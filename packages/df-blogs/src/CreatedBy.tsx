import React from 'react';
import { Table } from 'semantic-ui-react';

import AddressMini from '@polkadot/ui-app/AddressMiniJoy';
import { formatNumber } from '@polkadot/util';

import { Change } from './types';

type CreatedByProps = {
  created: Change
};

export const CreatedBy = (props: CreatedByProps) => (
  <Table celled selectable compact definition className='ProfileDetailsTable'>
    <Table.Body>
      <Table.Row>
        <Table.Cell>Created on</Table.Cell>
        <Table.Cell>{new Date(props.created.time).toLocaleString()} at block #{formatNumber(props.created.block)}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Created by</Table.Cell>
        <Table.Cell><AddressMini value={props.created.account} isShort={false} isPadded={false} size={36} withName withBalance /></Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
);
