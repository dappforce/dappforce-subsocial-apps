import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import ReactMarkdown from 'react-markdown';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { Option, AccountId } from '@polkadot/types';
import IdentityIcon from '@polkadot/ui-app/IdentityIcon';

import { getJsonFromIpfs } from './OffchainUtils';
import { nonEmptyStr, queryBlogsToProp } from '@polkadot/df-utils/index';
import { BlogId, Blog, PostId, BlogData } from '@dappforce/types/blogs';
import { MyAccountProps, withMyAccount } from '@polkadot/df-utils/MyAccount';
import Section from '@polkadot/df-utils/Section';
import { ViewPost } from './ViewPost';
import { CreatedBy } from './CreatedBy';
import { BlogFollowersModal } from './AccountsListModal';
import { BlogHistoryModal } from './ListsEditHistory';
import { Dropdown } from 'semantic-ui-react';
import { FollowBlogButton } from './FollowButton';
import TxButton from '@polkadot/df-utils/TxButton';
import { pluralizeText } from './utils';
import { MutedSpan } from '@polkadot/df-utils/MutedText';

type Props = MyAccountProps & {
  preview?: boolean,
  nameOnly?: boolean,
  previewDetails?: boolean,
  withFollowButton?: boolean,
  id: BlogId,
  blogById?: Option<Blog>,
  postIds?: PostId[],
  followers?: AccountId[]
};

function Component (props: Props) {
  const { blogById } = props;

  if (blogById === undefined) return <em>Loading...</em>;
  else if (blogById.isNone) return <em>Blog not found</em>;

  const {
    preview = false,
    nameOnly = false,
    previewDetails = false,
    withFollowButton = false,
    myAddress,
    postIds = []
  } = props;

  const blog = blogById.unwrap();
  const {
    id,
    score,
    created: { account },
    ipfs_hash,
    followers_count
  } = blog;
  const followers = followers_count.toNumber();
  const [ content , setContent ] = useState({} as BlogData);
  const { desc, name, image } = content;

  const [ followersOpen, setFollowersOpen ] = useState(false);

  useEffect(() => {
    if (!ipfs_hash) return;
    getJsonFromIpfs<BlogData>(ipfs_hash).then(json => {
      const content = json;
      setContent(content);
      console.log(content);
    }).catch(err => console.log(err));
  }, [ false ]);

  const isMyBlog = myAddress && account && myAddress === account.toString();
  const hasImage = image && nonEmptyStr(image);
  const postsCount = postIds ? postIds.length : 0;

  const renderDropDownMenu = () => {

    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    return (<Dropdown icon='ellipsis horizontal'>
      <Dropdown.Menu>
        {isMyBlog && <Link className='item' to={`/blogs/${id.toString()}/edit`}>Edit</Link>}
        <Dropdown.Item text='View edit history' onClick={() => setOpen(true)} />
        {open && <BlogHistoryModal id={id} close={close}/>}
      </Dropdown.Menu>
    </Dropdown>);
  };

  const renderNameOnly = () => (<>
    <Link to={`/blogs/${id}`} className='handle'>{name}</Link>
  </>);

  const renderPreview = () => {
    return <>
      <div className={`item ProfileDetails ${isMyBlog && 'MyProfile'}`}>
        {hasImage
          ? <img className='ui avatar image' src={image} />
          : <IdentityIcon className='image' value={account} size={40} />
        }
        <div className='content'>
          <div className='header'>
            {renderNameOnly()}
            {renderDropDownMenu()}
          </div>
          <div className='description'>
            <MutedSpan>Score: <b>{score.toString()}</b></MutedSpan>
            <ReactMarkdown className='DfMd' source={desc} linkTarget='_blank' />
          </div>
        </div>
        {withFollowButton && <FollowBlogButton blogId={id} />}
      </div>
    </>;
  };

  const renderPreviewExtraDetails = () => {
    return <>
      <div className={`DfBlog-links ${isMyBlog && 'MyProfile'}`}>
        <Link to='#' onClick={() => setFollowersOpen(true)} className={followers ? '' : 'disable'}>{pluralizeText(followers, 'Follower')}</Link>
        {followersOpen && <BlogFollowersModal id={id} accountsCount={blog.followers_count.toNumber()} open={followersOpen} close={() => setFollowersOpen(false)} title={pluralizeText(followers, 'Follower')} />}
        <HashLink to={`/blogs/${id}#posts`} className={postsCount ? '' : 'disable'}>{pluralizeText(postsCount, 'Post')}</HashLink>
      </div>
    </>;
  };

  if (nameOnly) {
    return renderNameOnly();
  } else if (preview) {
    return renderPreview();
  } else if (previewDetails) {
    return <>
    {renderPreview()}
    {renderPreviewExtraDetails()}
    </>;
  }

  const renderPostPreviews = () => {
    if (!postIds || postIds.length === 0) {
      return <em>This blog has no posts yet</em>;
    }

    return postIds.map((id, i) => <ViewPost key={i} id={id} preview />);
  };

  const postsSectionTitle = () => {
    return <>
      <span style={{ marginRight: '.5rem' }}>{pluralizeText(postsCount, 'Post')}</span>
      <Link to={`/blogs/${id}/newPost`} className='ui tiny button'>
        <i className='plus icon' />
        Write post
      </Link>
    </>;
  };

  return <>
    <div className='ui massive relaxed middle aligned list FullProfile'>
      {renderPreview()}
    </div>
    <CreatedBy created={blog.created} />
    <FollowBlogButton blogId={id} />
    <TxButton isBasic={true} isPrimary={false} onClick={() => setFollowersOpen(true)} isDisabled={followers === 0}>{pluralizeText(followers, 'Follower')}</TxButton>
    {followersOpen && <BlogFollowersModal id={id} accountsCount={blog.followers_count.toNumber()} open={followersOpen} close={() => setFollowersOpen(false)} title={pluralizeText(followers, 'Follower')} />}
    <Section id='posts' title={postsSectionTitle()}>
      {renderPostPreviews()}
    </Section>
  </>;
}

export default withMulti(
  Component,
  withMyAccount,
  withCalls<Props>(
    queryBlogsToProp('blogById', 'id'),
    queryBlogsToProp('postIdsByBlogId', { paramName: 'id', propName: 'postIds' })
  )
);
