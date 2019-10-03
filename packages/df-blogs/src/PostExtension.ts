import { Null } from '@polkadot/types';
import { u64, EnumType } from '@polkadot/types';
import { PostId, CommentId } from '../../df-types/src/types';

export class RegularPost extends Null {}
export class SharedPost extends u64 {}
export class SharedComment extends u64 {}

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
