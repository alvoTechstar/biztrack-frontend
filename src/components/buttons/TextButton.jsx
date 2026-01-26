import React from "react";
import { CircularProgress } from "@mui/material";
import "./buttons.css";

export default function TextButton({
  alignment,
  text,
  actionText,
  action,
  isLoading,
  color,
}) {
  return (
    <div className="text-button-container" style={{ textAlign: alignment }}>
      <span>{text}</span>
      {isLoading ? (
        <CircularProgress
          style={{ color: "#1f2937" }}
          size={16}
          thickness={5}
        />
      ) : (
        <span
          className="text-button-active"
          onClick={action}
          style={color ? { color: color } : null}
        >
          {actionText}
        </span>
      )}
    </div>
  );
}
