// Copyright 2017-2018 @polkadot/app-accounts authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';
import { ActionStatus } from '@polkadot/ui-app/Status/types';

import FileSaver from 'file-saver';
import React from 'react';
import { AddressSummary, Button, Dropdown, Input, Modal, Password } from '@polkadot/ui-app/index';
import { InputAddress } from '@polkadot/ui-app/InputAddress';
import { hexToU8a, isHex, stringToU8a, u8aToHex } from '@polkadot/util';
import { mnemonicToSeed, mnemonicValidate, naclKeypairFromSeed, randomAsU8a } from '@polkadot/util-crypto';
import keyring from '@polkadot/ui-keyring/index';
import { QrScan } from '@polkadot/ui-qr/index';

import translate from './translate';

const BipWorker = require('worker-loader?name=[name].[hash:8].js!./bipWorker');

type Props = I18nProps & {
  onStatusChange: (status: ActionStatus) => void,
  onCreateAccount: () => void
};

type SeedType = 'bip' | 'qr' | 'raw';

type State = {
  address: string,
  isBipBusy: boolean,
  isNameValid: boolean,
  isSeedValid: boolean,
  isPassValid: boolean,
  isValid: boolean,
  name: string,
  password: string,
  seed: string,
  seedOptions: Array<{ value: SeedType, text: string }>,
  seedType: SeedType,
  showWarning: boolean
};

function formatSeed (seed: string): Uint8Array {
  return isHex(seed)
    ? hexToU8a(seed)
    : stringToU8a((seed as string).padEnd(32, ' '));
}

function addressFromSeed (seed: string, seedType: SeedType): string {
  const keypair = naclKeypairFromSeed(
    seedType === 'bip'
      ? mnemonicToSeed(seed)
      : formatSeed(seed)
  );

  return keyring.encodeAddress(
    keypair.publicKey
  );
}

class Creator extends React.PureComponent<Props, State> {
  bipWorker: any;
  state: State = { seedType: 'bip' } as State;

  constructor (props: Props) {
    super(props);

    const { t } = this.props;

    this.bipWorker = new BipWorker();
    this.bipWorker.onmessage = (event: MessageEvent) => {
      const { publicKey, seed } = event.data;

      this.setState({
        address: keyring.encodeAddress(publicKey),
        isBipBusy: false,
        isSeedValid: true,
        seed
      });
    };
    this.state = {
      ...this.emptyState(),
      seedOptions: [
        { value: 'bip', text: t('seedType.bip', { defaultValue: 'Mnemonic' }) },
        { value: 'raw', text: t('seedType.raw', { defaultValue: 'Raw seed' }) },
        { value: 'qr', text: t('seedType.qr', { defaultValue: 'QR signer' }) }
      ]
    };
  }

  render () {
    const { address, isSeedValid } = this.state;

    return (
      <div className='accounts--Creator'>
        <div className='ui--grid'>
          <AddressSummary
            className='shrink'
            value={
              isSeedValid
                ? address
                : ''
            }
          />
          {this.renderInput()}
        </div>
        {this.renderButtons()}
      </div>
    );
  }

  private getSeedHint () {
    const { t } = this.props;
    const { seedType } = this.state;

    switch (seedType) {
      case 'bip':
        return t('creator.seed.bip', {
          defaultValue: 'create from the following mnemonic seed'
        });

      case 'qr':
        return t('creator.seed.qr', {
          defaultValue: 'scanned QR publicKey'
        });

      case 'raw':
        return t('creator.seed.raw', {
          defaultValue: 'create from the following seed (hex or string)'
        });

      default:
        throw new Error('Unreachable');
    }
  }

  private renderButtons () {
    const { t } = this.props;
    const { isValid } = this.state;

    return (
      <Button.Group>
        <Button
          onClick={this.onDiscard}
          text={t('creator.discard', {
            defaultValue: 'Reset'
          })}
        />
        <Button.Or />
        <Button
          isDisabled={!isValid}
          isPrimary
          onClick={this.onShowWarning}
          text={t('creator.save', {
            defaultValue: 'Save'
          })}
        />
      </Button.Group>
    );
  }

  private renderInput () {
    const { t } = this.props;
    const { isBipBusy, isNameValid, isSeedValid, name, seed, seedOptions, seedType } = this.state;
    const isQr = seedType === 'qr';

    return (
      <div className='grow'>
        <div className='ui--row'>
          <Input
            autoFocus
            className='full'
            isError={!isNameValid}
            label={t('creator.name', {
              defaultValue: 'name the account'
            })}
            onChange={this.onChangeName}
            value={name}
          />
        </div>
        <div className='ui--row'>
          <Input
            className='full'
            isAction
            isDisabled={isBipBusy}
            isError={!isSeedValid}
            isReadonly={isQr}
            label={this.getSeedHint()}
            onChange={this.onChangeSeed}
            placeholder={
              isBipBusy
                ? t('creator.seed.bipBusy', {
                  defaultValue: 'Generating Mnemeonic seed'
                })
                : null
            }
            value={isBipBusy ? '' : seed}
          >
            <Dropdown
              isButton
              defaultValue={seedType}
              onChange={this.selectSeedType}
              options={seedOptions}
            />
          </Input>
        </div>
        {this.renderPassword()}
        {this.renderQr()}
        {this.renderSaveModal()}
      </div>
    );
  }

