import React from "react";
import Modal from "../../../../components/modal/Modal";
import TextInput from "../../../../components/Input/TextInput";
import AppFormButton from "../../../../components/buttons/AppFormButton";
import { useTheme } from "../../../../components/theme/ThemeContext";
import { CheckCircle, AlertTriangle } from "lucide-react";

const CashPaymentModal = ({
  isOpen,
  onClose,
  totalAmount,
  amountPaid,
  onAmountPaidChange,
  onConfirmPayment,
  formatCurrency,
}) => {
  const theme = useTheme();
  const PrimaryColor = theme.primaryColor;
  const parsedAmountPaid = parseFloat(amountPaid) || 0;
  const difference = parsedAmountPaid - totalAmount;
  const isPaymentValid = parsedAmountPaid >= totalAmount && totalAmount > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cash Payment">
      <div className="space-y-4 p-2">
        {/* Compact Total Amount Display */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">Total Amount:</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(totalAmount)}
          </p>
        </div>

        {/* Amount Paid Input */}
        <TextInput
          id="amountPaid"
          label="Amount Paid"
          type="number"
          min="0"
          placeholder="Enter amount paid"
          input={amountPaid}  
          handleInput={(e) => onAmountPaidChange(e.target.value)}  
          required
        />

        {/* Compact Single-line Payment Status */}
        {amountPaid && (
          <div
            className={`flex items-center gap-2 text-sm ${difference >= 0 ? "text-green-600" : "text-amber-600"
              }`}
          >
            {difference >= 0 ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <span className="font-medium">
              {difference >= 0 ? "Change:" : "Balance Due:"}
            </span>
            <span className="font-semibold">
              {formatCurrency(Math.abs(difference))}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <AppFormButton
            text="Cancel"
            color="invert"
            action={onClose}
            validation={true}
            className="flex-1 py-2" // More compact button
          />

          <AppFormButton
            text="Complete Payment"
            color={PrimaryColor}
            action={onConfirmPayment}
            validation={isPaymentValid}
            className="flex-1 py-2" // More compact button
          />
        </div>
      </div>
    </Modal>
  );
};

export default CashPaymentModal;
