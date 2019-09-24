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
import { findNameByAddress, nonEmptyStr } from '@polkadot/df-utils/index';
import { FollowAccountButton } from '@dappforce/blogs/FollowButton';
import { Popup } from 'semantic-ui-react';
import { MyAccountProps, withMyAccount } from '@polkadot/df-utils/MyAccount';
import { queryBlogsToProp } from '@dappforce/blogs/utils';
import { SocialAccount, Profile, ProfileData } from '@dappforce/blogs/types';
import { getJsonFromIpfs } from '@dappforce/blogs/OffchainUtils';
import ReactMarkdown from 'react-markdown';
import { MutedSpan } from '@polkadot/df-utils/MutedText';
import { Link } from 'react-router-dom';
import { AccountFollowersModal } from '@dappforce/blogs/FollowersModal';
import { AccountFollowingModal } from '@dappforce/blogs/FollowingModal';

const LIMIT_SUMMARY = 40;

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
  withFollowButton?: boolean
};

function AddressMini (props: Props) {

  const { children, myAddress, className, isPadded = true, extraDetails, session_validators, style, size, value, socialAccountOpt, withFollowButton } = props;
  if (!value) {
    return null;
  }

  const address = value.toString();
  const isValidator = (session_validators || []).find((validator) =>
    validator.toString() === address
  );

  let socialAccount: SocialAccount | undefined = undefined;
  let profile: Profile = {} as Profile;

  if (socialAccountOpt && socialAccountOpt.isSome) {
    socialAccount = socialAccountOpt.unwrap();
    profile = socialAccount.profile.unwrapOr({}) as Profile;
  }

  const followers = socialAccount && socialAccount.followers_count.toNumber();
  const following = socialAccount && socialAccount.following_accounts_count.toNumber();
  const {
    username,
    ipfs_hash
  } = profile;
  const [ profileData , setProfileData ] = useState({} as ProfileData);
  const {
    fullname,
    avatar
  } = profileData;
  const [ summary, setSummary ] = useState('');

  useEffect(() => {
    if (!ipfs_hash) {
      setProfileData({} as ProfileData);
      return;
    }

    getJsonFromIpfs<ProfileData>(ipfs_hash).then(json => {
      setProfileData(json);
      const summary = json.about.length > LIMIT_SUMMARY ? json.about.substr(0,LIMIT_SUMMARY) + '...' : json.about;
      setSummary(summary);
    }).catch(err => console.log(err));
  }, [address, ipfs_hash]);

  const [ open, setOpen ] = useState(false);
  const [ openFollowers, setOpenFollowers ] = useState(false);
  const [ openFollowing, setOpenFollowing ] = useState(false);

  const openFollowersModal = () => {
    setOpenFollowers(true);
    setOpen(false);
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
              onClose={() => setOpen(false)}
              onOpen={() => setOpen(true)}
              open={open}
              flowing
              hoverable
            >
            {renderProfilePreview()}
            </Popup>
            : renderAddress(address)
          }
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
      <Link to='#' onClick={() => openFollowersModal()}>Followers: {followers} </Link>
      <Link to='#' onClick={() => setOpenFollowing(true)}>Following: {following} </Link>
      </div>
      {openFollowers && <AccountFollowersModal id={address} followersCount={followers} open={openFollowers} close={() => setOpenFollowers(false)}/>}
      {openFollowing && <AccountFollowingModal id={address} followingCount={following} open={openFollowing} close={() => setOpenFollowing(false)}/>}
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
  )
);
