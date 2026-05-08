// components/Buttons/FormButton.jsx
import React from "react";
import { CircularProgress } from "@mui/material";

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
      className={`w-full py-3 text-white rounded-lg flex items-center justify-center ${
        isLoading
          ? "bg-gray-600 cursor-not-allowed"
          : validation
          ? "bg-gray-800 hover:bg-gray-700"
          : "bg-gray-400 cursor-not-allowed"
      } transition-colors duration-300`}
    >
      {isLoading ? (
        <CircularProgress
          size={24}
          thickness={4}
          sx={{
            color: "white",
          }}
        />
      ) : (
        text
      )}
    </button>
  );
};

export default FormButton;