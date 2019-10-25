import { Routes } from '../types';

import Blogs from '../../../components/df-blogs/index';

export default ([
  {
    Component: Blogs,
    display: {},
    i18n: {
      defaultValue: 'Blogs'
    },
    icon: 'newspaper outline',
    name: 'blogs'
  }
] as Routes);
