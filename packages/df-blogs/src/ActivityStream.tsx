
import React, { useState, useEffect } from 'react';
import Section from '@polkadot/joy-utils/Section';
import { useMyAccount } from '@polkadot/joy-utils/MyAccountContext';
import axios from 'axios';
import { host } from './utils';
import AddressMini from '@polkadot/ui-app/AddressMiniJoy';
import { hexToNumber } from '@polkadot/util';
import { PostId, CommentId, OptionComment, Comment, BlogId } from './types';
import { ViewPost } from './ViewPost';
import { Segment } from 'semantic-ui-react';
import { api, withMulti } from '@polkadot/ui-api';
import { Link } from 'react-router-dom';
import ViewBlog from './ViewBlog';
import moment from 'moment-timezone';
import { withMyAccount, MyAccountProps } from '@polkadot/joy-utils/MyAccount';
import ActivityStreamItem from './ActivityStreamItem';
import { Post } from '@dappforce/types/blogs';

type Activity = {
  id: number,
  account: string,
  event: string,
  following_id: string,
  blog_id: string,
  post_id: string,
  comment_id: string,
  date: Date
};

type ActivityProps = {
  activity: Activity;
};

export const InnerViewNewsFeed = (props: MyAccountProps) => {
  const { myAddress } = props;
  console.log(myAddress);
  const [ myFeeds, setMyFeeds ] = useState([] as Activity[]);
  useEffect(() => {
    const loadWithApi = async () => {
      const res = await axios.get(`${host}/offchain/feed/${myAddress}`);
      const { data } = res;
      console.log(data);
      setMyFeeds(data);
    };
    loadWithApi().catch(err => new Error(err));
  },[false]);
  const totalCount = myFeeds && myFeeds.length;
  return (
  <Section title={`News Feed (${totalCount})`}>{
    myFeeds && myFeeds.length === 0
      ? <em>No news.</em>
      : <div className='ui huge relaxed middle aligned divided list ProfileextraPreviews'>
      {myFeeds && myFeeds.map((item, id) =>
        <Activity key={id} activity={item}/>
      )}
    </div>
  }</Section>
  );
};

export const InnerViewNotifications = (props: MyAccountProps) => {
  const { myAddress } = props;
  const [ myFeeds, setMyFeeds ] = useState([] as Activity[]);
  useEffect(() => {
    const loadWithApi = async () => {
      const res = await axios.get(`${host}/offchain/notifications/${myAddress}`);
      const { data } = res;
      setMyFeeds(data);
    };
    loadWithApi().catch(err => new Error(err));
  },[false]);
  const totalCount = myFeeds && myFeeds.length;
  return (
  <Section title={`Notifications (${totalCount})`}>{
    myFeeds && myFeeds.length === 0
      ? <em>No notifications.</em>
      : <div className='ui huge relaxed middle aligned divided list ProfileextraPreviews'>
          {myFeeds && myFeeds.map((item, id) =>
            <Notification key={id} activity={item}/>
          )}
        </div>
  }</Section>
  );
};

function Activity (props: ActivityProps) {
  const { activity } = props;
  const { account, date, post_id } = activity;
  const formatDate = moment(date).format('lll');

  const renderInfoOfEvent = () => (<div className='ui--AddressSummary-name'>
    <div><b style={{ textTransform: 'uppercase', marginRight: '.4rem' }}>{formatDate}</b></div>
    <div>{'create post'}</div>
  </div>);

  const postId = new PostId(hexToNumber('0x' + post_id));

  return <Segment className='DfActivity'>
    <AddressMini
      value={account}
      isShort={false}
      isPadded={false}
      size={36}
      withName
      extraDetails={renderInfoOfEvent()}
    />
    <ViewPost id={postId} withCreatedBy={false}/>
  </Segment>;
}

function Notification (props: ActivityProps) {
  const { activity } = props;
  const { account, event, date, post_id, comment_id, blog_id } = activity;
  const formatDate = moment(date).format('lll');
  const [ message, setMessage ] = useState(<>{event}</>);
  let postId = new PostId(0);
  const renderInfoOfEvent = () => (<div className='ui--AddressSummary-name'>
        <div><b style={{ textTransform: 'uppercase', marginRight: '.4rem' }}>{`${formatDate} `}</b></div>
    <div>{message}</div>
  </div>);

  useEffect(() => {
    console.log('here');
    const loadActivity = async () => {
      switch (event) {
        case 'FollowAccount': {
          setMessage(<>followed your</>);
          break;
        }
        case 'FollowBlog': {
          const blogId = new BlogId(hexToNumber('0x' + blog_id));
          setMessage(<>follower your blog <ViewBlog id={blogId} extraPreview/></>);
          break;
        }
        case 'CommentCreated': {
          let textActivity = '';
          if (postId === new PostId(0)) {
            postId = new PostId(hexToNumber('0x' + post_id));
          } else {
            const commentId = new CommentId(hexToNumber('0x' + comment_id));
            const commentOpt = await api.query.blogs.commentById(commentId) as OptionComment;
            if (commentOpt.isNone) return;

            const comment = commentOpt.unwrap() as Comment;
            postId = new PostId(hexToNumber('0x' + comment.post_id));
            if (comment.parent_id.isSome){
              textActivity = 'replied on your comment in ';
            } else {
              textActivity = 'create comment on ';
            }
          }
          setMessage(<>
            {textActivity}
            <ViewPost id={postId} withCreatedBy={false} extraPreview/>
          </>);
          break;
        }
        case 'PostReactionCreated': {
          postId = new PostId(hexToNumber('0x' + post_id));
          setMessage(<>
            {'created reaction to your post '}
            <ViewPost id={postId} withCreatedBy={false} extraPreview/>
          </>);
          break;
        }
        case 'CommentReactionCreated': {
          const commentId = new CommentId(hexToNumber('0x' + comment_id));
          const commentOpt = await api.query.blogs.commentById(commentId) as OptionComment;
          if (commentOpt.isNone) return;

          const comment = commentOpt.unwrap() as Comment;
          postId = new PostId(hexToNumber('0x' + comment.post_id));
          setMessage(<>
            {'created reaction to your comment in '}
            <ViewPost id={postId} withCreatedBy={false} extraPreview/></>);
          break;
        }
      }
    };
    loadActivity().catch(err => new Error(err));
  }, [ postId >= new PostId(0) ]);

  return <Segment className='DfActivity'>
  <ActivityStreamItem
    value={account}
    isShort={false}
    isPadded={false}
    size={48}
    withName
    date={formatDate}
    event={'NOT FOUND'}
    subject={<ViewPost id={postId} extraPreview/>}
  />
  </Segment>;
};

export const ViewNewsFeed = withMulti(
  InnerViewNewsFeed,
  withMyAccount
);

export const ViewNotifications = withMulti(
  InnerViewNotifications,
  withMyAccount
);
