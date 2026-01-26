import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Typography,
  Box
} from '@mui/material';
import {
  CreditCard,
  PhoneAndroid,
  AccountBalance,
  QrCode,
  ArrowForward as ArrowRightIcon
} from '@mui/icons-material';
import BaseModal from "./index.jsx";

const PaymentMethodModal = ({ open, onClose, footer }) => {
  const paymentMethods = [
    { icon: <CreditCard color="primary" />, text: 'Pay from Card' },
    { icon: <PhoneAndroid color="primary" />, text: 'Pay from Mobile Money' },
    { icon: <AccountBalance color="primary" />, text: 'Pay from Bank Account' },
    {
      icon: (
        <Box className="rounded border border-blue-500 p-1">
          <QrCode color="primary" />
        </Box>
      ),
      text: 'Pay from Verve Paycode',
    },
    { icon: <AccountBalance color="primary" />, text: 'Pay from Pesalink', secondaryText: 'Pesalink' },
  ];

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      userEmail="japheth.ongeri@interswitchgroup.com"
      amount="KES 1.00"
      headerBg="bg-white"
      headerTextColor="text-gray-800"
      footer={footer}
    >
      <Typography variant="h6" className="mb-4 font-averta">
        Select a payment method
      </Typography>

      <List className="space-y-1 m-0 font-averta">
        {paymentMethods.map((method, index) => (
          <React.Fragment key={index}>
            <ListItem
              button
              onClick={() => console.log(method.text)}
              className="py-1 px-2 hover:bg-gray-100 rounded-md"
            >
              <ListItemIcon className="min-w-0 mr-1 flex-shrink-0"> {/* Reduced margin */}
                {method.icon}
              </ListItemIcon>

              <ListItemText
                primary={method.text}
                secondary={method.secondaryText}
                primaryTypographyProps={{
                  className: 'font-averta text-sm leading-tight m-0' // Reduce line height for tighter text spacing
                }}
                secondaryTypographyProps={{
                  className: 'font-averta text-xs text-gray-500 m-0'
                }}
                className="ml-0"
              />

              <IconButton edge="end" size="small">
                <ArrowRightIcon fontSize="small" />
              </IconButton>
            </ListItem>

            <Divider className="my-1" />
          </React.Fragment>
        ))}
      </List>

    </BaseModal>
  );
};

export default PaymentMethodModal;
