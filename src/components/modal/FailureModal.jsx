import React, { useEffect, useState } from "react";
import failureIcon from "../../assets/modal/error.svg";
import { RefreshCw, ArrowLeft } from "lucide-react";

const FailureModal = ({ 
  amount, 
  currency = 'KSh', 
  reference, 
  onRetry,
  onNavigateToSales,
  onComplete,
  autoCloseDelay = 5,
  errorMessage = "Payment failed. Please try again.",
  retryButtonText = "Retry Payment", // New prop for retry button text
  backButtonText = "Back to Sales Page", // New prop for back button text
  countdownMessage = "Returning to payment modal in:" // New prop for countdown message
}) => {
  const [secondsLeft, setSecondsLeft] = useState(autoCloseDelay);

  useEffect(() => {
    if (secondsLeft <= 0) {
      handleNavigation(); // This will trigger onRetry if available
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleRetry = () => {
    console.log('🔄 User requested to retry payment');
    if (onRetry) {
      onRetry();
    }
  };

  const handleNavigation = () => {
    console.log('📍 Failure modal navigating');
    
    // Priority: Use the new navigation prop
    if (onNavigateToSales) {
      onNavigateToSales();
    } 
    // Fallback: Use the old complete prop
    else if (onComplete) {
      onComplete();
    }
  };

  const strokeDasharray = 100;
  const strokeDashoffset = (secondsLeft / autoCloseDelay) * strokeDasharray;

  const formattedAmount = Number(amount);

  return (
    // Changed to absolute positioning within the content area
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backdropFilter: "blur(2px)", backgroundColor: "rgba(92, 91, 91, 0.1)" }}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-[400px] text-center mx-4 border border-gray-200">
        {/* Failure Icon */}
        <div className="flex justify-center items-center mb-4">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
            <img src={failureIcon} alt="Failure" className="w-8 h-8" />
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Payment Failed
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          {errorMessage}
        </p>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-gray-500 text-sm">Amount:</span>
            <span className="font-semibold">
              {currency} {isNaN(formattedAmount) ? "0.00" : formattedAmount.toFixed(2)}
            </span>
          </div>
          {reference && (
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Reference:</span>
              <span className="font-mono text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                {reference}
              </span>
            </div>
          )}
        </div>

        {/* Countdown */}
        <div className="mt-4 text-gray-600 text-sm">
          <p className="mb-2">{countdownMessage} {secondsLeft} seconds</p>
          <div className="mt-3 flex justify-center">
            <div className="w-16 h-16 relative">
              <svg
                className="absolute top-0 left-0 w-full h-full"
                viewBox="0 0 36 36"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="4"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-red-600 font-bold">
                {secondsLeft}s
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            You can also manually click the buttons below.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-6">
          {/* Retry Button - goes back to payment modal */}
          <button
            onClick={handleRetry}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {retryButtonText}
          </button>
          
          {/* Back Button - goes to main sales page or original context */}
          <button
            onClick={handleNavigation}
            className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {backButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FailureModal;