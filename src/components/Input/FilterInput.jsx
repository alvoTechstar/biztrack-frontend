import React, { useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import { Popover } from "@mui/material";
import "./input.css";
import AppFormButton from "../buttons/AppFormButton";
import CheckboxInput from "./CheckboxInput";
import RadioInput from "./RadioInput";

export default function FilterInput({
  color,
  label,
  filters,
  filters2,
  options,
  selected = [], 
  selectedAction,
  selected2, 
  selectedAction2, 
  tableFilter,
  handleTableFilter,
  anchorEl,
  handleClose,
  handleClick,
}) {
  const [value, setValue] = useState(options[0]);

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleSave = () => {
    handleTableFilter(true);
    handleClose();
  };

  const handleReset = () => {
    setValue(options[0]);
    selectedAction([]);
    if (selected2 && selectedAction2) {
      selectedAction2([]);
    }
    handleTableFilter(false);
  };

  const handleCheck = (event) => {
    const selectArray = value === options[0] ? selected : selected2;
    const id = JSON.parse(event.target.id);
    
    // FIX: Check if selectArray exists before using indexOf
    const index = selectArray ? selectArray.indexOf(id) : -1;
    handleTableFilter(false);

    if (value === options[0]) {
      if (index !== -1) {
        selected.splice(index, 1);
        selectedAction([...selected]);
      } else {
        selectedAction([...selected, id]);
      }
    } else if (selected2 && selectedAction2) {
      if (index !== -1) {
        selected2.splice(index, 1);
        selectedAction2([...selected2]);
      } else {
        selectedAction2([...selected2, id]);
      }
    }
  };

  const open = Boolean(anchorEl);
  
  // FIX: Safe array access with defaults
  const selectArray = value === options[0] ? (selected || []) : (selected2 || []);
  const filterArray = value === options[0] ? (filters || []) : (filters2 || []);
  
  // FIX: Safe length checks
  const selectedFilters =
    (selected && selected.length > 0) || (selected2 && selected2.length > 0);

  return (
    <div className="filter-input">
      <button
        onClick={handleClick}
        style={
          tableFilter && selectedFilters
            ? { color: color, borderColor: color }
            : null
        }
      >
        {tableFilter && selectedFilters ? (
          <>
            {selected && selected.length > 0
              ? selected2 && selected2.length > 0
                ? `${options[0]}, ${options[1]}`
                : options[0]
              : options[1]}{" "}
            {open ? (
              <KeyboardArrowUpIcon color={"#353F50"} />
            ) : (
              <KeyboardArrowDownIcon color={"#353F50"} />
            )}
          </>
        ) : (
          <>
            Add Filter <AddRoundedIcon color={"#353F50"} />
          </>
        )}
      </button>
      <Popover
        id={label}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <div className="filter-popover">
          <div className="filter-popover-header">
            <span className="filter-popover-title">Available Filters</span>
            <CancelRoundedIcon
              className="filter-popover-close"
              style={{ fill: color }}
              onClick={handleClose}
            />
          </div>
          <RadioInput
            color={color}
            options={options}
            value={value}
            handleChange={handleChange}
          />
          <div className="filter-options">
            {filterArray && filterArray.length > 0 && filterArray.map((filter, index) => (
              <CheckboxInput
                key={index}
                checked={
                  selectArray.indexOf(
                    value === options[0] && options.length > 1
                      ? filter.label
                      : filter.value
                  ) !== -1
                }
                handleCheck={handleCheck}
                label={
                  value === options[0] && options.length > 1
                    ? filter.label
                    : filter.value
                }
                text={filter.label}
                color={color}
              />
            ))}
          </div>
          <div className="filter-buttons">
            <AppFormButton
              isLoading={false}
              text={"Reset"}
              action={handleReset}
              validation={true}
              color={"invert"}
            />
            <AppFormButton
              isLoading={false}
              text={"Apply"}
              action={handleSave}
              validation={true}
              color={color}
            />
          </div>
        </div>
      </Popover>
    </div>
  );
}