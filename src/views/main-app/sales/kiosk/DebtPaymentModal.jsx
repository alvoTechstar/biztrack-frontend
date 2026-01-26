import React from "react";
import Modal from "../../../../components/modal/Modal";
import TextInput from "../../../../components/Input/TextInput";
import AppFormButton from "../../../../components/buttons/AppFormButton";
import { useTheme } from "../../../../components/theme/ThemeContext";

const DebtPaymentModal = ({
  isOpen,
  onClose,
  totalAmount,
  debtCustomerName,
  onDebtCustomerNameChange,
  debtPhone,
  onDebtPhoneChange,
  debtNotes,
  onDebtNotesChange,
  onConfirmPayment,
  formatCurrency,
}) => {
  const theme = useTheme();
  const PrimaryColor = theme.primaryColor;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buy on Debt">
      <div className="space-y-4 p-2">
        {/* Compact Total Amount Display */}
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Total:</p>
          <p className="text-lg font-bold text-gray-800">
            {formatCurrency(totalAmount)}
          </p>
        </div>

        {/* Customer Name (Required) */}
        <TextInput
          id="debtCustomerName"
          name="debtCustomerName"
          label="Customer Name *"
          type="text"
          input={debtCustomerName}
          handleInput={(e) => onDebtCustomerNameChange(e.target.value)}
          placeholder="Enter customer name"
          required
          className="py-1"
        />

        {/* Phone Number (Optional) */}
        <TextInput
          id="debtPhone"
          name="debtPhone"
          label="Phone Number (Optional)"
          type="tel"
          input={debtPhone}
          handleInput={(e) => onDebtPhoneChange(e.target.value)}
          placeholder="0712345678"
          className="py-1"
        />

        {/* Notes (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            value={debtNotes}
            onChange={(e) => onDebtNotesChange(e.target.value)}
            placeholder="Additional notes..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <AppFormButton
            text="Cancel"
            color="invert"
            action={onClose}
            validation={true}
            className="flex-1 py-2"
          />
          <AppFormButton
            text="Record Debt"
            color={PrimaryColor}
            action={onConfirmPayment}
            validation={debtCustomerName.trim() !== ""}
            className="flex-1 py-2"
          />
        </div>
      </div>
    </Modal>
  );
};

export default DebtPaymentModal;