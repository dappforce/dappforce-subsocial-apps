// Copyright 2017-2019 @polkadot/ui-reactive/src authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BareProps, CallProps } from '@polkadot/ui-api/src/types';

import React from 'react';
import { BlockNumber } from '@polkadot/types';
import { withCall } from '@polkadot/ui-api/src';
import { formatNumber } from '@polkadot/util';

type Props = BareProps & CallProps & {
  children?: React.ReactNode,
  label?: string,
  chain_bestNumber?: BlockNumber
};

export class BestNumber extends React.PureComponent<Props> {
  render () {
    const { children, className, label = '', style, chain_bestNumber } = this.props;

    return (
      <div
        className={className}
        style={style}
      >
        {label}{
          chain_bestNumber
            ? formatNumber(chain_bestNumber)
            : '-'
        }{children}
      </div>
    );
  }
}

export default withCall('derive.chain.bestNumber')(BestNumber);
