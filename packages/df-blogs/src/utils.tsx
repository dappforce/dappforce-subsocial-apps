import React, { useState } from 'react';
import { Pagination as SuiPagination } from 'semantic-ui-react';

import { AccountId, AccountIndex, Address } from '@polkadot/types';
import AddressMini from '@polkadot/ui-app/AddressMiniJoy';
import { Options } from '@polkadot/ui-api/with/types';
import { queryToProp } from '@polkadot/joy-utils/index';
import { SubmittableResult } from '@polkadot/api';
import { PostId } from './types';

export const queryBlogsToProp = (storageItem: string, paramNameOrOpts?: string | Options) => {
  return queryToProp(`query.blogs.${storageItem}`, paramNameOrOpts);
};

type AuthorPreviewProps = {
  address: AccountId | AccountIndex | Address | string
};

// TODO show member instead of address.
export function AuthorPreview ({ address }: AuthorPreviewProps) {
  return (
    <AddressMini value={address} isShort={false} isPadded={false} withBalance={true} withName={true} withMemo={false} size={36} />
  );
}

type PaginationProps = {
  currentPage?: number,
  totalItems: number,
  itemsPerPage?: number,
  onPageChange: (activePage?: string | number) => void
};

export const Pagination = (p: PaginationProps) => {
  const { currentPage = 1, itemsPerPage = 20 } = p;
  const totalPages = Math.floor(p.totalItems / itemsPerPage);

  return totalPages <= 1 ? null : (
    <SuiPagination
      firstItem={null}
      lastItem={null}
      defaultActivePage={currentPage}
      totalPages={totalPages}
      onPageChange={(_event, { activePage }) => p.onPageChange(activePage)}
    />
  );
};

export function getIdWithEvent<T> (_txResult: SubmittableResult, id: T): T {
  const struct = (id instanceof PostId) ? 'Post' : 'Blog';
  const [structId, setStructId] = useState(id);
  _txResult.events.find(event => {
    const { event: { data, method } } = event;
    console.log('Method: ' + method);
    if (method === `${struct}Created`) {
      setStructId(data.toArray()[1] as T); // What do this, because ts error?
    }
  });
  return structId;
}
// It's used in such routes as:
//   /blogs/:id
//   /blogs/:id/edit
//   /posts/:id
//   /posts/:id/edit
export type UrlHasIdProps = {
  match: {
    params: {
      id: string
    }
  }
};
