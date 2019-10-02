import React from 'react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { AccountId } from '@polkadot/types';
import { queryBlogsToProp } from '@polkadot/df-utils/index';
import { BlogId } from './types';
import Section from '@polkadot/df-utils/Section';
import ViewBlog from './ViewBlog';
import { useMyAccount } from '@polkadot/df-utils/MyAccountContext';

type MyBlogProps = {
  id: AccountId,
  followedBlogsIds?: BlogId[]
};

const InnerListMyBlogs = (props: MyBlogProps) => {
  const { followedBlogsIds } = props;
  const totalCount = followedBlogsIds && followedBlogsIds.length;
  return (
  <Section title={`Following Blogs (${totalCount})`}>{
    followedBlogsIds && followedBlogsIds.length === 0
      ? <em>No blogs created yet.</em>
      : <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
          {followedBlogsIds && followedBlogsIds.map((id, i) =>
            <ViewBlog {...props} key={i} id={id} preview />
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
