import React, { useRef } from "react";
import { ColorLens as ColorLensIcon } from "@mui/icons-material";
import TextInput from "./TextInput";
import { useTheme } from "../theme/ThemeContext"; 

export default function ColorPickerInput({
  value,
  onChange,
  label,
  error = false,
  helperText = "",
}) {
  const pickerRef = useRef(null);
  const { primaryColor } = useTheme(); // get from global theme
  const color = value || primaryColor;

  const openNativePicker = () => pickerRef.current?.click();

  return (
    <div className="w-full mb-4">
      {/* Label */}
      <label className="text-[14px] leading-4 font-bold text-[#353f50] mb-1 block">
        {label}
      </label>

      {/* Colored TextInput */}
      <div className="relative" onClick={openNativePicker}>
        <TextInput
          value={color}
          readOnly
          disabled
          className="w-full cursor-pointer"
          endAdornment={<ColorLensIcon className="text-white" />}
          style={{
            backgroundColor: color,
            color: "#ffffff",
            borderColor: error ? "#dc2626" : "transparent",
          }}
          error={error}
          errorMessage={helperText}
        />

        {/* Invisible native input */}
        <input
          ref={pickerRef}
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}
