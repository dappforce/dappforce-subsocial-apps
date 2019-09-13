import React, { useState, useEffect } from 'react';
import { Button } from 'semantic-ui-react';
import { Form, Field, withFormik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { History } from 'history';

import { Option, Text, AccountId } from '@polkadot/types';
import Section from '@polkadot/joy-utils/Section';
import TxButton from '@polkadot/joy-utils/TxButton';
import { SubmittableResult } from '@polkadot/api';
import { withCalls, withMulti } from '@polkadot/ui-api/index';

import { addJsonToIpfs, getJsonFromIpfs, removeFromIpfs } from './OffchainUtils';
import * as JoyForms from '@polkadot/joy-utils/forms';
import { ProfileData, Profile, ProfileUpdate } from './types';
import { queryBlogsToProp } from './utils';
import { useMyAccount } from '@polkadot/joy-utils/MyAccountContext';
import { SocialAccount } from '@dappforce/types/blogs';

// TODO get next settings from Substrate:
const SLUG_REGEX = /^[A-Za-z0-9_-]+$/;

const URL_MAX_LEN = 2000;

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
function urlValidation (name: string) {
  return Yup.string()
    .url(`${name} URL is not valid.`)
    .max(URL_MAX_LEN, `${name} URL is too long. Maximum length is ${URL_MAX_LEN} chars.`);
}

const buildSchema = (p: ValidationProps) => Yup.object().shape({
  username: Yup.string()
    .required('Slug is required')
    .matches(SLUG_REGEX, 'Slug can have only letters (a-z, A-Z), numbers (0-9), underscores (_) and dashes (-).')
    .min(SLUG_MIN_LEN, `Slug is too short. Minimum length is ${SLUG_MIN_LEN} chars.`)
    .max(SLUG_MAX_LEN, `Slug is too long. Maximum length is ${SLUG_MAX_LEN} chars.`),

  fullname: Yup.string()
    .required('Name is required')
    .min(NAME_MIN_LEN, `Name is too short. Minimum length is ${NAME_MIN_LEN} chars.`)
    .max(NAME_MAX_LEN, `Name is too long. Maximum length is ${NAME_MAX_LEN} chars.`),

  avatar: Yup.string()
    .url('Avatar must be a valid URL.')
    .max(URL_MAX_LEN, `Image URL is too long. Maximum length is ${URL_MAX_LEN} chars.`),

  facebook: urlValidation('Facebook'),

  github: urlValidation('Github'),

  linkedIn: urlValidation('LinkedIn'),

  instagram: urlValidation('Instagram'),

  desc: Yup.string().max(DESC_MAX_LEN, `Description is too long. Maximum length is ${DESC_MAX_LEN} chars.`)
});

type ValidationProps = {
  // TODO get slug validation params
};

type OuterProps = ValidationProps & {
  history?: History,
  id?: AccountId,
  struct?: Profile,
  json?: ProfileData
};

type FormValues = ProfileData & {
  username: string;
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

  // const [ content , setContent ] = useState({} as BlogData & {slug: string});

  // values.then((res: BlogData & {slug: string}) => setContent(res));
  const {
    username,
    fullname,
    avatar,
    about,
    facebook,
    github,
    linkedIn,
    instagram
  } = values;

  const goToView = () => {
    if (history) {
      history.push('/blogs/profile');
    }
  };

  const [ ipfsCid, setIpfsCid ] = useState('');

  const onSubmit = (sendTx: () => void) => {
    if (isValid) {
      const json = { fullname, avatar, about, facebook, github, linkedIn, instagram };
      console.log(json);
      addJsonToIpfs(json).then(cid => {
        setIpfsCid(cid);
        sendTx();
      }).catch(err => new Error(err));
    }
  };

  const onTxCancelled = () => {
    removeFromIpfs(ipfsCid).catch(err => new Error(err));
    setSubmitting(false);
  };

  const onTxFailed = (_txResult: SubmittableResult) => {
    removeFromIpfs(ipfsCid).catch(err => new Error(err));
    setSubmitting(false);
  };

  const onTxSuccess = (_txResult: SubmittableResult) => {
    setSubmitting(false);

    if (!history) return;

    goToView();
  };

  const buildTxParams = () => {
    if (!isValid) return [];
    if (!struct) {
      return [ username, ipfsCid ];
    } else {
      // TODO update only dirty values.
      const update = new ProfileUpdate({
        // TODO get updated writers from the form
        username: new Option(Text, username),
        ipfs_hash: new Option(Text, ipfsCid)
      });
      return [ update ];
    }
  };

  const title = struct ? `Edit profile` : `New profile`;

  return (
    <Section className='EditEntityBox' title={title}>
    <Form className='ui form JoyForm EditEntityForm'>

      <LabelledText name='fullname' label='Fullname' placeholder='Enter your fullname' {...props} />

      <LabelledText name='username' label='username' placeholder={`You can use a-z, 0-9, dashes and underscores.`} style={{ maxWidth: '30rem' }} {...props} />

      <LabelledText name='avatar' label='Avatar URL' placeholder={`Should be a valid image Url.`} {...props} />

      <LabelledText
        name='facebook'
        label='Facebook link'
        placeholder={`Should be a valid page's url.`}
        {...props}
      />
      <LabelledText name='github' label='Github link' placeholder={`Should be a valid page's url`} {...props} />
      <LabelledText
        name='linkedIn'
        label='LinkedIn link'
        placeholder={`Should be a valid page's url.`}
        {...props}
      />
      <LabelledText
        name='instagram'
        label='Instagram link'
        placeholder={`Should be a valid page's url.`}
        {...props}
      />

      <LabelledField name='about' label='About' {...props}>
        <Field component='textarea' id='about' name='about' disabled={isSubmitting} rows={3} placeholder='Tell others something about yourself. You can use Markdown.' />
      </LabelledField>

      {/* TODO tags */}

      <LabelledField {...props}>
        <TxButton
          type='submit'
          size='large'
          label={struct
            ? 'Update profile'
            : 'Create new profile'
          }
          isDisabled={!dirty || isSubmitting}
          params={buildTxParams()}
          tx={struct
            ? 'blogs.updateProfile'
            : 'blogs.createProfile'
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
    </Form>
    </Section>
  );
};

const EditForm = withFormik<OuterProps, FormValues>({

  // Transform outer props into form values
  mapPropsToValues: (props): FormValues => {
    const { struct, json } = props;
    if (struct && json) {
      const username = struct.username.toString();
      return {
        username,
        ...json
      };
    } else {
      return {
        username: '',
        fullname: '',
        avatar: '',
        about: '',
        facebook: '',
        github: '',
        linkedIn: '',
        instagram: ''
      };
    }
  },

  validationSchema: buildSchema,

  handleSubmit: values => {
    // do submitting things
  }
})(InnerForm);

function withIdFromMyAddress (Component: React.ComponentType<OuterProps>) {
  return function () {
    const { state: { address: myAddress } } = useMyAccount();
    try {
      return <Component id={new AccountId(myAddress)}/>;
    } catch (err) {
      return <em>Invalid address: {myAddress}</em>;
    }
  };
}

type LoadStructProps = OuterProps & {
  socialAccountOpt: Option<SocialAccount>
};

type StructJson = ProfileData | undefined;

type Struct = Profile | undefined;

function LoadStruct (props: LoadStructProps) {

  const { state: { address: myAddress } } = useMyAccount(); // TODO maybe remove, becose usles
  const { socialAccountOpt } = props;
  const [ json, setJson ] = useState(undefined as StructJson);
  const [ struct, setStruct ] = useState(undefined as Struct);
  const jsonIsNone = json === undefined;

  useEffect(() => {

    if (!myAddress || !socialAccountOpt || socialAccountOpt.isNone) return;

    const socialAccount = socialAccountOpt.unwrap();
    const profileOpt = socialAccount.profile;
    if (profileOpt.isNone) return;

    setStruct(profileOpt.unwrap() as Profile);

    if (struct === undefined) return;

    getJsonFromIpfs<ProfileData>(struct.ipfs_hash).then(json => {
      const content = json;
      setJson(content);
    }).catch(err => console.log(err));
  });

  if (!myAddress || !socialAccountOpt || jsonIsNone) {
    return <em>Loading profile...</em>;
  }

  if (socialAccountOpt.isNone) {
    return <em>Profile not found...</em>;
  }

  return <EditForm {...props} struct={struct} json={json} />;
}

export const NewProfile = withMulti(
  EditForm
  // , withOnlyMembers
);

export const EditProfile = withMulti(
  LoadStruct,
  withIdFromMyAddress,
  withCalls<OuterProps>(
    queryBlogsToProp('socialAccountById',
      { paramName: 'id', propName: 'socialAccountOpt' })
  )
);
