// Copyright 2017-2020 @polkadot/apps-config authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Option } from './types';

const localNetworkWS = 'ws://127.0.0.1:9944/';
const currentNetworkWS = 'ws://testnet2.subsocial.network:9944/' || localNetworkWS;

const DEV: Option[] = [
  {
    info: 'local',
    text: 'Local Node (Own, 127.0.0.1:9944)',
    value: localNetworkWS
  }
];

const ENV: Option[] = [];

if (process.env.WS_URL) {
  ENV.push({
    info: 'WS_URL',
    text: 'WS_URL: ' + process.env.WS_URL,
    value: process.env.WS_URL
  });
}

const LIVE: Option[] = [
  {
    info: 'substrate',
    text: 'Subsocial (Subsocial Testnet, hosted by Subsocial)',
    value: currentNetworkWS
  }
];

let endpoints = [
  {
    isHeader: true,
    text: 'Live networks',
    value: ''
  },
  ...LIVE,
  {
    isHeader: true,
    text: 'Development',
    value: ''
  },
  ...DEV
];

if (ENV.length > 0) {
  endpoints = [
    {
      isHeader: true,
      text: 'Custom ENV',
      value: ''
    },
    ...ENV
  ].concat(endpoints);
}

// The available endpoints that will show in the dropdown. For the most part (with the exception of
// Polkadot) we try to keep this to live chains only, with RPCs hosted by the community/chain vendor
//   info: The chain logo name as defined in ../logos, specifically in namedLogos
//   text: The text to display on teh dropdown
//   value: The actual hosted secure websocket endpoint
export default endpoints.map((option): Option => ({ ...option, withI18n: true }));
