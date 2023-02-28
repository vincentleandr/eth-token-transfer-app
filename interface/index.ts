import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';

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
  balance: { [key: string]: string },
  addressIsWhitelisted: boolean
};

export type WalletStatus = 'connected' | 'disconnected';
export type Theme = 'default' | 'dark';

export type ResponseType = 'send' | 'mint' | 'whitelist';
