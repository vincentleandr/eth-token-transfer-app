import { useState, BaseSyntheticEvent, ReactElement } from "react";
import Image from 'next/image'
import { Box, Typography, Menu, Divider, CircularProgress, Tooltip } from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CallMadeRoundedIcon from '@mui/icons-material/CallMadeRounded';
import PowerSettingsNewRoundedIcon from '@mui/icons-material/PowerSettingsNewRounded';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';

import { CustomButton } from "../Button";
import { ComponentBaseProps, WalletStatus } from "../../interface";
import { truncateAddress } from "../../utils";
import { networkExplorerUrl } from "../../variables/network";

interface ButtonWalletProps extends ComponentBaseProps {
  connectedWalletButton?: ReactElement;
  fullWidth?: boolean;
};

export const ButtonWallet = (props: ButtonWalletProps) => {
  const {
    provider,
    signer,
    checkWalletConnection,
    walletIsConnected,
    isLoadingWallet,
    connectedWalletButton,
    walletData,
    balance,
    fullWidth
  } = props;

  const { address, network } = walletData;

  const [copyAddressTooltipText, setCopyAddressTooltipText] = useState<'Copy address' | 'Copied!'>('Copy address');

  const [menuAnchorElement, setMenuAnchorElement] = useState<null | HTMLElement>(null);
  const openWalletMenu = Boolean(menuAnchorElement);

  const truncatedAddress = address && truncateAddress(address);
  const jsNumberAddress = address
    ? jsNumberForAddress(address) 
    : jsNumberForAddress('0x111');
  const mappedNetwork = network === 'homestead'
    ? 'Ethereum Mainnet' : network;

  const connectWallet = async () => {
    // Triggering pop-up on metamask
    provider && await provider.send('eth_requestAccounts', []);

    localStorage.setItem('wallet_status', 'connected' as WalletStatus);
    checkWalletConnection();
  };

  const disconnectWallet = () => {
    onCloseWalletMenu();

    localStorage.setItem('wallet_status', 'disconnected' as WalletStatus);
    checkWalletConnection();
  };

  const onOpenWalletMenu = (event: BaseSyntheticEvent) => {
    setMenuAnchorElement(event.currentTarget);
  };

  const onCloseWalletMenu = () => {
    setMenuAnchorElement(null);
  };

  const copyAddress = () => {
    address && navigator.clipboard.writeText(address).then(() => {
      setCopyAddressTooltipText('Copied!')
      
      setTimeout(() => setCopyAddressTooltipText('Copy address'), 2000);
    });
  };

  const connectWalletButton = (
    <CustomButton
      buttonContent={isLoadingWallet ? 'Loading...' : 'Connect Wallet'}
      onClick={() => connectWallet()}
      variant='primary'
      disabled={isLoadingWallet}
      startIcon={isLoadingWallet ? <CircularProgress size={'24px'} /> : undefined}
      fullWidth={fullWidth}
    />
  );

  const defaultConnectedWalletButtonContent = (
    <Box
      display={'flex'}
      alignItems='center'
    >
      <Image
        src={'/icon-metamask.svg'}
        alt={'metamask'}
        width={24}
        height={24}
      />
      <Typography ml={'16px'}>{truncatedAddress}</Typography>
    </Box>
  );

  const defaultConnectedWalletButton = (
    <CustomButton
      buttonContent={defaultConnectedWalletButtonContent}
      onClick={(event: BaseSyntheticEvent) => onOpenWalletMenu(event)}
      variant='secondary'
      id='connected-wallet-button'
      popUpId='connected-wallet-menu'
      withPopUp
      openPopUp={openWalletMenu}
    />
  );

  const explorerBaseUrl = networkExplorerUrl[network] || networkExplorerUrl.homestead;
  const walletMenu = (
    <Menu
      id="connected-wallet-menu"
      anchorEl={menuAnchorElement}
      open={openWalletMenu}
      onClose={onCloseWalletMenu}
      MenuListProps={{
        'aria-labelledby': 'connected-wallet-button',
      }}
      PaperProps={{
        className: 'connected-wallet-menu'
      }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      <Box
        display={'flex'}
        alignItems='center'
        p={'16px 24px'}
      >
        <Jazzicon diameter={24} seed={jsNumberAddress} />
        <Typography ml={'16px'}>{truncatedAddress}</Typography>
        <Box ml={'24px'}>
          <Tooltip
            title={copyAddressTooltipText}
            arrow
          >
            <Box display={'unset'}>
              <CustomButton
                buttonContent={<ContentCopyRoundedIcon />}
                onClick={copyAddress}
                variant='icon'
              />
            </Box>
          </Tooltip>
          
          <CustomButton
            buttonContent={<CallMadeRoundedIcon />}
            variant='icon'
            href={`${explorerBaseUrl}/address/${address}`}
          />

          <Tooltip
            title={'Disconnect'}
            arrow
          >
            <Box display={'unset'}>
              <CustomButton
                buttonContent={<PowerSettingsNewRoundedIcon />}
                onClick={disconnectWallet}
                variant='icon'
              />
            </Box>
          </Tooltip>
          
        </Box>
      </Box>
      <Divider />
      <Box
        display={'flex'}
        alignItems='center'
        p={'16px 24px'}
      >
        <Box
          display={'flex'}
          justifyContent='center'
          width={'24px'}
        >
          <Box className='online-dot' />
        </Box>
        <Typography
          ml={'16px'}
          textTransform='capitalize'
        >
          {mappedNetwork}
        </Typography>
      </Box>
      <Divider />
      <Box
        display={'flex'}
        alignItems='center'
        p={'16px 24px'}
      >
        <Image
          src={'/icon-eth.svg'}
          alt={'eth'}
          width={24}
          height={24}
        />
        <Typography ml={'16px'}>{balance['ETH']}</Typography>
      </Box>
      <Box
        display={'flex'}
        alignItems='center'
        p={'16px 24px'}
      >
        <Typography width={24} height={24}>VL</Typography>
        <Typography ml={'16px'}>{balance['VL']}</Typography>
      </Box>
    </Menu>
  );

  const showConnectedWalletButton = !isLoadingWallet && walletIsConnected;
  const connectedWalletButtonToDisplay = connectedWalletButton || defaultConnectedWalletButton;
  const buttonToDisplay = showConnectedWalletButton
    ? connectedWalletButtonToDisplay : connectWalletButton;

  return (
    <>
      {buttonToDisplay}
      {walletMenu}
    </>
  );
};
