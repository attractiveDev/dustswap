import React from 'react';
import { Button, Modal, useMediaQuery } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import { useDispatch } from 'react-redux';
import { importToken } from '../../redux/action/tokenListAction';
import './importToken.scss';

const ImportTokenButton = styled(Button)({
  color: 'black',
  padding: '15px 10px',
  backgroundColor: 'rgba(67, 171, 224, 1)',
  fontWeight: '600',
  fontSize: '20px',
  lineHeight: '24px',
  borderRadius: '11px',
  '&:hover': {
    backgroundColor: 'white',
  }
})
export default function ImportToken(props) {
  const dispatch = useDispatch();
  const { modalVisible, setModalVisible, tokenAddress, validata, tokenName } = props;
  const table = useMediaQuery('(max-width: 900px)');
  const handleImportToken = () => {
    const tempTokenList = [
      {
        name: tokenName,
        address: tokenAddress,
      }
    ]
    dispatch(importToken(tempTokenList));
    setModalVisible(false);
  }
  return (
    <div>
      <Modal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className='modal_container'>
          <div className='title'>Import Token</div>
          <div className='import_warning'>
            <div className='row'>
              <ErrorOutlineIcon sx={{ color: '#43ABE0', fontSize: '100px' }} />
              <div className='text'>Make sure this is the token that you want to import</div>
            </div>
          </div>
          {
            validata ? <div style={{ color: 'white', fontSize: '30px', textAlign: 'center' }}>Token Not Found!</div> :
              <>
                <div className='floki'>{tokenName}</div>
                <div className='address'>{tokenAddress}</div>
                <ImportTokenButton onClick={() => handleImportToken()} sx={{ fontSize: table ? '15px' : '20px', marginBottom: table ? '40px' : '' }}>IMPORT TOKEN</ImportTokenButton>
              </>
          }

          <CloseIcon onClick={() => setModalVisible(false)} sx={{
            position: 'absolute !important',
            bottom: '16px',
            right: "15px",
            backgroundColor: '#43ABE0',
            float: 'right',
            fontSize: !table ? '20px' : '15px',
            padding: '10px',
            borderRadius: '11px'
          }} />
        </div>
      </Modal>
    </div>
  );
}
