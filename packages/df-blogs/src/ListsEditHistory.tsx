import React, { useState, useEffect } from 'react';
import { withMulti, withCalls } from '@polkadot/ui-api/with';
import { Modal, Comment as SuiComment, Button } from 'semantic-ui-react';
import _ from 'lodash';
import AddressMini from '@polkadot/ui-app/AddressMiniJoy';
import { Post, Blog, PostId, PostData, BlogData, BlogId, CommentId, CommentData, Comment, OptionComment, BlogHistoryRecord, CommentHistoryRecord, PostHistoryRecord } from './types';
import { queryBlogsToProp, getJsonFromIpfs } from './utils';
import { Option } from '@polkadot/types';
import ReactMarkdown from 'react-markdown';
import IdentityIcon from '@polkadot/ui-identicon/Identicon';
import { Link } from 'react-router-dom';
import { CreatedBy } from './CreatedBy';

type ModalController = {
  open: boolean,
  close: () => void
};

type PropsCommentFromHistory = {
  history: CommentHistoryRecord
};

const CommentFromHistory = (props: PropsCommentFromHistory) => {

  const { history: { old_data, edited } } = props;
  const { ipfs_hash } = old_data;
  const [ content, setContent ] = useState({} as CommentData);

  useEffect(() => {
    getJsonFromIpfs<CommentData>(ipfs_hash.toString()).then(data => setContent(data)).catch(err => new Error(err));
  });

  return (<div style={{ textAlign: 'left', margin: '1rem' }}>
        <SuiComment>
          <SuiComment.Metadata>
                <AddressMini
                  value={edited.account}
                  isShort={true}
                  isPadded={false}
                  size={28}
                  extraDetails={`${edited.time.toLocaleString()} at block #${edited.block.toNumber()}`}
                />
          </SuiComment.Metadata>
          <SuiComment.Text>{content.body}</SuiComment.Text>
        </SuiComment>
        <hr></hr>
      </div>);
};

type CommentHistoryProps = ModalController & {
  id: CommentId
  commentOpt?: OptionComment
};

const InnerCommentHistoryModal = (props: CommentHistoryProps) => {

  const { open, close, commentOpt } = props;

  if (commentOpt === undefined) return <Modal>Loading...</Modal>;
  else if (commentOpt.isNone) return <Modal>Post not found</Modal>;

  const comment = commentOpt.unwrap() as Comment;

  const { edit_history } = comment;
  console.log(edit_history);

  const renderCommentHistory = () => {
    return edit_history.map((x,index) => <CommentFromHistory history={x} key={index} />);
  };

  return (
    <Modal
      open={open}
      dimmer='blurring'
      centered={true}
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header><h1>Edit History</h1></Modal.Header>
      <Modal.Content scrolling>
        {edit_history && renderCommentHistory()}
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' onClick={close} />
      </Modal.Actions>
    </Modal>
  );
};

export const CommentHistoryModal = withMulti(
  InnerCommentHistoryModal,
  withCalls<CommentHistoryProps>(
    queryBlogsToProp('commentById', { paramName: 'id', propName: 'commentOpt' })
  )
);

type PropsPostFromHistory = {
  history: PostHistoryRecord
};

const PostFromHistory = (props: PropsPostFromHistory) => {

  const { history: { old_data, edited } } = props;
  const { ipfs_hash } = old_data;
  const [ content, setContent ] = useState({} as PostData);

  useEffect(() => {
    if (ipfs_hash.isNone) return;
    const ipfsHash = ipfs_hash.unwrap().toString();
    getJsonFromIpfs<PostData>(ipfsHash).then(data => setContent(data)).catch(err => new Error(err));
  });

  return (<div style={{ textAlign: 'left', margin: '1rem' }}>
    <h1 style={{ display: 'flex' }}>
      <span style={{ marginRight: '.5rem' }}>{content.title}</span>
    </h1>
    <CreatedBy created={edited} />
    <div style={{ margin: '1rem 0' }}>
      {content.image && <img src={content.image} className='DfPostImage' /* add onError handler */ />}
      <ReactMarkdown className='JoyMemo--full' source={content.body} linkTarget='_blank' />
      {/* TODO render tags */}
    </div>
    <hr></hr>
  </div>);
};

