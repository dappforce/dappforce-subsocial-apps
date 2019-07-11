import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { Option, AccountId, Bool } from '@polkadot/types';
import IdentityIcon from '@polkadot/ui-app/IdentityIcon';

import { nonEmptyStr } from '@polkadot/joy-utils/index';
import { BlogId, Blog, PostId } from './types';
import { Tuple } from '@polkadot/types/codec';
import { queryBlogsToProp } from './utils';
import { MyAccountProps, withMyAccount } from '@polkadot/joy-utils/MyAccount';
import Section from '@polkadot/joy-utils/Section';
import { ViewPost } from './ViewPost';
import { CreatedBy } from './CreatedBy';
import TxButton from '@polkadot/joy-utils/TxButton';
import { api } from '@polkadot/ui-api';

type Props = MyAccountProps & {
  preview?: boolean,
  id: BlogId,
  blogById?: Option<Blog>,
  postIds?: PostId[]
};

function Component (props: Props) {
  const { blogById } = props;

  if (blogById === undefined) return <em>Loading...</em>;
  else if (blogById.isNone) return <em>Blog not found</em>;

  const {
    preview = false,
    myAddress,
    postIds = []
  } = props;

  const blog = blogById.unwrap();
  const {
    id,
    created: { account },
    json: { name, desc, image }
  } = blog;

  const dataForQuery = new Tuple([AccountId, BlogId], [new AccountId(myAddress), id]);
  const [ isFollow, setIsFollow ] = useState(false);
  const [ triggerReload, setTriggerReload ] = useState(false);
  useEffect(() => {
    const load = async () => {
      const _isFollow = await (api.query.blogs[`blogFollowedByAccount`](dataForQuery)) as Bool;
      setIsFollow(_isFollow.valueOf());
    };
    load().catch(err => console.log(err));

  }, [ triggerReload ]);

  const isMyBlog = myAddress && account && myAddress === account.toString();
  const hasImage = image && nonEmptyStr(image.toString());
  const postsCount = postIds ? postIds.length : 0;

  const renderPreview = () => {
    return <>
      <div className={`item ProfileDetails ${isMyBlog && 'MyProfile'}`}>
        {hasImage
          ? <img className='ui avatar image' src={image.toString()} />
          : <IdentityIcon className='image' value={account} size={40} />
        }
        <div className='content'>
          <div className='header'>
            <Link to={`/blogs/${id}`} className='handle'>{name.toString()}</Link>
            {isMyBlog &&
              <Link to={`/blogs/${id}/edit`} className='ui tiny button'>
                <i className='pencil alternate icon' />
                Edit my blog
              </Link>
            }
          </div>
          <div className='description'>
            <ReactMarkdown className='JoyMemo--full' source={desc.toString()} linkTarget='_blank' />
          </div>
        </div>
      </div>
    </>;
  };

  if (preview) {
    return renderPreview();
  }

  const renderPostPreviews = () => {
    if (!postIds || postIds.length === 0) {
      return <em>This blog has no posts yet</em>;
    }

    return postIds.map((id, i) => <ViewPost key={i} id={id} preview />);
  };

  const postsSectionTitle = () => {
    return <>
      <span style={{ marginRight: '.5rem' }}>Posts ({postsCount})</span>
      {isMyBlog && <Link to={`/blogs/${id}/newPost`} className='ui tiny button'>
        <i className='plus icon' />
        Write post
      </Link>}
    </>;
  };

  const buildTxParams = () => {
    return [ id ];
  };

  return <>
    <div className='ui massive relaxed middle aligned list FullProfile'>
      {renderPreview()}
    </div>
    <CreatedBy created={blog.created} />
    <TxButton
      type='submit'
      compact
      isPrimary={!isFollow}
      isBasic={isFollow}
      label={isFollow
        ? 'Unfollow blog'
        : 'Follow blog'}
      params={buildTxParams()}
      tx={isFollow
        ? `blogs.unfollowBlog`
        : `blogs.followBlog`}
      txSuccessCb={() => setTriggerReload(!triggerReload) }
    />
    <Section title={postsSectionTitle()}>
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
