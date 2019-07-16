import React, { useState, useEffect } from 'react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { queryBlogsToProp } from './utils';
import { Modal, Button, Tab } from 'semantic-ui-react';
import _ from 'lodash';
import AddressMini from '@polkadot/ui-app/AddressMiniJoy';
import { ReactionId, Post, Reaction } from './types';
import { api } from '@polkadot/ui-api/Api';


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

  const renderVoters = (state: Array<Reaction>) => {
    return state.map(reaction => {
      return <div key={reaction.id.toNumber()} style={{ textAlign: 'left', margin: '1rem' }}>
      <AddressMini
        value={reaction.created.account}
        isPadded={false}
        size={28}
        extraDetails={`Kind: ${reaction.kind}`}
      />
    </div>;
    });
  };
  const panes = [
  { key: 'all', menuItem: 'All', render: () => <Tab.Pane>{renderVoters(reactionView)}</Tab.Pane> },
    { key: 'upvote', menuItem: 'Upvoters', render: () => {
      const reactionWithUpVoters = reactionView.filter(reaction => reaction.kind.toString() === 'Upvote');
      return <Tab.Pane>{renderVoters(reactionWithUpVoters)}</Tab.Pane>;
    }},
    { key: 'downvote', menuItem: 'Downvoters', render: () => {
      const reactionWithDownVoters = reactionView.filter(reaction => reaction.kind.toString() === 'Downvote');
      return <Tab.Pane>{renderVoters(reactionWithDownVoters)}</Tab.Pane>;
    }}
  ];

  return (
    <Modal
      open={open}
      dimmer='blurring'
      centered={true}
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header><h1>Voters ({votersCount})</h1></Modal.Header>
      <Modal.Content scrolling>
      <Tab panes={panes} />
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
