import React, { useState, useEffect } from 'react';
import { Button } from 'semantic-ui-react';
import { Form, Field, withFormik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { History } from 'history';
import TxButton from '@polkadot/df-utils/TxButton';
import { SubmittableResult } from '@polkadot/api';
import { withCalls, withMulti } from '@polkadot/ui-api/with';

import { addJsonToIpfs, getJsonFromIpfs } from './OffchainUtils';
import * as DfForms from '@polkadot/df-utils/forms';
import { Text } from '@polkadot/types';
import { Option } from '@polkadot/types/codec';
import { PostId, Post, PostData, PostUpdate, BlogId, PostExtension, RegularPost } from '@dappforce/types/blogs';
import Section from '@polkadot/df-utils/Section';
import { useMyAccount } from '@polkadot/df-utils/MyAccountContext';
import { queryBlogsToProp } from '@polkadot/df-utils/index';
import { UrlHasIdProps, getNewIdFromEvent } from './utils';

import SimpleMDEReact from 'react-simplemde-editor';


const buildSchema = (p: ValidationProps) => Yup.object().shape({
  title: Yup.string()
    // .min(p.minTitleLen, `Title is too short. Minimum length is ${p.minTitleLen} chars.`)
    // .max(p.maxTitleLen, `Title is too long. Maximum length is ${p.maxTitleLen} chars.`)
    .required('Post title is required'),

  body: Yup.string()
    // .min(p.minTextLen, `Your post is too short. Minimum length is ${p.minTextLen} chars.`)
    // .max(p.maxTextLen, `Your post description is too long. Maximum length is ${p.maxTextLen} chars.`)
    .required('Post body is required'),

  image: Yup.string()
    .url('Image must be a valid URL.')
    // .max(URL_MAX_LEN, `Image URL is too long. Maximum length is ${URL_MAX_LEN} chars.`),
});

type ValidationProps = {
  // minTitleLen: number,
  // maxTitleLen: number,
  // minTextLen: number,
  // maxTextLen: number
};

type OuterProps = ValidationProps & {
  history?: History,
  blogId?: BlogId,
  id?: PostId,
  extention?: PostExtension,
  struct?: Post
  json?: PostData,
  preview?: React.ReactNode,
  extButton?: React.ReactNode,
  closeModal?: () => void
};

type FormValues = PostData;

type FormProps = OuterProps & FormikProps<FormValues>;

const LabelledField = DfForms.LabelledField<FormValues>();

const LabelledText = DfForms.LabelledText<FormValues>();

const InnerForm = (props: FormProps) => {
  const {
    history,
    id,
    blogId,
    struct,
    extention = new PostExtension({ RegularPost: new RegularPost() }),
    extButton,
    values,
    preview,
    dirty,
    isValid,
    errors,
    setFieldValue,
    isSubmitting,
    setSubmitting,
    resetForm,
    closeModal
  } = props;

  const isRegularPost = extention.value instanceof RegularPost;

  const renderResetButton = () => (
    <Button
      type='button'
      size='large'
      disabled={isSubmitting || (isRegularPost && !dirty)}
      onClick={() => resetForm()}
      content='Reset form'
    />
  );

  const {
    title,
    body,
    image,
    tags
  } = values;

  const goToView = (id: PostId) => {
    if (history) {
      history.push('/blogs/posts/' + id.toString());
    }
  };

  const [ ipfsHash, setIpfsCid ] = useState('');

  const onSubmit = (sendTx: () => void) => {
    if (isValid || !isRegularPost) {
      console.log('here1');
      const json = { title, body, image, tags };
      console.log(json);
      addJsonToIpfs(json).then(hash => {
        setIpfsCid(hash);
        sendTx();
      }).catch(err => new Error(err));
    }
  };
  const onTxCancelled = () => {
    setSubmitting(false);
  };

  const onTxFailed = (_txResult: SubmittableResult) => {
    setSubmitting(false);
  };

  const onTxSuccess = (_txResult: SubmittableResult) => {
    setSubmitting(false);

    closeModal && closeModal();

    if (!history) return;

    const _id = id ? id : getNewIdFromEvent<PostId>(_txResult);
    _id && goToView(_id);
  };

  const buildTxParams = () => {
    if (isValid || !isRegularPost) {

      if (!struct) {
        return [ blogId, ipfsHash, extention ];
      } else {
        // TODO update only dirty values.
        const update = new PostUpdate({
          // TODO setting new blog_id will move the post to another blog.
          blog_id: new Option(BlogId, null),
          ipfs_hash: new Option(Text, ipfsHash)
        });
        return [ struct.id, update ];
      }
    } else {
      return [];
    }
  };

  const renderButtons = () => (
    <div className='DfTxButton'>
      {extButton && extButton}
      <TxButton
        type='submit'
        size='large'
        label={!struct
          ? `Create a post`
          : `Update a post`
        }
        isDisabled={isSubmitting || (isRegularPost && !dirty)}
        params={buildTxParams()}
        tx={struct
          ? 'blogs.updatePost'
          : 'blogs.createPost'
        }
        onClick={onSubmit}
        txCancelledCb={onTxCancelled}
        txFailedCb={onTxFailed}
        txSuccessCb={onTxSuccess}
      />
      {!extButton && renderResetButton()}
    </div>
  );

  const form =
    <Form className='ui form DfForm EditEntityForm'>

      {isRegularPost
        ? <>
          <LabelledText name='title' label='Post title' placeholder={`What is a title of you post?`} {...props} />

          <LabelledText name='image' label='Image URL' placeholder={`Should be a valid image URL.`} {...props} />

          {/* TODO ask a post summary or auto-generate and show under an "Advanced" tab. */}

          <LabelledField name='body' label='Description' {...props}>
            <Field component={SimpleMDEReact} name='body' value={body} onChange={(data: string) => setFieldValue('body', data)} className={`DfMdEditor ${errors['body'] && 'error'}`} />
         </LabelledField>
        </>
        : <>
          <SimpleMDEReact value={body} onChange={(data: string) => setFieldValue('body', data)} className={`DfMdEditor`}/>
        </>
      }
      {!isRegularPost && preview}
      <LabelledField {...props}>
        {renderButtons()}
      </LabelledField>
    </Form>;

  const sectionTitle = isRegularPost ? (!struct ? `New post` : `Edit my post`) : '';

  return <>
    <Section className='EditEntityBox' title={sectionTitle}>
      {form}
    </Section>
  </>;
};

const EditForm = withFormik<OuterProps, FormValues>({

  // Transform outer props into form values
  mapPropsToValues: (props): FormValues => {
    const { struct, json } = props;

    if (struct && json) {
      return {
        ...json
      };
    } else {
      return {
        title: '',
        body: '',
        image: '',
        tags: []
      };
    }
  },

  validationSchema: buildSchema,

  handleSubmit: values => {
    // do submitting things
  }
})(InnerForm);

function withIdFromUrl (Component: React.ComponentType<OuterProps>) {
  return function (props: UrlHasIdProps & OuterProps) {
    const { match: { params: { id } }, id: postId } = props;

    if (postId) return <Component {...props}/>;

    try {
      return <Component id={new PostId(id)} {...props}/>;
    } catch (err) {
      return <em>Invalid post ID: {id}</em>;
    }
  };
}

function withBlogIdFromUrl (Component: React.ComponentType<OuterProps>) {
  return function (props: UrlHasIdProps) {
    const { match: { params: { id } } } = props;
    try {
      return <Component blogId={new BlogId(id)} {...props} />;
    } catch (err) {
      return <em>Invalid blog ID: {id}</em>;
    }
  };
}

type LoadStructProps = OuterProps & {
  structOpt: Option<Post>
};

type StructJson = PostData | undefined;
type Struct = Post | undefined;

function LoadStruct (Component: React.ComponentType<LoadStructProps>) {
  return function (props: LoadStructProps) {
    const { state: { address: myAddress } } = useMyAccount(); // TODO maybe remove, becose usles
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

      if (!myAddress || !structOpt || structOpt.isNone) return toggleTrigger();

      setStruct(structOpt.unwrap());

      if (struct === undefined) return toggleTrigger();

      console.log('Loading post JSON from IPFS');

      getJsonFromIpfs<PostData>(struct.ipfs_hash).then(json => {
        setJson(json);
      }).catch(err => console.log(err));
    }, [ trigger ]);

    if (!myAddress || !structOpt || jsonIsNone) {
      return <em>Loading post...</em>;
    }

    if (structOpt.isNone) {
      return <em>Post not found</em>;
    }

    return <Component {...props} struct={struct} json={json}/>;
  };
}

export const NewPost = withMulti(
  EditForm,
  withBlogIdFromUrl
);

export const NewSharePost = withMulti(
  EditForm
);

export const EditPost = withMulti<OuterProps>(
  EditForm,
  withIdFromUrl,
  withCalls<OuterProps>(
    queryBlogsToProp('postById',
      { paramName: 'id', propName: 'structOpt' })
  ),
  LoadStruct
);
