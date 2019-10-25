import React, { useState, useEffect } from 'react';
import { Button } from 'semantic-ui-react';
import { Form, Field, withFormik, FormikProps } from 'formik';
import * as Yup from 'yup';

import TxButton from '../df-utils/TxButton';
import { SubmittableResult } from '@polkadot/api';
import { withCalls, withMulti } from '@polkadot/ui-api/with';
import * as DfForms from '../df-utils/forms';
import { Text } from '@polkadot/types';
import { Option } from '@polkadot/types/codec';
import { useMyAccount } from '../df-utils/MyAccountContext';

import { addJsonToIpfs, getJsonFromIpfs, removeFromIpfs } from './OffchainUtils';
import { queryBlogsToProp } from '../df-utils/index';
import { PostId, CommentId, Comment, CommentUpdate, CommentData } from '../df-types/blogs';

import SimpleMDEReact from 'react-simplemde-editor';

const buildSchema = (p: ValidationProps) => Yup.object().shape({

  body: Yup.string()
    // .min(p.minTextLen, `Your comment is too short. Minimum length is ${p.minTextLen} chars.`)
    // .max(p.maxTextLen, `Your comment is too long. Maximum length is ${p.maxTextLen} chars.`)
    .required('Comment body is required')
});

type ValidationProps = {
  // minTextLen: number,
  // maxTextLen: number
};

type OuterProps = ValidationProps & {
  postId: PostId,
  parentId?: CommentId,
  id?: CommentId,
  struct?: Comment,
  onSuccess: () => void,
  autoFocus: boolean,
  json: CommentData
};

type FormValues = CommentData;

type FormProps = OuterProps & FormikProps<FormValues>;

const LabelledField = DfForms.LabelledField<FormValues>();

// const LabelledText = DfForms.LabelledText<FormValues>();

const InnerForm = (props: FormProps) => {
  const {
    postId,
    parentId,
    struct,
    values,
    errors,
    dirty,
    isValid,
    setFieldValue,
    isSubmitting,
    setSubmitting,
    resetForm,
    onSuccess,
    autoFocus = false
  } = props;

  const hasParent = parentId !== undefined;

  const {
    body
  } = values;

  const [ ipfsCid, setIpfsCid ] = useState('');

  const onSubmit = async (sendTx: () => void) => {
    if (isValid) {
      const json = { body };
      const cid = await addJsonToIpfs(json).catch(err => console.log(err)) as string;
      setIpfsCid(cid);
      sendTx();
      // window.onunload = async (e) => {
      //   e.preventDefault();
      //   await removeFromIpfs(cid).catch(err => console.log(err));
      //   return false;
      // };// Attention!!! Old code!
      // TODO unpin, when close tab
    }
  };

  const onTxCancelled = () => {
    removeFromIpfs(ipfsCid).catch(err => console.log(err));
    setSubmitting(false);
  };

  const onTxFailed = (_txResult: SubmittableResult) => {
    removeFromIpfs(ipfsCid).catch(err => console.log(err));
    setSubmitting(false);
  };

  const isNewRoot = !hasParent && !struct;

  const onTxSuccess = (_txResult: SubmittableResult) => {
    setSubmitting(false);

    if (isNewRoot) {
      resetForm();
    }
    if (onSuccess) {
      onSuccess();
    }
  };

  const buildTxParams = () => {
    if (!isValid) return [];

    if (!struct) {
      const parentCommentId = new Option(CommentId, parentId);
      return [ postId, parentCommentId, ipfsCid ];
    } else if (dirty) {
      const update = new CommentUpdate({
        ipfs_hash: new Text(ipfsCid)
      });
      return [ struct.id, update ];
    } else {
      console.log('Nothing to update in a comment');
      return [];
    }
  };

  const form = () => (
    <Form className='ui form DfForm EditEntityForm'>
      <LabelledField name='body' {...props}>
        <Field component={SimpleMDEReact} name='body' value={body} onChange={(data: string) => setFieldValue('body', data)} className={`DfMdEditor ${errors['body'] && 'error'}`} style={{ minWidth: '40rem', marginTop: '1rem' }} autoFocus={autoFocus}/>
      </LabelledField>

      <LabelledField {...props}>
        <>
        <TxButton
          type='submit'
          label={!struct
            ? `Comment`
            : `Update my comment`
          }
          isDisabled={!dirty || isSubmitting}
          params={buildTxParams()}
          tx={struct
            ? 'blogs.updateComment'
            : 'blogs.createComment'
          }
          onClick={onSubmit}
          txCancelledCb={onTxCancelled}
          txFailedCb={onTxFailed}
          txSuccessCb={onTxSuccess}
        />
        {!isNewRoot && <Button
          type='button'
          onClick={onSuccess}
          content='Cancel'
        />}
        </>
      </LabelledField>
    </Form>);

  return form();
};

const EditForm = withFormik<OuterProps, FormValues>({

  // Transform outer props into form values
  mapPropsToValues: (props): FormValues => {
    const { struct, json } = props;

    if (struct) {
      return {
        body: json.toString()
      };
    } else {
      return {
        body: ''
      };
    }
  },

  validationSchema: buildSchema,

  handleSubmit: values => {
    // do submitting things
  }
})(InnerForm);

type LoadStructProps = OuterProps & {
  structOpt: Option<Comment>
};

type StructJson = CommentData | undefined;

type Struct = Comment | undefined;

function LoadStruct (props: LoadStructProps) {
  const { state: { address: myAddress } } = useMyAccount();
  const { structOpt } = props;
  const [ json, setJson ] = useState(undefined as StructJson);
  const [ struct, setStruct ] = useState(undefined as Struct);
  const [ trigger, setTrigger ] = useState(false);
  const jsonIsNone = json === undefined;

  const toggleTrigger = () => {
    json === undefined && setTrigger(!trigger);
    return;
  };

  useEffect(() => {

    if (!myAddress || !structOpt || structOpt.isNone) return toggleTrigger();;

    setStruct(structOpt.unwrap());

    if (struct === undefined) return toggleTrigger();;

    console.log('Loading comment JSON from IPFS');

    getJsonFromIpfs<CommentData>(struct.ipfs_hash).then(json => {
      const content = json;
      setJson(content);
    }).catch(err => console.log(err));
  }, [ trigger ]);

  if (!myAddress || !structOpt || jsonIsNone) {
    return <em>Loading comment...</em>;
  }

  if (structOpt.isNone) {
    return <em>Comment not found</em>;
  }

  return <EditForm {...props} struct={struct} json={json as CommentData} />;

}

export const EditComment = withMulti<LoadStructProps>(
  LoadStruct,
  withCalls<OuterProps>(
    queryBlogsToProp('commentById',
      { paramName: 'id', propName: 'structOpt' })
  )
);

export const NewComment = withMulti<OuterProps>(
  EditForm
);
