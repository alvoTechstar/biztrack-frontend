import React from "react";
import "./input.css";

export default function ColorInput({
  id,
  label,
  input,
  handleInput,
  disabled,
}) {
  return (
    <div className="text-input-container">
      <span className="text-input-label">{label}</span>
      <input
        id={id}
        disabled={!!disabled}
        type={"color"}
        value={input || "#000000"}
        onChange={(e) => handleInput(e)}
        autoComplete={"off"}
      />
    </div>
  );
}
