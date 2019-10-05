import React from 'react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { AccountId } from '@polkadot/types';
import { queryBlogsToProp } from '@polkadot/df-utils/index';
import { Modal, Button } from 'semantic-ui-react';
import AddressMini from '@polkadot/ui-app/AddressMiniDf';
import AddressMiniDf from '@polkadot/ui-app/AddressMiniDf';

type Props = {
  accounts?: AccountId[],
  accountsCount: Number,
  title: string,
  open: boolean,
  close: () => void
};

const InnerAccountsListModal = (props: Props) => {

  const { accounts, accountsCount = 0, open, close, title } = props;
  console.log(accounts);

  const renderAccounts = () => {
    return accounts && accounts.map((account, index) =>
      <div key={index} style={{ textAlign: 'left', margin: '1rem' }}>
        <AddressMiniDf
          value={account}
          isShort={true}
          isPadded={false}
          size={48}
          withFollowButton
          withProfilePreview
          withoutCounters
        />
      </div>
    );
  };

  return (
    <Modal
      open={open}
      centered={true}
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header><h1>{title}</h1></Modal.Header>
      <Modal.Content scrolling>
        {renderAccounts()}
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' onClick={close} />
      </Modal.Actions>
    </Modal>
  );
};

export const BlogFollowersModal = withMulti(
  InnerAccountsListModal,
  withCalls<Props>(
    queryBlogsToProp('blogFollowers', { paramName: 'id', propName: 'accounts' })
  )
);

export const AccountFollowersModal = withMulti(
  InnerAccountsListModal,
  withCalls<Props>(
    queryBlogsToProp('accountFollowers', { paramName: 'id', propName: 'accounts' })
  )
);

export const AccountFollowingModal = withMulti(
  InnerAccountsListModal,
  withCalls<Props>(
    queryBlogsToProp('accountsFollowedByAccount', { paramName: 'id', propName: 'accounts' })
  )
);
