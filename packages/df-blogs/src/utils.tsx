import React from 'react';
import { Pagination as SuiPagination } from 'semantic-ui-react';

import { AccountId, AccountIndex, Address } from '@polkadot/types';
import AddressMini from '@polkadot/ui-app/AddressMiniJoy';
import { Options } from '@polkadot/ui-api/with/types';
import { queryToProp } from '@polkadot/joy-utils/index';
import { SubmittableResult } from '@polkadot/api';
import { CommentId, PostId, BlogId, CommentData, PostData, BlogData } from './types';

import * as IPFS from 'typestub-ipfs';
const ipfsClient = require('ipfs-http-client');
const CID = require('cids');

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

export function getNewIdFromEvent<IdType extends BlogId | PostId | CommentId>
  (_txResult: SubmittableResult): IdType | undefined {

  let id: IdType | undefined;

  _txResult.events.find(event => {
    const { event: { data, method } } = event;
    if (method.indexOf(`Created`) >= 0) {
      const [/* owner */, newId ] = data.toArray();
      id = newId as IdType;
      return true;
    }
    return false;
  });

  return id;
}

export type UrlHasIdProps = {
  match: {
    params: {
      id: string
    }
  }
};

type IpfsAPI = IPFS.FilesAPI & {
  pin: {
    rm: (hash?: string) => any,
    ls: (hash?: string) => any
  },
  repo: IPFS.RepoAPI
};

// connect to ipfs daemon API server
const ipfs = ipfsClient('localhost', '5002', { protocol: 'http' }) as IpfsAPI;

// const ipfsConfig = { host: 'localhost', port:'5002', protocol: 'http' };
// new IPFS({ config: ipfsConfig });

type IpfsData = CommentData | PostData | BlogData;

export async function addJsonToIpfs (data: IpfsData): Promise<string> {
  // const path = `subsocial/${pathDir}`;
  // console.log(path);
  // const json = { path: path, content: Buffer.from(JSON.stringify(data)) };
  const json = Buffer.from(JSON.stringify(data));
  const results = await ipfs.add(json);
  return results[results.length - 1].hash;
}

export async function removeFromIpfs (hash: string) {
  await ipfs.pin.rm(hash);
}

export async function getJsonFromIpfs<T extends IpfsData> (hash: string): Promise<T> {
  const cid = new CID(hash);
  const results = await ipfs.cat(cid);
  return JSON.parse(results.toString()) as T;
}
