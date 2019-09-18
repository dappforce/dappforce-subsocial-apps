import React, { useState, useEffect } from 'react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { queryBlogsToProp } from './utils';
import { Modal, Button, Tab } from 'semantic-ui-react';
import _ from 'lodash';
import { Option } from '@polkadot/types';
import AddressMini from '@polkadot/ui-app/AddressMiniJoy';
import { ReactionId, Reaction, CommentId, PostId } from './types';
import { api } from '@polkadot/ui-api/Api';

type VotersProps = {
  id: CommentId | PostId,
  reactions?: ReactionId[],
  open: boolean,
  close: () => void
};

const InnerModalVoters = (props: VotersProps) => {

  const { reactions, open, close } = props;
  const votersCount = reactions && reactions.length;
  const [ reactionView, setReactionView ] = useState(new Array<Reaction>());

  useEffect(() => {

    if (!open) return;

    const loadVoters = async () => {

      if (!reactions) return;

      const apiCalls: Promise<Option<Reaction>>[] = reactions.map(async reactionId =>
        await api.query.blogs.reactionById(reactionId) as Option<Reaction>);
      const loadedReaction = (await Promise.all<Option<Reaction>>(apiCalls)).map(x => x.unwrap() as Reaction);
      setReactionView(loadedReaction);
    };
    loadVoters().catch(err => console.log(err));
  }, [ open ]);

  const renderVoters = (state: Array<Reaction>) => {
    return state.map(reaction => {
      return <div key={reaction.id.toNumber()} style={{ textAlign: 'left', margin: '1rem' }}>
      <AddressMini
        value={reaction.created.account}
        isPadded={false}
        size={28}
        extraDetails={`Kind: ${reaction.kind}`}
        withFollowButton
      />
    </div>;
    });
  };

  const filterVoters = (type: 'Upvote' | 'Downvote') => {
    const reactionWithVoters = reactionView.filter(reaction => reaction.kind.toString() === type);
    return <Tab.Pane>{renderVoters(reactionWithVoters)}</Tab.Pane>;
  };

  const panes = [
  { key: 'all', menuItem: 'All', render: () => <Tab.Pane>{renderVoters(reactionView)}</Tab.Pane> },
    { key: 'upvote', menuItem: 'Upvoters', render: () => filterVoters('Upvote') },
    { key: 'downvote', menuItem: 'Downvoters', render: () => filterVoters('Downvote') }
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

export const PostVoters = withMulti(
  InnerModalVoters,
  withCalls<VotersProps>(
    queryBlogsToProp(`reactionIdsByPostId`, { paramName: 'id', propName: 'reactions' })
  )
);

export const CommentVoters = withMulti(
  InnerModalVoters,
  withCalls<VotersProps>(
    queryBlogsToProp(`reactionIdsByCommentId`, { paramName: 'id', propName: 'reactions' })
  )
);
