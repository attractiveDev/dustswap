import React from 'react';
import Modal from '@mui/material/Modal';
import CloseIcon from '@mui/icons-material/Close';
import './success.scss';

export default function Success(props) {
  const { successVisible, setSuccessVisible, treasuryAmount, tokenName, setModalVisible } = props;
  return (
    <div>
      <Modal
        open={successVisible}
        onClose={() => setSuccessVisible(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className='modal_container'>
          <div className='title'>SUCCESS!</div>
          <div className='success_text'>{treasuryAmount} {tokenName} has been added to the treasury.</div>
          <CloseIcon onClick={() => {setSuccessVisible(false); setModalVisible(false);}} sx={{
            position: 'absolute !important',
            bottom: '16px',
            right: "15px",
            backgroundColor: '#43ABE0',
            float: 'right',
            fontSize: '25px',
            padding: '7px',
            borderRadius: '11px'
          }} />
        </div>
      </Modal>
    </div>
  );
}
