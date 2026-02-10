import React, { useState, useEffect, useRef } from "react";
import { Loader, Smartphone, Clock, AlertCircle } from "lucide-react";
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
  onPaymentComplete, // Callback when payment is completed successfully
  onTransactionCreated, // Callback when transaction is created
  transactionId, // Optional: Existing transaction ID
}) => {
  const theme = useTheme();
  const PrimaryColor = theme.primaryColor;

  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, sending, waiting, completed, failed, cancelled
  const [currentTransactionId, setCurrentTransactionId] = useState(transactionId || '');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [countdown, setCountdown] = useState(30); 
  const [errorMessage, setErrorMessage] = useState('');
  const [mpesaReceipt, setMpesaReceipt] = useState('');
  const [lastPollTime, setLastPollTime] = useState('');

  // States for showing success/failure modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [successData, setSuccessData] = useState({});
  const [failureData, setFailureData] = useState({});

  const pollingIntervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      resetState();
    } else {
      cleanup();
      // Close any open success/failure modals
      setShowSuccessModal(false);
      setShowFailureModal(false);
    }
  }, [isOpen]);

  // Set transaction ID if provided
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
    setCountdown(30);
    setErrorMessage('');
    setMpesaReceipt('');
    setLastPollTime('');
    setShowSuccessModal(false);
    setShowFailureModal(false);
    cleanup();
  };

  // Countdown timer
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

  // Start polling when we have a transaction to check
  useEffect(() => {
    if (paymentStatus === 'waiting' && currentTransactionId) {
      startPolling();
      return () => cleanup();
    }
  }, [paymentStatus, currentTransactionId]);

  const startPolling = () => {
    console.log('🔄 Starting polling for transaction:', currentTransactionId);

    // Poll every 3 seconds for faster response
    pollingIntervalRef.current = setInterval(() => {
      checkTransactionStatus();
    }, 3000);
  };

  const checkTransactionStatus = async () => {
    if (!currentTransactionId) return;

    try {
      console.log('🔍 Checking transaction status for callback:', currentTransactionId);
      setLastPollTime(new Date().toLocaleTimeString());

      // Build the poll URL
      const pollUrl = `${URLS.TAG_BASE_URL}${URLS.MPESA.POLL_STATUS.replace(':transactionId', currentTransactionId)}`;
      console.log('🌐 Polling URL:', pollUrl);

      const response = await fetch(pollUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Poll response status:', response.status);

      if (!response.ok) {
        console.warn('⚠️ Polling request failed:', response.status);

        // If we get 404, the transaction might not exist yet, keep polling
        if (response.status === 404) {
          console.log('⏳ Transaction not found yet, continuing to poll...');
          return;
        }

        // Don't stop polling on network errors
        return;
      }

      const result = await response.json();

      console.log('📊 Callback polling result:', result);

      if (result.success) {
        // Handle based on status returned from your backend
        switch (result.status) {
          case 'completed':
            // Callback received and payment successful
            cleanup();

            if (isMountedRef.current) {
              const receipt = result.mpesaReceipt || result.receipt || 'MPESA Receipt';
              setPaymentStatus('completed');
              setMpesaReceipt(receipt);

              // Prepare success data for modal
              setSuccessData({
                amount: totalAmount,
                currency: 'KSh',
                reference: receipt,
                transactionId: currentTransactionId
              });

              // Show success modal for 3 seconds
              setShowSuccessModal(true);

              // Call payment complete callback with ALL callback data
              if (onPaymentComplete) {
                onPaymentComplete({
                  transactionId: currentTransactionId,
                  status: 'completed',
                  receipt: receipt,
                  amount: result.amountPaid || totalAmount,
                  phone: mpesaPhone,
                  callbackData: result,
                  timestamp: result.timestamp || new Date().toISOString()
                });
              }
            }
            break;

          case 'failed':
            // Callback received but payment failed
            cleanup();

            if (isMountedRef.current) {
              const errorMsg = result.errorMessage || result.message || 'Payment failed. Please try again.';
              setPaymentStatus('failed');
              setErrorMessage(errorMsg);

              // Prepare failure data for modal
              setFailureData({
                amount: totalAmount,
                currency: 'KSh',
                reference: currentTransactionId,
                errorMessage: errorMsg
              });

              // Show failure modal for 3 seconds
              setShowFailureModal(true);
            }
            break;

          case 'pending':
            // Still waiting for callback - continue polling
            console.log('⏳ Still waiting for M-PESA callback...');
            
            // Update countdown based on polling result if available
            if (result.timeRemaining) {
              setCountdown(result.timeRemaining);
            }
            break;

          default:
            console.log('ℹ️ Transaction status:', result.status);
        }
      } else {
        console.warn('⚠️ Polling returned success: false', result.message);

        // If the transaction doesn't exist yet, we might need to wait
        if (result.message?.includes('not found')) {
          console.log('⏳ Transaction not found in database yet, continuing to poll...');
        }
      }

    } catch (error) {
      console.error('❌ Error checking transaction callback status:', error);
      // Don't stop polling on network errors, just log it
    }
  };

  const queryMpesaDirectly = async () => {
    if (!checkoutRequestId) return null;
    
    try {
      console.log('🔍 Querying M-PESA directly for checkout:', checkoutRequestId);
      
      const queryUrl = `${URLS.TAG_BASE_URL}${URLS.MPESA.QUERY_STATUS.replace(':checkoutRequestId', checkoutRequestId)}`;
      console.log('🌐 Query URL:', queryUrl);
      
      const response = await fetch(queryUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('📊 Direct M-PESA query result:', result);
        
        if (result.success && result.mpesaStatus?.ResultCode === '0') {
          // Payment was successful on M-PESA side
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
      console.error('❌ Error querying M-PESA directly:', error);
      return null;
    }
  };

  const handleTimeout = async () => {
    cleanup();
    
    // Try to query M-PESA directly first
    const directResult = await queryMpesaDirectly();
    
    if (directResult?.success) {
      // Payment was actually successful
      setPaymentStatus('completed');
      setMpesaReceipt(directResult.receipt);

      // Prepare success data for modal
      setSuccessData({
        amount: totalAmount,
        currency: 'KSh',
        reference: directResult.receipt,
        transactionId: currentTransactionId
      });

      // Show success modal for 3 seconds
      setShowSuccessModal(true);
      
      if (onPaymentComplete) {
        onPaymentComplete({
          transactionId: currentTransactionId,
          status: 'completed',
          receipt: directResult.receipt,
          amount: directResult.amount,
          phone: directResult.phone,
          source: 'direct_query'
        });
      }
    } else {
      // Genuine timeout/failure
      setPaymentStatus('failed');
      const errorMsg = 'Payment timeout. Please check with customer if they completed the M-PESA payment.';
      setErrorMessage(errorMsg);

      // Prepare failure data for modal
      setFailureData({
        amount: totalAmount,
        currency: 'KSh',
        reference: currentTransactionId,
        errorMessage: errorMsg
      });

      // Show failure modal for 3 seconds
      setShowFailureModal(true);
    }
  };

  const handleMpesaPayment = async () => {
    if (!mpesaPhone || mpesaPhone.trim() === '') {
      setErrorMessage('Please enter a phone number');
      return;
    }

    // Validate phone
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

      console.log('📱 Initiating M-PESA payment...');

      // Call the parent's onConfirmPayment function
      const result = await onConfirmPayment();

      console.log('📱 STK push result:', result);

      if (result && result.success) {
        const transId = result.transactionId || result.data?.transactionId;
        const checkoutId = result.checkoutRequestId || result.data?.checkoutRequestId;

        if (transId) {
          setCurrentTransactionId(transId);
          setCheckoutRequestId(checkoutId || '');
          setPaymentStatus('waiting');
          setCountdown(30); // Reset countdown

          // Start polling immediately (first check after 2 seconds)
          setTimeout(() => {
            if (isMountedRef.current && paymentStatus === 'waiting') {
              checkTransactionStatus();
            }
          }, 2000);

          // Notify parent that transaction was created
          if (onTransactionCreated) {
            onTransactionCreated({
              transactionId: transId,
              checkoutRequestId: checkoutId,
              phone: mpesaPhone,
              amount: totalAmount,
              timestamp: new Date().toISOString()
            });
          }

          console.log('✅ STK Push sent successfully');
          console.log('📊 Transaction details:', {
            transactionId: transId,
            checkoutRequestId: checkoutId,
            phone: mpesaPhone,
            amount: totalAmount
          });
        } else {
          setPaymentStatus('failed');
          setErrorMessage('Transaction ID not received. Please try again.');
        }
      } else {
        setPaymentStatus('failed');
        setErrorMessage(result?.message || 'Failed to initiate M-PESA payment');
      }
    } catch (error) {
      console.error("❌ M-PESA payment error:", error);
      setPaymentStatus('failed');
      setErrorMessage(error.message || 'An unexpected error occurred');
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this payment?')) {
      cleanup();
      setPaymentStatus('cancelled');

      // Close after 1 second
      setTimeout(() => {
        if (isMountedRef.current) {
          handleClose(false);
        }
      }, 1000);
    }
  };

  const handleClose = (isCompleted = false) => {
    cleanup();
    onClose(isCompleted);
  };

  // Handle success completion - go back to sales page
  const handleSuccessComplete = () => {
    setShowSuccessModal(false);
    handleClose(true); // Close with success status
  };

  // Handle failure - reset to allow retry
  const handleFailureRetry = () => {
    setShowFailureModal(false);
    handleClose(false); // Close the modal to go back to payment page
    // The parent component (SalesPage) will handle showing the modal again
  };

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Phone validation function
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

  // Render different views based on status
  const renderInitialView = () => (
    <div className="space-y-4 p-2">
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
          text="Send STK Push"
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
          Sending M-PESA Request
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
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Waiting for Payment
        </h3>
        <p className="text-gray-600 mb-1">
          Check your phone <strong>{mpesaPhone}</strong> and enter your M-PESA PIN
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
        return "Sending Request...";
      case 'waiting':
        return "Complete Payment";
      case 'completed':
        return "Payment Successful";
      case 'failed':
        return "Payment Failed";
      case 'cancelled':
        return "Payment Cancelled";
      default:
        return "M-PESA Payment";
    }
  };

  return (
    <>
      {/* Main M-PESA Payment Modal - only show if success/failure modals are not showing */}
      <Modal
        isOpen={isOpen && !showSuccessModal && !showFailureModal}
        onClose={paymentStatus === 'waiting' ? undefined : () => handleClose(false)}
        title={getModalTitle()}
        showCloseButton={paymentStatus !== 'waiting'}
      >
        {renderContent()}
      </Modal>

      {/* Success Modal - shows for 3 seconds then auto-closes to sales page */}
      {showSuccessModal && (
        <SuccessModal
          amount={successData.amount}
          currency={successData.currency || 'KSh'}
          reference={successData.reference || successData.transactionId || 'N/A'}
          onComplete={handleSuccessComplete}
        />
      )}

      {/* Failure Modal - shows for 3 seconds then allows retry */}
      {showFailureModal && (
        <FailureModal
          amount={failureData.amount}
          currency={failureData.currency || 'KSh'}
          reference={failureData.reference || 'N/A'}
          onRetry={handleFailureRetry}
        />
      )}
    </>
  );
};

export default MpesaPaymentModal;