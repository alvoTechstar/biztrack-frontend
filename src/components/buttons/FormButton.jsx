// components/Buttons/FormButton.jsx
import React from "react";

const FormButton = ({
  text,
  isLoading,
  validation,
  action,
  disabled = false,
}) => {
  return (
    <button
      onClick={action}
      disabled={isLoading || !validation || disabled}
      className={`w-full py-3 text-white rounded-lg ${
        isLoading
          ? "bg-gray-600 cursor-not-allowed"
          : validation
          ? "bg-gray-800 hover:bg-gray-700"
          : "bg-gray-400 cursor-not-allowed"
      } transition-colors duration-300`}
    >
      {isLoading ? (
        <span className="animate-spin">🔄</span> // Simple spinner (you can use Material UI spinner as well)
      ) : (
        text
      )}
    </button>
  );
};

export default FormButton;
