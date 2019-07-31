import React, { useState } from 'react';
import { withMulti, withCalls } from '@polkadot/ui-api/with';
import { Modal, Comment as SuiComment, Button } from 'semantic-ui-react';
import _ from 'lodash';
import AddressMini from '@polkadot/ui-app/AddressMiniJoy';
import { Post, Blog, PostId, PostData, BlogData, BlogId, CommentId, CommentData, Comment, OptionComment } from './types';
import { queryBlogsToProp, getJsonFromIpfs } from './utils';
import { Option } from '@polkadot/types';
import ReactMarkdown from 'react-markdown';
import IdentityIcon from '@polkadot/ui-identicon/Identicon';
import { Link } from 'react-router-dom';

type ModalController = {
  open: boolean,
  close: () => void
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

    return edit_history.map((x, index) => {
      const [ content, setContent ] = useState({} as CommentData);
      const ipfsHash = x.old_data.ipfs_hash.toString();
      getJsonFromIpfs<CommentData>(ipfsHash).then(data => setContent(data)).catch(err => new Error(err));
      console.log(content);
      return (<div key={index} style={{ textAlign: 'left', margin: '1rem' }}>
        <SuiComment>
          <SuiComment.Metadata>
                <AddressMini
                  value={x.edited.account}
                  isShort={true}
                  isPadded={false}
                  size={28}
                  extraDetails={`${x.edited.time.toLocaleString()} at block #${x.edited.block.toNumber()}`}
                />
          </SuiComment.Metadata>
          <SuiComment.Text>{content.body}</SuiComment.Text>
        </SuiComment>
        <hr></hr>
      </div>);
    });
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

    return edit_history.map((x, index) => {
      const [ content, setContent ] = useState({} as PostData);
      const ipfsHashOpt = x.old_data.ipfs_hash;
      if (ipfsHashOpt.isNone) return <></>;
      const ipfsHash = ipfsHashOpt.unwrap().toString();
      getJsonFromIpfs<PostData>(ipfsHash).then(data => setContent(data)).catch(err => new Error(err));
      console.log('Content #' + index + [ content ]);
      return (<div key={index} style={{ textAlign: 'left', margin: '1rem' }}><h1 style={{ display: 'flex' }}>
        <span style={{ marginRight: '.5rem' }}>{content.title}</span>
      </h1>
      {/* <CreatedBy edited={x.edited} /> */}
      <div style={{ margin: '1rem 0' }}>
        {content.image && <img src={content.image} className='DfPostImage' /* add onError handler */ />}
        <ReactMarkdown className='JoyMemo--full' source={content.body} linkTarget='_blank' />
        {/* TODO render tags */}
      </div>
      <hr></hr>
    </div>);
    });
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

const InnerBlogHistoryModal = (props: BlogHistoryProps) => {

  const { open, close, blogOpt } = props;

  if (blogOpt === undefined) return <Modal>Loading...</Modal>;
  else if (blogOpt.isNone) return <Modal>Blog not found</Modal>;

  const blog = blogOpt.unwrap();
  const { edit_history } = blog;
  console.log(edit_history);

  const renderBlogHistory = () => {

    return edit_history.map((x, index) => {
      const [ content, setContent ] = useState({} as BlogData);
      const ipfsHashOpt = x.old_data.ipfs_hash;
      if (ipfsHashOpt.isNone) return <></>;
      const ipfsHash = ipfsHashOpt.unwrap().toString();
      getJsonFromIpfs<BlogData>(ipfsHash).then(data => setContent(data)).catch(err => new Error(err));
      console.log(content);
      return (<div key={index} style={{ textAlign: 'left', margin: '1rem' }}>
        <div className='ui massive relaxed middle aligned list FullProfile'>
          <div className={`item ProfileDetails MyProfile`}>
          {content.image
          ? <img className='ui avatar image' src={content.image} />
          : <IdentityIcon className='image' value={x.edited.account} size={40} />
          }
            <div className='content'>
              <div className='header'>
                <Link to={`/blogs/${blog.id}`} className='handle'>{content.name}</Link>
              </div>
              <div className='description'>
                <ReactMarkdown className='JoyMemo--full' source={content.desc} linkTarget='_blank' />
              </div>
            </div>
          </div>
        </div>
      <hr></hr>
    </div>);
    });
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
        {edit_history && renderBlogHistory()}
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
