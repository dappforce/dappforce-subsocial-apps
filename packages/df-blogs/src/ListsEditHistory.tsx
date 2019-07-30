import React, { useState } from 'react';
import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { AccountId } from '@polkadot/types';
import { queryBlogsToProp } from './utils';
import { Modal, Comment as SuiComment, Button } from 'semantic-ui-react';
import _ from 'lodash';
import AddressMini from '@polkadot/ui-app/AddressMiniJoy';
import { Post, Blog } from './types';

type ModalController = {
  open: boolean,
  close: () => void
}

type CommentHistoryProps = ModalController &  {
  history?: Comment[]
};

const InnerCommentHistoryModal = (props: CommentHistoryProps) => {

  const { open, close } = props;

  const renderCommentHistory = () => {
    let test = new Array<any>();
    for (let i = 0; i < 30; i++) {
      test.push(<><SuiComment style={{ textAlign: 'left', margin: '1rem' }}>
      <SuiComment.Metadata>
            <AddressMini
              value={'dasdas'}
              isShort={true}
              isPadded={false}
              size={28}
              //extraDetails={`${time.toLocaleString()} at block #${block.toNumber()}`}
              extraDetails='information'
            />
      </SuiComment.Metadata>
      <SuiComment.Text>{'Text Text Text Text Text Text Text Text'}</SuiComment.Text>
    </SuiComment>
    <hr></hr>
    </>);
    }
    return (test);
  };

  return (
    <Modal
      open={open}
      dimmer='blurring'
      centered={true}
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header><h1>Edit History ({0})</h1></Modal.Header>
      <Modal.Content scrolling>
        {renderCommentHistory()}
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' onClick={close} />
      </Modal.Actions>
    </Modal>
  );
};

export const CommentHistoryModal = withMulti(
  InnerCommentHistoryModal
  // withCalls<Props>(
  //   queryBlogsToProp('blogFollowers', { paramName: 'id', propName: 'followers' })
  // )
);

type PostHistoryProps = ModalController & {
  history?: Post[]
};

const InnerPostHistoryModal = (props: PostHistoryProps) => {

  const { open, close } = props;

  const renderPostHistory = () => {
    let test = new Array<any>();
    for (let i = 0; i < 30; i++) {
      test.push(<><SuiComment style={{ textAlign: 'left', margin: '1rem' }}>
      <SuiComment.Metadata>
            <AddressMini
              value={'dasdas'}
              isShort={true}
              isPadded={false}
              size={28}
              //extraDetails={`${time.toLocaleString()} at block #${block.toNumber()}`}
              extraDetails='information'
            />
      </SuiComment.Metadata>
      <SuiComment.Text>{'Text Text Text Text Text Text Text Text'}</SuiComment.Text>
    </SuiComment>
    <hr></hr>
    </>);
    }
    return (test);
  };

  return (
    <Modal
      open={open}
      dimmer='blurring'
      centered={true}
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header><h1>Edit History ({0})</h1></Modal.Header>
      <Modal.Content scrolling>
        {renderPostHistory()}
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' onClick={close} />
      </Modal.Actions>
    </Modal>
  );
};

export const PostHistoryModal = withMulti(
  InnerPostHistoryModal
  // withCalls<Props>(
  //   queryBlogsToProp('blogFollowers', { paramName: 'id', propName: 'followers' })
  // )
);

type BlogHistoryProps = ModalController & {
  history?: Blog[]
};

const InnerBlogHistoryModal = (props: BlogHistoryProps) => {

  const { open, close } = props;

  const renderBlogHistory = () => {
    let test = new Array<any>();
    for (let i = 0; i < 30; i++) {
      test.push(<><SuiComment style={{ textAlign: 'left', margin: '1rem' }}>
      <SuiComment.Metadata>
            <AddressMini
              value={'dasdas'}
              isShort={true}
              isPadded={false}
              size={28}
              //extraDetails={`${time.toLocaleString()} at block #${block.toNumber()}`}
              extraDetails='information'
            />
      </SuiComment.Metadata>
      <SuiComment.Text>{'Text Text Text Text Text Text Text Text'}</SuiComment.Text>
    </SuiComment>
    <hr></hr>
    </>);
    }
    return (test);
  };

  return (
    <Modal
      open={open}
      dimmer='blurring'
      centered={true}
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header><h1>Edit History ({0})</h1></Modal.Header>
      <Modal.Content scrolling>
        {renderBlogHistory()}
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' onClick={close} />
      </Modal.Actions>
    </Modal>
  );
};

export const BlogHistoryModal = withMulti(
  InnerBlogHistoryModal
  // withCalls<Props>(
  //   queryBlogsToProp('blogFollowers', { paramName: 'id', propName: 'followers' })
  // )
);
