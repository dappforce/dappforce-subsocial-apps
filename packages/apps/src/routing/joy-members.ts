import { Routes } from '../types';

import AddressMiniDf from '@polkadot/ui-app/AddressMiniDf';

export default ([
  {
    Component: AddressMiniDf,
    display: {},
    i18n: {
      defaultValue: 'Membership'
    },
    icon: 'users',
    name: 'members'
  }
] as Routes);
