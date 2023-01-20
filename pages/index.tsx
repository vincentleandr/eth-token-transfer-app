import { useState, useMemo, BaseSyntheticEvent } from 'react';
import Link from 'next/link';
import { ethers } from 'ethers';
import { ComponentBaseProps } from './interface';
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import CallMadeRoundedIcon from '@mui/icons-material/CallMadeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import { CustomButton, ButtonWallet } from '../components';

// const usdc = {
//   address: "0x68ec573C119826db2eaEA1Efbfc2970cDaC869c4",
//   abi: [
//     "function gimmeSome() external",
//     "function balanceOf(address _owner) public view returns (uint256 balance)",
//     "function transfer(address _to, uint256 _value) public returns (bool success)",
//   ],
// };

export default function Home(props: ComponentBaseProps) {
  const {
    provider,
    signer,
    checkWalletConnection,
    walletIsConnected,
    isLoadingWallet,
    walletData
  } = props;

  const { address: selfAddress, balance, network } = walletData;

  const [address, setAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const [addressIsValid, setAddressIsValid] = useState<boolean>(false);
  const isSelfAddress = address === selfAddress;
  const addressAllowed = !isSelfAddress && addressIsValid && address !== '';

  const formattedBalance = balance && parseFloat(balance);
  const formattedAmount = parseFloat(amount);
  const amountAllowed = formattedAmount > 0 && formattedAmount <= formattedBalance;

  const [isSendingEth, setIsSendingEth] = useState<boolean>(false);
  const [txReceipt, setTxReceipt] = useState<any>({
    from: '',
    to: '',
    blockNumber: '',
    cumulativeGasUsed: '',
    transactionHash: '',
    value: ''
  });
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

  const sendEth = async () => {
    setIsSendingEth(true);

    const formattedAmount = ethers.utils.parseEther(amount);

    if (signer) {
      // await provider.send("eth_requestAccounts", []);

      try {
        const tx = await signer.sendTransaction({
          to: address,
          value: formattedAmount
        });
  
        const receipt = await tx.wait();
        setTxReceipt({
          from: receipt.from,
          to: receipt.to,
          blockNumber: receipt.blockNumber,
          cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
          transactionHash: receipt.transactionHash,
          value: tx.value.toString()
        });
        setOpenSnackbar(true);
      } catch (error) {
        console.log(error);
      }

      setIsSendingEth(false);
    }
  };

  const generateSnackbarContent = () => {
    const explorerBaseUrl = network === 'homestead'
      ? 'https://etherscan.io/tx/'
      : 'https://goerli.etherscan.io/tx/';
    
    const txUrl = explorerBaseUrl + txReceipt.transactionHash;

    return (
      <Box
        display={'flex'}
        alignItems='center'
      >
        <Typography mr={'16px'}>Transaction confirmed!</Typography>
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

  // const mintUsdc = async () => {
  //   await provider.send("eth_requestAccounts", []);
  //   const usdcContract = new ethers.Contract(usdc.address, usdc.abi, signer);
    
  //   const tx = await usdcContract.gimmeSome({ gasPrice: 20e9 });
  //   console.log(`Transaction hash: ${tx.hash}`);

  //   const receipt = await tx.wait();
  //   console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
  //   console.log(`Gas used: ${receipt.gasUsed.toString()}`);
  // };

  useMemo(() => {
    const addressIsValid = ethers.utils.isAddress(address);
    setAddressIsValid(addressIsValid);
  }, [address]);

  const onChangeAmount = (value: string) => {
    const floatRegex = /^\d*\.?\d*$/;

    if (floatRegex.test(value)) {
        setAmount(value);
    }
  };

  const addressSection = (
    <Box mb={'24px'}>
      <Typography mb={'8px'}>Address</Typography>
      <TextField
        variant="standard"
        placeholder='0xabc12345'
        InputProps={{
          disableUnderline: true,
          className: 'input-base'
        }}
        value={address}
        onChange={(event: BaseSyntheticEvent) => setAddress(event.target.value)}
      />
    </Box>
  );

  const amountInputAdornment = (
    <Box
      display={'flex'}
      justifyContent='center'
      alignItems={'center'}
      className='input-adornment'
    >
      <Typography>ETH</Typography>
    </Box>
  );
  const amountSection = (
    <Box mb={'40px'}>
      <Typography mb={'8px'}>Amount</Typography>
      <TextField
        variant="standard"
        placeholder='1.5'
        InputProps={{
          disableUnderline: true,
          className: 'input-base',
          endAdornment: amountInputAdornment
        }}
        value={amount}
        onChange={(event: BaseSyntheticEvent) => onChangeAmount(event.target.value)}
      />
    </Box>
  );

  const sendButton = (
    <CustomButton
      buttonContent={isSendingEth ? 'Sending...' : 'Send'}
      onClick={sendEth}
      variant='primary'
      disabled={!amountAllowed || !addressAllowed || isSendingEth}
      startIcon={isSendingEth ? <CircularProgress size={'24px'} /> : undefined}
    />
  );

  const formButton = (
    <ButtonWallet
      provider={provider}
      signer={signer}
      checkWalletConnection={checkWalletConnection}
      walletIsConnected={walletIsConnected}
      isLoadingWallet={isLoadingWallet}
      connectedWalletButton={sendButton}
      walletData={walletData}
    />
  );

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
        {addressSection}
        {amountSection}
        {formButton}
        {responseSnackbar}
      </Box>
    </Box>
  );
}
