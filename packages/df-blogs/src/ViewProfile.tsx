import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { AccountId } from '@polkadot/types';
import IdentityIcon from '@polkadot/ui-app/IdentityIcon';

import { nonEmptyStr } from '@polkadot/df-utils/index';
import { SocialAccount, ProfileData, Profile } from './types';
import { queryBlogsToProp, withIdFromMyAddress, withSocialAccount, withRequireProfile } from './utils';
import _ from 'lodash';
import { Dropdown, Icon } from 'semantic-ui-react';
import { useMyAccount } from '@polkadot/df-utils/MyAccountContext';
import { FollowAccountButton } from './FollowButton';
import { AccountFollowersModal, AccountFollowingModal } from './AccountsListModal';
import { ProfileHistoryModal } from './ListsEditHistory';
import TxButton from '@polkadot/df-utils/TxButton';

export type Props = {
  preview?: boolean,
  nameOnly?: boolean,
  id: AccountId,
  profile?: Profile,
  profileData?: ProfileData,
  socialAccount?: SocialAccount,
  requireProfile?: boolean,
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
    profile,
    profileData
  } = props;

  const followers = socialAccount && socialAccount.followers_count.toNumber();
  const following = socialAccount && socialAccount.following_accounts_count.toNumber();
  const followersText = followers === 1 ? 'follower' : 'followers';

  const [ followersOpen, setFollowersOpen ] = useState(false);
  const [ followingOpen, setFollowingOpen ] = useState(false);

  if (!profileData || !profile) return null;

  const {
    created: { account },
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

  const renderDropDownMenu = () => {

    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    return (<Dropdown icon='ellipsis horizontal'>
      <Dropdown.Menu>
        {<Link className='item' to={`/blogs/accounts/${id.toString()}/edit`}>Edit</Link>}
        <Dropdown.Item text='View edit history' onClick={() => setOpen(true)} />
        {open && <ProfileHistoryModal id={id} open={open} close={close}/>}
      </Dropdown.Menu>
    </Dropdown>);
  };

  const renderNameOnly = () => (<>
    <div className='handle'>{fullname || username}</div></>);

  const renderPreview = () => {
    return <>
      <div className={`item ProfileDetails MyProfile`}>
        {hasAvatar
          ? <img className='DfAvatar' height={size || 48} width={size || 48} src={avatar} />
          : <IdentityIcon className='image' value={account} size={size || 48} />
        }
        <div className='content'>
          <div className='header'>
            {renderNameOnly()}
            {renderDropDownMenu()}
          </div>
          <div className='about'>
            {hasFacebookLink &&
              <a
                href={facebook}
                className='handle'
                target='_blank'
              >
                <Icon className='facebook'/>Facebook
              </a>
            }
            {hasTwitterLink &&
              <a
                href={twitter}
                className='handle'
                target='_blank'
              >
                <Icon className='twitter' />Twitter
              </a>
            }
            {hasLinkedInLink &&
              <a
                href={linkedIn}
                className='handle'
                target='_blank'
              >
                <Icon className='linkedIn' />LinkedIn
              </a>
            }
            {hasGithubLink &&
              <a
                href={github}
                className='handle'
                target='_blank'
              >
                <Icon className='github' />GitHub
              </a>
            }
            {hasInstagramLink &&
              <a
                href={instagram}
                className='handle'
                target='_blank'
              >
              <Icon className='instagram' />Instagram
              </a>
            }

            <ReactMarkdown className='DfMemo--full' source={about} linkTarget='_blank' />
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

  const { state: { address: myAddress } } = useMyAccount();
  const isMyProfile: boolean = id.toString() === myAddress;

  const renderFollowButton = () => {
    if (!isMyProfile) return <FollowAccountButton address={id.toString()} />;
    else return null;
  };

  return <>
    <div className='ui massive relaxed middle aligned list FullProfile'>
      {renderPreview()}
    </div>
    {renderFollowButton()}
    <TxButton isBasic={true} onClick={() => setFollowersOpen(true)}><b>{followers}</b> {followersText} </TxButton>
    <TxButton isBasic={true} onClick={() => setFollowingOpen(true)}>{following} following </TxButton>
    {followersOpen && <AccountFollowersModal id={id} accountsCount={followers} open={followersOpen} close={() => setFollowersOpen(false)} title={followersText}/>}
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
  withRequireProfile,
  withSocialAccount
);
