import React from "react";
import { Select, MenuItem, Chip, Box } from "@mui/material";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import { useTheme } from "../theme/ThemeContext"; // Verify this path is correct for your theme context

export default function SelectInput({
  id,
  name,
  label,
  options = [],
  value,
  onBlur,
  onChange,
  disabled = false,
  required = false,
  error = false,
  errorMessage = "",
  returnObject = false,
  multiple = false,
}) {
  const { primaryColor } = useTheme();

  // Determine the value to pass to MUI Select based on 'multiple' prop
  const displayValue = multiple ? (value || []) : (value === undefined || value === null ? "" : value);

  // Define common Tailwind color hex codes for consistency (adjust if your Tailwind config uses different values)
  const tailwindGray300 = '#D1D5DB'; // Equivalent to border-gray-300
  const tailwindGray400 = '#9CA3AF'; // Slightly darker gray for hover, similar to border-gray-400
  const tailwindRed500 = '#EF4444';   // Equivalent to border-red-500
  const tailwindGray100 = '#F3F4F6';  // Equivalent to bg-gray-100

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
        <Select
          id={id}
          name={name}
          fullWidth
          displayEmpty // Important for displaying the placeholder when value is empty
          disabled={disabled}
          value={displayValue}
          onChange={onChange}
          onBlur={onBlur}
          multiple={multiple}
          variant="outlined"
          className={`
            w-full px-4 py-2 shadow-sm rounded-lg
            ${disabled ? `bg-[${tailwindGray100}] cursor-not-allowed` : ""}
          `}
          sx={{
            height: '40px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: error ? tailwindRed500 : tailwindGray300,
              transition: 'border-color 0.2s ease-in-out',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: error ? tailwindRed500 : tailwindGray400,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: primaryColor,
              boxShadow: `0 0 0 2px ${primaryColor}33`,
              outline: 'none',
            },
            '&.Mui-focused': {
                outline: 'none',
            },
            '& .MuiSelect-select': {
              padding: '8px 14px',
              minHeight: 'unset',
              ...(multiple && {
                padding: '8px 32px 8px 14px',
              }),
            },
            '& .MuiInputBase-input': {
                padding: '5px !important', // Adjusted from 0 to 5px for better visual padding
                height: '100%',
                display: 'flex',
                alignItems: 'center',
            },
            '& .MuiSelect-icon': {
                right: '10px',
            },
            '& .MuiInputLabel-root': {
                display: 'none',
            },
            '& .MuiChip-root': {
                margin: '2px',
            },
          }}
          // --- START Placeholder Logic ---
          renderValue={(selected) => {
            if (multiple) {
              // For multiple select, if no items are selected, show placeholder
              if (selected.length === 0) {
                return <span className="text-[#9ca3af]">Select {label}</span>;
              }
              // Otherwise, render selected chips
              return (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((val) => {
                    const selectedOption = options.find((opt) =>
                      returnObject
                        ? opt === val
                        : opt.value === val || opt.name === val
                    );
                    return (
                      <Chip
                        key={val}
                        label={
                          selectedOption?.label || selectedOption?.name || val
                        }
                        size="small"
                      />
                    );
                  })}
                </Box>
              );
            } else {
              // For single select, if value is empty, show placeholder
              if (selected === "" || selected === null || selected === undefined) {
                return <span className="text-[#9ca3af]">Select {label}</span>;
              }
              // Otherwise, render the selected option's label
              const selectedOption = options.find((opt) =>
                returnObject
                  ? opt === selected
                  : opt.value === selected || opt.name === selected
              );
              return selectedOption?.label || selectedOption?.name || selected;
            }
          }}
          // --- END Placeholder Logic ---
        >
          {/* We don't need a disabled MenuItem for placeholder if renderValue handles it for displayEmpty */}
          {/* {!multiple && (
            <MenuItem value={""} disabled>
              <span className="text-[#9ca3af]">Select {label}</span>
            </MenuItem>
          )} */}

          {options.map((option, index) => {
            const val = returnObject ? option : option.value || option.name;
            const isSelected = multiple
              ? (value || []).includes(val)
              : (returnObject && option === value) ||
                option.value === value ||
                JSON.stringify(option) === JSON.stringify(value) ||
                option.name === value;

            return (
              <MenuItem
                key={index}
                value={val}
                sx={{
                  ":hover": { color: primaryColor },
                  color: isSelected ? primaryColor : "inherit",
                }}
              >
                {option.label || option.name}
              </MenuItem>
            );
          })}
        </Select>

        {error && (
          <div className="flex items-center mt-1 text-xs leading-5 text-[#dc4437]">
            <ErrorRoundedIcon className="h-[0.7em] w-[0.7em] mr-1" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}