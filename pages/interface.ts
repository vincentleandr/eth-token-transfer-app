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
};