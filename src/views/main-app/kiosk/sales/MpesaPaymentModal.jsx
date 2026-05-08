import React, { useState, useEffect, useRef } from "react";
import { Loader, Smartphone, Clock, X } from "lucide-react";
import Modal from "../../../../components/modal/Modal";
import TextInput from "../../../../components/Input/TextInput";
import AppFormButton from "../../../../components/buttons/AppFormButton";
import { useTheme } from "../../../../components/theme/ThemeContext";
import URLS from "../../../../utilities/Endpoints";
import SuccessModal from "../../../../components/modal/SuccessModal";
import FailureModal from "../../../../components/modal/FailureModal";

const MpesaPaymentModal = ({
  isOpen,
  onClose,
  totalAmount,
  mpesaPhone,
  onMpesaPhoneChange,
  onConfirmPayment,
  formatCurrency,
  shopkeeperName,
  validatePhone,
  onPaymentComplete,
  onTransactionCreated,
  transactionId,
  isDebtPayment = false,
  paymentType = 'TILL',
  paymentInfo = {},
  successModalCustomMessage,
}) => {
  const theme = useTheme();
  const PrimaryColor = theme.primaryColor;

  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [currentTransactionId, setCurrentTransactionId] = useState(transactionId || '');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [countdown, setCountdown] = useState(180);
  const [errorMessage, setErrorMessage] = useState('');
  const [mpesaReceipt, setMpesaReceipt] = useState('');
  const [lastPollTime, setLastPollTime] = useState('');

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [successData, setSuccessData] = useState({});
  const [failureData, setFailureData] = useState({});

  const pollingIntervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetState();
    } else {
      cleanup();
      setShowSuccessModal(false);
      setShowFailureModal(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (transactionId && isOpen) {
      setCurrentTransactionId(transactionId);
    }
  }, [transactionId, isOpen]);

  const cleanup = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const resetState = () => {
    if (!transactionId) {
      setCurrentTransactionId('');
    }
    setPaymentStatus('idle');
    setCheckoutRequestId('');
    setCountdown(180);
    setErrorMessage('');
    setMpesaReceipt('');
    setLastPollTime('');
    setShowSuccessModal(false);
    setShowFailureModal(false);
    cleanup();
  };

  useEffect(() => {
    if (paymentStatus === 'waiting' && countdown > 0) {
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          setCountdown(prev => prev - 1);
          setLastPollTime(new Date().toLocaleTimeString());
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else if (paymentStatus === 'waiting' && countdown === 0) {
      handleTimeout();
    }
  }, [paymentStatus, countdown]);

  useEffect(() => {
    if (paymentStatus === 'waiting' && currentTransactionId) {
      startPolling();
      return () => cleanup();
    }
  }, [paymentStatus, currentTransactionId]);

  const startPolling = () => {
    pollingIntervalRef.current = setInterval(() => {
      checkTransactionStatus();
    }, 3000);
  };

  const checkTransactionStatus = async () => {
    if (!currentTransactionId) return;

    try {
      setLastPollTime(new Date().toLocaleTimeString());
      const pollUrl = `${URLS.TAG_BASE_URL}${URLS.MPESA.POLL_STATUS.replace(':transactionId', currentTransactionId)}`;
      const response = await fetch(pollUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return;
      }

      const result = await response.json();

      if (result.success) {
        switch (result.status) {
          case 'completed':
            cleanup();
            if (isMountedRef.current) {
              const receipt = result.mpesaReceipt || result.receipt || 'MPESA Receipt';
              setPaymentStatus('completed');
              setMpesaReceipt(receipt);
              setSuccessData({
                amount: totalAmount,
                currency: 'KSh',
                reference: receipt,
                transactionId: currentTransactionId
              });

              // Show success modal
              setShowSuccessModal(true);

              // Call onPaymentComplete to update the transaction record
              if (onPaymentComplete) {
                await onPaymentComplete({
                  transactionId: currentTransactionId,
                  status: 'completed',
                  receipt: receipt,
                  amount: result.amountPaid || totalAmount,
                  phone: mpesaPhone,
                  callbackData: result,
                  timestamp: result.timestamp || new Date().toISOString(),
                  isDebtPayment: isDebtPayment,
                  checkoutRequestId: checkoutRequestId
                });
              }
            }
            break;

          case 'failed':
            cleanup();
            if (isMountedRef.current) {
              const errorMsg = result.errorMessage || result.message || 'Payment failed. Please try again.';
              setPaymentStatus('failed');
              setErrorMessage(errorMsg);
              setFailureData({
                amount: totalAmount,
                currency: 'KSh',
                reference: currentTransactionId,
                errorMessage: errorMsg
              });
              setShowFailureModal(true);
            }
            break;

          case 'pending':
            if (result.timeRemaining) {
              setCountdown(result.timeRemaining);
            }
            break;
        }
      }
    } catch (error) {
      // Silently handle error
    }
  };

  const queryMpesaDirectly = async () => {
    if (!checkoutRequestId) return null;

    try {
      const queryUrl = `${URLS.TAG_BASE_URL}${URLS.MPESA.QUERY_STATUS.replace(':checkoutRequestId', checkoutRequestId)}`;
      const response = await fetch(queryUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.mpesaStatus?.ResultCode === '0') {
          return {
            success: true,
            status: 'completed',
            receipt: result.mpesaStatus?.MpesaReceiptNumber || 'MPESA Receipt',
            amount: result.mpesaStatus?.Amount || totalAmount,
            phone: result.mpesaStatus?.PhoneNumber || mpesaPhone
          };
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const handleTimeout = async () => {
    cleanup();
    const directResult = await queryMpesaDirectly();

    if (directResult?.success) {
      setPaymentStatus('completed');
      setMpesaReceipt(directResult.receipt);
      setSuccessData({
        amount: totalAmount,
        currency: 'KSh',
        reference: directResult.receipt,
        transactionId: currentTransactionId
      });

      setShowSuccessModal(true);

      if (onPaymentComplete) {
        await onPaymentComplete({
          transactionId: currentTransactionId,
          status: 'completed',
          receipt: directResult.receipt,
          amount: directResult.amount,
          phone: directResult.phone,
          source: 'direct_query',
          isDebtPayment: isDebtPayment
        });
      }
    } else {
      setPaymentStatus('failed');
      const errorMsg = 'Payment timeout. Please check with customer if they completed the M-PESA payment.';
      setErrorMessage(errorMsg);
      setFailureData({
        amount: totalAmount,
        currency: 'KSh',
        reference: currentTransactionId,
        errorMessage: errorMsg
      });
      setShowFailureModal(true);
    }
  };

  const handleMpesaPayment = async () => {
    if (!mpesaPhone || mpesaPhone.trim() === '') {
      setErrorMessage('Please enter a phone number');
      return;
    }

    if (validatePhone) {
      const validation = validatePhone(mpesaPhone);
      if (!validation.isValid) {
        setErrorMessage(validation.message);
        return;
      }
    }

    try {
      setPaymentStatus('sending');
      setErrorMessage('');

      console.log('📱 Initiating M-PESA payment with:', {
        paymentType,
        paymentInfo,
        phone: mpesaPhone,
        amount: totalAmount
      });

      const result = await onConfirmPayment();

      if (result && result.success) {
        const transId = result.transactionId || result.data?.transactionId;
        const checkoutId = result.checkoutRequestId || result.data?.checkoutRequestId;

        if (transId) {
          setCurrentTransactionId(transId);
          setCheckoutRequestId(checkoutId || '');
          setPaymentStatus('waiting');
          setCountdown(180);

          setTimeout(() => {
            if (isMountedRef.current && paymentStatus === 'waiting') {
              checkTransactionStatus();
            }
          }, 2000);

          if (onTransactionCreated) {
            onTransactionCreated({
              transactionId: transId,
              checkoutRequestId: checkoutId,
              phone: mpesaPhone,
              amount: totalAmount,
              paymentType,
              timestamp: new Date().toISOString()
            });
          }
        } else {
          setPaymentStatus('failed');
          setErrorMessage('Transaction ID not received. Please try again.');
        }
      } else {
        setPaymentStatus('failed');
        setErrorMessage(result?.message || 'Failed to initiate M-PESA payment');
      }
    } catch (error) {
      console.error('❌ M-PESA payment error:', error);
      setPaymentStatus('failed');
      setErrorMessage(error.message || 'An unexpected error occurred');
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this payment?')) {
      cleanup();
      setPaymentStatus('cancelled');
      setTimeout(() => {
        if (isMountedRef.current) {
          handleClose(false);
        }
      }, 1000);
    }
  };

  const handleSuccessComplete = () => {
    console.log(`✅ Success modal completed - isDebtPayment: ${isDebtPayment}`);
    setShowSuccessModal(false);
    handleClose(true);
  };

  const handleFailureRetry = () => {
    setShowFailureModal(false);
    setPaymentStatus('idle');
    setErrorMessage('');
    setCurrentTransactionId('');
    setCheckoutRequestId('');
    setCountdown(180);
  };

  const handleFailureClose = () => {
    setShowFailureModal(false);
    handleClose(false);
  };

  const handleClose = (isCompleted = false) => {
    console.log(`🔄 Closing M-PESA modal - isCompleted: ${isCompleted}, isDebtPayment: ${isDebtPayment}`);
    cleanup();
    resetState();
    onClose(isCompleted);
  };

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const validatePhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 9) {
      return { isValid: false, message: 'Phone number too short' };
    }
    if (!/^(07|01|2547|2541|7|1)/.test(cleaned)) {
      return { isValid: false, message: 'Invalid Kenyan number format' };
    }
    return { isValid: true, message: 'Valid phone number' };
  };

  // Render payment instructions based on payment type
  const renderPaymentInstructions = () => {
    if (!paymentInfo) return null;

    switch (paymentType) {
      case 'PAYBILL':
        return (
          <div className="bg-blue-50 p-3 rounded-lg mb-3 border border-blue-200">
            <h4 className="font-semibold text-blue-800 text-sm mb-1">Paybill Details</h4>
            <p className="text-xs text-blue-600">Business No: <span className="font-bold">{paymentInfo.shortCode}</span></p>
            <p className="text-xs text-blue-600">Account No: <span className="font-bold">{paymentInfo.accountNumber}</span></p>
            <p className="text-xs text-blue-500 mt-1">Amount: {formatCurrency(totalAmount)}</p>
          </div>
        );
      case 'TILL':
        return (
          <div className="bg-green-50 p-3 rounded-lg mb-3 border border-green-200">
            <h4 className="font-semibold text-green-800 text-sm mb-1">Till Number</h4>
            <p className="text-xs text-green-600">Till No: <span className="font-bold">{paymentInfo.shortCode}</span></p>
            <p className="text-xs text-green-500 mt-1">Amount: {formatCurrency(totalAmount)}</p>
          </div>
        );
      case 'POCHI':
        return (
          <div className="bg-purple-50 p-3 rounded-lg mb-3 border border-purple-200">
            <h4 className="font-semibold text-purple-800 text-sm mb-1">Pochi La Biashara</h4>
            <p className="text-xs text-purple-600">Business No: <span className="font-bold">{paymentInfo.shortCode}</span></p>
            <p className="text-xs text-purple-500 mt-1">Amount: {formatCurrency(totalAmount)}</p>
          </div>
        );
      default:
        return null;
    }
  };

  const renderInitialView = () => (
    <div className="space-y-4 p-2">
      {/* Payment instructions */}
      {renderPaymentInstructions()}

      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-500">Total:</p>
        <p className="text-lg font-bold text-gray-800">
          {formatCurrency(totalAmount)}
        </p>
      </div>

      {shopkeeperName && (
        <div className="text-sm text-gray-500 text-center">
          Processing as: <span className="font-medium">{shopkeeperName}</span>
        </div>
      )}

      <TextInput
        id="mpesaPhone"
        name="mpesaPhone"
        label="Customer Phone Number"
        type="tel"
        input={mpesaPhone}
        handleInput={(e) => {
          onMpesaPhoneChange(e.target.value);
          setErrorMessage('');
        }}
        placeholder="0712345678 or 254712345678"
        required
        className="py-1"
      />

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {errorMessage}
        </div>
      )}

      {mpesaPhone && !errorMessage && (
        <div className="text-xs mt-1">
          {(() => {
            const validation = validatePhoneNumber(mpesaPhone);
            return (
              <span className={validation.isValid ? "text-green-600" : "text-red-600"}>
                {validation.message}
              </span>
            );
          })()}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <AppFormButton
          text="Cancel"
          color="invert"
          action={() => handleClose(false)}
          validation={true}
          className="flex-1 py-2"
        />
        <AppFormButton
          text={`Pay with ${paymentType}`}
          color={PrimaryColor}
          action={handleMpesaPayment}
          validation={!!mpesaPhone && validatePhoneNumber(mpesaPhone).isValid}
          disabled={!mpesaPhone || !validatePhoneNumber(mpesaPhone).isValid}
          className="flex-1 py-2"
        />
      </div>
    </div>
  );

  const renderSendingView = () => (
    <div className="space-y-6 p-4 text-center">
      <div className="animate-pulse">
        <Smartphone className="h-16 w-16 mx-auto text-blue-500" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Sending {paymentType} Request
        </h3>
        <p className="text-gray-600">
          Sending payment request to {mpesaPhone}...
        </p>
      </div>
      <div className="flex justify-center">
        <Loader className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    </div>
  );

  const renderWaitingView = () => (
    <div className="space-y-6 p-4 text-center">
      <div className="relative">
        <Smartphone className="h-16 w-16 mx-auto text-yellow-500" />
        <Clock className="h-8 w-8 absolute -top-2 -right-2 text-yellow-500 animate-pulse" />
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Waiting for Payment
        </h3>
        <p className="text-gray-600 mb-1">
          Waiting for <strong>{mpesaPhone}</strong> to enter M-PESA PIN
        </p>
        {currentTransactionId && (
          <p className="text-sm text-gray-500 mt-2">
            Transaction ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{currentTransactionId}</span>
          </p>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-center justify-center gap-2">
          <Clock className="h-5 w-5 text-yellow-600" />
          <span className="text-lg font-bold text-yellow-700">
            {formatCountdown(countdown)}
          </span>
        </div>
        <p className="text-xs text-yellow-600 mt-1">
          Time remaining to complete payment
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Loader className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            Checking payment status...
          </span>
        </div>
        <p className="text-xs text-blue-600">
          Last checked: {lastPollTime || 'Just now'}
        </p>
        {currentTransactionId && (
          <p className="text-xs text-blue-500 mt-1">
            Polling transaction: {currentTransactionId}
          </p>
        )}
      </div>
      <div className="pt-2">
        <AppFormButton
          text="Cancel Payment"
          color="red"
          action={handleCancel}
          validation={true}
          className="w-full py-2"
        />
      </div>
    </div>
  );

  const renderCancelledView = () => (
    <div className="space-y-6 p-4 text-center">
      <X className="h-20 w-20 mx-auto text-orange-500" />
      <div>
        <h3 className="text-xl font-bold text-orange-600 mb-2">
          Payment Cancelled
        </h3>
        <p className="text-gray-600">The payment was cancelled.</p>
      </div>

      <AppFormButton
        text="Close"
        color="orange"
        action={() => handleClose(false)}
        validation={true}
        className="w-full py-3"
      />
    </div>
  );

  const renderContent = () => {
    switch (paymentStatus) {
      case 'sending':
        return renderSendingView();
      case 'waiting':
        return renderWaitingView();
      case 'cancelled':
        return renderCancelledView();
      default:
        return renderInitialView();
    }
  };

  const getModalTitle = () => {
    switch (paymentStatus) {
      case 'sending':
        return `Sending ${paymentType} Request...`;
      case 'waiting':
        return "Complete Payment";
      case 'completed':
        return "Payment Successful";
      case 'failed':
        return "Payment Failed";
      case 'cancelled':
        return "Payment Cancelled";
      default:
        return `${paymentType} Payment`;
    }
  };

  // If success modal is showing, render ONLY the success modal
  if (showSuccessModal) {
    return (
      <SuccessModal
        amount={totalAmount}
        currency="KSh"
        reference={mpesaReceipt || successData.reference || successData.transactionId || 'N/A'}
        onNavigateToSales={handleSuccessComplete}
        onComplete={handleSuccessComplete}
        autoCloseDelay={5}
        customMessage={successModalCustomMessage}
      />
    );
  }

  // If failure modal is showing, render ONLY the failure modal
  if (showFailureModal) {
    return (
      <FailureModal
        amount={failureData.amount}
        currency={failureData.currency || 'KSh'}
        reference={failureData.reference || 'N/A'}
        errorMessage={failureData.errorMessage || 'Payment failed. Please try again.'}
        onRetry={handleFailureRetry}
        onNavigateToSales={handleFailureClose}
        onComplete={handleFailureClose}
        autoCloseDelay={5}
      />
    );
  }

  // Otherwise render the main modal
  return (
    <>
      {isOpen && (
        <Modal
          isOpen={true}
          onClose={paymentStatus === 'waiting' ? undefined : () => handleClose(false)}
          title={getModalTitle()}
          showCloseButton={paymentStatus !== 'waiting'}
        >
          {renderContent()}
        </Modal>
      )}
    </>
  );
};

export default MpesaPaymentModal;