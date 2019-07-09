import React, { useEffect, useState } from 'react';
import { Button, Icon } from 'semantic-ui-react';

import TxButton from '@polkadot/joy-utils/TxButton';
import { api } from '@polkadot/ui-api';
import { AccountId } from '@polkadot/types';
import { Tuple } from '@polkadot/types/codec';
import { useMyAccount } from '@polkadot/joy-utils/MyAccountContext';
import { PostId, Comment, Post, ReactionKind, Reaction, CommentId } from './types';

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

    const struct = isComment ? 'comment' : 'post';

    isComment
    ? api.query.blogs.commentById(id, (x => {
      if (x.isNone) return;
      const comment = x.unwrap() as Comment;
      setState(comment);
    })).catch(err => console.log(err))
    : api.query.blogs.postById(id, (x => {
      if (x.isNone) return;
      const post = x.unwrap() as Post;
      setState(post);
    })).catch(err => console.log(err));

    api.query.blogs[`${struct}ReactionIdByAccount`](dataForQuery, reactionId => {
      api.query.blogs.reactionById(reactionId, x => {
        if (x.isNone) {
          setReactionState('None');
          return;
        }
        const reaction = x.unwrap() as Reaction;
        setReactionState(reaction);
        console.log(reaction.kind);
      }).catch(err => console.log(err));
    }).catch(err => console.log(err));

  }, [ reactionKind ]);

  const buildTxParams = (param: string) => {
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

    // type ValueButton = {
    //   isUpvote: boolean;
    // };

    // const RenderTxButton = (props: ValueButton) => {

    //   const { isUpvote } = props;
    //   const reactionName = isUpvote ? 'Uptove' : 'Downvote';
    //   const icon = isUpvote ? 'up' : 'down';
    //   const count = isUpvote ? state.upvotes_count.toNumber() : state.downvotes_count.toNumber();
    //   const struct = isComment ? 'Comment' : 'Post';

    //   return (<TxButton
    //     type='submit'
    //     compact
    //     params={buildTxParams(reactionName)}
    //     tx={reactionIsNone
    //       ? `blogs.create${struct}Reaction`
    //       : (reactionKind !== reactionName)
    //       ? `blogs.update${struct}Reaction`
    //       : `blogs.delete${struct}Reaction`}
    //   >
    //     <Icon className={`thumbs ${icon} outline`}/>
    //     {count}
    //   </TxButton>);
    // };
    const struct = isComment ? 'Comment' : 'Post';

    return <Button.Group basic className={`DfVoter ${orientation}`}>
        <TxButton
          type='submit'
          compact
          params={buildTxParams('Upvote')}
          tx={reactionIsNone
            ? `blogs.create${struct}Reaction`
            : (reactionKind !== 'Upvote')
            ? `blogs.update${struct}Reaction`
            : `blogs.delete${struct}Reaction`}
        >
          <Icon className='thumbs up outline'/>
          {state.upvotes_count.toNumber()}
        </TxButton>
      <TxButton
        type='submit'
        circular
        compact
        params={buildTxParams('Downvote')}
        tx={reactionIsNone
          ? `blogs.create${struct}Reaction`
          : (reactionKind !== 'Downvote')
          ? `blogs.update${struct}Reaction`
          : `blogs.delete${struct}Reaction`}
      >
        <Icon className='thumbs down outline'/>
        {state.downvotes_count.toNumber()}
      </TxButton>
    </Button.Group>;
  };

  return VoterRender();
};
