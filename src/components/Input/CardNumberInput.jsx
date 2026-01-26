import React from 'react';
import VisaIcon from '../../assets/card/visa.svg';
import MastercardIcon from '../../assets/card/mastercard.svg';
import VerveIcon from '../../assets/card/verve.svg';
import UnionPayIcon from '../../assets/card/unionpay.svg';
import DefaultCardIcon from '../../assets/card/card.svg'; // Add a generic placeholder icon
import { ErrorOutline } from '@mui/icons-material';

const getCardType = (digits) => {
  const clean = digits.replace(/\s/g, '');
  if (clean.startsWith('4')) return 'visa';
  const prefix2 = clean.slice(0, 2);
  if (prefix2 === '50') return 'verve';
  if (prefix2 === '62') return 'unionpay';
  const num = parseInt(prefix2, 10);
  if (num >= 51 && num <= 55) return 'mastercard';
  return null;
};

const CardNumberInput = ({
  label = 'Card Number',
  placeholder = '0000 0000 0000 0000',
  value,
  onChange,
  onBlur,
  error = false,
  errorMessage = '',
  required = false,
}) => {
  const cardType = getCardType(value);

  let icon = <img src={DefaultCardIcon} alt="Card" className="h-6 w-auto" />;

  if (error) {
    icon = <ErrorOutline className="text-red-500" />;
  } else {
    switch (cardType) {
      case 'visa':
        icon = <img src={VisaIcon} alt="Visa" className="h-6 w-auto" />;
        break;
      case 'mastercard':
        icon = <img src={MastercardIcon} alt="Mastercard" className="h-6 w-auto" />;
        break;
      case 'verve':
        icon = <img src={VerveIcon} alt="Verve" className="h-6 w-auto" />;
        break;
      case 'unionpay':
        icon = <img src={UnionPayIcon} alt="UnionPay" className="h-6 w-auto" />;
        break;
      default:
        break;
    }
  }

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    const grouped = raw.match(/.{1,4}/g)?.join(' ') || raw;
    onChange && onChange(grouped);
  };

  return (
    <div className="mb-4 w-full">
      <div className="mb-1 flex items-center">
        <span className="text-[12px] leading-4 font-bold text-[#353f50]">
          {label}
        </span>
        {required && (
          <span className="ml-1 text-red-500 font-bold text-[12px] leading-4">
            *
          </span>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          value={value || ''}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full pr-10 px-4 py-2 border ${
            error ? 'border-red-500' : 'border-gray-300'
          } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          {icon}
        </div>
      </div>

      {error && errorMessage && (
        <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

export default CardNumberInput;
