// SuccessModal.js
import React, { useEffect, useState } from "react";
import successIcon from "../../assets/modal/success.svg";
import { ShoppingBag } from "lucide-react";

const SuccessModal = ({ 
  amount, 
  currency = 'KSh', 
  reference, 
  onComplete,
  onNavigateToSales,
  autoCloseDelay = 5
}) => {
  const [secondsLeft, setSecondsLeft] = useState(autoCloseDelay);

  useEffect(() => {
    if (secondsLeft <= 0) {
      handleNavigation();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleNavigation = () => {
    console.log('📍 Success modal navigating to sales page');
    
    if (onNavigateToSales) {
      onNavigateToSales();
    } else if (onComplete) {
      onComplete();
    }
  };

  const strokeDasharray = 100;
  const strokeDashoffset = (secondsLeft / autoCloseDelay) * strokeDasharray;

  return (
    // Added backdrop with lower opacity so layout is visible
    <div className="absolute inset-0 bg-white bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[400px] text-center mx-4 border border-gray-200">
        {/* Success Icon */}
        <div className="flex justify-center items-center mb-4">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
            <img src={successIcon} alt="Success" className="w-8 h-8" />
          </div>
        </div>

        {/* Text */}
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Payment Successful!
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Transaction completed successfully.
        </p>

        {/* Payment Details */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-gray-700 text-sm">Amount:</span>
            <span className="font-bold text-green-700">
              {currency} {(!isNaN(amount) ? Number(amount).toFixed(2) : "0.00")}
            </span>
          </div>
          {reference && (
            <div className="flex justify-between">
              <span className="text-gray-700 text-sm">Receipt:</span>
              <span className="font-mono text-xs font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded">
                {reference}
              </span>
            </div>
          )}
        </div>

        {/* Countdown */}
        <div className="mt-4 text-gray-600 text-sm">
          <p className="mb-2">Returning to <strong>Sales Page</strong> in:</p>
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
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-green-600 font-bold">
                {secondsLeft}s
              </div>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <button
          onClick={handleNavigation}
          className="mt-6 w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingBag className="h-4 w-4" />
          Go to Sales Page & Start New Sale
        </button>

        {/* Manual Return Link */}
        <button
          onClick={handleNavigation}
          className="mt-3 text-sm text-blue-600 hover:underline"
        >
          ← Return to sales page 
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;