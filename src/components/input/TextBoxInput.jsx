import React, { useState } from "react";
import { useTheme } from "../theme/ThemeContext";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";

export default function TextBoxInput({
  id,
  label,
  placeholder,
  required,
  input,
  handleInput,
  max,
  disabled,
  error = false,
  errorMessage,
  onBlur,
}) {
  const { primaryColor } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const tailwindGray300 = "#D1D5DB";
  const tailwindRed500 = "#EF4444";

  const getBorderColor = () => {
    if (error) return tailwindRed500;
    if (isFocused) return primaryColor;
    return tailwindGray300;
  };

  const getBoxShadow = () => {
    if (isFocused && !error) {
      return `0 0 0 2px ${primaryColor}33`;
    }
    return "none";
  };

  const handleFocus = () => setIsFocused(true);
  const handleInternalBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

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
        <textarea
          id={id}
          value={input}
          disabled={disabled}
          placeholder={placeholder}
          onChange={handleInput}
          onFocus={handleFocus}
          onBlur={handleInternalBlur}
          maxLength={max}
          rows={3}
          autoComplete="off"
         className={`
            w-full pr-10 px-4 py-2 border rounded-lg shadow-sm
            focus:outline-none
            ${error ? "border-red-500" : "border-gray-300"}
            ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
          `}
          style={{
            borderColor: getBorderColor(),
            boxShadow: getBoxShadow(),
          }}
        ></textarea>

        {error && (
          <div className="flex items-center mt-1 text-xs leading-5 text-[#dc4437]">
            <ErrorRoundedIcon className="h-[0.7em] w-[0.7em] mr-1" />{" "}
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
