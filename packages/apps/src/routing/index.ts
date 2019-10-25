// Copyright 2017-2019 @polkadot/apps authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Routing, Routes } from '../types';

import appSettings from '../../../components/df-settings';

import blogs from './df-blogs';

import accounts from './accounts';

const routes: Routes = appSettings.isBasicMode
  ? ([] as Routes).concat(
    null,
    blogs,
    accounts
  )
  : ([] as Routes).concat(
    blogs,
    accounts
  );

export default ({
  default: 'blogs',
  routes
} as Routing);
