// Copyright 2017-2019 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BareProps } from './types';

import BN from 'bn.js';
import React from 'react';
import { AccountId, AccountIndex, Address, Balance } from '@polkadot/types';
import { withCall, withMulti } from '@polkadot/ui-api/index';

import classes from './util/classes';
import toShortAddress from './util/toShortAddress';
import BalanceDisplay from './Balance';
import IdentityIcon from './IdentityIcon';

import { findNameByAddress, nonEmptyStr } from '@polkadot/df-utils/index';
import { FollowAccountButton } from '@dappforce/blogs/FollowButton';
import { Popup, Grid } from 'semantic-ui-react';
import { MyAccountProps, withMyAccount } from '@polkadot/df-utils/MyAccount';
import { queryBlogsToProp } from '@dappforce/blogs/utils';
import { SocialAccount, Profile, ProfileData } from '@dappforce/blogs/types';
import { getJsonFromIpfs } from '@dappforce/blogs/OffchainUtils';

type Props = MyAccountProps & BareProps & {
  balance?: Balance | Array<Balance> | BN,
  children?: React.ReactNode,
  isPadded?: boolean,
  extraDetails?: React.ReactNode,
  isShort?: boolean,
  session_validators?: Array<AccountId>,
  value?: AccountId | AccountIndex | Address | string,
  name?: string,
  size?: number,
  withAddress?: boolean,
  withBalance?: boolean,
  withName?: boolean,
  withMemo?: boolean
};

class AddressMini extends React.PureComponent<Props> {
  constructor (props: Props) {
    super(props);
  }
  render () {
    const { children, myAddress, className, isPadded = true, extraDetails, session_validators, style, size, value } = this.props;

    if (!value) {
      return null;
    }

    const address = value.toString();
    const isValidator = (session_validators || []).find((validator) =>
      validator.toString() === address
    );

    const renderFollowButton = <div className='DfFollowButton'><FollowAccountButton address={address} /> </div>;

    const renderAutorPreview = () => (
    <div
      className={classes('ui--AddressMini', isPadded ? 'padded' : '', className)}
      style={style}
    >
      <div className='ui--AddressMini-info'>
        <IdentityIcon
          isHighlight={!!isValidator}
          size={size || 36}
          value={address}
        />
        <div>
        {myAddress !== address
        ? <Popup
            trigger={this.renderAddress(address)}
            flowing
            hoverable
        >
        <Grid centered divided columns={1}>
          <Grid.Column textAlign='center'>
            {renderFollowButton}
          </Grid.Column>
          </Grid>
        </Popup>
        : this.renderAddress(address)}
          <div className='ui--AddressMini-details'>
            {this.renderName(address)}
            {extraDetails}
            {this.renderBalance()}
            {this.renderMemo(address)}
          </div>
        </div>
        {children}
      </div>
    </div>
    );

    return renderAutorPreview();
  }

  private renderAddress (address: string) {
    const { isShort = true, withAddress = true } = this.props;
    if (!withAddress) {
      return null;
    }

    return (
      <div className='ui--AddressMini-address'>
        {isShort ? toShortAddress(address) : address}
      </div>
    );
  }

  private renderName (address: string) {
    let { name, withName = false } = this.props;
    if (!withName) {
      return null;
    }

    name = name ? name : findNameByAddress(address);
    return (nonEmptyStr(name) ?
      <div className='ui--AddressSummary-name'>
        Name: <b style={{ textTransform: 'uppercase' }}>{name}</b>
      </div> : null
    );
  }

  private renderBalance () {
    const { balance, value, withBalance = false } = this.props;
    if (!withBalance || !value) {
      return null;
    }

    return (
      <BalanceDisplay
        label='Balance: '
        balance={balance}
        className='ui--AddressSummary-balance'
        params={value}
      />
    );
  }

  private renderMemo (address: string) {
    let { withMemo = false } = this.props;
    if (!withMemo) {
      return null;
    }

    return <div className='ui--AddressSummary-memo'>
      Memo: <b><MemoView accountId={address} preview={true} showEmpty={true} /></b>
    </div>;
  }
}

export default withMulti(
  AddressMini,
  withMyAccount,
  withCall('query.session.validators')
);
