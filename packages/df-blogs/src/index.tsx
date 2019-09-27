
import BN from 'bn.js';
import React, { PureComponent } from 'react';
import { Route, Switch } from 'react-router';

import { AppProps, I18nProps } from '@polkadot/ui-app/types';
import { ApiProps } from '@polkadot/ui-api/types';
import { withCalls, withMulti } from '@polkadot/ui-api/with';
import Tabs, { TabItem } from '@polkadot/ui-app/Tabs';

import './index.css';

import { queryBlogsToProp } from '@polkadot/df-utils/index';
import translate from './translate';
import { ListBlogs, ListMyBlogs } from './ListBlogs';
import { EditBlog, NewBlog } from './EditBlog';
import ViewBlogById from './ViewBlogById';
import { NewPost, EditPost } from './EditPost';
import { ViewPostById } from './ViewPost';
import { ListFollowingBlogs } from './ListFollowingBlogs';
import { ViewNewsFeed, ViewNotifications } from './ActivityStream';
import { EditProfile, NewProfile } from './EditProfile';
import ViewProfile from './ViewProfile';
import { MyAccountContext, MyAccountContextProps } from '@polkadot/df-utils/MyAccountContext';

type Props = AppProps & ApiProps & I18nProps & {
  nextBlogId?: BN
};

class App extends PureComponent<Props> {

  private buildTabs (): TabItem[] {
    const { t, nextBlogId } = this.props;
    let blogCount = nextBlogId ? nextBlogId.sub(new BN(1)).toNumber() : 0;

    return [
      {
        name: 'blogs',
        text: t('All blogs') + ` (${blogCount})`
      },
      {
        name: 'my',
        text: t('My blogs')
      },
      {
        name: 'followed',
        text: t('Following blogs')
      },
      {
        name: 'new',
        text: t('New blog')
      },
      {
        name: 'feed',
        text: t('News feed')
      },
      {
        name: 'notifications',
        text: t('Notifications')
      }
    ];
  }

  render () {
    const { basePath } = this.props;
    const tabs = this.buildTabs();
    return (
      <main className='blogs--App'>
        <header>
          <Tabs basePath={basePath} items={tabs} />
        </header>
        <Switch>
          <Route path={`${basePath}/my`} component={ListMyBlogs} />
          <Route path={`${basePath}/followed`} component={ListFollowingBlogs} />
          <Route path={`${basePath}/new`} component={NewBlog} />
          <Route path={`${basePath}/feed`} component={ViewNewsFeed} />
          <Route path={`${basePath}/notifications`} component={ViewNotifications} />
          <Route path={`${basePath}/posts/:id/edit`} component={EditPost} />
          <Route path={`${basePath}/posts/:id`} component={ViewPostById} />
          <Route path={`${basePath}/:id/edit`} component={EditBlog} />
          <Route path={`${basePath}/:id/newPost`} component={NewPost} />
          <Route path={`${basePath}/:id`} component={ViewBlogById} />
          <Route component={ListBlogs} />
        </Switch>
      </main>
    );
  }
}

export default withMulti(
  App,
  translate,
  withCalls<Props>(
    queryBlogsToProp('nextBlogId')
  )
);
