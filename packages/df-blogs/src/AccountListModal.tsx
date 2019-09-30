import React from 'react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { AccountId } from '@polkadot/types';
import { queryBlogsToProp } from '@polkadot/df-utils/index';
import { Modal, Button } from 'semantic-ui-react';
import _ from 'lodash';
import AddressMini from '@polkadot/ui-app/AddressMiniDf';

type Props = {
  followers?: AccountId[],
  followersCount: Number,
  title: string,
  open: boolean,
  close: () => void
};

const InnerFollowersModal = (props: Props) => {

  const { followers, followersCount = 0, open, close, title } = props;

  const renderFollowers = () => {
    return followers && followers.map((account, index) =>
      <div key={index} style={{ textAlign: 'left', margin: '1rem' }}>
        <AddressMini
          value={account}
          isShort={true}
          isPadded={false}
          size={48}
          withName
          withBalance
          withFollowButton
        />
      </div>
    );
  };

  // const renderAsLink = () => (
  //   asLink
  //   ? <Link to='# ' onClick={() => setOpen(true)}>Followers ({followersCount})</Link>
  //   : <Button basic onClick={() => setOpen(true)}>Followers ({followersCount})</Button>
  // );

  return (
    <Modal
      open={open}
      centered={true}
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header><h1>{title} ({followersCount})</h1></Modal.Header>
      <Modal.Content scrolling>
        {renderFollowers()}
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' onClick={close} />
      </Modal.Actions>
    </Modal>
  );
};

export const BlogFollowersModal = withMulti(
  InnerFollowersModal,
  withCalls<Props>(
    queryBlogsToProp('blogFollowers', { paramName: 'id', propName: 'followers' })
  )
);

export const AccountFollowersModal = withMulti(
  InnerFollowersModal,
  withCalls<Props>(
    queryBlogsToProp('accountFollowers', { paramName: 'id', propName: 'followers' })
  )
);

export const AccountFollowingModal = withMulti(
  InnerFollowersModal,
  withCalls<Props>(
    queryBlogsToProp('accountsFollowedByAccount', { paramName: 'id', propName: 'following' })
  )
);

