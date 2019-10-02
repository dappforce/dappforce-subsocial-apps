import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { AccountId } from '@polkadot/types';
import IdentityIcon from '@polkadot/ui-app/IdentityIcon';

import { nonEmptyStr, queryBlogsToProp } from '@polkadot/df-utils/index';
import { SocialAccount, ProfileData, Profile } from './types';
import { withIdFromMyAddress, withSocialAccount, withRequireProfile, pluralizeText } from './utils';
import _ from 'lodash';
import { Dropdown, Icon } from 'semantic-ui-react';
import { useMyAccount } from '@polkadot/df-utils/MyAccountContext';
import { FollowAccountButton } from './FollowButton';
import { AccountFollowersModal, AccountFollowingModal } from './AccountsListModal';
import { ProfileHistoryModal } from './ListsEditHistory';
import TxButton from '@polkadot/df-utils/TxButton';
import { toShortAddress } from '@polkadot/ui-app/util';

export type Props = {
  preview?: boolean,
  nameOnly?: boolean,
  id: AccountId,
  profile?: Profile,
  profileData?: ProfileData,
  socialAccount?: SocialAccount,
  followers?: AccountId[],
  size?: number
};

function Component (props: Props) {

  const {
    id,
    preview = false,
    nameOnly = false,
    size,
    socialAccount,
    profile = {} as Profile,
    profileData = {} as ProfileData
  } = props;

  const address = id.toString();
  const profileIsNone = !socialAccount || socialAccount && socialAccount.profile.isNone;
  const followers = socialAccount ? socialAccount.followers_count.toNumber() : 0;
  const following = socialAccount ? socialAccount.following_accounts_count.toNumber() : 0;

  const [ followersOpen, setFollowersOpen ] = useState(false);
  const [ followingOpen, setFollowingOpen ] = useState(false);

  const {
    username
  } = profile;

  const {
    fullname,
    avatar,
    about,
    facebook,
    twitter,
    linkedIn,
    github,
    instagram
  } = profileData;

  const hasAvatar = avatar && nonEmptyStr(avatar);
  const hasFacebookLink = facebook && nonEmptyStr(facebook);
  const hasTwitterLink = twitter && nonEmptyStr(twitter);
  const hasLinkedInLink = linkedIn && nonEmptyStr(linkedIn);
  const hasGithubLink = github && nonEmptyStr(github);
  const hasInstagramLink = instagram && nonEmptyStr(instagram);

  const renderCreateProfileButton = profileIsNone &&
    <Link to={`/blogs/accounts/new`} style={ { marginTop: '.5rem' } } className='ui tiny button primary'>
      <i className='plus icon' />
      Create profile
    </Link>;

  const renderDropDownMenu = () => {

    if (profileIsNone) return null;

    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    return (<Dropdown icon='ellipsis horizontal'>
      <Dropdown.Menu>
        {<Link className='item' to={`/blogs/accounts/${address}/edit`}>Edit</Link>}
        <Dropdown.Item text='View edit history' onClick={() => setOpen(true)} />
        {open && <ProfileHistoryModal id={id} open={open} close={close}/>}
      </Dropdown.Menu>
    </Dropdown>);
  };

  const renderNameOnly = () => (<>
    <div className='handle'>{fullname || username || address}</div></>);

  const renderPreview = () => {
    return <>
      <div className={`item ProfileDetails MyProfile`}>
        {hasAvatar
          ? <img className='DfAvatar' height={size || 48} width={size || 48} src={avatar} />
          : <IdentityIcon className='image' value={address} size={size || 48} />
        }
        <div className='content'>
          <div className='header'>
            {renderNameOnly()}
            {renderDropDownMenu()}
          </div>
          {renderCreateProfileButton}
          <div className='about'>
            <ReactMarkdown className='DfMd' source={about} linkTarget='_blank' />
            <div className='DfSocialLinks'>
              {hasFacebookLink &&
                <a
                  href={facebook}
                  target='_blank'
                >
                  <Icon className='facebook'/>Facebook
                </a>
              }
              {hasTwitterLink &&
                <a
                  href={twitter}
                  target='_blank'
                >
                  <Icon className='twitter' />Twitter
                </a>}
              {hasLinkedInLink &&
                <a
                  href={linkedIn}
                  target='_blank'
                >
                  <Icon className='linkedin' />LinkedIn
                </a>
              }
              {hasGithubLink &&
                <a
                  href={github}
                  target='_blank'
                >
                  <Icon className='github' />GitHub
                </a>
              }
              {hasInstagramLink &&
                <a
                  href={instagram}
                  target='_blank'
                >
                <Icon className='instagram' />Instagram
                </a>
              }
            </div>
          </div>
        </div>
      </div>
    </>;
  };

  if (nameOnly) {
    return renderNameOnly();
  } else if (preview) {
    return renderPreview();
  }

  return <>
    <div className='ui massive relaxed middle aligned list FullProfile'>
      {renderPreview()}
    </div>
    <FollowAccountButton address={address}/>
    <TxButton isBasic={true} isPrimary={false} onClick={() => setFollowersOpen(true)} isDisabled={followers === 0}>{pluralizeText(followers, 'follower')} </TxButton>
    <TxButton isBasic={true} isPrimary={false} onClick={() => setFollowingOpen(true)} isDisabled={following === 0}>{following} following </TxButton>
    {followersOpen && <AccountFollowersModal id={id} accountsCount={followers} open={followersOpen} close={() => setFollowersOpen(false)} title={pluralizeText(followers, 'follower')}/>}
    {followingOpen && <AccountFollowingModal id={id} accountsCount={following} open={followingOpen} close={() => setFollowingOpen(false)} title={'following'}/>}
  </>;
}

export default withMulti(
  Component,
  withIdFromMyAddress,
  withCalls<Props>(
    queryBlogsToProp('socialAccountById',
      { paramName: 'id', propName: 'socialAccountOpt' })
  ),
  withSocialAccount
);
