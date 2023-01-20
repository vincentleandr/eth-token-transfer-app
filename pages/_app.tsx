import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { Box } from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';

import { ButtonTheme, ButtonWallet } from '../components';
import '../styles/main.css';

declare global {
  interface Window {
    ethereum: any
  }
}

type WalletStatus = 'connected' | 'disconnected';

export default function App({ Component, pageProps }: AppProps) {
  const [provider, setProvider] = useState<Web3Provider>();
  const [signer, setSigner] = useState<JsonRpcSigner>();

  const [walletIsConnected, setWalletIsConnected] = useState<boolean>(false);
  const [isLoadingWallet, setIsLoadingWallet] = useState<boolean>(false);

  const [walletData, setWalletData] = useState<any>({
    address: '',
    balance: '',
    network: ''
  });

  // Get the provider and signer to interact with the chain
  // Set both as global state and pass it to all components
  useEffect(() => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      setProvider(provider);

      const signer = provider.getSigner();
      setSigner(signer);
    } catch (error) {
      // TODO: Suggest user to install metamask
      console.log(error, '===');
    }
  }, []);

  // Detect changes on wallet
  useEffect(() => {
    checkWalletConnection();

    // Detect network changes
    provider && provider.on("network", (newNetwork, oldNetwork) => {
      if (oldNetwork) {
        checkWalletConnection();
      }
    });

    // Detect account changes
    window.ethereum.on("accountsChanged", () => {
      checkWalletConnection();
    });
  }, [provider, walletIsConnected]);

  // Global function to check to check / re-check for wallet connection
  const checkWalletConnection = async () => {
    setIsLoadingWallet(true);

    // Check wallet status from local storage
    const walletStatusFromLocalStorage = localStorage.getItem('wallet_status') as WalletStatus;

    // Check wallet status from wallet app
    const accountList = provider && await provider.listAccounts();
    const walletStatusIsConnected = accountList !== undefined && accountList.length > 0;

    // Wallet connection is valid when both status is connected
    const walletIsConnected = walletStatusFromLocalStorage === 'connected' && walletStatusIsConnected;

    walletIsConnected && getWalletData();
    
    setWalletIsConnected(walletIsConnected);

    setIsLoadingWallet(false);
  };

  const getWalletData = async () => {
    const address = signer && await signer.getAddress();

    const balance = provider && address && await provider.getBalance(address);
    const formattedBalance = balance && ethers.utils.formatEther(balance);

    const network = provider && await provider.getNetwork();

    setWalletData({
      address,
      balance: formattedBalance,
      network: network?.name
    });
    
    // const mySignature = await signer.signMessage("Some custom message");
  };

  const appHeader = (
    <Box
      display={'flex'}
      justifyContent='center'
      position={'relative'}
    >
      <ButtonWallet
        provider={provider}
        signer={signer}
        checkWalletConnection={checkWalletConnection}
        walletIsConnected={walletIsConnected}
        isLoadingWallet={isLoadingWallet}
        walletData={walletData}
      />
      <ButtonTheme />
    </Box>
  );
  
  return (
    <div className='container'>
      <StyledEngineProvider injectFirst>
        {appHeader}
        <Component
          provider={provider}
          signer={signer}
          checkWalletConnection={checkWalletConnection}
          walletIsConnected={walletIsConnected}
          isLoadingWallet={isLoadingWallet}
          walletData={walletData}
          {...pageProps}
        />
      </StyledEngineProvider>
    </div>
  )
}
