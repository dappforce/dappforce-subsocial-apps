import React from 'react';

import { I18nProps } from '@polkadot/ui-app/types';

import translate from './translate';
import ViewBlog from './ViewBlog';
import { BlogId } from './types';
import { UrlHasIdProps } from './utils';

type Props = I18nProps & UrlHasIdProps;

class Component extends React.PureComponent<Props> {
  render () {
    const { match: { params: { id } } } = this.props;
    return id
    ? <ViewBlog id={new BlogId(id)} />
    : null;
  }
}

export default translate(Component);
