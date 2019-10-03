
import { BareProps } from './types';

import BN from 'bn.js';
import React, { useState } from 'react';
import { AccountId, AccountIndex, Address, Balance, Option } from '@polkadot/types';
import { withCall, withMulti, withCalls } from '@polkadot/ui-api/index';

import classes from './util/classes';
import toShortAddress from './util/toShortAddress';
import BalanceDisplay from './Balance';
import IdentityIcon from './IdentityIcon';
import { findNameByAddress, nonEmptyStr, queryBlogsToProp } from '@polkadot/df-utils/index';
import { FollowAccountButton } from '@dappforce/blogs/FollowButton';
import { Popup } from 'semantic-ui-react';
import { MyAccountProps, withMyAccount } from '@polkadot/df-utils/MyAccount';
import { withSocialAccount, pluralizeText } from '@dappforce/blogs/utils';
import { SocialAccount, Profile, ProfileData } from '@dappforce/blogs/types';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { AccountFollowersModal, AccountFollowingModal } from '@dappforce/blogs/AccountsListModal';

const LIMIT_SUMMARY = 40;

export type Props = MyAccountProps & BareProps & {
  socialAccountOpt?: Option<SocialAccount>,
  profile?: Profile,
  profileData?: ProfileData,
  socialAccount?: SocialAccount,
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
  withFollowButton?: boolean,
  optionalProfile: boolean,
  date: string,
  event?: string,
  count?: number,
  subject?: React.ReactNode,
  asActivity?: boolean
};

function AddressMini (props: Props) {

  const { children,
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
    withFollowButton,
    asActivity = false,
    date,
    event,
    count,
    subject } = props;
  if (!value) {
    return null;
  }

  const address = value.toString();
  const isValidator = (session_validators || []).find((validator) =>
    validator.toString() === address
  );

  const followers = socialAccount !== undefined ? socialAccount.followers_count.toNumber() : 0;
  const following = socialAccount !== undefined ? socialAccount.following_accounts_count.toNumber() : 0;

  const {
    username
  } = profile;

  const {
    fullname,
    avatar,
    about
  } = profileData;

  const summary = about !== undefined && about.length > LIMIT_SUMMARY ? about.substr(0,LIMIT_SUMMARY) + '...' : about;

  const [ popupOpen, setPopupOpen ] = useState(false);
  const [ followersOpen, setFollowersOpen ] = useState(false);
  const [ followingOpen, setFollowingOpen ] = useState(false);

  const openFollowersModal = () => {
    if (!followers) return;

    setFollowersOpen(true);
    setPopupOpen(false);
  };

  const openFollowingModal = () => {
    if (!following) return;

    setFollowingOpen(true);
    setPopupOpen(false);
  };

  const hasAvatar = avatar && nonEmptyStr(avatar);
  const isMyProfile: boolean = address === myAddress;
  const renderCount = () => (count && `and ${count} people `);

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
        <div className='DfAddressMini-popup'>
          <Popup
            trigger={renderAddress(address)}
            onClose={() => setPopupOpen(false)}
            onOpen={() => setPopupOpen(true)}
            open={popupOpen}
            flowing
            hoverable
          >
          {renderProfilePreview()}
          </Popup>
          {followersOpen && <AccountFollowersModal id={address} followersCount={followers} open={followersOpen} close={() => setFollowersOpen(false)} title={pluralizeText(followers, 'Follower')}/>}
          {followingOpen && <AccountFollowingModal id={address} followingCount={following} open={followingOpen} close={() => setFollowingOpen(false)} title={'Following'}/>}
          {renderName(address)}
          {asActivity
            ? renderPreviewForActivity()
            : renderPreviewForAddress()
          }
        </div>
        {withFollowButton && renderFollowButton}
        {children}
      </div>
    </div>
  );

  return renderAutorPreview();

  function renderPreviewForAddress () {
    return <div className='ui--AddressMini-details'>
      {extraDetails}
      {renderBalance()}
    </div>;
  }

  function renderPreviewForActivity () {
    return <><div>
      {renderCount()}
      <div className='DfActivityStreamItem-details event'>
        {event}
      </div>
      <div className='DfActivityStreamItem-details subject'>
        {subject}
      </div>
    </div>
    <div className='DfActivityStreamItem-details date'>
      {date}
    </div>
    </>;
  }

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
      <div className='DfPopup-links'>
        <Link to='#' onClick={openFollowersModal} className={followers ? '' : 'disable'}>{pluralizeText(followers, 'Follower')}</Link>
        <Link to='#' onClick={openFollowingModal} className={following ? '' : 'disable'}><b>{following}</b> Following</Link>
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
  withSocialAccount
);
