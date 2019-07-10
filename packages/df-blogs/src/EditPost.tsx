import React from 'react';
import { Button } from 'semantic-ui-react';
import { Form, Field, withFormik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { History } from 'history';
import TxButton from '@polkadot/joy-utils/TxButton';
import { SubmittableResult } from '@polkadot/api';
import { withCalls, withMulti } from '@polkadot/ui-api/with';

import * as JoyForms from '@polkadot/joy-utils/forms';
import { Text } from '@polkadot/types';
import { Option } from '@polkadot/types/codec';
import { PostId, Post, PostData, PostUpdate, BlogId } from './types';
import Section from '@polkadot/joy-utils/Section';
import { useMyAccount } from '@polkadot/joy-utils/MyAccountContext';
import { queryBlogsToProp, UrlHasIdProps, getIdWithEvent } from './utils';

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
  struct?: Post
};

type FormValues = PostData & {
  slug: string
};

type FormProps = OuterProps & FormikProps<FormValues>;

const LabelledField = JoyForms.LabelledField<FormValues>();

const LabelledText = JoyForms.LabelledText<FormValues>();

const InnerForm = (props: FormProps) => {
  const {
    history,
    id,
    blogId,
    struct,
    values,
    dirty,
    isValid,
    isSubmitting,
    setSubmitting,
    resetForm
  } = props;

  const {
    slug,
    title,
    body,
    image,
    tags
  } = values;

  const onSubmit = (sendTx: () => void) => {
    if (isValid) sendTx();
  };

  const onTxCancelled = () => {
    setSubmitting(false);
  };

  const goToView = (id: PostId) => {
    if (history) {
      history.push('/blogs/posts/' + id.toString());
    }
  };

  const onTxFailed = (_txResult: SubmittableResult) => {
    setSubmitting(false);
  };

  const onTxSuccess = (_txResult: SubmittableResult) => {
    setSubmitting(false);

    if (!history) return;

    let _id = id;
    if (!_id) {
      _id = getIdWithEvent(_txResult,id);
    }
    _id && goToView(_id);
  };

  const isNew = struct === undefined;

  const buildTxParams = () => {
    if (!isValid) return [];

    const json = JSON.stringify(
      { title, body, image, tags });

    if (!struct) {
      return [ blogId, slug, json ];
    } else {
      // TODO update only dirty values.
      const update = new PostUpdate({
        // TODO setting new blog_id will move the post to another blog.
        blog_id: new Option(BlogId, null),
        slug: new Option(Text, slug),
        json: new Option(Text, json)
      });
      return [ struct.id, update ];
    }
  };

  const form =
    <Form className='ui form JoyForm EditEntityForm'>

      <LabelledText name='title' label='Post title' placeholder={`What is a title of you post?`} {...props} />

      <LabelledText name='slug' label='URL slug' placeholder={`You can use a-z, 0-9, dashes and underscores.`} style={{ maxWidth: '30rem' }} {...props} />

      <LabelledText name='image' label='Image URL' placeholder={`Should be a valid image URL.`} {...props} />

      {/* TODO ask a post summary or auto-generate and show under an "Advanced" tab. */}

      <LabelledField name='body' label='Your post' {...props}>
        <Field component='textarea' id='body' name='body' disabled={isSubmitting} rows={5} placeholder={`Write your post here. You can use Markdown.`} />
      </LabelledField>

      {/* TODO tags */}

      <LabelledField {...props}>
        <TxButton
          type='submit'
          size='large'
          label={isNew
            ? `Create a post`
            : `Update a post`
          }
          isDisabled={!dirty || isSubmitting}
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
        <Button
          type='button'
          size='large'
          disabled={!dirty || isSubmitting}
          onClick={() => resetForm()}
          content='Reset form'
        />
      </LabelledField>
    </Form>;

  const sectionTitle = isNew ? `New post` : `Edit my post`;

  return <>
    <Section className='EditEntityBox' title={sectionTitle}>
      {form}
    </Section>
  </>;
};

const EditForm = withFormik<OuterProps, FormValues>({

  // Transform outer props into form values
  mapPropsToValues: (props): FormValues => {
    const { struct } = props;

    if (struct) {
      const { json } = struct;
      const slug = struct.slug.toString();
      return {
        slug,
        ...json
      };
    } else {
      return {
        slug: '',
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
  return function (props: UrlHasIdProps) {
    const { match: { params: { id } } } = props;
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

function LoadStruct (props: LoadStructProps) {
  const { state: { address: myAddress } } = useMyAccount(); // TODO maybe remove, becose usles
  const { structOpt } = props;

  if (!myAddress || !structOpt) {
    return <em>Loading post...</em>;
  }

  if (structOpt.isNone) {
    return <em>Post not found</em>;
  }

  const struct = structOpt.unwrap();

  return <EditForm {...props} struct={struct}/>;// TODO
}

export const NewPost = withMulti(
  EditForm,
  withBlogIdFromUrl
  // , withOnlyMembers
);

export const EditPost = withMulti(
  LoadStruct,
  withIdFromUrl,
  withCalls<OuterProps>(
    queryBlogsToProp('postById',
      { paramName: 'id', propName: 'structOpt' })
  )
);
