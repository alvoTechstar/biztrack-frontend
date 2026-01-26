// components/input/DateInput.jsx
import React, { forwardRef, useRef, useState } from "react";
import { IconButton } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useTheme as useAppTheme } from "../theme/ThemeContext";

const DateInput = forwardRef(function DateInput(
  {
    id,
    name,
    label,
    placeholder = "Select date",
    value,
    required,
    onBlur,
    onChange,
    disabled = false,
    error = false,
    errorMessage = "",
    ...other
  },
  ref
) {
  const { primaryColor } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [open, setOpen] = useState(false);

  // anchorRef points to the wrapper div so Popper can stick to it
  const anchorRef = useRef(null);

  const formatDateForInput = (d) => (d ? dayjs(d).format("DD/MM/YYYY") : "");

  const handleOpen = () => {
    if (!disabled) {
      setOpen(true);
      setIsFocused(true);
    }
  };
  const handleClose = () => {
    setOpen(false);
    setIsFocused(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="mb-4 w-full" ref={anchorRef}>
        {/* Label */}
        {label && (
          <div className="mb-1">
            <span className="text-[14px] leading-4 font-bold text-[#353f50]">
              {label}
              {required && (
                <span className="text-red-500 font-bold text-[12px] ml-1">
                  *
                </span>
              )}
            </span>
          </div>
        )}
        {/* Hidden DatePicker — Popper anchored to anchorRef */}
        <div className="hidden">
          <DatePicker
            open={open}
            onClose={handleClose}
            value={value}
            disabled={disabled}
            onChange={(newValue) => {
              onChange?.(newValue);
              handleClose();
            }}
            /* v5 API */
            componentsProps={{
              popper: {
                anchorEl: () => anchorRef.current,
                placement: "bottom-start",
              },
            }}
            /* v6 API */
            slotProps={{
              popper: {
                anchorEl: anchorRef.current,
                placement: "bottom-start",
              },
            }}
            renderInput={() => null}
            {...other}
          />
        </div>
        {/* Custom visible input */}
        <div className="relative">
          <input
            ref={ref}
            id={id || name}
            name={name}
            type="text"
            value={formatDateForInput(value)}
            placeholder={placeholder}
            onClick={handleOpen}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            readOnly
            disabled={disabled}
            className={`
              w-full pr-10 px-4 py-2 border rounded-lg shadow-sm
              focus:outline-none cursor-pointer
              ${error ? "border-red-500" : "border-gray-300"}
              ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
            `}
            style={{
              height: "45px",
              ...(isFocused && !error
                ? {
                    borderColor: primaryColor,
                    boxShadow: `0 0 0 2px ${primaryColor}33`,
                  }
                : {}),
            }}
          />

          {/* Calendar icon */}
          <div
            className="absolute inset-y-0 right-3 flex items-center"
            style={{ color: primaryColor }}
          >
            <IconButton
              size="small"
              onClick={handleOpen}
              disabled={disabled}
              className="!p-1"
              aria-label="Open calendar"
            >
              <EventIcon fontSize="small" />
            </IconButton>
          </div>
        </div>
        {error && <p className="text-sm text-red-500 mt-1">{errorMessage}</p>}
      </div>
    </LocalizationProvider>
  );
});

export default DateInput;
