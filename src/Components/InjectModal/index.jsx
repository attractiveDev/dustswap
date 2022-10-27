import React, { useState } from 'react';
import { Modal, Button, useMediaQuery } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { toast } from "react-toastify";
import Loading from "react-fullscreen-loading";
import Success from './success';
import './InjectModal.scss';
import TreasuryAbi from '../../contract/TreasuryManager.json'
import erc20Abi from '../../contract/erc20.json';
import config from '../../Config/config.json';

const CustomButton = styled(Button)({
  color: 'black',
  padding: '15px 10px',
  backgroundColor: 'rgba(67, 171, 224, 1)',
  fontWeight: '600',
  fontSize: '20px',
  lineHeight: '24px',
  borderRadius: '11px',
  '&:hover': {
    backgroundColor: 'white',
  },
})

export default function ImportToken(props) {
  const { modalVisible, setModalVisible, tokenName, tokenAddress, tokenBalance } = props;
  const { library, chainId, account } = useWeb3React();
  const [successVisible, setSuccessVisible] = useState(false);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const table = useMediaQuery('(max-width: 800px)');
  const handleInject = async () => {
    try {
      if(!!account && chainId){
        setLoading(false);
        let injectContract = new ethers.Contract(config.injectContract, TreasuryAbi.abi, library?.getSigner());
        let tokenContract = new ethers.Contract(tokenAddress, erc20Abi, library?.getSigner());
        const allowance = await tokenContract.allowance(account, config.injectContract);
        const decimals = await tokenContract.decimals();
        let tempAmount = ethers.utils.parseUnits(amount, decimals);
        if(allowance.isZero() && tokenBalance < amount){
          toast("Token is not enough", {position: "bottom-left", type: "error"});
          setLoading(true);
          return false;
        } 
        if(allowance.lt(tempAmount)) {
          let aTxHandle = await tokenContract.approve(config.injectContract, '10000000000000000000000000');
          await aTxHandle.wait();
        }
        let txHandle =  await injectContract.depositToken(tokenAddress, tempAmount);
        await txHandle.wait();
        setSuccessVisible(true);
        setLoading(true);
      }
      else {
        toast("Wallet Connect", { position: "bottom-left", type: "error" });
      }
    }
    catch(err) {
      setSuccessVisible(false);
      setLoading(true);
      toast(err?.error?.data.message || err.message, { position: "bottom-left", type: "error" });
      console.log("error:::", err);
    }
  }
  const handleAmount = (event) => {
    setAmount(event.target.value);
  }
  return (
    <div>
      <Modal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className='inject_modal_container'>
          <div className='title'>Inject {tokenName} into Treasury</div>
          <div className='warning'>
            <div className='row'>
              <ErrorOutlineIcon sx={{ color: '#43ABE0', fontSize: '100px' }} />
              <div className='text'>Make sure this is the token that you want to inject into the treasury</div>
            </div>
          </div>
          <div className='floki'>{tokenName}</div>
          <div className='address'>{tokenAddress}</div>
          <div className='row_2'>
            <input type='number' className='amount_input' placeholder='Input amount to inject...' value={amount} onChange={handleAmount}  />
            <CustomButton onClick={() => {setAmount(Math.round(tokenBalance));}} sx={{ minWidth: table ? '200px' : '' }}>SET MAX</CustomButton>
            <CustomButton onClick={() => handleInject()} sx={{ minWidth: table ? '200px' : '' }} >INJECT</CustomButton>
          </div>
         
          <CloseIcon onClick={() => setModalVisible(false)} sx={{
            position: 'absolute !important',
            bottom: '16px',
            right: "15px",
            backgroundColor: '#43ABE0',
            float: 'right',
            fontSize: '25px',
            padding: '7px',
            borderRadius: '11px'
          }} />
          {
          !loading && 
            <Loading loading={true} background="transparent" loaderColor="#3498db" />
          }
          <Success  setModalVisible={ setModalVisible} tokenName={tokenName} successVisible={successVisible} setSuccessVisible={setSuccessVisible} treasuryAmount={amount} />
        </div>
      </Modal>
    </div>
  );
}
