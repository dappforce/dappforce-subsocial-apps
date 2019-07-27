import { Option, Struct, Enum, U8a } from '@polkadot/types/codec';
import { getTypeRegistry, BlockNumber, Moment, AccountId, u16, u32, u64, Text, Vector } from '@polkadot/types';
import * as IPFS from 'typestub-ipfs';
const CID = require('cids');

export class IpfsCid extends Text {}
export class BlogId extends u64 {}
export class OptionIpfsCid extends Option.with(IpfsCid) {}
export class PostId extends u64 {}
export class CommentId extends u64 {}
export class ReactionId extends u64 {}

export type ChangeType = {
  account: AccountId,
  block: BlockNumber,
  time: Moment
};
export class Change extends Struct {
  constructor (value?: ChangeType) {
    super({
      account: AccountId,
      block: BlockNumber,
      time: Moment
    }, value);
  }

  get account (): AccountId {
    return this.get('account') as AccountId;
  }

  get block (): BlockNumber {
    return this.get('block') as BlockNumber;
  }

  get time (): Moment {
    return this.get('time') as Moment;
  }
}

export class VecAccountId extends Vector.with(AccountId) {}

export class OptionText extends Option.with(Text) {}
export class OptionChange extends Option.with(Change) {}
export class OptionBlogId extends Option.with(BlogId) {}
export class OptionCommentId extends Option.with(CommentId) {}
export class OptionVecAccountId extends Option.with(VecAccountId) {}

export type BlogData = {
  name: string,
  desc: string,
  image: string,
  tags: string[]
};

export type BlogType = {
  id: BlogId,
  created: ChangeType,
  updated: OptionChange,
  writers: AccountId[],
  slug: Text,
  ipfs_cid: IpfsCid,
  posts_count: u16,
  followers_count: u32
};

export class Blog extends Struct {
  constructor (value?: BlogType) {
    super({
      id: BlogId,
      created: Change,
      updated: OptionChange,
      writers: VecAccountId,
      slug: Text,
      ipfs_cid: IpfsCid,
      posts_count: u16,
      followers_count: u32
    }, value);
  }

  get id (): BlogId {
    return this.get('id') as BlogId;
  }

  get created (): Change {
    return this.get('created') as Change;
  }

  get updated (): OptionChange {
    return this.get('updated') as OptionChange;
  }

  get writers (): VecAccountId {
    return this.get('writers') as VecAccountId;
  }

  get slug (): Text {
    return this.get('slug') as Text;
  }

  get ipfs_cid (): IPFS.CID {
    const ipfsCid = this.get('ipfs_cid') as Text;
    return new CID(ipfsCid.toString());
  }

  // get ipfs_cid (): BlogData {
  //   const IpfsCid = this.get('ipfs_cid') as Text;
  //   return JSON.parse(IpfsCid.toString());
  // }

  get posts_count (): u16 {
    return this.get('posts_count') as u16;
  }

  get followers_count (): u32 {
    return this.get('followers_count') as u32;
  }
}

export type BlogUpdateType = {
  writers: OptionVecAccountId,
  slug: OptionText,
  ipfs_cid: OptionIpfsCid
};

export class BlogUpdate extends Struct {
  constructor (value?: BlogUpdateType) {
    super({
      writers: OptionVecAccountId,
      slug: OptionText,
      ipfs_cid: OptionIpfsCid
    }, value);
  }
}

export type PostData = {
  title: string,
  body: string,
  image: string,
  tags: string[]
};

export type PostType = {
  id: PostId,
  blog_id: BlogId,
  created: ChangeType,
  updated: OptionChange,
  slug: Text,
  ipfs_cid: IpfsCid,
  comments_count: u16,
  upvotes_count: u16,
  downvotes_count: u16
};

export class Post extends Struct {
  constructor (value?: PostType) {
    super({
      id: PostId,
      blog_id: BlogId,
      created: Change,
      updated: OptionChange,
      slug: Text,
      ipfs_cid: IpfsCid,
      comments_count: u16,
      upvotes_count: u16,
      downvotes_count: u16
    }, value);
  }

  get id (): PostId {
    return this.get('id') as PostId;
  }

  get blog_id (): BlogId {
    return this.get('blog_id') as BlogId;
  }

  get created (): Change {
    return this.get('created') as Change;
  }

  get updated (): OptionChange {
    return this.get('updated') as OptionChange;
  }

  get slug (): Text {
    return this.get('slug') as Text;
  }

