import { queryToProp } from '@polkadot/df-utils/index';
import { Options as QueryOptions } from '@polkadot/ui-api/with/types';

export const queryMembershipToProp = (storageItem: string, paramNameOrOpts?: string | QueryOptions) => {
  return queryToProp(`query.membership.${storageItem}`, paramNameOrOpts);
};
