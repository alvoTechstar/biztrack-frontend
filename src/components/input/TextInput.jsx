import React from "react";
import "./input.css";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";

export default function TextInput({
  id,
  label,
  placeholder,
  input,
  handleInput,
  handleBlur,
  error,
  errorMessage,
  type,
  max,
  min,
  disabled,
  required,
  color,
  name, // Make sure you're passing name prop
}) {
  const disablePastDate = () => {
    const today = new Date();
    const dd = String(today.getDate() + 1).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    const yyyy = today.getFullYear();
    return yyyy + "-" + mm + "-" + dd;
  };
  
  // Handle undefined/null input by providing a default value
  const inputValue = input ?? '';
  
  return (
    <div className="text-input-container">
      <span
        className={
          required ? "text-input-label display-inline" : "text-input-label"
        }
      >
        {label}
      </span>
      {required ? (
        <span
          className="text-input-label display-inline"
          style={{ color: "red" }}
        >
          {" "}
          *{" "}
        </span>
      ) : null}
      <input
        id={id}
        name={name || id} // Make sure name is passed
        disabled={disabled}
        type={type || "text"}
        placeholder={placeholder}
        value={inputValue} // Use the safe value
        pattern={type === "number" ? `\d*` : null}
        onChange={(e) => handleInput && handleInput(e)}
        onBlur={handleBlur}
        maxLength={max}
        minLength={min}
        className={
          error
            ? "text-input-container-error"
            : color
            ? `text-input-${color}`
            : "text-input-default" // Add default class
        }
        autoComplete={id === "code" ? "off" : "on"}
        min={!id?.includes("issueDate") ? disablePastDate() : null}
        max={id?.includes("issueDate") ? disablePastDate() : null}
      />
      {error ? (
        <div className="text-input-error">
          <ErrorRoundedIcon />
          <span>{errorMessage}</span>
        </div>
      ) : null}
    </div>
  );
}