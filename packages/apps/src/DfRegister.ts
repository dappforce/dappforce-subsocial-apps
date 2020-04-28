// Copyright 2017-2020 @polkadot/apps authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { types } from '@subsocial/types/substrate/preparedTypes';
import { registry } from '@polkadot/react-api';

export const registerSubsocialTypes = (): void => {
  try {
    registry.register(types);
  } catch (err) {
    console.error('Failed to register custom types of blogs module', err);
  }
};

export default registerSubsocialTypes;
