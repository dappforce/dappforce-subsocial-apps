import React, { useState } from 'react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { AccountId } from '@polkadot/types';
import { queryBlogsToProp } from './utils';
import { Modal, Button } from 'semantic-ui-react';
import _ from 'lodash';
import AddressMini from '@polkadot/ui-app/AddressMiniDf';

type Props = {
  followers?: AccountId[],
  followersCount: Number
};

const InnerFollowersModal = (props: Props) => {

  const { followers, followersCount } = props;
  console.log(followers);
  const [open, setOpen] = useState(false);

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
        />
      </div>
    );
  };

  return (
    <Modal
      open={open}
      dimmer='blurring'
      trigger={<Button basic onClick={() => setOpen(true)}>Followers ({followersCount})</Button>}
      centered={true}
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header><h1>Followers ({followersCount})</h1></Modal.Header>
      <Modal.Content scrolling>
        {renderFollowers()}
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' onClick={() => setOpen(false)} />
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
