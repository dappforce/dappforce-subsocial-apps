import { Null } from '@polkadot/types';
import { EnumType } from '@polkadot/types/codec';
import { PostId, CommentId } from './blogs';

export class RegularPost extends Null {}
export class SharedPost extends PostId {}
export class SharedComment extends CommentId {}

export type PostExtensionEnum =
  RegularPost |
  SharedPost |
  SharedComment;

type PostExtensionEnumValue = 
  { RegularPost: RegularPost } |
  { SharedPost: SharedPost } |
  { SharedComment: SharedComment };

export class PostExtension extends EnumType<PostExtensionEnumValue> {
  constructor (value?: PostExtensionEnumValue, index?: number) {
    super({
      RegularPost,
      SharedPost,
      SharedComment
    }, value, index);
  }
}

export default PostExtension;
