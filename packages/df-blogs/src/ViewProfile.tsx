import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { Option, AccountId } from '@polkadot/types';
import IdentityIcon from '@polkadot/ui-app/IdentityIcon';

import { getJsonFromIpfs } from './OffchainUtils';
import { nonEmptyStr } from '@polkadot/joy-utils/index';
import { SocialAccount, ProfileData, Profile } from './types';
import { queryBlogsToProp } from './utils';
import _ from 'lodash';
import { Dropdown, Icon } from 'semantic-ui-react';
import { useMyAccount } from '@polkadot/joy-utils/MyAccountContext';

type Props = {
  preview?: boolean,
  extraPreview?: boolean,
  id: AccountId,
  socialAccountOpt?: Option<SocialAccount>,
  followers?: AccountId[]
};

function Component (props: Props) {
  const { socialAccountOpt } = props;

  if (socialAccountOpt === undefined) return <em>Loading...</em>;
  else if (socialAccountOpt.isNone) return <em>Social account not found yet.</em>;

  const socialAccount = socialAccountOpt.unwrap();
  const profileOpt = socialAccount.profile;

  if (profileOpt.isNone) return <em>Profile is not created yet.</em>;

  const profile = profileOpt.unwrap() as Profile;

  const {
    preview = false,
    extraPreview = false
  } = props;

  const {
    created: { account },
    username,
    ipfs_hash
  } = profile;

  const [ profileData , setProfileData ] = useState({} as ProfileData);
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

  useEffect(() => {
    if (!ipfs_hash) return;
    getJsonFromIpfs<ProfileData>(ipfs_hash).then(json => {
      setProfileData(json);
    }).catch(err => console.log(err));
  }, [ false ]);

  const hasAvatar = avatar && nonEmptyStr(avatar);
  const hasFacebookLink = facebook && nonEmptyStr(facebook);
  const hasTwitterLink = twitter && nonEmptyStr(twitter);
  const hasLinkedInLink = linkedIn && nonEmptyStr(linkedIn);
  const hasGithubLink = github && nonEmptyStr(github);
  const hasInstagramLink = instagram && nonEmptyStr(instagram);

  const renderDropDownMenu = () => {

    return (<Dropdown icon='ellipsis horizontal'>
      <Dropdown.Menu>
        {/* // TODO refactor to /blogs/accounts/:address */}
        {<Link className='item' to={`/blogs/profile/edit`}>Edit</Link>}
        {/* <Dropdown.Item text='View edit history' onClick={() => setOpen(true)} /> */}
        {/* {open && <ProfileHistoryModal id={id} open={open} close={close}/>} */}
      </Dropdown.Menu>
    </Dropdown>);
  };

  // TODO refactor to /blogs/accounts/:address
  const renderExtraPreview = () => (<>
    <Link to={`/blogs/profile`} className='handle'>{fullname || username}</Link>
  </>);

  const renderPreview = () => {
    return <>
      <div className={`item ProfileDetails MyProfile`}>
        {hasAvatar
          ? <img className='ui avatar image' src={avatar} />
          : <IdentityIcon className='image' value={account} size={40} />
        }
        <div className='content'>
          <div className='header'>
            {renderExtraPreview()}
            {renderDropDownMenu()}
          </div>
          <div className='description'>
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

            <ReactMarkdown className='JoyMemo--full' source={about} linkTarget='_blank' />
          </div>
        </div>
      </div>
    </>;
  };

  if (extraPreview) {
    return renderExtraPreview();
  } else if (preview) {
    return renderPreview();
  }

  return <>
    <div className='ui massive relaxed middle aligned list FullProfile'>
      {renderPreview()}
    </div>
    {/* TODO: impl. */}
    {/* <FollowAccountButton blogId={id} /> */}
    {/* <AccountFollowersModal id={id} followersCount={blog.followers_count.toNumber()}/> */}
  </>;
}

function withIdFromMyAddress (Component: React.ComponentType<Props>) {
  return function () {
    const { state: { address: myAddress } } = useMyAccount();
    try {
      return <Component id={new AccountId(myAddress)}/>;
    } catch (err) {
      return <em>Invalid address: {myAddress}</em>;
    }
  };
}

export default withMulti(
  Component,
  withIdFromMyAddress,
  withCalls<Props>(
    queryBlogsToProp('socialAccountById',
      { paramName: 'id', propName: 'socialAccountOpt' })
  )
);
