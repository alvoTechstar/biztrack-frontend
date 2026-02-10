// FailureModal.js
import React, { useEffect, useState } from "react";
import failureIcon from "../../assets/modal/error.svg";

const FailureModal = ({ amount, currency, reference, onRetry }) => {
  const [secondsLeft, setSecondsLeft] = useState(5); // Changed from 10 to 3 seconds

  useEffect(() => {
    if (secondsLeft <= 0) {
      onRetry?.(); // Call the retry callback when countdown finishes
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, onRetry]);

  const strokeDasharray = 100;
  const strokeDashoffset = (secondsLeft / 5) * strokeDasharray; // Changed denominator to 3

  const formattedAmount = Number(amount);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[400px] text-center">
        {/* Failure Icon */}
        <div className="flex justify-center items-center mb-4">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
            <img src={failureIcon} alt="Failure" className="w-8 h-8" />
          </div>
        </div>

        {/* Text */}
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Payment Failed
        </h2>
        <p className="text-sm text-gray-600">
          Your payment of{" "}
          <strong>
            {currency}{" "}
            {isNaN(formattedAmount) ? "0.00" : formattedAmount.toFixed(2)}
          </strong>{" "}
          was unsuccessful. Ref #:{" "}
          <span className="bg-red-100 text-red-800 font-mono px-2 py-0.5 rounded">
            {reference}
          </span>
        </p>

        {/* Countdown */}
        <div className="mt-6 text-gray-600 text-sm">
          Returning to payment page in
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
        </div>

        {/* Manual Return */}
        <button
          onClick={onRetry}
          className="mt-6 text-sm text-blue-600 hover:underline flex items-center justify-center mx-auto"
        >
          &larr; Try again
        </button>
      </div>
    </div>
  );
};

export default FailureModal;