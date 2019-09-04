
import React, { useState, useEffect } from 'react';
import Section from '@polkadot/joy-utils/Section';
import { useMyAccount } from '@polkadot/joy-utils/MyAccountContext';
import axios from 'axios';
import { host } from './utils';
import AddressMini from '@polkadot/ui-app/AddressMiniJoy';
import { hexToNumber } from '@polkadot/util';
import { PostId, CommentId, OptionComment, Comment } from './types';
import { ViewPost } from './ViewPost';
import { Segment } from 'semantic-ui-react';
import { nonEmptyStr } from '@polkadot/joy-utils/';
import { ViewComment } from './ViewComment';
import { api } from '@polkadot/ui-api';

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

export const ViewNewsFeed = () => {
  const [ myFeeds, setMyFeeds ] = useState([] as Activity[]);
  const { state: { address: myAddress } } = useMyAccount();
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
      : <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
          {myFeeds && myFeeds.map((item, id) =>
            <Activity key={id} activity={item}/>
          )}
        </div>
  }</Section>
  );
};

export const ViewNotifications = () => {
  const [ myFeeds, setMyFeeds ] = useState([] as Activity[]);
  const { state: { address: myAddress } } = useMyAccount();
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
  <Section title={`News Feed (${totalCount})`}>{
    myFeeds && myFeeds.length === 0
      ? <em>No notifications.</em>
      : <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
          {myFeeds && myFeeds.map((item, id) =>
            <Activity key={id} activity={item}/>
          )}
        </div>
  }</Section>
  );
};

function Activity (props: ActivityProps) {
  const { activity } = props;
  const { account, event, date, post_id, comment_id, blog_id, following_id, id } = activity;
  console.log([post_id, comment_id, blog_id, following_id]);

  const renderDate = () => (<div className='ui--AddressSummary-name'>
    Created in: <b style={{ textTransform: 'uppercase' }}>{date}</b>
  </div>);

  const renderActivity = () => {
    const [ comment, setComment ] = useState({} as Comment);
    if (nonEmptyStr(comment_id)) {
      const commentId = new CommentId(hexToNumber('0x' + comment_id));
      api.query.blogs.commentById(commentId,
        (commentOpt: OptionComment) =>
          setComment(commentOpt.unwrap() as Comment))
        .catch(err => new Error(err));
      return <ViewPost key={id} id={comment.post_id} withCreatedBy={false}/>;
    } else {
      const postId = new PostId(hexToNumber('0x' + post_id));
      return <ViewPost key={id} id={postId} withCreatedBy={false}/>;
    }
  };

  return <Segment className='DfActivity'>
    <AddressMini
      value={account}
      isShort={false}
      isPadded={false}
      size={36}
      withName
      extraDetails={renderDate()}
    />
    {renderActivity()}
  </Segment>;
};
