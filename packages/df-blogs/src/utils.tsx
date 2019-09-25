import React, { Component, useState, useEffect } from 'react';
import { Pagination as SuiPagination } from 'semantic-ui-react';

import { AccountId, AccountIndex, Address, Struct } from '@polkadot/types';
import AddressMini, { Props as PropsWithAddressMini } from '@polkadot/ui-app/AddressMiniDf';
import { Options } from '@polkadot/ui-api/with/types';
import { queryToProp } from '@polkadot/df-utils/index';
import { SubmittableResult } from '@polkadot/api';
import { CommentId, PostId, BlogId, Profile, ProfileData, SocialAccount } from './types';
import { OuterProps } from './EditProfile';
import { getJsonFromIpfs } from '@dappforce/blogs/OffchainUtils';
import { Props as PropsWithViewProfile } from './ViewProfile';

export const host = 'http://localhost:3001/v1';

export const queryBlogsToProp = (storageItem: string, paramNameOrOpts?: string | Options) => {
  return queryToProp(`query.blogs.${storageItem}`, paramNameOrOpts);
};

type AuthorPreviewProps = {
  address: AccountId | AccountIndex | Address | string
};

// TODO show member instead of address.
export function AuthorPreview ({ address }: AuthorPreviewProps) {
  return (
    <AddressMini value={address} isShort={false} isPadded={false} withBalance={true} withName={true} size={36} />
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

export function getNewIdFromEvent<IdType extends BlogId | PostId | CommentId | AccountId>
  (_txResult: SubmittableResult): IdType | undefined {

  let id: IdType | undefined;

  _txResult.events.find(event => {
    const { event: { data, method } } = event;
    if (method.indexOf('ProfileCreated') >= 0) {
      const [ newId ] = data.toArray();
      id = newId as IdType;
      return true;
    } else if (method.indexOf(`Created`) >= 0) {
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

export type UrlHasAddressProps = {
  match: {
    params: {
      address: string
    }
  }
};

export function withIdFromMyAddress (Component: React.ComponentType<OuterProps>) {
  return function (props: UrlHasAddressProps) {
    const { match: { params: { address } } } = props;
    try {
      return <Component id={new AccountId(address)} {...props}/>;
    } catch (err) {
      return <em>Invalid address: {address}</em>;
    }
  };
}

type LoadSocialAccountType = PropsWithAddressMini | PropsWithViewProfile;

export function LoadSocialAccount (Component: React.ComponentType<LoadSocialAccountType>) {
  return function (props: LoadSocialAccountType) {
    const { socialAccountOpt } = props;
    const [ socialAccount, setSocialAccount ] = useState(undefined as (SocialAccount | undefined));
    const [ profileData, setProfileData ] = useState(undefined as (ProfileData | undefined));
    const [ profile, setProfile ] = useState(undefined as (Profile | undefined));

    const loadingProfile = <em>Loading profile...</em>;

    useEffect(() => {
      if (!socialAccountOpt || socialAccountOpt.isNone) return;

      setSocialAccount(socialAccountOpt.unwrap());
      const profileOpt = socialAccount && socialAccount.profile;

      if (profileOpt === undefined) return;
      if (profileOpt.isNone) return;

      setProfile(profileOpt.unwrap() as Profile);

      if (profile === undefined) return;
      console.log(profile.ipfs_hash);
      getJsonFromIpfs<ProfileData>(profile.ipfs_hash).then(profileData => {
        setProfileData(profileData);
      }).catch(err => console.log(err));
    }, [ false ]);

    if (!socialAccountOpt) {
      return loadingProfile;
    }

    if (socialAccountOpt.isNone) {
      return <em>Profile not found...</em>;
    }

    return <Component {...props} profile={profile} profileData={profileData} socialAccount={socialAccount} />;
  };
}
