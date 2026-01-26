import React from "react";
import { Checkbox } from "@mui/material";
import "./input.css";

export default function CheckboxInput({
  checked,
  handleCheck,
  disabled,
  label,
  color,
  text,
}) {
  return (
    <div className="checkbox-input">
      <Checkbox
        disabled={disabled}
        disableRipple
        checked={checked}
        onChange={handleCheck}
        id={JSON.stringify(label)}
        name="checkbox"
        sx={{
          "&.Mui-checked": {
            color: color,
          },
        }}
      />
      {text ? <span className="checkbox-input-span">{text}</span> : null}
    </div>
  );
}
