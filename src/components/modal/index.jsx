// components/modal/BaseModal.jsx
import React from 'react';
import {
  Dialog,
  Divider
} from '@mui/material';
import sidianLogo from '../../assets/Logos/sidian.png';
import ModalFooter from './ModalFooter';

const BaseModal = ({
  open,
  onClose,
  amount= "KES 1.00",
  footer,              
  userEmail = '',
  headerBg = 'bg-white',
  headerTextColor = 'text-gray-800',
  children,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 400,
          borderRadius: 2,
          overflow: 'hidden',
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        },
      }}
    >
      {/* Header */}
      <div className={`${headerBg} ${headerTextColor} py-4 px-4 font-averta`}>
        <div className="flex justify-between items-start">
          <div>
              <img src={sidianLogo} alt="Sidian Logo" className="w-50 h-20" />
            <span className="text-sm font-averta text-gray-700">
              {userEmail}
            </span>
          </div>

          {/* Amount: pushed down & inward */}
          <span className="text-xl text-gray-700 font-bold mt-3 ml-3">
            {amount}
          </span>
        </div>
      </div>

      <Divider className='shadow-amber-100' />

      {/* Body */}
      <div className="p-4 flex-1 overflow-auto font-averta">
        {children}
      </div>

      {/* Footer */}
      <ModalFooter>
        {footer}
      </ModalFooter>
    </Dialog>
  );
};

export default BaseModal;
