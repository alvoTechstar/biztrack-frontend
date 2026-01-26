import React, { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useTheme } from "../theme/ThemeContext";

const PasswordInput = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  disabled = false,
  error = false,
  errorMessage = "",
  required = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { primaryColor } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
  

  return (
    <div className="mb-4 w-full">
      <div className="mb-1">
        <span className="text-[14px] leading-4 font-bold text-[#353f50]">
          {label}
          {required && (
            <span className="text-red-500 font-bold text-[12px] ml-1">*</span>
          )}
        </span>
      </div>

      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
            onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pr-10 px-4 py-2 border rounded-lg shadow-sm
            focus:outline-none 
            ${error ? "border-red-500" : "border-gray-300"}
            ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
          `}
            style={
            isFocused && !error
              ? {
                  borderColor: primaryColor,
                  boxShadow: `0 0 0 2px ${primaryColor}33`,
                }
              : {}
          }
        />
        <div
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-2.5 cursor-pointer"
          style={{ color: primaryColor }}
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </div>
      </div>

      {error && <p className="text-sm text-red-500 mt-1">{errorMessage}</p>}
    </div>
  );
};

export default PasswordInput;