  get ipfs_cid (): IPFS.CID {
    const ipfsCid = this.get('ipfs_cid') as Text;
    return new CID(ipfsCid.toString());
  }

  get comments_count (): u16 {
    return this.get('comments_count') as u16;
  }

  get upvotes_count (): u16 {
    return this.get('upvotes_count') as u16;
  }

  get downvotes_count (): u16 {
    return this.get('downvotes_count') as u16;
  }
}

export type PostUpdateType = {
  blog_id: OptionBlogId,
  slug: OptionText,
  ipfs_cid: OptionIpfsCid
};

export class PostUpdate extends Struct {
  constructor (value?: PostUpdateType) {
    super({
      blog_id: OptionBlogId,
      slug: OptionText,
      ipfs_cid: OptionIpfsCid
    }, value);
  }
}

export type CommentData = {
  body: string
};

export type CommentType = {
  id: CommentId,
  parent_id: OptionCommentId,
  post_id: PostId,
  created: Change,
  updated: OptionChange,
  ipfs_cid: IpfsCid,
  upvotes_count: u16,
  downvotes_count: u16
};

export class Comment extends Struct {
  constructor (value?: CommentType) {
    super({
      id: CommentId,
      parent_id: OptionCommentId,
      post_id: PostId,
      created: Change,
      updated: OptionChange,
      ipfs_cid: IpfsCid,
      upvotes_count: u16,
      downvotes_count: u16
    }, value);
  }

  get id (): CommentId {
    return this.get('id') as CommentId;
  }

  get parent_id (): OptionCommentId {
    return this.get('parent_id') as OptionCommentId;
  }

  get post_id (): PostId {
    return this.get('post_id') as PostId;
  }

  get created (): Change {
    return this.get('created') as Change;
  }

  get updated (): OptionChange {
    return this.get('updated') as OptionChange;
  }

  get ipfs_cid (): IPFS.CID {
    const ipfsCid = this.get('ipfs_cid') as Text;
    return new CID(ipfsCid.toString());
  }

  get upvotes_count (): u16 {
    return this.get('upvotes_count') as u16;
  }

  get downvotes_count (): u16 {
    return this.get('downvotes_count') as u16;
  }
}

export type CommentUpdateType = {
  ipfs_cid: IpfsCid
};

export class CommentUpdate extends Struct {
  constructor (value?: CommentUpdateType) {
    super({
      ipfs_cid: IpfsCid
    }, value);
  }
}

export class OptionComment extends Option.with(Comment) {}

export const ReactionKinds: { [key: string ]: string } = {
  Upvote: 'Upvote',
  Downvote: 'Downvote'
};

export class ReactionKind extends Enum {
  constructor (value?: any) {
    super([
      'Upvote',
      'Downvote'
    ], value);
  }
}

export type ReactionType = {
  id: ReactionId,
  created: Change,
  updated: OptionChange,
  kind: ReactionKind
};

export class Reaction extends Struct {
  constructor (value?: ReactionType) {
    super({
      id: ReactionId,
      created: Change,
      updated: OptionChange,
      kind: ReactionKind
    }, value);
  }

  get id (): ReactionId {
    return this.get('id') as ReactionId;
  }

  get created (): Change {
    return this.get('created') as Change;
  }

  get updated (): OptionChange {
    return this.get('updated') as OptionChange;
  }

  get kind (): ReactionKind {
    return this.get('kind') as ReactionKind;
  }
}

export type SocialAccountType = {
  followers_count: u32,
  following_accounts_count: u16,
  following_blogs_count: u16
};

export class SocialAccount extends Struct {
  constructor (value?: SocialAccountType) {
    super({
      followers_count: u32,
      following_accounts_count: u16,
      following_blogs_count: u16
    }, value);
  }

  get followers_count (): u32 {
    return this.get('followers_count') as u32;
  }

  get following_accounts_count (): u16 {
    return this.get('following_accounts_count') as u16;
  }

  get following_blogs_count (): u16 {
    return this.get('following_blogs_count') as u16;
  }
}

export function registerBlogsTypes () {
  try {
    const typeRegistry = getTypeRegistry();
    typeRegistry.register({
      BlogId,
      PostId,
      CommentId,
      ReactionId,
      Change,
      Blog,
      BlogUpdate,
      Post,
      PostUpdate,
      Comment,
      CommentUpdate,
      ReactionKind,
      Reaction,
      SocialAccount
    });
  } catch (err) {
    console.error('Failed to register custom types of blogs module', err);
  }
}
