import { fillHistory } from './ListsEditHistory';
import { VecBlogHistoryRecord, Blog, BlogId } from './types';
import { api } from '@polkadot/ui-api/Api';

test('History is undefined', async () => {
  const blog = await api.query.blogs.blogById(new BlogId(1)) as Blog;
  const { edit_history } = blog;
  expect(typeof fillHistory<VecBlogHistoryRecord>(edit_history)).toBe('VecBlogHistoryRecord');
});
