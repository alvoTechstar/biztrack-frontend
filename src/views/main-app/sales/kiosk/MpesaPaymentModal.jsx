import React from "react";
import { Loader } from "lucide-react";
import Modal from "../../../../components/modal/Modal";
import TextInput from "../../../../components/Input/TextInput";
import AppFormButton from "../../../../components/buttons/AppFormButton";
import { useTheme } from "../../../../components/theme/ThemeContext";

const MpesaPaymentModal = ({
  isOpen,
  onClose,
  totalAmount,
  mpesaPhone,
  onMpesaPhoneChange,
  onConfirmPayment,
  mpesaLoading,
  formatCurrency,
}) => {
  const theme = useTheme();
  const PrimaryColor = theme.primaryColor;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="M-PESA Payment">
      <div className="space-y-4 p-2">
        {/* Compact Total Amount Display */}
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Total:</p>
          <p className="text-lg font-bold text-gray-800">
            {formatCurrency(totalAmount)}
          </p>
        </div>

        {/* Phone Input */}
        <TextInput
          id="mpesaPhone"
          name="mpesaPhone"
          label="Customer Phone Number"
          type="tel"
          input={mpesaPhone}
          handleInput={(e) => onMpesaPhoneChange(e.target.value)}
          placeholder="0719515125"
          required
          className="py-1"
        />

        {/* Loading Indicator */}
        {mpesaLoading && (
          <div className="flex items-center gap-2 text-blue-600 text-sm">
            <Loader className="h-4 w-4 animate-spin" />
            <span>Sending STK Push...</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <AppFormButton
            text="Cancel"
            color="invert"
            action={onClose}
            validation={true}
            disabled={mpesaLoading}
            className="flex-1 py-2"
          />
          <AppFormButton
            text="Send STK Push"
            color={PrimaryColor}
            action={onConfirmPayment}
            validation={!mpesaLoading}
            disabled={mpesaLoading}
            className="flex-1 py-2"
          />
        </div>
      </div>
    </Modal>
  );
};

export default MpesaPaymentModal;