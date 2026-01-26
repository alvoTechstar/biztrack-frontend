import React from "react";
import PublishRoundedIcon from "@mui/icons-material/PublishRounded";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import { IconButton } from "@mui/material";
import "./input.css";

function fileUpload(id, label, formats, color, disabled, handleFile, type) {
  const handleImageUpload = (e) => {
    if (handleFile) {
      handleFile(e);
    }
  };
  return (
    <div>
      <input
        type={type}
        id={id ? id : `${label}File`}
        accept={formats}
        hidden
        onChange={handleImageUpload}
        disabled={disabled}
      />
      <button
        className='File-Container'
        id={id}
        onClick={(e) => {
          e.preventDefault();
          document.getElementById(id ? id : `${label}File`).click();
        }}
      >
        <div
          className='File-Flex'
          style={{ justifyContent: "center" }}
        >
          <div>
            <PublishRoundedIcon style={{ color: color }} />
            <span className='File-Text'>Click to upload</span>
            <span className='File-Text File-Subtitle'>{formats}</span>
          </div>
        </div>
      </button>
    </div>
  );
}

function uploadedFile(id, label, input, showImage, disabled, handleDelete, onImageError) {
  const isFileObject = input && typeof input === 'object' && input instanceof File;
  let image = null;
  if (isFileObject) {
    image = URL.createObjectURL(input);
  }

  let size = null;
  let fileName = null;
  if (isFileObject) {
    size = input.size > 1000000
      ? (input.size / 1000000).toFixed(2)
      : (input.size / 1000).toFixed(2);
    fileName = input.name;
  }

  return (
    <div className='File-Container'>
      <div className='File-Flex'>
        <div>
          <PublishRoundedIcon className='File-Success' />
          <span className='File-Text File-Success'>
            Uploaded
          </span>
          {!showImage && fileName ? (
            <span className='File-Text File-Subtitle'>
              {fileName}
              {size ? ` - ${size} ${input.size > 1000000 ? "MB" : "KB"}` : null}
            </span>
          ) : null}
        </div>
        {showImage && image ? (
          <div className='File-Image'>
            <img
              src={image}
              alt='file-preview'
              onError={(e) => {
                console.error('Image failed to load:', image);
                if (onImageError) {
                  onImageError();
                }
                e.target.style.display = 'none';
              }}
            />
          </div>
        ) : null}
        {!disabled ? (
          <div>
            <IconButton
              disableFocusRipple
              disableRipple
              disableTouchRipple
              onClick={() => handleDelete(id)}
              style={{ padding: 0 }}
            >
              <DeleteOutlineOutlinedIcon className='File-Icon-Delete' />
            </IconButton>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function FileInput({
  id,
  showImage,
  label,
  formats,
  input,
  max,
  color,
  disabled,
  handleFile,
  handleDelete,
  type,
}) {
  const maxSizeInBytes = max * 1000000;

  const isFileObject = input && input instanceof File;
  const isFileTooLarge = isFileObject && input.size > maxSizeInBytes;

  const hasInput = input && input instanceof File;

  return (
    <div className='text-input-container'>
      <span className='text-input-label'>{label}</span>
      {hasInput
        ? uploadedFile(id, label, input, showImage, disabled, handleDelete)
        : fileUpload(id, label, formats, color, disabled, handleFile, type)}

      {isFileTooLarge && (
        <div className='text-input-error'>
          <ErrorRoundedIcon />
          <span>File too large. Please select a file less than {max} MB.</span>
        </div>
      )}
    </div>
  );
}