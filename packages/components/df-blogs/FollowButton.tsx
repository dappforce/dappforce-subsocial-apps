import React, { useEffect, useState } from 'react';

import { AccountId, Bool } from '@polkadot/types';

import { BlogId } from '../df-types/blogs';
import { Tuple } from '@polkadot/types/codec';
import { useMyAccount } from '../df-utils/MyAccountContext';
import TxButton from '../df-utils/TxButton';
import { api } from '@polkadot/ui-api';

type FollowBlogButtonProps = {
  blogId: BlogId,
  size?: string
};

export function FollowBlogButton (props: FollowBlogButtonProps) {
  const { blogId, size = 'medium' } = props;
  const { state: { address: myAddress } } = useMyAccount();

  const dataForQuery = new Tuple([AccountId, BlogId], [new AccountId(myAddress), blogId]);

  const [ isFollow, setIsFollow ] = useState(false);
  const [ triggerReload, setTriggerReload ] = useState(false);

  useEffect(() => {
    const load = async () => {
      const _isFollow = await (api.query.blogs[`blogFollowedByAccount`](dataForQuery)) as Bool;
      setIsFollow(_isFollow.valueOf());
    };
    load().catch(err => console.log(err));

  }, [ blogId ]);

  const buildTxParams = () => {
    return [ blogId ];
  };

  return <TxButton
    type='submit'
    compact
    size = {size}
    isBasic={isFollow}
    isPrimary={!isFollow}
    label={isFollow
      ? 'Unfollow'
      : 'Follow'}
    params={buildTxParams()}
    tx={isFollow
      ? `blogs.unfollowBlog`
      : `blogs.followBlog`}
    txSuccessCb={() => setTriggerReload(!triggerReload) }
  />;
}

type FollowAccountButtonProps = {
  address: string,
  size?: string
};

export function FollowAccountButton (props: FollowAccountButtonProps) {
  const { address } = props;
  const { state: { address: myAddress } } = useMyAccount();

  // Account cannot follow itself
  if (!myAddress || address === myAddress) return null;

  return <InnerFollowAccountButton {...props} myAddress={myAddress}/>;
}

type InnerFollowAccountButtonProps = FollowAccountButtonProps & {
  myAddress: string
};

function InnerFollowAccountButton (props: InnerFollowAccountButtonProps) {
  const { myAddress, address, size = 'medium' } = props;

  const accountId = new AccountId(address);
  const dataForQuery = new Tuple([AccountId, AccountId], [new AccountId(myAddress), accountId]);

  const [ isFollow, setIsFollow ] = useState(true);
  const [ triggerReload, setTriggerReload ] = useState(false);

  useEffect(() => {
    const load = async () => {
      const _isFollow = await (api.query.blogs[`accountFollowedByAccount`](dataForQuery)) as Bool;
      setIsFollow(_isFollow.valueOf());
    };
    load().catch(err => console.log(err));

  }, [ accountId ]);

  const buildTxParams = () => {
    return [ accountId ];
  };

  return <TxButton
    type='submit'
    compact
    size={size}
    isBasic={isFollow}
    isPrimary={!isFollow}
    label={isFollow
      ? 'Unfollow'
      : 'Follow'}
    params={buildTxParams()}
    tx={isFollow
      ? `blogs.unfollowAccount`
      : `blogs.followAccount`}
    txSuccessCb={() => setTriggerReload(!triggerReload) }
  />;
}