  private renderSaveModal () {
    const { t } = this.props;
    const { address, seedType, showWarning } = this.state;

    return (
      <Modal
        className='app--accounts-Modal'
        dimmer='inverted'
        open={showWarning}
        size='small'
      >
        <Modal.Header key='header'>
          {t('seedWarning.header', {
            defaultValue: 'Important notice!'
          })}
        </Modal.Header>
        <Modal.Content key='content'>
          {t('seedWarning.content', {
            defaultValue: 'We will provide you with a generated backup file after your account is created. As long as you have access to your account you can always redownload this file later.'
          })}
          <Modal.Description>
            {t('seedWarning.description', {
              defaultValue: 'Please make sure to save this file in a secure location as it is the only way to restore your account.'
            })}
          </Modal.Description>
          <AddressSummary
            className='accounts--Modal-Address'
            value={address}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button.Group>
            <Button
              isNegative
              onClick={this.onHideWarning}
              text={t('seedWarning.cancel', {
                defaultValue: 'Cancel'
              })}
            />
            <Button.Or />
            <Button
              isPrimary
              onClick={
                seedType === 'qr'
                  ? this.onCreateQr
                  : this.onCreateSeed
              }
              text={t('seedWarning.continue', {
                defaultValue: 'Create and backup account'
              })}
            />
          </Button.Group>
        </Modal.Actions>
      </Modal>
    );
  }

  private renderPassword () {
    const { t } = this.props;
    const { isPassValid, password, seedType } = this.state;

    if (seedType === 'qr') {
      return null;
    }

    return (
      <div className='ui--row'>
        <Password
          className='full'
          isError={!isPassValid}
          label={t('creator.password', {
            defaultValue: 'encrypt it using the password'
          })}
          onChange={this.onChangePass}
          value={password}
        />
      </div>
    );
  }

  private renderQr () {
    const { isSeedValid, seedType } = this.state;

    if (isSeedValid || seedType !== 'qr') {
      return null;
    }

    return (
      <div className='app--account-Qr'>
        <QrScan onScan={this.onQrScan} />
      </div>
    );
  }

  private generateSeed (seedType: SeedType): State {
    if (seedType === 'qr') {
      return {
        address: '',
        isBipBusy: false,
        isSeedValid: false,
        seed: ''
      } as State;
    } else if (seedType === 'bip') {
      this.bipWorker.postMessage('create');

      return {
        isBipBusy: true,
        seed: ''
      } as State;
    }

    const seed = u8aToHex(randomAsU8a());
    const address = addressFromSeed(seed, seedType);

    return {
      address,
      isBipBusy: false,
      isSeedValid: true,
      seed
    } as State;
  }

  private emptyState (): State {
    const { seedType } = this.state;

    return {
      ...this.generateSeed(seedType),
      isNameValid: true,
      isPassValid: false,
      isValid: false,
      name: 'new keypair',
      password: '',
      seedType,
      showWarning: false
    };
  }

  private nextState (newState: State): void {
    this.setState(
      (prevState: State, props: Props): State => {
        const { isBipBusy = prevState.isBipBusy, name = prevState.name, password = prevState.password, seed = prevState.seed, seedOptions = prevState.seedOptions, seedType = prevState.seedType, showWarning = prevState.showWarning } = newState;
        let address = prevState.address;
        const isNameValid = !!name;
        const isSeedValid = seedType === 'bip'
          ? mnemonicValidate(seed)
          : (
            isHex(seed)
              ? seed.length === 66
              : (seed as string).length <= 32
          );
        const isPassValid = keyring.isPassValid(password);

        if (isSeedValid && seed !== prevState.seed) {
          address = addressFromSeed(seed, seedType);
        }

        return {
          address,
          isBipBusy,
          isNameValid,
          isPassValid,
          isSeedValid,
          isValid: isNameValid && isPassValid && isSeedValid,
          name,
          password,
          seed,
          seedOptions,
          seedType,
          showWarning
        };
      }
    );
  }

  private onChangeSeed = (seed: string): void => {
    this.nextState({ seed } as State);
  }

  private onChangeName = (name: string): void => {
    this.nextState({ name } as State);
  }

  private onChangePass = (password: string): void => {
    this.nextState({ password } as State);
  }

  private onShowWarning = (): void => {
    this.nextState({ showWarning: true } as State);
  }

  private onHideWarning = (): void => {
    this.nextState({ showWarning: false } as State);
  }

  private onQrScan = (data: any): void => {
    console.log('scanned', data);
  }

  private onCreateQr = (): void => {
    // do something
  }

  private onCreateSeed = (): void => {
    const { onCreateAccount, onStatusChange, t } = this.props;
    const { name, password, seed, seedType } = this.state;

    const status: ActionStatus = {
      action: 'create'
    };

    try {
      const pair = seedType === 'bip'
        ? keyring.createAccountMnemonic(seed, password, { name })
        : keyring.createAccount(formatSeed(seed), password, { name });

      const json = pair.toJson(password);
      const blob = new Blob([JSON.stringify(json)], { type: 'application/json; charset=utf-8' });

      FileSaver.saveAs(blob, `${pair.address()}.json`);

      status.value = pair.address();
      status.success = !!(pair);
      status.message = t('status.created', {
        defaultValue: `Created Account`
      });

      InputAddress.setLastValue('account', pair.address());
    } catch (err) {
      status.success = false;
      status.message = err.message;
    }

    this.onHideWarning();
    onCreateAccount();
    onStatusChange(status);
  }

  private onDiscard = (): void => {
    this.setState(this.emptyState());
  }

  private selectSeedType = (seedType: SeedType): void => {
    if (seedType === this.state.seedType) {
      return;
    }

    this.setState({
      ...this.generateSeed(seedType),
      seedType
    });
  }
}

export default translate(Creator);
