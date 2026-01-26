import React, { useState } from "react";
import { useTheme } from "../theme/ThemeContext";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

export default function SearchInput({
  id,
  placeholder,
  input,
  handleInput,
  handleClear,
  error = false,
  disabled = false,
}) {
  const { primaryColor } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-64 mr-2">
      <div
        className={`
          flex items-center rounded-md border
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-gray-100"} 
          ${error ? "border-red-500" : 
            isFocused ? "border-transparent" : 
            "border-gray-300" 
          }
        `}
        style={ 
          isFocused && !error
            ? {
                borderColor: primaryColor,
                boxShadow: `0 0 0 2px ${primaryColor}33`,
              }
            : {}
        }
      >
        <div className="w-10 flex items-center justify-center ml-3 text-gray-500 cursor-pointer">
          <SearchRoundedIcon className="h-4 w-4" />
        </div>
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          value={input}
          autoComplete="off"
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={`
            w-full h-[40px] px-4 py-2 text-sm font-medium text-gray-700 bg-transparent focus:outline-none
            ${disabled ? "cursor-not-allowed" : ""}
          `}
        />
        <div
          className={`w-10 flex items-center justify-center mr-3 cursor-pointer ${
            input ? "visible" : "invisible"
          }`}
          onClick={() => handleClear("")}
        >
          <CloseRoundedIcon className="h-4 w-4 text-gray-500" />
        </div>
      </div>
    </div>
  );
}