import React, { useEffect, useState } from 'react';

import { AccountId, Bool } from '@polkadot/types';

import { BlogId } from './types';
import { Tuple } from '@polkadot/types/codec';
import { useMyAccount } from '@polkadot/joy-utils/MyAccountContext';
import TxButton from '@polkadot/joy-utils/TxButton';
import { api } from '@polkadot/ui-api';
import _ from 'lodash';

type PropsFollowButtonBlog = {
  blogId: BlogId
};

export function FollowButtonBlog (props: PropsFollowButtonBlog) {
  const { blogId } = props;
  const { state: { address: myAddress } } = useMyAccount();

  const dataForQuery = new Tuple([AccountId, BlogId], [new AccountId(myAddress), blogId]);

  const [ isFollow, setIsFollow ] = useState(true);
  const [ triggerReload, setTriggerReload ] = useState(false);

  useEffect(() => {
    const load = async () => {
      const _isFollow = await (api.query.blogs[`accountFollowedByBlog`](dataForQuery)) as Bool;
      setIsFollow(_isFollow.valueOf());
    };
    load().catch(err => console.log(err));

  }, [ BlogId ]);

  const buildTxParams = () => {
    return [ blogId ];
  };

  return <TxButton
    type='submit'
    compact
    isBasic={isFollow}
    isPrimary={!isFollow}
    label={isFollow
      ? 'Unfollow blog'
      : 'Follow blog'}
    params={buildTxParams()}
    tx={isFollow
      ? `blogs.unfollowBlog`
      : `blogs.followBlog`}
    txSuccessCb={() => setTriggerReload(!triggerReload) }
  />;
}

type PropsFollowButtonAccount = {
  accountId: string
};

export function FollowButtonAccount (props: PropsFollowButtonAccount) {
  const { accountId } = props;
  const { state: { address: myAddress } } = useMyAccount();

  if (myAddress === accountId) return null;

  const dataForQuery = new Tuple([AccountId, AccountId], [new AccountId(myAddress), accountId]);

  const [ isFollow, setIsFollow ] = useState(true);
  const [ triggerReload, setTriggerReload ] = useState(false);

  useEffect(() => {
    const load = async () => {
      const _isFollow = await (api.query.blogs[`accountFollowedByAccount`](dataForQuery)) as Bool;
      setIsFollow(_isFollow.valueOf());
    };
    load().catch(err => console.log(err));

  }, [ AccountId ]);

  const buildTxParams = () => {
    return [ accountId ];
  };

  return <div className='DfFollowButton'><TxButton
    type='submit'
    compact
    isBasic={isFollow}
    isPrimary={!isFollow}
    label={isFollow
      ? 'Unfollow blog'
      : 'Follow blog'}
    params={buildTxParams()}
    tx={isFollow
      ? `blogs.unfollowAccount`
      : `blogs.followAccount`}
    txSuccessCb={() => setTriggerReload(!triggerReload) }
  /></div>;
}
