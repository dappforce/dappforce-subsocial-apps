// Copyright 2017-2019 @polkadot/apps authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/src/types';
import { SIDEBAR_MENU_THRESHOLD } from '../constants';

import './SideBar.css';

import React from 'react';
import styled from 'styled-components';
import { Responsive } from 'semantic-ui-react';
import { Button, Menu, media } from '@polkadot/ui-app/src';
import { classes } from '@polkadot/ui-app/src/util';
import { logoBackground, logoPadding } from '@polkadot/ui-app/src/styles/theme';

import routing from '../routing';
import translate from '../translate';
import Item from './Item';
import NodeInfo from './NodeInfo';
import getLogo from './logos';

type Props = I18nProps & {
  collapse: () => void,
  handleResize: () => void,
  isCollapsed: boolean,
  menuOpen: boolean,
  toggleMenu: () => void
};

const Toggle = styled.img`
  background: ${logoBackground};
  padding: ${logoPadding};
  border-radius: 50%;
  cursor: pointer;
  left: 0.9rem;
  opacity: 0;
  position: absolute;
  top: 0px;
  transition: opacity 0.2s ease-in, top 0.2s ease-in;
  width: 2.8rem;

  &.delayed {
    transition-delay: 0.4s;
  }
  &.open {
    opacity: 1;
    top: 0.9rem;
  }

  ${media.DESKTOP`
    opacity: 0 !important;
    top: -2.9rem !important;
  `}
`;

class SideBar extends React.PureComponent<Props> {
  render () {
    const { isCollapsed } = this.props;

    return (
      <Responsive
        onUpdate={this.props.handleResize}
        className={
          classes(
            'apps-SideBar-Wrapper',
              isCollapsed ? 'collapsed' : 'expanded'
            )
        }
      >
        {this.renderMenuToggle()}
        <div className='apps--SideBar'>
          <Menu
            secondary
            vertical
          >
            <div className='apps-SideBar-Scroll'>
              {this.renderSubSocialLogo()}
              {this.renderRoutes()}
              <Menu.Divider hidden />
              {
                isCollapsed
                  ? null
                  : <NodeInfo />
              }
            </div>
            {this.renderCollapse()}
          </Menu>
          {this.renderToggleBar()}
        </div>
      </Responsive>
    );
  }

  private renderCollapse () {
    const { isCollapsed } = this.props;

    return (
      <Responsive
        minWidth={SIDEBAR_MENU_THRESHOLD}
        className={`apps--SideBar-collapse ${isCollapsed ? 'collapsed' : 'expanded'}`}
      >
        <Button
          icon={`angle double ${isCollapsed ? 'right' : 'left'}`}
          isBasic
          isCircular
          onClick={this.props.collapse}
        />
      </Responsive>
    );
  }

  // @ts-ignore is declared but its value is never read
  private renderLogo () {
    const { isCollapsed } = this.props;
    const logo = getLogo(isCollapsed);

    return (
      <img
        alt='polkadot'
        className='apps--SideBar-logo'
        src={logo}
      />
    );
  }

  private renderSubSocialLogo () {
    const { isCollapsed } = this.props;
    return <span className='DfSidebarLogo'>{isCollapsed ? 'S.' : 'SubSocial'}</span>;
  }

  private renderRoutes () {
    const { isCollapsed } = this.props;
    const { t } = this.props;

    return routing.routes.map((route, index) => (
      route
        ? (
          <Item
            isCollapsed={isCollapsed}
            key={route.name}
            route={route}
            onClick={this.props.handleResize}
            t={t}
          />
        )
        : (
          <Menu.Divider
            hidden
            key={index}
          />
        )
    ));
  }

  private renderToggleBar () {
    return (
      <Responsive minWidth={SIDEBAR_MENU_THRESHOLD}>
        <div
          className='apps--SideBar-toggle'
          onClick={this.props.collapse}
        >
        </div>
      </Responsive>
    );
  }

  private renderMenuToggle () {
    const logo = getLogo(true);
    const { toggleMenu, menuOpen } = this.props;

    return (
      <Toggle
        alt='logo'
        className={menuOpen ? 'closed' : 'open delayed'}
        onClick={toggleMenu}
        src={logo}
      />
    );
  }
}

export default translate(SideBar);
