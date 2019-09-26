import BN from 'bn.js';
import React from 'react';
import { AccountId, AccountIndex, Address, Balance } from '@polkadot/types';
import { withCall, withMulti } from '@polkadot/ui-api/index';

import { findNameByAddress, nonEmptyStr } from '@polkadot/df-utils/index';
import { FollowAccountButton } from '@dappforce/blogs/FollowButton';
import { Popup, Grid } from 'semantic-ui-react';
import { MyAccountProps, withMyAccount } from '@polkadot/df-utils/MyAccount';
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
  event?: string,
  count?: number
};

class ActivityStreamItem extends React.PureComponent<Props> {
  constructor (props: Props) {
    super(props);
  }

  render () {
    const { children, myAddress, className, isPadded = true, date, event, count, subject, session_validators, style, size, value } = this.props;

    if (!value) {
      return null;
    }

    const address = value.toString();
    const isValidator = (session_validators || []).find((validator) =>
      validator.toString() === address
    );

    const renderCount = () => (count && `and ${count} people `);

    const renderFollowButton = <div className='DfFollowButton'><FollowAccountButton address={address} /> </div>;

    const renderPreview = () => (
      <div
        className={classes('DfActivityStreamItem', isPadded ? 'padded' : '', className)}
        style={style}
      >
        <div className='DfActivityStreamItem-info'>
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
              </Popup>
            }
            <div className='DfActivityStreamItem-details'>
              {this.renderName(address)}
              {renderCount()}
              <div className='DfActivityStreamItem-details event'>
                {event}
              </div>
              <div className='DfActivityStreamItem-details subject'>
                {subject}
              </div>
              <div className='DfActivityStreamItem-details date'>
                {date}
              </div>
            </div>
          </div>
          {children}
        </div>
      </div>
    );

    return renderPreview();
  }

  private renderAddress (address: string) {
    const { isShort = true, withAddress = true } = this.props;
    if (!withAddress) {
      return null;
    }

    return (
      <div className='DfActivityStreamItem-address'>
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
      <div className='DfActivityStreamItem-details name'>
        <b>{name}</b>
      </div> : null
    );
  }
}

export default withMulti(
  ActivityStreamItem,
  withMyAccount,
  withCall('query.session.validators')
);
