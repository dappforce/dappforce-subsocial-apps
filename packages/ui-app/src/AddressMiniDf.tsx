// Copyright 2017-2019 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BareProps } from './types';

import BN from 'bn.js';
import React, { useState } from 'react';
import { AccountId, AccountIndex, Address, Balance, Option } from '@polkadot/types';
import { withCall, withMulti, withCalls } from '@polkadot/ui-api/index';

import classes from './util/classes';
import toShortAddress from './util/toShortAddress';
import BalanceDisplay from './Balance';
import IdentityIcon from './IdentityIcon';
import { findNameByAddress, nonEmptyStr } from '@polkadot/df-utils/index';
import { FollowAccountButton } from '@dappforce/blogs/FollowButton';
import { Popup } from 'semantic-ui-react';
import { MyAccountProps, withMyAccount } from '@polkadot/df-utils/MyAccount';
import { queryBlogsToProp, LoadSocialAccount } from '@dappforce/blogs/utils';
import { SocialAccount, Profile, ProfileData } from '@dappforce/blogs/types';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { AccountFollowersModal, AccountFollowingModal } from '@dappforce/blogs/FollowModal';

const LIMIT_SUMMARY = 40;

export type Props = MyAccountProps & BareProps & {
  socialAccountOpt?: Option<SocialAccount>,
  socialAccount?: SocialAccount,
  profile?: Profile,
  profileData?: ProfileData,
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
  withFollowButton?: boolean
};

function AddressMini (props: Props) {

  const {
    children,
    myAddress,
    className,
    isPadded = true,
    extraDetails,
    session_validators,
    style,
    size,
    value,
    socialAccount,
    profile = {} as Profile,
    profileData = {} as ProfileData,
    withFollowButton } = props;
  if (!value) {
    return null;
  }

  const address = value.toString();
  const isValidator = (session_validators || []).find((validator) =>
    validator.toString() === address
  );

  const followers = socialAccount && socialAccount.followers_count.toNumber();
  const following = socialAccount && socialAccount.following_accounts_count.toNumber();
  const {
    username
  } = profile;

  const {
    fullname,
    avatar,
    about = ''
  } = profileData;
  const summary = about.length > LIMIT_SUMMARY ? about.substr(0,LIMIT_SUMMARY) + '...' : about;

  const [ popupOpen, setPopupOpen ] = useState(false);
  const [ followersOpen, setFollowersOpen ] = useState(false);
  const [ followingOpen, setFollowingOpen ] = useState(false);

  const openFollowersModal = () => {
    setFollowersOpen(true);
    setPopupOpen(false);
  };

  const openFollowingModal = () => {
    setFollowingOpen(true);
    setPopupOpen(false);
  };

  const hasAvatar = avatar && nonEmptyStr(avatar);
  const isMyProfile: boolean = address === myAddress;

  const renderFollowButton = (!isMyProfile)
    ? <div className = 'AddressMini follow'><FollowAccountButton address={address}/></div>
    : null;

  const renderAutorPreview = () => (
    <div
      className={classes('ui--AddressMini', isPadded ? 'padded' : '', className)}
      style={style}
    >
      <div className='ui--AddressMini-info'>
        {hasAvatar
          ? <img className='DfAvatar' height={size || 36} width={size || 36} src={avatar} />
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
              onClose={() => setPopupOpen(false)}
              onOpen={() => setPopupOpen(true)}
              open={popupOpen}
              flowing
              hoverable
            >
            {renderProfilePreview()}
            </Popup>
            : renderAddress(address)
          }
            {followersOpen && <AccountFollowersModal id={address} followersCount={followers} open={followersOpen} close={() => setFollowersOpen(false)} title={'Followers'}/>}
            {followingOpen && <AccountFollowingModal id={address} followingCount={following} open={followingOpen} close={() => setFollowingOpen(false)} title={'Following'}/>}
          <div className='ui--AddressMini-details'>
            {renderName(address)}
            {extraDetails}
            {renderBalance()}
          </div>
        </div>
        {withFollowButton && renderFollowButton}
        {children}
      </div>
    </div>
  );

  return renderAutorPreview();

  function renderProfilePreview () {
    return <div>
      <div className={`item ProfileDetails MyProfile`}>
        {hasAvatar
          ? <img className='DfAvatar' height={size || 48} width={size || 48} src={avatar} />
          : <IdentityIcon className='image' value={address} size={40} />
        }
        <div className='content'>
          <div className='header'>
            {renderAddressForProfile(address)}
          </div>
        </div>
        {renderFollowButton}
      </div>
      <div className='DfPopup-about'>
        <ReactMarkdown source={summary} linkTarget='_blank' />
      </div>
      <div>
      <Link to='#' onClick={openFollowersModal}>Followers: {followers}</Link>
      <Link to='#' onClick={openFollowingModal}>Following: {following}</Link>
      </div>
    </div>;
  }

  function renderAddressForProfile (address: string) {
    const { withAddress = true } = props;
    if (!withAddress) {
      return null;
    }

    return (
      <div className='ui--AddressMini-address'>
        <b>{fullname || toShortAddress(address)}</b>
        <div className='DfPopup-username'>{username}</div>
      </div>
    );
  }

  function renderAddress (address: string) {
    const { isShort = true, withAddress = true } = props;
    if (!withAddress) {
      return null;
    }

    return (
      <div className='ui--AddressMini-address'>
        <p>{fullname || username || (isShort ? toShortAddress(address) : address)}</p>
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
  ),
  LoadSocialAccount
);
