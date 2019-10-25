// Copyright 2017-2019 @polkadot/ui-app/src authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Props } from '../types';

import BN from 'bn.js';
import React from 'react';
import { Dropdown } from '@polkadot/ui-app/src';

import Bare from './Bare';

const options = [
  { text: 'Nay', value: 0 },
  { text: 'Aye', value: -1 }
];

export default class Vote extends React.PureComponent<Props> {
  render () {
    const { className, defaultValue: { value }, isDisabled, isError, label, style, withLabel } = this.props;
    const defaultValue = value instanceof BN
      ? value.toNumber()
      : value as number;

    return (
      <Bare
        className={className}
        style={style}
      >
        <Dropdown
          className={isDisabled ? 'full' : 'medium'}
          defaultValue={defaultValue}
          isDisabled={isDisabled}
          isError={isError}
          label={label}
          options={options}
          onChange={this.onChange}
          withLabel={withLabel}
        />
      </Bare>
    );
  }

  private onChange = (value: number): void => {
    const { onChange } = this.props;

    onChange && onChange({
      isValid: true,
      value
    });
  }
}
