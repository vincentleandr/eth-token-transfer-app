import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { Box, Dialog, Typography } from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { ButtonTheme, ButtonWallet, CustomButton } from '../components';
import { WalletStatus } from '../interface';
import { VLToken } from '../variables/contracts';
import '../styles/main.css';

declare global {
  interface Window {
    ethereum: any
  }
}

export default function App({ Component, pageProps }: AppProps) {
  const [provider, setProvider] = useState<Web3Provider>();
  const [signer, setSigner] = useState<JsonRpcSigner>();

  const [walletIsConnected, setWalletIsConnected] = useState<boolean>(false);
  const [isLoadingWallet, setIsLoadingWallet] = useState<boolean>(false);

  const [walletData, setWalletData] = useState<any>({
    address: '',
    network: ''
  });
  const [balance, setBalance] = useState<{ [key: string]: string }>({});
  const [addressIsWhitelisted, setAddressIsWhitelisted] = useState<boolean>(false);

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const isMobile = useMediaQuery('(max-width: 599px)');

  // Get the provider and signer to interact with the chain
  // Set both as global state and pass it to all components
  useEffect(() => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      setProvider(provider);

      const signer = provider.getSigner();
      setSigner(signer);
    } catch (error) {
      setModalOpen(true);
    }
  }, []);

  // Detect changes on wallet
  useEffect(() => {
    checkWalletConnection();

    if (provider) {
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
    }
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
    const ETHTokenBalance = balance && ethers.utils.formatEther(balance);

    const network = provider && await provider.getNetwork();

    setWalletData({
      address,
      network: network?.name
    });

    let VLTokenBalance;
    try {
      const tokenContract = new ethers.Contract(VLToken.address, VLToken.abi, signer);
      const tokenBalance = await tokenContract.balanceOf(address);
      VLTokenBalance = ethers.utils.formatUnits(tokenBalance);

      const addressIsWhitelisted = await tokenContract.verifyWhitelist(address);
      setAddressIsWhitelisted(addressIsWhitelisted);
    } catch (error) {
      // TODO: Handle error
      console.log(error, '===');
    }

    setBalance({
      ETH: ETHTokenBalance || '0',
      VL: VLTokenBalance || '0'
    })
  };

  const infoModal = (
    <Dialog
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      PaperProps={{ className: `card-base` }}
    >
      <Box p={'32px'}>
        <Typography variant='h6' mb={'16px'}>Hi there!</Typography>
        <Typography mb={'32px'}>
          To get the full experience of the app, please use a desktop browser and install <a href='https://metamask.io/' target={'_blank'} rel="noreferrer">Metamask</a>.
        </Typography>
        <Box
          display={'flex'}
          justifyContent='center'
        >
          <CustomButton
            buttonContent={'Got it!'}
            onClick={() => setModalOpen(false)}
            variant='primary'
          />
        </Box>
      </Box>
    </Dialog>
  );

  const appHeader = (
    <Box
      display={'flex'}
      justifyContent={isMobile ? 'space-between' : 'center'}
      position={'relative'}
    >
      <ButtonWallet
        provider={provider}
        signer={signer}
        checkWalletConnection={checkWalletConnection}
        walletIsConnected={walletIsConnected}
        isLoadingWallet={isLoadingWallet}
        walletData={walletData}
        balance={balance}
        addressIsWhitelisted={addressIsWhitelisted}
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
          balance={balance}
          addressIsWhitelisted={addressIsWhitelisted}
          {...pageProps}
        />
        {infoModal}
      </StyledEngineProvider>
    </div>
  )
}
