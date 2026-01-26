// components/Input/LogoUploadInput.jsx
import React, { useRef, useEffect, useState } from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Box,
} from "@mui/material";
import { Upload as UploadIcon } from "@mui/icons-material";

const LogoUploadInput = ({ value, onChange, label, error, helperText }) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(value || "");

  // If value changes externally, update preview
  useEffect(() => {
    setPreview(value);
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onChange(reader.result); // Set base64 image URL as value
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleInputChange = (e) => {
    const url = e.target.value;
    onChange(url);
    setPreview(url);
  };

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <TextField
        label={label}
        value={value}
        onChange={handleInputChange}
        error={error}
        helperText={helperText}
        fullWidth
        variant="outlined"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleUploadClick} edge="end">
                <UploadIcon />
              </IconButton>
            </InputAdornment>
          ),
          startAdornment: preview && (
            <InputAdornment position="start">
              <Avatar src={preview} sx={{ width: 32, height: 32 }} />
            </InputAdornment>
          ),
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />
    </Box>
  );
};

export default LogoUploadInput;
