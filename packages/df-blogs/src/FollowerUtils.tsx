import React, { useState, useEffect } from 'react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { AccountId, Option } from '@polkadot/types';
import { queryBlogsToProp } from './utils';
import { Modal, Button } from 'semantic-ui-react';
import _ from 'lodash';
import AddressMini from '@polkadot/ui-app/AddressMiniJoy';
import { ReactionId, Post, Reaction } from './types';
import { api } from '@polkadot/ui-api/Api';

type Props = {
  followers?: AccountId[],
  followersCount: Number
};

const InnerBlogFollowersModal = (props: Props) => {

  const { followers, followersCount } = props;
  const [open, setOpen] = useState(false);

  const renderFollowers = () => {
    return followers && followers.map(account =>
      <div style={{ textAlign: 'left', margin: '1rem' }}>
        <AddressMini
          value={account}
          isShort={false}
          isPadded={false}
          size={48}
          withName
          withBalance
        />
      </div>
    );
  };

  return (
    <Modal
      open={open}
      dimmer='blurring'
      trigger={<Button basic onClick={() => setOpen(true)}>Followers ({followersCount})</Button>}
      centered={true}
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header><h1>Blog followers ({followersCount})</h1></Modal.Header>
      <Modal.Content scrolling>
        {renderFollowers()}
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' onClick={() => setOpen(false)} />
      </Modal.Actions>
    </Modal>
  );
};

export const BlogFollowersModal = withMulti(
  InnerBlogFollowersModal,
  withCalls<Props>(
    queryBlogsToProp('blogFollowers', { paramName: 'id', propName: 'followers' })
  )
);

type PropsVoters = {
  id: Comment | Post,
  reactions?: ReactionId[],
  open: boolean,
  close: () => void
};

const InnerVotersModal = (props: PropsVoters) => {

  const { reactions, open, close } = props;
  const votersCount = reactions && reactions.length;
  const [ reactionView, setReactionView ] = useState(new Array<Reaction>());

  useEffect(() => {

    const loadVoters = () => {
      let arrReaction: Array<Reaction> = [];
      reactions && reactions.forEach(reactionId => {
        api.query.blogs.reactionById(reactionId, reaction => {
          arrReaction.push(reaction.unwrap() as Reaction);
        }).catch(err => console.log(err));
      });
      setReactionView(arrReaction);
    };
    loadVoters();
  });

  const renderVoters = () => {
    return reactionView.map(reaction => {
      return <div style={{ textAlign: 'left', margin: '1rem' }}>
      <AddressMini
        value={reaction.created.account}
        isShort={true}
        isPadded={false}
        size={28}
        withName
        extraDetails={`Kind: ${reaction.kind}`}
      />
    </div>;
    });
  };

  return (
    <Modal
      open={open}
      dimmer='blurring'
      centered={true}
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header><h1>Voters ({votersCount})</h1></Modal.Header>
      <Modal.Content scrolling>
        {renderVoters()}
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' onClick={close} />
      </Modal.Actions>
    </Modal>
  );
};

export const VotersModal = withMulti(
  InnerVotersModal,
  withCalls<PropsVoters>(
    queryBlogsToProp('reactionIdsByCommentId', { paramName: 'id', propName: 'reactions' })
  )
);