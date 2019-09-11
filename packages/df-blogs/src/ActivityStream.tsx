
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

const InnerViewNewsFeed = (props: MyAccountProps) => {
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
      ? <em>No news yet.</em>
      : <div className='ui huge relaxed middle aligned divided list ProfileextraPreviews'>
      {myFeeds && myFeeds.map((item, id) =>
        <Activity key={id} activity={item}/>
      )}
    </div>
  }</Section>
  );
};

const InnerViewNotifications = (props: MyAccountProps) => {
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

  const postId = new PostId(hexToNumber('0x' + post_id));

  return <Segment className='DfActivity'>
  <ActivityStreamItem
    value={account}
    isShort={false}
    isPadded={false}
    size={48}
    withName
    date={formatDate}
  />
    <ViewPost id={postId} withCreatedBy={false} preview/>
  </Segment>;
}

function Notification (props: ActivityProps) {
  const { activity } = props;
  const { account, event, date, post_id, comment_id, blog_id } = activity;
  const formatDate = moment(date).format('lll');
  const [ message, setMessage ] = useState('string');
  const [ subject, setSubject ] = useState(<></>);
  let postId = new PostId(0);

  useEffect(() => {
    console.log(event);
    const loadActivity = async () => {
      switch (event) {
        case 'FollowAccount': {
          setMessage('followed your account');
          break;
        }
        case 'FollowBlog': {
          const blogId = new BlogId(hexToNumber('0x' + blog_id));
          setMessage('followed your blog');
          setSubject(<ViewBlog id={blogId} extraPreview/>);
          break;
        }
        case 'CommentCreated': {
          if (postId === new PostId(0)) {
            postId = new PostId(hexToNumber('0x' + post_id));
          } else {
            const commentId = new CommentId(hexToNumber('0x' + comment_id));
            const commentOpt = await api.query.blogs.commentById(commentId) as OptionComment;
            if (commentOpt.isNone) return;

            const comment = commentOpt.unwrap() as Comment;
            postId = new PostId(hexToNumber('0x' + comment.post_id));
            if (comment.parent_id.isSome) {
              setMessage('replied to your comment in');
            } else {
              setMessage('commented your post');
            }
          }
          setSubject(<ViewPost id={postId} withCreatedBy={false} extraPreview/>);
          break;
        }
        case 'PostReactionCreated': {
          postId = new PostId(hexToNumber('0x' + post_id));
          setMessage('reacted to your post');
          setSubject(<ViewPost id={postId} withCreatedBy={false} extraPreview/>);
          break;
        }
        case 'CommentReactionCreated': {
          const commentId = new CommentId(hexToNumber('0x' + comment_id));
          const commentOpt = await api.query.blogs.commentById(commentId) as OptionComment;
          if (commentOpt.isNone) return;

          const comment = commentOpt.unwrap() as Comment;
          postId = new PostId(hexToNumber('0x' + comment.post_id));
          setMessage('reacted to your comment');
          setSubject(<ViewPost id={postId} withCreatedBy={false} extraPreview/>);
          break;
        }
      }
    };
    loadActivity().catch(err => new Error(err));
  }, [ postId > new PostId(0) ]);

  return <Segment className='DfActivity'>
    <ActivityStreamItem
      value={account}
      isShort={false}
      isPadded={false}
      size={48}
      withName
      date={formatDate}
      event={message}
      subject={subject}
    />
  </Segment>;
}

export const ViewNewsFeed = withMulti(
  InnerViewNewsFeed,
  withMyAccount
);

export const ViewNotifications = withMulti(
  InnerViewNotifications,
  withMyAccount
);
