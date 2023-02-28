import { useState, useMemo, BaseSyntheticEvent } from 'react';
import { ethers } from 'ethers';
import { ComponentBaseProps, ResponseType } from '../interface';
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import CallMadeRoundedIcon from '@mui/icons-material/CallMadeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import { CustomButton, ButtonWallet } from '../components';
import { networkExplorerUrl } from '../variables/network';
import { VLToken } from '../variables/contracts';

export default function Home(props: ComponentBaseProps) {
  const {
    provider,
    signer,
    checkWalletConnection,
    walletIsConnected,
    isLoadingWallet,
    walletData,
    balance,
    addressIsWhitelisted
  } = props;

  const { address: selfAddress, network } = walletData;

  const [activeTab, setActiveTab] = useState<number>(0);

  // Send form states
  const [address, setAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [selectedToken, setSelectedToken] = useState<string>('ETH');

  // Check address validity
  const [addressIsValid, setAddressIsValid] = useState<boolean>(false);
  const isSelfAddress = address === selfAddress;
  const addressAllowed = !isSelfAddress && addressIsValid && address !== '';

  // Check amount validity
  const formattedBalance = parseFloat(balance[selectedToken]);
  const formattedAmount = parseFloat(amount);
  const amountAllowed = formattedAmount > 0 && formattedAmount <= formattedBalance;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [txReceipt, setTxReceipt] = useState<any>({
    from: '',
    to: '',
    blockNumber: '',
    cumulativeGasUsed: '',
    transactionHash: '',
    value: ''
  });
  const [responseType, setResponseType] = useState<ResponseType>('send');
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

  const sendToken = async () => {
    setIsLoading(true);

    if (signer) {
      try {
        const tx = selectedToken === 'ETH' ? await sendEth() : await sendERC20Token();
  
        const receipt = await tx.wait();
        setTxReceipt({
          from: receipt.from,
          to: receipt.to,
          blockNumber: receipt.blockNumber,
          cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
          transactionHash: receipt.transactionHash,
          value: tx.value.toString()
        });
        setResponseType('send');
        setOpenSnackbar(true);
      } catch (error) {
        console.log(error);
      }

      setAddress('');
      setAmount('');
      setIsLoading(false);
    }
  };

  const sendEth = async () => {
    const formattedAmount = ethers.utils.parseEther(amount);
    const tx = signer && await signer.sendTransaction({
      to: address,
      value: formattedAmount
    });

    return tx;
  };

  const sendERC20Token = async () => {
    const tokenContract = new ethers.Contract(VLToken.address, VLToken.abi, signer);
    const tokenAmount = ethers.utils.parseUnits(amount);
    const tx = await tokenContract.transfer(address, tokenAmount);
    return tx;
  };

  const mintToken = async () => {
    setIsLoading(true);

    if (signer) {
      try {
        const tokenContract = new ethers.Contract(VLToken.address, VLToken.abi, signer);

        const tx = await tokenContract.mint();
        const receipt = await tx.wait();
        setTxReceipt({
          from: receipt.from,
          to: receipt.to,
          blockNumber: receipt.blockNumber,
          cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
          transactionHash: receipt.transactionHash,
          value: tx.value.toString()
        });
        setResponseType('mint');
        setOpenSnackbar(true);
      } catch (error) {
        console.log(error);
      }

      setIsLoading(false);
    }
  };

  const whitelistAddress = async () => {
    setIsLoading(true);

    if (signer) {
      try {
        const tokenContract = new ethers.Contract(VLToken.address, VLToken.abi, signer);

        const tx = await tokenContract.addToWhitelist(selfAddress);
        const receipt = await tx.wait();
        setTxReceipt({
          from: receipt.from,
          to: receipt.to,
          blockNumber: receipt.blockNumber,
          cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
          transactionHash: receipt.transactionHash,
          value: tx.value.toString()
        });
        setResponseType('whitelist');
        setOpenSnackbar(true);
        checkWalletConnection();
      } catch (error) {
        console.log(error);
      }

      setIsLoading(false);
    }
  };

  const generateSnackbarContent = () => {
    const explorerBaseUrl = networkExplorerUrl[network] || networkExplorerUrl.homestead;
    
    const txUrl = `${explorerBaseUrl}/tx/${txReceipt.transactionHash}`;

    let snackbarText;
    if (responseType === 'mint') {
      snackbarText = `Successfully minted VL token!`;
    } else if (responseType === 'whitelist') {
      snackbarText = 'Address is whitelisted!';
    } else {
      snackbarText = 'Transaction confirmed!';
    }

    return (
      <Box
        display={'flex'}
        alignItems='center'
      >
        <Typography mr={'16px'}>{snackbarText}</Typography>
        <CustomButton
          buttonContent={<CallMadeRoundedIcon />}
          variant='icon'
          href={txUrl}
        />
      </Box>
    );
  };
  
  const responseSnackbar = (
    <Snackbar
      open={openSnackbar}
      onClose={() => setOpenSnackbar(false)}
      autoHideDuration={10000}
    >
      <Alert
        onClose={() => setOpenSnackbar(false)}
        className='snackbar-base snackbar-success'
        icon={<CheckCircleRoundedIcon />}
      >
        {generateSnackbarContent()}
      </Alert>
    </Snackbar>
  );

  // Check address validity onChange
  useMemo(() => {
    const addressIsValid = ethers.utils.isAddress(address);
    setAddressIsValid(addressIsValid);
  }, [address]);

  // Check amount validity onChange
  const onChangeAmount = (value: string) => {
    const floatRegex = /^\d*\.?\d*$/;

    if (floatRegex.test(value)) {
        setAmount(value);
    }
  };

  const tabs = (
    <Box>
      <Tabs
          value={activeTab}
          onChange={(event, newValue) => setActiveTab(newValue)}
          variant='fullWidth'
          className='tabs-base'
          TabIndicatorProps={{style: { background: 'transparent' }}}
      >
          <Tab label='Send' disableRipple />
          <Tab label='Mint' disableRipple />
      </Tabs>
      <Divider sx={{ mt: '-1px' }} />
    </Box>
);

  // Send Form
  // ========================
  const addressInput = (
    <Box mb={'24px'}>
      <Typography mb={'8px'}>Address</Typography>
      <TextField
        variant="standard"
        placeholder='0xabc12345'
        InputProps={{
          disableUnderline: true,
          className: 'input-base'
        }}
        fullWidth
        value={address}
        onChange={(event: BaseSyntheticEvent) => setAddress(event.target.value)}
      />
    </Box>
  );

  const tokenSelector = (
    <Select
      value={selectedToken}
      variant='outlined'
      onChange={(event) => setSelectedToken(event.target.value)}
      className='select-base input-adornment'
    >
      <MenuItem value={'ETH'}>ETH</MenuItem>
      <MenuItem value={'VL'}>VL</MenuItem>
    </Select>
  );
  const amountInput = (
    <Box mb={'40px'}>
      <Typography mb={'8px'}>Amount</Typography>
      <Box display='flex'>
        <TextField
          variant="standard"
          placeholder='1.5'
          InputProps={{
            disableUnderline: true,
            className: 'input-base with-selector'
          }}
          fullWidth
          value={amount}
          onChange={(event: BaseSyntheticEvent) => onChangeAmount(event.target.value)}
        />
        {tokenSelector}
      </Box>
    </Box>
  );

  const sendButton = (
    <CustomButton
      buttonContent={'Send'}
      onClick={sendToken}
      variant='primary'
      disabled={!amountAllowed || !addressAllowed || isLoading}
      startIcon={isLoading ? <CircularProgress size={'24px'} /> : undefined}
      fullWidth
    />
  );
  // ========================

  // Mint Form
  // ========================
  const whitelistButton = (
    <CustomButton
      buttonContent={'Whitelist my address'}
      onClick={whitelistAddress}
      variant='primary'
      disabled={isLoading || network !== 'sepolia'}
      startIcon={isLoading ? <CircularProgress size={'24px'} /> : undefined}
      fullWidth
    />
  );

  const mintButton = (
    <CustomButton
      buttonContent={'Mint VL'}
      onClick={mintToken}
      variant='primary'
      disabled={isLoading || network !== 'sepolia'}
      startIcon={isLoading ? <CircularProgress size={'24px'} /> : undefined}
      fullWidth
    />
  );

  const mintFormButton = addressIsWhitelisted ? mintButton : whitelistButton;
  // ========================

  const formButton = (
    <ButtonWallet
      provider={provider}
      signer={signer}
      checkWalletConnection={checkWalletConnection}
      walletIsConnected={walletIsConnected}
      isLoadingWallet={isLoadingWallet}
      connectedWalletButton={activeTab === 0 ? sendButton : mintFormButton}
      walletData={walletData}
      balance={balance}
      addressIsWhitelisted
      fullWidth
    />
  );

  const sendTabContent = (
    <>
      {addressInput}
      {amountInput}
    </>
  );

  const mintTabContent = (
    <Typography mb={'40px'}>
      VL token is an ERC-20 token. Right now it is only available on Sepolia Testnet. In order to mint the token, please switch to Sepolia Testnet and whitelist your address.
    </Typography>
  );

  const content = activeTab === 0 ? sendTabContent : mintTabContent;

  return (
    <Box
      display={'flex'}
      justifyContent='center'
      alignItems={'center'}
      className='app-body-container'
    >
      <Box
        display={'flex'}
        flexDirection='column'
        className='card-base'
      >
        {tabs}
        <Box p={'40px'}>
          {content}
          {formButton}
        </Box>
        {responseSnackbar}
      </Box>
    </Box>
  );
}
