import React, { useEffect, useState } from 'react';

import { AccountId, Bool } from '@polkadot/types';

import { BlogId, PostId, CommentId } from '../df-types/blogs';
import { Tuple } from '@polkadot/types/codec';
import { useMyAccount } from '../df-utils/MyAccountContext';
import TxButton from '../df-utils/TxButton';
import { api } from '@polkadot/ui-api';

type PropsShareButtonPost = {
  postId: PostId
};

export function ShareButtonPost (props: PropsShareButtonPost) {
  const { postId } = props;
  const { state: { address: myAddress } } = useMyAccount();

  const dataForQuery = new Tuple([AccountId, BlogId], [new AccountId(myAddress), postId]);

  const [ isFollow, setIsFollow ] = useState(false);
  const [ triggerReload, setTriggerReload ] = useState(false);

  useEffect(() => {
    const load = async () => {
      const _isFollow = await (api.query.blogs[`postSharedByAccount`](dataForQuery)) as Bool;
      setIsFollow(_isFollow.valueOf());
    };
    load().catch(err => console.log(err));

  }, [ postId ]);

  const buildTxParams = () => {
    return [ postId ];
  };

  return <TxButton
    type='submit'
    compact
    isBasic={true}
    isPrimary={false}
    label={isFollow
      ? 'Unshare post'
      : 'Share post'}
    params={buildTxParams()}
    tx={isFollow
      ? `blogs.unsharePost`
      : `blogs.sharePost`}
    txSuccessCb={() => setTriggerReload(!triggerReload) }
  />;
}

type PropsShareButtonComment = {
  commentId: CommentId
};

export function ShareButtonComment (props: PropsShareButtonComment) {
  const { commentId } = props;
  const { state: { address: myAddress } } = useMyAccount();

  const dataForQuery = new Tuple([AccountId, BlogId], [new AccountId(myAddress), commentId]);

  const [ isFollow, setIsFollow ] = useState(false);
  const [ triggerReload, setTriggerReload ] = useState(false);

  useEffect(() => {
    const load = async () => {
      const _isFollow = await (api.query.blogs[`commentSharedByAccount`](dataForQuery)) as Bool;
      setIsFollow(_isFollow.valueOf());
    };
    load().catch(err => console.log(err));

  }, [ commentId ]);

  const buildTxParams = () => {
    return [ commentId ];
  };

  return <TxButton
    type='submit'
    compact
    size='tiny'
    isBasic={true}
    isPrimary={false}
    label={isFollow
      ? 'Unshare post'
      : 'Share post'}
    params={buildTxParams()}
    tx={isFollow
      ? `blogs.unshareComment`
      : `blogs.shareComment`}
    txSuccessCb={() => setTriggerReload(!triggerReload) }
  />;
}
