import React from "react";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import PasswordInput from "./PasswordInput";
import "./input.css";
import { validatePassword } from "../../utilities/SharedFunctions";

const REQUIREMENTS = [
  { label: "A minimum of 12 characters", test: "length" },
  { label: "A special character (@#$*)", test: "characters" },
  { label: "A capital letter", test: "uppercase" },
  { label: "A number", test: "number" },
];

export default function PasswordResetInput({
  id,
  label,
  placeholder,
  input,
  handleInput,
  id2,
  label2,
  placeholder2,
  input2,
  loading,
  error,
}) {
  return (
    <div>
      <PasswordInput
        id={id}
        label={label}
        placeholder={placeholder}
        value={input}
        onChange={handleInput}
        disabled={loading}
        error={error || (input && !validatePassword("all", input))}
        errorMessage={
          error ? "New password cannot be the same as old password" : null
        }
      />
      {input && !validatePassword("all", input) ? (
        <div className="validation-container">
          {REQUIREMENTS.map((key, index) => (
            <div key={key.test}>
              <CheckCircleOutlineRoundedIcon
                style={{
                  color:
                    validatePassword(key.test, input) === true
                      ? "#74C965"
                      : "#D1D5DB",
                }}
              />
              <span>{key.label}</span>
            </div>
          ))}
        </div>
      ) : null}

      <PasswordInput
        id={id2}
        label={label2}
        placeholder={placeholder2}
        value={input2}
        onChange={handleInput}
        disabled={loading || input === ""}
        error={input && input2 && input !== input2}
        errorMessage={"Passwords do not match"}
      />
    </div>
  );
}