import * as React from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";

export default function RadioInput({
  id,
  color,
  options,
  value,
  label,
  handleChange,
}) {
  return (
    <FormControl style={label ? { marginBottom: "18px" } : null}>
      {label ? <span className="text-input-label">{label}</span> : null}
      <RadioGroup row value={value} onChange={handleChange}>
        {options.map((option, index) => (
          <FormControlLabel
            key={index}
            value={option}
            control={
              <Radio
                name={id ? id : "radio"}
                disableRipple
                disableFocusRipple
                disableTouchRipple
                sx={{
                  "&.Mui-checked": {
                    color: color,
                  },
                }}
              />
            }
            label={option}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}
