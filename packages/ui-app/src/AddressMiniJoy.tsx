// Copyright 2017-2019 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BareProps } from './types';

import BN from 'bn.js';
import React, { useState, useEffect } from 'react';
import { AccountId, AccountIndex, Address, Balance, Option } from '@polkadot/types';
import { withCall, withMulti, withCalls } from '@polkadot/ui-api/index';

import classes from './util/classes';
import toShortAddress from './util/toShortAddress';
import BalanceDisplay from './Balance';
import IdentityIcon from './IdentityIcon';
import { findNameByAddress, nonEmptyStr } from '@polkadot/joy-utils/index';
import { FollowAccountButton } from '@dappforce/blogs/FollowButton';
import { Popup, Grid } from 'semantic-ui-react';
import { MyAccountProps, withMyAccount } from '@polkadot/joy-utils/MyAccount';
import { queryBlogsToProp } from '@dappforce/blogs/utils';
import { SocialAccount, Profile, ProfileData } from '@dappforce/blogs/types';
import { getJsonFromIpfs } from '@dappforce/blogs/OffchainUtils';

type Props = MyAccountProps & BareProps & {
  socialAccountOpt?: Option<SocialAccount>,
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

function AddressMini (props: Props) {

  const { children, myAddress, className, isPadded = true, extraDetails, session_validators, style, size, value, socialAccountOpt } = props;

  if (!value) {
    return null;
  }

  const address = value.toString();
  const isValidator = (session_validators || []).find((validator) =>
    validator.toString() === address
  );

  const profile: Profile =
    socialAccountOpt && socialAccountOpt.isSome
    ? socialAccountOpt.unwrap().profile.unwrapOr({}) as Profile
    : {} as Profile;

  const {
    ipfs_hash
  } = profile;
  const [ profileData , setProfileData ] = useState({} as ProfileData);
  const {
    avatar
  } = profileData;

  useEffect(() => {
    if (!ipfs_hash) {
      setProfileData({} as ProfileData);
      return;
    }

    getJsonFromIpfs<ProfileData>(ipfs_hash).then(json => {
      setProfileData(json);
    }).catch(err => console.log(err));
  }, [address, ipfs_hash]);

  const hasAvatar = avatar && nonEmptyStr(avatar);

  const renderFollowButton = <div className='DfFollowButton'><FollowAccountButton address={address} /> </div>;

  const renderAutorPreview = () => (
    <div
      className={classes('ui--AddressMini', isPadded ? 'padded' : '', className)}
      style={style}
    >
      <div className='ui--AddressMini-info'>
        {hasAvatar
          ? <img className='ui avatar image' src={avatar} />
          : <IdentityIcon
            isHighlight={!!isValidator}
            size={size || 36}
            value={address}
          />
        }
        <div>
          {myAddress !== address
            ? <Popup
                trigger={renderAddress(address)}
                flowing
                hoverable
            >
              <Grid centered divided columns={1}>
                <Grid.Column textAlign='center'>
                  {renderFollowButton}
                </Grid.Column>
              </Grid>
            </Popup>
            : renderAddress(address)
          }
          <div className='ui--AddressMini-details'>
            {renderName(address)}
            {extraDetails}
            {renderBalance()}
          </div>
        </div>
        {children}
      </div>
    </div>
  );

  return renderAutorPreview();

  function renderAddress (address: string) {
    const { isShort = true, withAddress = true } = props;
    if (!withAddress) {
      return null;
    }

    return (
      <div className='ui--AddressMini-address'>
        {isShort ? toShortAddress(address) : address}
      </div>
    );
  }

  function renderName (address: string) {
    let { name, withName = false } = props;
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

  function renderBalance () {
    const { balance, value, withBalance = false } = props;
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
}

export default withMulti(
  AddressMini,
  withMyAccount,
  withCall('query.session.validators'),
  withCalls<Props>(
    queryBlogsToProp('socialAccountById',
      { paramName: 'value', propName: 'socialAccountOpt' })
  )
);
