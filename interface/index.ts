import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';

declare global {
  interface Window {
    ethereum: any
  }
}

export interface ComponentBaseProps {
  provider: Web3Provider | undefined;
  signer: JsonRpcSigner | undefined;
  checkWalletConnection: () => void;
  walletIsConnected: boolean;
  isLoadingWallet: boolean;
  walletData: {
    address: string;
    balance: string;
    network: string;
  };
};

export type WalletStatus = 'connected' | 'disconnected';
export type Theme = 'default' | 'dark';
