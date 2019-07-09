import React from 'react';
import { Button } from 'semantic-ui-react';
import { Form, Field, withFormik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { History } from 'history';

import { Option, Text } from '@polkadot/types';
import Section from '@polkadot/joy-utils/Section';
import TxButton from '@polkadot/joy-utils/TxButton';
import { nonEmptyStr } from '@polkadot/joy-utils/index';
import { SubmittableResult } from '@polkadot/api';
import { withCalls } from '@polkadot/ui-api/index';

import * as JoyForms from '@polkadot/joy-utils/forms';
import { MyAccountProps, withMyAccount } from '@polkadot/joy-utils/MyAccount';
import { BlogId, Blog, BlogData, BlogUpdate, VecAccountId } from './types';
import { queryBlogsToProp, UrlHasIdProps } from './utils';

// TODO get next settings from Substrate:
const SLUG_REGEX = /^[A-Za-z0-9_-]+$/;

const URL_MAX_LEN = 2000;

const TAG_MIN_LEN = 2;
const TAG_MAX_LEN = 50;

const SLUG_MIN_LEN = 5;
const SLUG_MAX_LEN = 50;

const NAME_MIN_LEN = 3;
const NAME_MAX_LEN = 100;
const DESC_MAX_LEN = 1000;

// const POST_TITLE_MIN_LEN = 3;
// const POST_TITLE_MAX_LEN = 100;
// const POST_BODY_MAX_LEN = 10000;

// const COMMENT_MIN_LEN = 2;
// const COMMENT_MAX_LEN = 1000;

const buildSchema = (p: ValidationProps) => Yup.object().shape({

  slug: Yup.string()
    .required('Slug is required')
    .matches(SLUG_REGEX, 'Slug can have only letters (a-z, A-Z), numbers (0-9), underscores (_) and dashes (-).')
    .min(SLUG_MIN_LEN, `Slug is too short. Minimum length is ${SLUG_MIN_LEN} chars.`)
    .max(SLUG_MAX_LEN, `Slug is too long. Maximum length is ${SLUG_MAX_LEN} chars.`),

  name: Yup.string()
    .required('Name is required')
    .min(NAME_MIN_LEN, `Name is too short. Minimum length is ${NAME_MIN_LEN} chars.`)
    .max(NAME_MAX_LEN, `Name is too long. Maximum length is ${NAME_MAX_LEN} chars.`),

  image: Yup.string()
    .url('Image must be a valid URL.')
    .max(URL_MAX_LEN, `Image URL is too long. Maximum length is ${URL_MAX_LEN} chars.`),

  desc: Yup.string()
    .max(DESC_MAX_LEN, `Description is too long. Maximum length is ${DESC_MAX_LEN} chars.`)
});

type ValidationProps = {
  // TODO get slug validation params
};

type OuterProps = ValidationProps & {
  history?: History,
  id?: BlogId,
  struct?: Blog
};

type FormValues = BlogData & {
  slug: string
};

type FormProps = OuterProps & FormikProps<FormValues>;

const LabelledField = JoyForms.LabelledField<FormValues>();

const LabelledText = JoyForms.LabelledText<FormValues>();

const InnerForm = (props: FormProps) => {
  const {
    history,
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
    name,
    desc,
    image,
    tags
  } = values;

  const onSubmit = (sendTx: () => void) => {
    if (isValid) sendTx();
  };

  const onTxCancelled = () => {
    setSubmitting(false);
  };

  const onTxFailed = (_txResult: SubmittableResult) => {
    setSubmitting(false);
  };

  const onTxSuccess = (_txResult: SubmittableResult) => {
    setSubmitting(false);

    // TODO get id of newly created post and redirect.
    // goToView(id);
  };

  const isNew = struct === undefined;

  const buildTxParams = () => {
    if (!isValid) return [];

    const json = JSON.stringify(
      { name, desc, image, tags });

    if (!struct) {
      return [ slug, json ];
    } else {
      // TODO update only dirty values.
      const update = new BlogUpdate({
        // TODO get updated writers from the form
        writers: new Option(VecAccountId,(struct.writers)),
        slug: new Option(Text, slug),
        json: new Option(Text, json)
      });
      return [ struct.id, update ];
    }
  };

  const goToView = (id: BlogId) => {
    if (history) {
      history.push('/blogs/' + id.toString());
    }
  };

  const title = struct ? `Edit blog` : `New my blog`;

  return (
    <Section className='EditEntityBox' title={title}>
    <Form className='ui form JoyForm EditEntityForm'>

      <LabelledText name='name' label='Blog name' placeholder='Name of your blog.' {...props} />

      <LabelledText name='slug' label='URL slug' placeholder={`You can use a-z, 0-9, dashes and underscores.`} style={{ maxWidth: '30rem' }} {...props} />
      NewAccount
      <LabelledText name='image' label='Image URL' placeholder={`Should be a valid image URL.`} {...props} />

      <LabelledField name='desc' label='Description' {...props}>
        <Field component='textarea' id='desc' name='desc' disabled={isSubmitting} rows={3} placeholder='Tell others what is your blog about. You can use Markdown.' />
      </LabelledField>

      {/* TODO tags */}

      <LabelledField {...props}>
        <TxButton
          type='submit'
          size='large'
          label={struct
            ? 'Update blog'
            : 'Create new blog'
          }
          isDisabled={!dirty || isSubmitting}
          params={buildTxParams()}
          tx={struct
            ? 'blogs.updateBlog'
            : 'blogs.createBlog'
          }
          onClick={onSubmit}
          onTxCancelled={onTxCancelled}
          onTxFailed={onTxFailed}
          onTxSuccess={onTxSuccess}
        />
        <Button
          type='button'
          size='large'
          disabled={!dirty || isSubmitting}
          onClick={() => resetForm()}
          content='Reset form'
        />
      </LabelledField>
    </Form>
    </Section>
  );
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
        name: '',
        desc: '',
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

type BlogByIdProps = MyAccountProps & {
  id: BlogId,
  blogById?: Option<Blog>
};

function BlogByIdInner (p: BlogByIdProps) {
  if (p.blogById) {
    const struct = p.blogById.unwrapOr(undefined);
    return <EditForm struct={struct} />;
  } else return <em>Loading...</em>;
}

const BlogById = withMyAccount(
  withCalls<BlogByIdProps>(
    queryBlogsToProp('blogById', 'id')
  )(BlogByIdInner)
);

function ExtractIdFromUrl (props: UrlHasIdProps) {
  const { match: { params: { id } } } = props;
  return nonEmptyStr(id)
    ? <BlogById id={new BlogId(id)} />
    : <EditForm />;
}

export default ExtractIdFromUrl;
