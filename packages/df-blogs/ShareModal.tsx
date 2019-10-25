import React, { useState } from 'react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { queryBlogsToProp } from '../df-utils/index';
import { Modal, Dropdown, Button } from 'semantic-ui-react';
import { withMyAccount, MyAccountProps } from '../df-utils/MyAccount';
import { PostId, PostExtension, SharedPost, BlogId } from '../df-types/blogs';
import { NewSharePost } from './EditPost';
import { ViewPost } from './ViewPost';
import ViewBlog from './ViewBlog';
import { Link } from 'react-router-dom';

type Props = MyAccountProps & {
  postId: PostId,
  open: boolean,
  close: () => void,
  blogsIds?: BlogId[]
};

const InnerShareModal = (props: Props) => {
  const { open, close } = props;

  const renderShareView = () => {

    const { postId, blogsIds } = props;

    if (!blogsIds) return <em>Loading...</em>;

    if (blogsIds.length === 0) {
      return (
        <Link to='/blogs/new' className='ui button primary'>Create your firs blog</Link>
      );
    }

    const blogs = blogsIds.map(id => ({ key: id.toNumber(), text: <ViewBlog id={id} key={id} nameOnly/>, value: id.toNumber() }));

    console.log(blogs);

    const [ blogId, setBlogId ] = useState(blogsIds[0]);
    const saveBlog = (event: any, data: any) => {
      setBlogId(data);
    };
    return (<div className='DfShareModal'>
      <Dropdown
        placeholder='Select blog...'
        selection
        search
        size='tiny'
        options={blogs}
        onChange={saveBlog}
        defaultValue={blogs[0].value}
      />
      <NewSharePost
        blogId={blogId}
        extention={new PostExtension({ SharedPost: new SharedPost(postId) })}
        extButton={<Button content='Close' onClick={close} />}
        preview={<ViewPost id={postId} preview withStats={false} withActions={false}/>}
        closeModal={close}
      />
    </div>
    );
  };

  return (
    <Modal
      onClose={close}
      open={open}
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header>Share post</Modal.Header>
      <Modal.Content scrolling className='noCenter'>
        {renderShareView()}
      </Modal.Content>
    </Modal>
  );
};

export const ShareModal = withMulti(
  InnerShareModal,
  withMyAccount,
  withCalls<Props>(
    queryBlogsToProp(`blogIdsByOwner`, { paramName: 'myAddress', propName: 'blogsIds' })
  )
);
