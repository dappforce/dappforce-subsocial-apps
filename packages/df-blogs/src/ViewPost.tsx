import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Segment, Dropdown } from 'semantic-ui-react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { Option } from '@polkadot/types';

import { PostId, Post, CommentId, PostData } from './types';
import { queryBlogsToProp, UrlHasIdProps, AuthorPreview, getJsonFromIpfs } from './utils';
import { withMyAccount, MyAccountProps } from '@polkadot/joy-utils/MyAccount';
import { CommentsByPost } from './ViewComment';
import { CreatedBy } from './CreatedBy';
import { MutedSpan } from '@polkadot/joy-utils/MutedText';
import { Voter } from './Voter';
import { PostHistoryModal } from './ListsEditHistory';

type ViewPostProps = MyAccountProps & {
  preview?: boolean,
  id: PostId,
  postById: Option<Post>,
  commentIds?: CommentId[]
};

function ViewPostInternal (props: ViewPostProps) {
  const { postById } = props;

  if (postById === undefined) return <em>Loading...</em>;
  else if (postById.isNone) return <em>Post not found</em>;

  const {
    myAddress,
    preview = false,
    id
  } = props;

  const post = postById.unwrap();
  const {
    created: { account },
    comments_count,
    upvotes_count,
    downvotes_count,
    ipfs_hash
  } = post;

  const [ content , setContent ] = useState({} as PostData);
  const { title, body, image } = content;
  useEffect(() => {
    if (!ipfs_hash) return;
    getJsonFromIpfs<PostData>(ipfs_hash).then(json => {
      const content = json;
      setContent(content);
      console.log(content);
    }).catch(err => console.log(err));
  }, [ false ]);

  const isMyStruct = myAddress === account.toString();

  const renderDropDownMenu = () => {

    if (!isMyStruct) return null;

    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);
    return (<Dropdown icon='ellipsis horizontal'>
      <Dropdown.Menu>
        <Link className='item' to={`/blogs/posts/${id.toString()}/edit`}>Edit</Link>
        <Dropdown.Item text='View edit history' onClick={() => setOpen(true)} />
        {open && <PostHistoryModal id={id} open={open} close={close}/>}
      </Dropdown.Menu>
    </Dropdown>);
  };

  const renderPreview = () => {
    return <>
      <Segment>
        <h2>
          <Link
            to={`/blogs/posts/${id.toString()}`}
            style={{ marginRight: '.5rem' }}
          >{title}
          </Link>
          {renderDropDownMenu()}
        </h2>
        <AuthorPreview address={account} />
        <div className='DfCountsPreview'>
          <MutedSpan>Comments: <b>{comments_count.toString()}</b></MutedSpan>
          <MutedSpan>Upvotes: <b>{upvotes_count.toString()}</b></MutedSpan>
          <MutedSpan>Downvotes: <b>{downvotes_count.toString()}</b></MutedSpan>
        </div>
      </Segment>
    </>;
  };

  const renderDetails = () => {
    return <>
      <h1 style={{ display: 'flex' }}>
        <span style={{ marginRight: '.5rem' }}>{title}</span>
        {renderDropDownMenu()}
      </h1>
      <CreatedBy created={post.created} />
      <div style={{ margin: '1rem 0' }}>
        {image && <img src={image} className='DfPostImage' /* add onError handler */ />}
        <ReactMarkdown className='JoyMemo--full' source={body} linkTarget='_blank' />
        {/* TODO render tags */}
      </div>
      <Voter struct={post} />
      <CommentsByPost postId={post.id} post={post} />
    </>;
  };
  return preview
    ? renderPreview()
    : renderDetails();
}

export const ViewPost = withMulti(
  ViewPostInternal,
  withMyAccount,// TODO replese with useMyAccount
  withCalls<ViewPostProps>(
    queryBlogsToProp('postById', 'id')
  )
);

export function ViewPostById (props: UrlHasIdProps) {
  const { match: { params: { id } } } = props;
  try {
    return <ViewPost id={new PostId(id)}/>;
  } catch (err) {
    return <em>Invalid post ID: {id}</em>;
  }
}
