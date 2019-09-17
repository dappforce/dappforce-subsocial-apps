import BN from 'bn.js';
import React, { useState, useEffect } from 'react';
import { AccountId, AccountIndex, Address, Balance, Option } from '@polkadot/types';
import { withCall, withMulti, withCalls } from '@polkadot/ui-api/index';

import { findNameByAddress, nonEmptyStr } from '@polkadot/joy-utils/index';
import { FollowAccountButton } from '@dappforce/blogs/FollowButton';
import { Popup, Grid } from 'semantic-ui-react';
import { MyAccountProps, withMyAccount } from '@polkadot/joy-utils/MyAccount';
import { BareProps } from '@polkadot/ui-app/types';
import { classes, toShortAddress } from '@polkadot/ui-app/util';
import IdentityIcon from '@polkadot/ui-identicon/Identicon';
import { queryBlogsToProp } from './utils';
import { ProfileData, Profile, SocialAccount } from './types';
import { getJsonFromIpfs } from './OffchainUtils';

type Props = MyAccountProps & BareProps & {
  socialAccountOpt?: Option<SocialAccount>,
  balance?: Balance | Array<Balance> | BN,
  children?: React.ReactNode,
  isPadded?: boolean,
  subject?: React.ReactNode,
  isShort?: boolean,
  session_validators?: Array<AccountId>,
  value?: AccountId | AccountIndex | Address | string,
  name?: string,
  size?: number,
  withAddress?: boolean,
  withName?: boolean,
  date: string,
  event?: string,
  count?: number
};

function ActivityStreamItem (props: Props) {

  const { children, myAddress, className, isPadded = true, date, event, count, subject, session_validators, style, size, value, socialAccountOpt } = props;

  if (!value) {
    return null;
  }

  const address = value.toString();
  const isValidator = (session_validators || []).find((validator) =>
      validator.toString() === address
    );

  if (socialAccountOpt === undefined) return <em>Loading...</em>;
  else if (socialAccountOpt.isNone) return <em>Social account not found yet.</em>;

  const socialAccount = socialAccountOpt.unwrap();
  const profileOpt = socialAccount.profile;

  const profile = profileOpt.unwrap() as Profile;

  const {
    ipfs_hash
  } = profile;
  const [ profileData , setProfileData ] = useState({} as ProfileData);
  const {
    avatar
  } = profileData;

  useEffect(() => {
    if (!ipfs_hash) return;
    getJsonFromIpfs<ProfileData>(ipfs_hash).then(json => {
      setProfileData(json);
    }).catch(err => console.log(err));
  }, [ false ]);

  const hasAvatar = avatar && nonEmptyStr(avatar);

  const renderCount = () => (count && `and ${count} people `);

  const renderFollowButton = <div className='DfFollowButton'><FollowAccountButton address={address} /> </div>;

  const renderPreview = () => (
      <div
        className={classes('DfActivityStreamItem', isPadded ? 'padded' : '', className)}
        style={style}
      >
        <div className='DfActivityStreamItem-info'>
          <IdentityIcon
            isHighlight={!!isValidator}
            size={size || 36}
            value={address}
          />
          <div>
            {myAddress !== address &&
              <Popup
                  trigger={renderAddress(address)}
                  flowing
                  hoverable
              >
              <Grid centered divided columns={1}>
                <Grid.Column textAlign='center'>
                  {renderFollowButton}
                </Grid.Column>
                </Grid>
              </Popup>
            }
            <div className='DfActivityStreamItem-details'>
              {renderName(address)}
              {renderCount()}
              <div className='DfActivityStreamItem-details event'>
                {event}
              </div>
              <div className='DfActivityStreamItem-details subject'>
                {subject}
              </div>
              <div className='DfActivityStreamItem-details date'>
                {date}
              </div>
            </div>
          </div>
          {children}
        </div>
      </div>
    );

  return renderPreview();

  function renderAddress (address: string) {
    const { isShort = true, withAddress = true } = props;
    if (!withAddress) {
      return null;
    }

    return (
      <div className='DfActivityStreamItem-address'>
        {isShort ? toShortAddress(address) : address}
      </div>
    );
  }

  function renderName (address: string) {
    let { name, withName = false } = props;
    if (!withName) {
      return null;
    }

    name = name ? name : findNameByAddress(address);
    return (nonEmptyStr(name) ?
      <div className='DfActivityStreamItem-details name'>
        <b>{name}</b>
      </div> : null
    );
  }
}

export default withMulti(
  ActivityStreamItem,
  withMyAccount,
  withCall('query.session.validators'),
  withCalls<Props>(
    queryBlogsToProp('socialAccountById',
      { paramName: 'value', propName: 'socialAccountOpt' })
  )
);
