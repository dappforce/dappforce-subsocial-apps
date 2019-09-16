import React, { useState } from 'react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { AccountId } from '@polkadot/types';
import { queryBlogsToProp } from './utils';
import { Modal, Button } from 'semantic-ui-react';
import _ from 'lodash';
import AddressMini from '@polkadot/ui-app/AddressMiniJoy';

type Props = {
  following?: AccountId[],
  followingCount: Number
};

const InnerFollowingModal = (props: Props) => {

  const { following, followingCount } = props;
  console.log(following);
  const [open, setOpen] = useState(false);

  const renderFollowing = () => {
    return following && following.map((account, index) =>
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
      trigger={<Button basic onClick={() => setOpen(true)}>Following ({followingCount})</Button>}
      centered={true}
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header><h1>Following ({followingCount})</h1></Modal.Header>
      <Modal.Content scrolling>
        {renderFollowing()}
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' onClick={() => setOpen(false)} />
      </Modal.Actions>
    </Modal>
  );
};

export const AccountFollowingModal = withMulti(
  InnerFollowingModal,
  withCalls<Props>(
    queryBlogsToProp('accountsFollowedByAccount', { paramName: 'id', propName: 'following' })
  )
);
