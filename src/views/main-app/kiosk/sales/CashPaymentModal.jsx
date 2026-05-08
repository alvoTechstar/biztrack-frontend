import React, { useState, useEffect } from "react";
import Modal from "../../../../components/modal/Modal";
import TextInput from "../../../../components/Input/TextInput";
import AppFormButton from "../../../../components/buttons/AppFormButton";
import { useTheme } from "../../../../components/theme/ThemeContext";
import SuccessModal from "../../../../components/modal/SuccessModal";
import FailureModal from "../../../../components/modal/FailureModal";
import { CheckCircle, AlertTriangle } from "lucide-react";

const CashPaymentModal = ({
  isOpen,
  onClose, // This onClose will be handleCashModalClose from SalesPage or DebtManagement
  totalAmount,
  amountPaid,
  onAmountPaidChange,
  onConfirmPayment, // This is the handleCashPayment from SalesPage or DebtManagement
  formatCurrency,
  shopkeeperName,
  submitting = false,
  isDebtPayment = false,
  onPaymentComplete,
  // Props for internal SuccessModal
  successModalCustomMessage,
  successModalConfirmButtonText,
  successModalCountdownMessage,
  // Props for internal FailureModal
  failureModalRetryButtonText,
  failureModalBackButtonText,
  failureModalCountdownMessage,
}) => {
  const theme = useTheme();
  const PrimaryColor = theme.primaryColor;
  const parsedAmountPaid = parseFloat(amountPaid) || 0;
  const difference = parsedAmountPaid - totalAmount;
  const isPaymentValid = parsedAmountPaid >= totalAmount && totalAmount > 0;

  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, completed, failed
  const [localErrorMessage, setLocalErrorMessage] = useState(''); // Internal error message for input validation
  const [receiptNumber, setReceiptNumber] = useState('');
  
  const [showSuccessModalInternal, setShowSuccessModalInternal] = useState(false);
  const [showFailureModalInternal, setShowFailureModalInternal] = useState(false);
  const [successData, setSuccessData] = useState({});
  const [failureData, setFailureData] = useState({});

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setPaymentStatus('idle');
    setLocalErrorMessage('');
    setReceiptNumber('');
    setShowSuccessModalInternal(false);
    setShowFailureModalInternal(false);
    setSuccessData({});
    setFailureData({});
  };

  const handleCashPayment = async () => {
    if (!isPaymentValid) {
      setLocalErrorMessage('Amount paid must be at least the total amount');
      return;
    }

    try {
      setPaymentStatus('processing');
      setLocalErrorMessage(''); // Clear previous error messages

      // Call the parent's onConfirmPayment (handleCashPayment from SalesPage or DebtManagement)
      const result = await onConfirmPayment(); // Parent's onConfirmPayment returns {success: boolean, ...}
      
      if (result && result.success) {
        const receipt = result.receiptNumber || result.transactionId || `CASH-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 1000)}`;

        if (isDebtPayment && onPaymentComplete) {
          try {
            await onPaymentComplete({
              transactionId: result.transactionId || `CASH-${Date.now()}`,
              status: 'completed',
              receipt,
              amount: totalAmount,
              amountPaid: parsedAmountPaid,
              change: difference > 0 ? difference : 0,
              paymentMethod: 'cash',
              timestamp: new Date().toISOString(),
              isDebtPayment: true,
            });
          } catch (completeError) {
            console.error('⚠️ CashPaymentModal: onPaymentComplete error:', completeError);
            throw completeError;
          }
        }

        // Show success modal for both regular and debt payments
        setReceiptNumber(receipt);
        setPaymentStatus('completed');
        
        setSuccessData({
          amount: result.totalAmount || totalAmount,
          currency: 'KSh',
          reference: receipt,
          transactionId: result.transactionId || `CASH-${Date.now()}`,
          change: result.change > 0 ? result.change : 0,
          customerName: result.customerName || 'Walk-in Customer'
        });
        setShowSuccessModalInternal(true);
      } else {
        throw new Error(result?.message || 'Payment failed');
      }
    } catch (error) {
      console.error('❌ Cash payment error:', error);
      setPaymentStatus('failed');
      setLocalErrorMessage(error.message || 'Payment failed'); // Set error message for internal display
      setFailureData({
        amount: totalAmount,
        currency: 'KSh',
        reference: `CASH-${Date.now()}`,
        errorMessage: error.message || 'Payment failed. Please try again.'
      });
      setShowFailureModalInternal(true);
    }
  };

  const handleInternalSuccessModalClose = () => {
    setShowSuccessModalInternal(false);
    // Notify parent that payment was completed
    onClose(true); // Pass true to indicate successful completion
  };

  const handleInternalFailureModalRetry = () => {
    setShowFailureModalInternal(false);
    setPaymentStatus('idle'); // Allow re-attempt
    setLocalErrorMessage(''); // Clear internal error message
    // Don't call onClose(false) here, as we want to return to the input modal
  };

  const handleInternalFailureModalClose = () => {
    setShowFailureModalInternal(false);
    // Notify parent that payment was not completed
    onClose(false); // Pass false to indicate no completion
  };

  // Render loading state
  const renderProcessingView = () => (
    <div className="space-y-6 p-4 text-center">
      <div className="animate-pulse">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Processing Cash Payment
        </h3>
        <p className="text-gray-600">
          Please wait while we complete your transaction...
        </p>
      </div>
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    </div>
  );

  // Conditional rendering for internal modals
  if (showSuccessModalInternal) {
    return (
      <SuccessModal
        isOpen={true}
        onClose={() => { /* Handled by onNavigateToSales/onComplete */ }}
        title="Payment Successful!"
        customMessage={successModalCustomMessage || `Cash payment completed successfully. Change: ${formatCurrency(successData.change || 0)}`}
        amount={successData.amount}
        currency={successData.currency}
        reference={successData.reference}
        onNavigateToSales={handleInternalSuccessModalClose}
        autoCloseDelay={5}
        confirmButtonText={successModalConfirmButtonText}
        countdownMessage={successModalCountdownMessage}
      />
    );
  }

  if (showFailureModalInternal) {
    return (
      <FailureModal
        isOpen={true}
        onClose={handleInternalFailureModalClose} // This is for the manual close button
        title="Payment Failed"
        errorMessage={failureData.errorMessage || "Payment failed. Please try again."}
        amount={failureData.amount}
        currency={failureData.currency}
        reference={failureData.reference}
        onRetry={handleInternalFailureModalRetry} // This is for auto-retry
        autoCloseDelay={5}
        retryButtonText={failureModalRetryButtonText}
        backButtonText={failureModalBackButtonText}
        countdownMessage={failureModalCountdownMessage}
      />
    );
  }

  if (paymentStatus === 'processing' || submitting) {
    return (
      <Modal isOpen={isOpen} onClose={() => onClose(false)} title="Processing Cash Payment">
        {renderProcessingView()}
      </Modal>
    );
  }
  
  return (
    <Modal isOpen={isOpen} onClose={() => onClose(false)} title="Cash Payment">
      <div className="space-y-4 p-2">
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">Total Amount:</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(totalAmount)}
          </p>
        </div>

        {shopkeeperName && (
          <div className="text-sm text-gray-500 text-center">
            Processing as: <span className="font-medium">{shopkeeperName}</span>
          </div>
        )}

        <TextInput
          id="amountPaid"
          label="Amount Paid"
          type="number"
          min="0"
          step="0.01"
          placeholder="Enter amount paid"
          input={amountPaid}  
          handleInput={(e) => {
            onAmountPaidChange(e.target.value);
            setLocalErrorMessage(''); // Clear internal error message on input change
          }}  
          required
        />

        {localErrorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {localErrorMessage}
          </div>
        )}

        {amountPaid && (
          <div
            className={`flex items-center gap-2 text-sm p-2 rounded ${
              difference >= 0 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {difference >= 0 ? (
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            )}
            <span className="font-medium">
              {difference >= 0 ? "Change:" : "Balance Due:"}
            </span>
            <span className="font-semibold">
              {formatCurrency(Math.abs(difference))}
            </span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <AppFormButton
            text="Cancel"
            color="invert"
            action={() => onClose(false)}
            validation={true}
            className="flex-1 py-2"
          />

          <AppFormButton
            text="Complete Payment"
            color={PrimaryColor}
            action={handleCashPayment}
            validation={isPaymentValid && !submitting}
            disabled={!isPaymentValid || submitting}
            className="flex-1 py-2"
          />
        </div>
      </div>
    </Modal>
  );
};

export default CashPaymentModal;
