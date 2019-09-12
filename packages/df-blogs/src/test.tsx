import React, { useState, useEffect } from 'react';
import { Button } from 'semantic-ui-react';
import { Form, Field, withFormik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { History } from 'history';

import { Option, Text } from '@polkadot/types';
import Section from '@polkadot/joy-utils/Section';
import TxButton from '@polkadot/joy-utils/TxButton';
import { SubmittableResult } from '@polkadot/api';
import { withCalls, withMulti } from '@polkadot/ui-api/index';

import * as JoyForms from '@polkadot/joy-utils/forms';
import { BlogId, Blog, BlogData, BlogUpdate, VecAccountId } from './types';
import { queryBlogsToProp, UrlHasIdProps, getNewIdFromEvent, addJsonToIpfs, getJsonFromIpfs, removeFromIpfs } from './utils';
import { useMyAccount } from '@polkadot/joy-utils/MyAccountContext';

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
    .max(URL_MAX_LEN, `${name} URL is too long. Maximum length is ${URL_MAX_LEN} chars.`)
}

const buildSchema = (p: ValidationProps) =>
  Yup.object().shape({
    username: Yup.string()
      .required("Slug is required")
      .matches(SLUG_REGEX, "Slug can have only letters (a-z, A-Z), numbers (0-9), underscores (_) and dashes (-).")
      .min(SLUG_MIN_LEN, `Slug is too short. Minimum length is ${SLUG_MIN_LEN} chars.`)
      .max(SLUG_MAX_LEN, `Slug is too long. Maximum length is ${SLUG_MAX_LEN} chars.`),

    fullname: Yup.string()
      .required("Name is required")
      .min(NAME_MIN_LEN, `Name is too short. Minimum length is ${NAME_MIN_LEN} chars.`)
      .max(NAME_MAX_LEN, `Name is too long. Maximum length is ${NAME_MAX_LEN} chars.`),

    avatar: Yup.string()
      .url("Avatar must be a valid URL.")
      .max(URL_MAX_LEN, `Image URL is too long. Maximum length is ${URL_MAX_LEN} chars.`),

    facebook: urlValidation('Facebook'),

    github: urlValidation('Github'),

    linkedIn: urlValidation('LinkedIn'),

    instagram: urlValidation('Instagram'),

    desc: Yup.string().max(DESC_MAX_LEN, `Description is too long. Maximum length is ${DESC_MAX_LEN} chars.`)
  });