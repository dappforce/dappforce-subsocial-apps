import React, { useState } from 'react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { AccountId } from '@polkadot/types';
import { queryBlogsToProp } from './utils';
import { Modal, Button } from 'semantic-ui-react';
import _ from 'lodash';
import AddressMini from '@polkadot/ui-app/AddressMiniDf';

type Props = {
  followers?: AccountId[],
  followersCount: Number,
  open: boolean,
  close: () => void
};

const InnerFollowersModal = (props: Props) => {

  const { followers, followersCount, open, close } = props;
  console.log(followers);

  const renderFollowers = () => {
    return followers && followers.map((account, index) =>
      <div key={index} style={{ textAlign: 'left', margin: '1rem'}}>
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
      <Modal.Header><h1>Followers ({followersCount})</h1></Modal.Header>
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
