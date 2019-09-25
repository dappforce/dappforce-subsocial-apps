import BN from 'bn.js';
import React, { useState, useEffect } from 'react';
import { AccountId, AccountIndex, Address, Balance, Option } from '@polkadot/types';
import { withCall, withMulti, withCalls } from '@polkadot/ui-api/index';

import { findNameByAddress, nonEmptyStr } from '@polkadot/df-utils/index';
import { FollowAccountButton } from '@dappforce/blogs/FollowButton';
import { Popup } from 'semantic-ui-react';
import { MyAccountProps, withMyAccount } from '@polkadot/df-utils/MyAccount';
import { BareProps } from '@polkadot/ui-app/types';
import { classes, toShortAddress } from '@polkadot/ui-app/util';
import IdentityIcon from '@polkadot/ui-identicon/Identicon';
import { queryBlogsToProp } from './utils';
import { ProfileData, Profile, SocialAccount } from './types';
import { getJsonFromIpfs } from './OffchainUtils';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { AccountFollowersModal, AccountFollowingModal } from '@dappforce/blogs/FollowModal';

const LIMIT_SUMMARY = 40;

type Props = MyAccountProps & BareProps & {
  socialAccountOpt?: Option<SocialAccount>,
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

function ActivityStreamItem (props: Props) {

  const { children, myAddress, className, isPadded = true, date, event, count, subject, session_validators, style, size, value, socialAccountOpt } = props;

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
    if (!ipfs_hash) return;

    getJsonFromIpfs<ProfileData>(ipfs_hash).then(json => {
      setProfileData(json);
      const summary = json.about.length > LIMIT_SUMMARY ? json.about.substr(0,LIMIT_SUMMARY) + '...' : json.about;
      setSummary(summary);
    }).catch(err => console.log(err));
  }, [address, ipfs_hash]);

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

  const renderCount = () => (count && `and ${count} people `);

  const renderFollowButton = <div className='DfFollowButton'><FollowAccountButton address={address} /> </div>;

  const renderPreview = () => (
    <div
      className={classes('DfActivityStreamItem', isPadded ? 'padded' : '', className)}
      style={style}
    >
      <div className='DfActivityStreamItem-info'>
      {hasAvatar
        ? <img className='ui avatar image' src={avatar}/>
        : <IdentityIcon
          isHighlight={!!isValidator}
          size={size || 36}
          value={address}
        />
      }
      <div className='DfActivityStreamItem-popup'>
        {myAddress !== address &&
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
        }
          {followersOpen && <AccountFollowersModal id={address} followersCount={followers} open={followersOpen} close={() => setFollowersOpen(false)} title={'Followers'}/>}
          {followingOpen && <AccountFollowingModal id={address} followingCount={following} open={followingOpen} close={() => setFollowingOpen(false)} title={'Following'}/>}
          {renderName(address)}
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
      {children}
      </div>
    </div>
  );

  return renderPreview();

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
      <div className='DfActivityStreamItem-address'>
        <b>{fullname || username || (isShort ? toShortAddress(address) : address)}</b>
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
      <div className='DfActivityStreamItem-details name'>
        <b>{name}</b>
      </div> : null
    );
  }
}

export default withMulti(
  ActivityStreamItem,
  withMyAccount,
  withCall('query.session.validators'),
  withCalls<Props>(
    queryBlogsToProp('socialAccountById',
      { paramName: 'value', propName: 'socialAccountOpt' })
  )
);
