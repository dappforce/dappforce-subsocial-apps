import React from 'react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { AccountId } from '@polkadot/types';
import { queryBlogsToProp } from '../df-utils/index';
import { BlogId } from '../df-types/blogs';
import Section from '../df-utils/Section';
import ViewBlog from './ViewBlog';
import { useMyAccount } from '../df-utils/MyAccountContext';
import { pluralizeText } from './utils';

type MyBlogProps = {
  id: AccountId,
  followedBlogsIds?: BlogId[]
};

const InnerListMyBlogs = (props: MyBlogProps) => {
  const { followedBlogsIds } = props;
  const totalCount = followedBlogsIds !== undefined ? followedBlogsIds && followedBlogsIds.length : 0;

  return (
  <Section title={pluralizeText(totalCount, 'Following blog')}>{
    followedBlogsIds && followedBlogsIds.length === 0
      ? <em>No blogs created yet.</em>
      : <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
          {followedBlogsIds && followedBlogsIds.map((id, i) =>
            <ViewBlog {...props} key={i} id={id} previewDetails withFollowButton/>
          )}
        </div>
  }</Section>
  );
};

function withIdFromUseMyAccount (Component: React.ComponentType<MyBlogProps>) {
  return function () {
    const { state: { address: myAddress } } = useMyAccount();
    try {
      return <Component id={new AccountId(myAddress)} />;
    } catch (err) {
      return <em>Invalid Account id</em>;
    }
  };
}

export const ListFollowingBlogs = withMulti(
  InnerListMyBlogs,
  withIdFromUseMyAccount,
  withCalls<MyBlogProps>(
    queryBlogsToProp(`blogsFollowedByAccount`, { paramName: 'id', propName: 'followedBlogsIds' })
  )
);
