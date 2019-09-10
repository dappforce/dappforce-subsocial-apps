// Copyright 2017-2019 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import BN from 'bn.js';
import React from 'react';
import { AccountId, AccountIndex, Address, Balance } from '@polkadot/types';
import { withCall, withMulti } from '@polkadot/ui-api/index';

import { findNameByAddress, nonEmptyStr } from '@polkadot/joy-utils/index';
import { FollowButtonAccount } from '@dappforce/blogs/FollowButton';
import { Popup, Grid } from 'semantic-ui-react';
import { MyAccountProps, withMyAccount } from '@polkadot/joy-utils/MyAccount';
import { BareProps } from '@polkadot/ui-app/types';
import { classes, toShortAddress } from '@polkadot/ui-app/util';
import IdentityIcon from '@polkadot/ui-identicon/Identicon';

type Props = MyAccountProps & BareProps & {
  balance?: Balance | Array<Balance> | BN,
  children?: React.ReactNode,
  isPadded?: boolean,
  subject?: React.ReactNode,
  isShort?: boolean,
  session_validators?: Array<AccountId>,
  value?: AccountId | AccountIndex | Address | string,
  name?: string,
  size?: number,
  withAddress?: boolean,
  withName?: boolean,
  date: string,
  event: string
};

class ActivityStreamItem extends React.PureComponent<Props> {
  constructor (props: Props) {
    super(props);
  }
  render () {
    const { children, myAddress, className, isPadded = true, date, event, subject, session_validators, style, size, value } = this.props;

    if (!value) {
      return null;
    }

    const address = value.toString();
    const isValidator = (session_validators || []).find((validator) =>
      validator.toString() === address
    );

    const renderFollowButton = <FollowButtonAccount address={address} />;

    const renderAutorPreview = () => (
    <div
      className={classes('ui--DfActivityStreamItem', isPadded ? 'padded' : '', className)}
      style={style}
    >
      <div className='ui--DfActivityStreamItem-info'>
        <IdentityIcon
          isHighlight={!!isValidator}
          size={size || 36}
          value={address}
        />
        <div>
        {myAddress !== address &&
        <Popup
            trigger={this.renderAddress(address)}
            flowing
            hoverable
        >
        <Grid centered divided columns={1}>
          <Grid.Column textAlign='center'>
            {renderFollowButton}
          </Grid.Column>
          </Grid>
        </Popup>}
          <div className='ui--DfActivityStreamItem-details'>
            {this.renderName(address)}
            <div className='ui--DfActivityStreamItem-details event'>
            {event}
            </div>
            <div className='ui--DfActivityStreamItem-details subject'>
            {subject}
            </div>
            <div className='ui--DfActivityStreamItem-details date'>
            {date}
            </div>
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
      <div className='ui--DfActivityStreamItem-address'>
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
      <div className='ui--DfActivityStreamItemSummary-name'>
        <b style={{ textTransform: 'uppercase' }}>{name}</b>
      </div> : null
    );
  }
}

export default withMulti(
  ActivityStreamItem,
  withMyAccount,
  withCall('query.session.validators')
);