type PostHistoryProps = ModalController & {
  id: PostId,
  postOpt?: Option<Post>
};

const InnerPostHistoryModal = (props: PostHistoryProps) => {

  const { open, close, postOpt } = props;

  if (postOpt === undefined) return <Modal>Loading...</Modal>;
  else if (postOpt.isNone) return <Modal>Post not found</Modal>;

  const post = postOpt.unwrap();
  const { edit_history } = post;
  console.log(edit_history);

  const renderPostHistory = () => {
    return post.edit_history.map((x,index) => <PostFromHistory history={x} key={index} />);
  };

  return (
    <Modal
      open={open}
      dimmer='blurring'
      centered={true}
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header><h1>Edit History</h1></Modal.Header>
      <Modal.Content scrolling>
        {edit_history && renderPostHistory()}
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' onClick={close} />
      </Modal.Actions>
    </Modal>
  );
};

export const PostHistoryModal = withMulti(
  InnerPostHistoryModal,
  withCalls<PostHistoryProps>(
    queryBlogsToProp('postById', { paramName: 'id', propName: 'postOpt' })
  )
);

type BlogHistoryProps = ModalController & {
  id: BlogId,
  blogOpt?: Option<Blog>
};

type PropsBlogFromHistory = {
  history: BlogHistoryRecord
};

const BlogFromHistory = (props: PropsBlogFromHistory) => {

  const { history: { old_data, edited } } = props;
  const { ipfs_hash } = old_data;
  const [ content, setContent ] = useState({} as BlogData);

  useEffect(() => {
    if (ipfs_hash.isNone) return;
    const ipfsHash = ipfs_hash.unwrap().toString();
    getJsonFromIpfs<BlogData>(ipfsHash).then(data => setContent(data)).catch(err => new Error(err));
  });

  return (<div style={{ textAlign: 'left', margin: '1rem' }}>
      <div className='ui massive relaxed middle aligned list FullProfile'>
        <div className={`item ProfileDetails MyProfile`}>
        {content.image
        ? <img className='ui avatar image' src={content.image} />
        : <IdentityIcon className='image' value={edited.account} size={40} />
        }
          <div className='content'>
            <div className='header'>
              <Link to='' className='handle'>{content.name}</Link>
            </div>
            <div className='description' style={{ margin: '0.2rem' }}>
              <ReactMarkdown className='JoyMemo--full' source={content.desc} linkTarget='_blank' />
            </div>
          </div>
        </div>
      </div>
      <CreatedBy created={edited} />
      <hr/>
  </div>);
};

const InnerBlogHistoryModal = (props: BlogHistoryProps) => {

  const { open, close, blogOpt } = props;

  if (blogOpt === undefined) return <Modal>Loading...</Modal>;
  else if (blogOpt.isNone) return <Modal>Blog not found</Modal>;

  const blog = blogOpt.unwrap();

  const renderBlogHistory = () => {
    return blog.edit_history.map((x,index) => <BlogFromHistory history={x} key={index} />);
  };

  return (
    <Modal
      open={open}
      dimmer='blurring'
      centered={true}
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header><h1>Edit History</h1></Modal.Header>
      <Modal.Content scrolling>
        {history && renderBlogHistory()}
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' onClick={close} />
      </Modal.Actions>
    </Modal>
  );
};

export const BlogHistoryModal = withMulti(
  InnerBlogHistoryModal,
  withCalls<PostHistoryProps>(
    queryBlogsToProp('blogById', { paramName: 'id', propName: 'blogOpt' })
  )
);
