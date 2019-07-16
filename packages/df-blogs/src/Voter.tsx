import React, { useEffect, useState } from 'react';
import { Button } from 'semantic-ui-react';

import TxButton from '@polkadot/joy-utils/TxButton';
import { api } from '@polkadot/ui-api';
import { AccountId, Option } from '@polkadot/types';
import { Tuple } from '@polkadot/types/codec';
import { useMyAccount } from '@polkadot/joy-utils/MyAccountContext';
import { PostId, Comment, Post, ReactionKind, Reaction, CommentId } from './types';
import { CommentVoters, PostVoters } from './ListVoters';

type VoterValue = {
  struct: Comment | Post
};

type VoterProps = VoterValue;

export const Voter = (props: VoterProps) => {
  const {
    struct
  } = props;

  const resetState: any = 'None';
  const [ reactionState, setReactionState ] = useState(resetState);

  const { state: { address } } = useMyAccount();

  const reactionKind = reactionState instanceof Reaction ? reactionState.kind.toString() : 'None';
  const reactionIsNone = !(reactionState instanceof Reaction);

  const [ state , setState ] = useState(struct);
  const { id } = state;
  const isComment = struct instanceof Comment;

  const Id = isComment ? CommentId : PostId;

  const dataForQuery = new Tuple([AccountId, Id], [new AccountId(address), id]);

  useEffect(() => {

    const structQuery = isComment ? 'comment' : 'post';

    async function loadStruct<T extends Comment | Post> (struct: T) {
      const result = await api.query.blogs[`${structQuery}ById`](id) as Option<T>;

      if (result.isNone) return;

      const _struct = result.unwrap() as T;
      setState(_struct);
    }
    loadStruct(state).catch(err => console.log(err));

    // TODO not use callback
    api.query.blogs[`${structQuery}ReactionIdByAccount`](dataForQuery, reactionId => {
      api.query.blogs.reactionById(reactionId, x => {
        if (x.isNone) {
          setReactionState('None');
          return;
        }
        const reaction = x.unwrap() as Reaction;
        setReactionState(reaction);
        console.log(reaction.kind.toString());
      }).catch(err => console.log(err));
    }).catch(err => console.log(err));

  }, [ reactionKind ]);

  const buildTxParams = (param: 'Downvote' | 'Upvote') => {
    if (reactionIsNone) {
      return [ id, new ReactionKind(param) ];
    } else if (reactionKind !== param) {
      return [ id, reactionState.id, new ReactionKind(param) ];
    } else {
      return [ id, reactionState.id ];
    }
  };

  const VoterRender = () => {

    const orientation = isComment ? 'vertical' : '';
    const count = (state.upvotes_count.toNumber() - state.downvotes_count.toNumber()).toString();
    const colorCount = count > '0' ? 'green' : count < '0' ? 'red' : '';
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);
    const renderTxButton = (isUpvote: boolean) => {

      const reactionName = isUpvote ? 'Upvote' : 'Downvote';
      const color = isUpvote ? 'green' : 'red';
      const isActive = (reactionKind === reactionName) && 'active';
      const icon = isUpvote ? 'up' : 'down';
      const struct = isComment ? 'Comment' : 'Post';

      return (<TxButton
        type='submit'
        compact
        icon={`thumbs ${icon} outline`}
        className={`${color} ${isActive}`}
        params={buildTxParams(reactionName)}
        tx={reactionIsNone
          ? `blogs.create${struct}Reaction`
          : (reactionKind !== `${reactionName}`)
          ? `blogs.update${struct}Reaction`
          : `blogs.delete${struct}Reaction`}
      />);
    };

    return <><Button.Group className={`DfVoter ${orientation}`}>
        {renderTxButton(true)}
        <Button content={count} variant='primary' className={`${colorCount} active`} onClick={() => setOpen(true)}/>
        {renderTxButton(false)}
    </Button.Group>
  {isComment
  ? <CommentVoters id={id} open={open} close={close}/>
  : <PostVoters id={id} open={open} close={close}/>}
  </>;
  };

  return VoterRender();
};
