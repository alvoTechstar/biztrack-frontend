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
  filters3,
  options,
  selected = [],
  selectedAction,
  selected2,
  selectedAction2,
  selected3,
  selectedAction3,
  tableFilter,
  handleTableFilter,
  anchorEl,
  handleClose,
  handleClick,
}) {
  const [value, setValue] = useState(options[0]);

  // Category N lines up with options[N] / filters(N+1) / selected(N+1)
  const categories = [
    { filters, selected, selectedAction },
    { filters: filters2, selected: selected2, selectedAction: selectedAction2 },
    { filters: filters3, selected: selected3, selectedAction: selectedAction3 },
  ];

  const activeCategoryIndex = Math.max(options.indexOf(value), 0);
  const activeCategory = categories[activeCategoryIndex] || categories[0];

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleSave = () => {
    handleTableFilter(true);
    handleClose();
  };

  const handleReset = () => {
    setValue(options[0]);
    categories.forEach((category) => {
      if (category.selected && category.selectedAction) {
        category.selectedAction([]);
      }
    });
    handleTableFilter(false);
  };

  const handleCheck = (event) => {
    const { selected: activeSelected = [], selectedAction: activeSelectedAction } = activeCategory;
    if (!activeSelectedAction) return;

    const id = JSON.parse(event.target.id);
    const index = activeSelected.indexOf(id);
    handleTableFilter(false);

    if (index !== -1) {
      activeSelectedAction(activeSelected.filter((_, i) => i !== index));
    } else {
      activeSelectedAction([...activeSelected, id]);
    }
  };

  const open = Boolean(anchorEl);

  const selectArray = activeCategory.selected || [];
  const filterArray = activeCategory.filters || [];

  const activeLabels = options.filter((option, index) => {
    const category = categories[index];
    return category?.selected && category.selected.length > 0;
  });
  const selectedFilters = activeLabels.length > 0;

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
            {activeLabels.join(", ")}{" "}
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
                checked={selectArray.indexOf(filter.value) !== -1}
                handleCheck={handleCheck}
                label={filter.value}
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
