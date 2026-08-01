import React, { useRef } from "react";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { IconButton } from "@mui/material";
import { useTheme } from "../theme/ThemeContext";

const TAILWIND_GRAY_300 = "#D1D5DB";
const TAILWIND_RED_500 = "#EF4444";

const formatSize = (bytes) => {
  if (bytes > 1000000) return `${(bytes / 1000000).toFixed(2)} MB`;
  return `${(bytes / 1000).toFixed(2)} KB`;
};

function FieldLabel({ label, required }) {
  return (
    <div className="mb-1">
      <span className="text-[14px] leading-4 font-bold text-[#353f50]">
        {label}
        {required && (
          <span className="text-red-500 font-bold text-[12px] ml-1">*</span>
        )}
      </span>
    </div>
  );
}

function PreviewThumbnail({ imageUrl, primaryColor }) {
  if (!imageUrl) {
    return (
      <div className="w-16 h-16 flex-shrink-0 rounded-lg border border-gray-200 bg-white flex items-center justify-center">
        <UploadRoundedIcon style={{ color: primaryColor }} />
      </div>
    );
  }
  return (
    <div className="w-16 h-16 flex-shrink-0 rounded-lg border border-gray-200 bg-white overflow-hidden">
      <img
        src={imageUrl}
        alt="Logo preview"
        className="w-full h-full object-contain"
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    </div>
  );
}

function PreviewCard({
  isFileObject,
  displayImageUrl,
  file,
  disabled,
  error,
  primaryColor,
  onChange,
  onDelete,
}) {
  return (
    <div
      className="flex items-center gap-3 w-full p-3 rounded-lg border bg-gray-50"
      style={{ borderColor: error ? TAILWIND_RED_500 : TAILWIND_GRAY_300 }}
    >
      <PreviewThumbnail imageUrl={displayImageUrl} primaryColor={primaryColor} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-[#519e47]">
          <CheckCircleRoundedIcon style={{ fontSize: 16 }} />
          <span className="text-[12px] font-semibold">
            {isFileObject ? "Ready to upload" : "Current logo"}
          </span>
        </div>
        {isFileObject && (
          <p className="text-[12px] text-[#5f738c] truncate mt-0.5">
            {file.name} &middot; {formatSize(file.size)}
          </p>
        )}
      </div>

      {!disabled && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={onChange}
            className="text-[12px] font-semibold px-2 py-1 rounded-md hover:bg-gray-200 transition"
            style={{ color: primaryColor }}
          >
            Change
          </button>
          <IconButton
            disableFocusRipple
            disableRipple
            disableTouchRipple
            onClick={onDelete}
            size="small"
          >
            <DeleteOutlineOutlinedIcon style={{ fontSize: 18, color: "#353f50" }} />
          </IconButton>
        </div>
      )}
    </div>
  );
}

function Dropzone({ formats, disabled, error, primaryColor, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-1 w-full py-6 px-4 rounded-lg border-2 border-dashed transition
        ${disabled ? "bg-gray-100 cursor-not-allowed border-gray-200" : "border-gray-300 hover:bg-gray-50 cursor-pointer"}
      `}
      style={{ borderColor: error ? TAILWIND_RED_500 : undefined }}
    >
      <UploadRoundedIcon style={{ color: primaryColor }} />
      <span className="text-[12px] font-semibold text-[#353f50]">Click to upload</span>
      <span className="text-[11px] text-[#848f9f]">{formats}</span>
    </button>
  );
}

function FieldMessage({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-center mt-1 text-xs leading-5 text-[#dc4437]">
      <ErrorRoundedIcon className="h-[0.7em] w-[0.7em] mr-1" />
      <span>{message}</span>
    </div>
  );
}

export default function FileInput({
  id,
  showImage,
  label,
  formats,
  input,
  max = 5,
  disabled,
  required,
  handleFile,
  handleDelete,
  type,
  error = false,
  errorMessage = "",
  currentImageUrl,
}) {
  const { primaryColor } = useTheme();
  const inputRef = useRef(null);

  const isFileObject = input instanceof File;
  const previewUrl = isFileObject && showImage ? URL.createObjectURL(input) : null;
  const displayImageUrl = previewUrl || (showImage ? currentImageUrl : null);

  const isFileTooLarge = isFileObject && input.size > max * 1000000;
  const inputElementId = id || `${label}File`;

  const openFilePicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div className="mb-4 w-full">
      <FieldLabel label={label} required={required} />

      <input
        ref={inputRef}
        type={type || "file"}
        id={inputElementId}
        accept={formats}
        hidden
        onChange={(e) => handleFile?.(e)}
        disabled={disabled}
      />

      {isFileObject || displayImageUrl ? (
        <PreviewCard
          isFileObject={isFileObject}
          displayImageUrl={displayImageUrl}
          file={input}
          disabled={disabled}
          error={error}
          primaryColor={primaryColor}
          onChange={openFilePicker}
          onDelete={() => handleDelete(id)}
        />
      ) : (
        <Dropzone
          formats={formats}
          disabled={disabled}
          error={error}
          primaryColor={primaryColor}
          onClick={openFilePicker}
        />
      )}

      <FieldMessage
        message={
          isFileTooLarge
            ? `File too large. Please select a file less than ${max} MB.`
            : (error && errorMessage)
        }
      />
    </div>
  );
}
