
import React, { useState, useEffect } from 'react';
import Section from '@polkadot/joy-utils/Section';
import { useMyAccount } from '@polkadot/joy-utils/MyAccountContext';
import axios from 'axios';
import { host } from './utils'

type Activity = {
  id: number,
  account: string,
  event: string,
  following_account: string,
  blog_id: string,
  post_id: string,
  comment_id: string
}

type ActivityProps = {
  activity: Activity;
}

export const ViewNewsFeed = () => {
  const [ myFeeds, setMyFeeds ] = useState([] as Activity[]);
  const { state: { address: myAddress } } = useMyAccount();
  useEffect(() => {
    const loadWithApi = async () => {
      const res = await axios.get(`${host}/offchain/notifications/${myAddress}`);
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
          {myFeeds && myFeeds.map(item =>
            <Activity activity={item}/>
          )}
        </div>
  }</Section>
  );
};

function Activity (props: ActivityProps) {
  const { activity } = props;
  const { account, event } = activity;
  return <>
    <div>{`User: ${account}`}</div>
    <div>{event}</div>
  </>;
}

