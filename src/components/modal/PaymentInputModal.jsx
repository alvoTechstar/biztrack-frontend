import React, { useEffect, useState } from 'react';
import {
  Typography,
  InputAdornment,
  Link
} from '@mui/material';
import BaseModal from "./index.jsx";
import VerveCard from "../../assets/card/safetoken.png";
import Mastercard from '../../assets/card/mcidcheck.png';
import Visa from '../../assets/card/Visa-Secure-Logo.png';
import pciDssCard from '../../assets/card/pcidss.png';
import CardNumberInput from '../input/CardNumberInput.jsx';
import FormButton from '../buttons/FormButton.jsx';
import { cardNumberValidation, cvvValidation, expiryValidation } from '../../utilities/Sharedfunctions.jsx';
import TextInput from '../input/TextInput.jsx';

const PaymentInputModal = ({ open, onClose, footer, amount }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardNumberError, setCardNumberError] = useState('');

  const [expiry, setExpiry] = useState('');
  const [expiryError, setExpiryError] = useState('');

  const [cvv, setCvv] = useState('');
  const [cvvError, setCvvError] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const validateOnBlur = async (value, setError, schema) => {
    try {
      await schema.validate(value);
      setError('');
    } catch (error) {
      setError(error.message);
    }
  };

  const handlePayment = async () => {
    try {
      await cardNumberValidation.validate(cardNumber.replace(/\s/g, ''));
      await expiryValidation.validate(expiry);
      await cvvValidation.validate(cvv);

      setCardNumberError('');
      setExpiryError('');
      setCvvError('');

      setIsProcessing(true);
      console.log('Processing payment...');
      setTimeout(() => setIsProcessing(false), 1000);
    } catch (error) {
      if (error?.message?.includes('card')) setCardNumberError(error.message);
      else if (error?.message?.includes('expiry')) setExpiryError(error.message);
      else if (error?.message?.includes('CVV')) setCvvError(error.message);
    }
  };

  useEffect(() => {
    const validateForm = async () => {
      try {
        await cardNumberValidation.validate(cardNumber.replace(/\s/g, ''));
        await expiryValidation.validate(expiry);
        await cvvValidation.validate(cvv);
        setIsFormValid(true);
      } catch {
        setIsFormValid(false);
      }
    };

    validateForm();
  }, [cardNumber, expiry, cvv]);

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      userEmail="japheth.ongeri@interswitchgroup.com"
      amount={amount}
      footer={footer}
    >
      {/* Card Number */}
      <CardNumberInput
        label="Card Number"
        placeholder="0000 0000 0000 0000"
        value={cardNumber}
        onChange={(v) => {
          setCardNumber(v);
          if (cardNumberError) {
            validateOnBlur(v.replace(/\s/g, ''), setCardNumberError, cardNumberValidation);
          }
        }}
        onBlur={() => validateOnBlur(cardNumber.replace(/\s/g, ''), setCardNumberError, cardNumberValidation)}
        error={!!cardNumberError}
        errorMessage={cardNumberError}
      />

      {/* Expiry & CVV */}
      <div className="flex gap-4 mb-4">
        <TextInput
          fullWidth
          variant="outlined"
          placeholder="MM/YY"
          label="Card Expiry"
          value={expiry}
          onChange={e => setExpiry(e.target.value)}
          onBlur={() => validateOnBlur(expiry, setExpiryError, expiryValidation)}
          error={!!expiryError}
          helperText={expiryError}
        />
        <TextInput
          fullWidth
          variant="outlined"
          placeholder="123"
          label="CVV"
          value={cvv}
          onChange={e => setCvv(e.target.value)}
          onBlur={() => validateOnBlur(cvv, setCvvError, cvvValidation)}
          error={!!cvvError}
          helperText={cvvError}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Lock fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </div>

      {/* Privacy Policy */}
      <Typography variant="body2" className="text-primary mb-6 font-averta">
        By proceeding with payment you agree to the{' '}
        <Link href="#" underline="always" className="text-primary">
          privacy policy
        </Link>{' '}
        in use by the payment processor.
      </Typography>

      {/* Pay Button */}
      <div className="flex flex-col gap-4 mb-4 mt-2">
        <FormButton
          text={`PAY KES 1.00`}
          isLoading={isProcessing}
          validation={isFormValid}
          action={handlePayment}
          className="text-primary"
        />
      </div>

      {/* Card Logos */}
      <div className="flex justify-center gap-6 mt-4 mb-2 grayscale hover:grayscale-0 transition duration-300 ease-in-out">
        <img src={VerveCard} alt="Verve Card" className="h-8 w-auto" />
        <img src={Mastercard} alt="Mastercard" className="h-8 w-auto" />
        <img src={Visa} alt="Visa" className="h-8 w-auto" />
        <img src={pciDssCard} alt="PCI DSS" className="h-8 w-auto" />
      </div>
    </BaseModal>
  );
};

export default PaymentInputModal;
