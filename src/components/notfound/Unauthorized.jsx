import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Lock, ArrowLeft } from "lucide-react"; // Import ArrowLeft icon

const Unauthorized = () => {
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleGoBack = () => {
    navigate(-1); // This navigates back to the previous entry in the history stack
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full">
        <Lock size={64} className="text-red-500 mx-auto mb-6" />
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
          Unauthorized Access
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          You don't have the necessary permissions to view this page. Please
          contact your administrator if you believe this is an error.
        </p>
        <div className="flex justify-center">
          <button
            onClick={handleGoBack} // Use the handleGoBack function
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" /> {/* Use ArrowLeft icon */}
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
