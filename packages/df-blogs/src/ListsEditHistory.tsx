import React, { useState, useEffect } from 'react';
import { withMulti, withCalls } from '@polkadot/ui-api/with';
import { Modal, Comment as SuiComment, Button } from 'semantic-ui-react';
import _ from 'lodash';
import AddressMini from '@polkadot/ui-app/AddressMiniDf';
import { Post, Blog, PostId, PostData, BlogData, BlogId, CommentId, CommentData, Comment, OptionComment, BlogHistoryRecord, CommentHistoryRecord, PostHistoryRecord, VecBlogHistoryRecord, VecPostHistoryRecord, ProfileHistoryRecord, ProfileData, Profile, VecProfileHistoryRecord } from './types';
import { queryBlogsToProp } from '@polkadot/df-utils/index';
import { Option, AccountId } from '@polkadot/types';
import ReactMarkdown from 'react-markdown';
import IdentityIcon from '@polkadot/ui-identicon/Identicon';
import { Link } from 'react-router-dom';
import { CreatedBy } from './CreatedBy';
import { getJsonFromIpfs } from './OffchainUtils';

type ModalController = {
  open: boolean,
  close: () => void
};

export function fillHistory<T extends (BlogHistoryRecord | PostHistoryRecord)[]> (historyLast: T) {

  if (historyLast[0] === undefined) return;
  const history = [...historyLast];
  let ipfsHash = history[0].old_data.ipfs_hash;
  let slug = history[0].old_data.slug;

  if (ipfsHash.isNone) {
    for (let i = 1; i < history.length; i++) {
      if (history[i].old_data.ipfs_hash.isSome) {
        ipfsHash = history[i].old_data.ipfs_hash;
        break;
      }
    }
  }

  if (slug.isNone) {
    for (let i = 1; i < history.length; i++) {
      if (history[i].old_data.slug.isSome) {
        slug = history[i].old_data.slug;
        break;
      }
    }
  }

  return history.map(record => {
    if (record.old_data.ipfs_hash.isNone) {
      record.old_data.ipfs_hash = ipfsHash;
    } else {
      ipfsHash = record.old_data.ipfs_hash;
    }
    if (record.old_data.slug.isNone) {
      record.old_data.slug = slug;
    } else {
      slug = record.old_data.slug;
    }
    return record;
  }).reverse() as T;
}

type PropsCommentFromHistory = {
  history: CommentHistoryRecord
};

const CommentFromHistory = (props: PropsCommentFromHistory) => {

  const { history: { old_data, edited } } = props;
  const { ipfs_hash } = old_data;
  const [ content, setContent ] = useState({} as CommentData);

  useEffect(() => {
    const loadData = async () => {
      const data = await getJsonFromIpfs<CommentData>(ipfs_hash.toString());
      setContent(data);
    };
    loadData().catch(err => new Error(err));
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
    <hr/>
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

  const renderCommentHistory = () => {
    const commentArrays = edit_history.map((x,index) => <CommentFromHistory history={x} key={index} />);
    return commentArrays.reverse();
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
        {edit_history ? renderCommentHistory() : 'No change history'}
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
  history: PostHistoryRecord,
  current_data: {
    ipfs_hash: string,
    slug: string
  }
};

const PostFromHistory = (props: PropsPostFromHistory) => {

  const { history: { old_data, edited }, current_data } = props;
  const { ipfs_hash, slug } = old_data;
  const [ content, setContent ] = useState({} as PostData);
  const [ ipfsHash, setIpfsHash ] = useState('');
  const [ _slug, setSlug ] = useState('');

  useEffect(() => {
    ipfs_hash.isNone ? setIpfsHash(current_data.ipfs_hash) : setIpfsHash(ipfs_hash.unwrap().toString());
    slug.isNone ? setSlug(current_data.slug) : setSlug(slug.unwrap().toString());
    const loadData = async () => {
      const data = await getJsonFromIpfs<PostData>(ipfsHash);
      setContent(data);
    };
    loadData().catch(err => new Error(err));
  },[ipfsHash, _slug]);


  return (<div style={{ textAlign: 'left', margin: '1rem' }}>
    <h1 style={{ display: 'flex' }}>
      <span style={{ marginRight: '.5rem' }}>{content.title}</span>
    </h1>
    <span style={{ marginRight: '.5rem' }}>{`slug: ${_slug}`}</span>
    <CreatedBy created={edited} dateLabel='Edited on' accountLabel='Edited by' />
    <div style={{ margin: '1rem 0' }}>
      {content.image && <img src={content.image} className='DfPostImage' /* add onError handler */ />}
      <ReactMarkdown className='DfMemo--full' source={content.body} linkTarget='_blank' />
      {/* TODO render tags */}
    </div>
    <hr/>
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

  const history = fillHistory<VecPostHistoryRecord>(edit_history);

  const renderPostHistory = () => {
    return history && history.map((x,index) => <PostFromHistory
      history={x}
      key={index}
      current_data={{ ipfs_hash: post.ipfs_hash, slug: post.slug.toString() }}
    />);
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
        {history && renderPostHistory()}
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
  history: BlogHistoryRecord,
  current_data: {
    ipfs_hash: string,
    slug: string
  }
};

const BlogFromHistory = (props: PropsBlogFromHistory) => {

  const { history: { old_data, edited }, current_data } = props;
  const { ipfs_hash, slug } = old_data;
  const [ content, setContent ] = useState({} as BlogData);
  const [ ipfsHash, setIpfsHash ] = useState('');
  const [ _slug, setSlug ] = useState('');

  useEffect(() => {
    ipfs_hash.isNone ? setIpfsHash(current_data.ipfs_hash) : setIpfsHash(ipfs_hash.unwrap().toString());
    slug.isNone ? setSlug(current_data.slug) : setSlug(slug.unwrap().toString());
    const loadData = async () => {
      const data = await getJsonFromIpfs<BlogData>(ipfsHash);
      setContent(data);
    };
    loadData().catch(err => new Error(err));
  },[ipfsHash, _slug]);

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
            <div className='description' style={{ margin: '0.2rem' }}>{`slug: ${_slug}`}</div>
            <div className='description' style={{ margin: '0.2rem' }}>
              <ReactMarkdown className='DfMemo--full' source={content.desc} linkTarget='_blank' />
            </div>
          </div>
        </div>
      </div>
      <CreatedBy created={edited} dateLabel='Edited on' accountLabel='Edited by' />
      <hr/>
  </div>);
};

const InnerBlogHistoryModal = (props: BlogHistoryProps) => {

  const { open, close, blogOpt } = props;

  if (blogOpt === undefined) return <Modal>Loading...</Modal>;
  else if (blogOpt.isNone) return <Modal>Blog not found</Modal>;

  const blog = blogOpt.unwrap();
  const { edit_history } = blog;

  console.log(edit_history);

  const history = fillHistory<VecBlogHistoryRecord>(edit_history);

  const renderBlogHistory = () => {
    return history && history.map((x,index) => <BlogFromHistory
      history={x}
      key={index}
      current_data={{ ipfs_hash: blog.ipfs_hash, slug: blog.slug.toString() }}
    />);
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
