import React, { useEffect, useState } from "react";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import { Popover } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { SingleInputDateRangeField } from "@mui/x-date-pickers-pro/SingleInputDateRangeField";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import dayjs from "dayjs";
import "./input.css";
import AppFormButton from "../buttons/AppFormButton";
import { getDateRange } from "../../utilities/SharedFunctions.jsx";

const DATE_OPTIONS = [
  "Today",
  "Last 7 days",
  "Last 30 days",
  "Last 60 days",
  "Custom",
];

const CUSTOM_OPTIONS = [
  { label: "Date Range (Max 90 Days)", value: "range" },
  { label: "Yearly", value: "year" },
];

export default function DateRangeInput
({
  type,
  color,
  selected,
  dateFilter,
  anchorEl,
  selectedAction,
  handleDateFilter,
  handleClose,
  handleClick,
}) {
  const [value, setValue] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [anchorElCustom, setAnchorElCustom] = useState(null);
  const [hovered, setHovered] = useState(-1);
  const [hoveredCustom, setHoveredCustom] = useState(-1);
  const [dateValue, setDateValue] = useState([dayjs(), dayjs()]);

  const open = Boolean(anchorEl);
  const openCustom = Boolean(anchorElCustom);

  const customStyle = {
    background: `${color}1A `,
    color: `${color}`,
  };

  const maxDate =
    dateValue[0] && dateValue[0] !== dayjs()
      ? dateValue[0].add(90, "day")
      : dateValue[1]
      ? dateValue[1]
      : null;

  const currentYear = dayjs();
  const minYear = dayjs("2024-01-01");

  const MouseEnter = (index) => {
    setHovered(index);
  };
  const MouseLeave = () => {
    setHovered(-1);
  };

  const MouseEnterCustom = (index) => {
    setHoveredCustom(index);
  };
  const MouseLeaveCustom = () => {
    setHoveredCustom(-1);
  };

  const handleClickCustom = (event) => {
    setAnchorElCustom(event.currentTarget);
  };

  const handleCloseCustom = () => {
    setAnchorElCustom(null);
  };

  const handleDate = (value) => {
    setDateValue(value);
    localStorage.removeItem("dateFilterCustom");
  };

  const handleFormatDate = (value) => {
    const year = dayjs(value).format("YYYY");
    const customStartDate = dayjs(`${year}-01-01`);
    const customEndDate =
      year === dayjs(currentYear).format("YYYY")
        ? dayjs()
        : dayjs(`${year}-12-31`);
    return [customStartDate, customEndDate];
  };

  const handleCustomDate = (value) => {
    setDateValue(handleFormatDate(value));
  };

  const handleChange = (selectedValue, event) => {
    setValue(selectedValue);
    setDateValue([dayjs(), dayjs()]);
    setCustomValue("");
    localStorage.setItem("dateFilter", selectedValue);
    if (selectedValue === "Custom") {
      handleClickCustom(event);
    }
  };

  const handleRange = (date) => {
    switch (date) {
      case "Last 7 days":
        return 7;
      case "Last 30 days":
        return 30;
      case "Last 60 days":
        return 60;
      default:
        return 0;
    }
  };

  const handleDateFilterChange = (value) => {
    setCustomValue(value);
    setDateValue([dayjs(), dayjs()]);
    handleCloseCustom();
    localStorage.setItem("dateFilterCustom", value);
  };

  const handleSave = () => {
    if (value && value !== "Custom") {
      handleDates(value);
    } else if (value === "Custom") {
      if (customValue === "year") {
        const dates = handleFormatDate(dateValue[0]);
        selectedAction({
          startDate: dates[0].format("DD-MM-YYYY"),
          endDate: dates[1].format("DD-MM-YYYY"),
        });
      } else {
        selectedAction({
          startDate: dateValue[0].format("DD-MM-YYYY"),
          endDate: dateValue[1].format("DD-MM-YYYY"),
        });
      }
    }
    handleDateFilter(true);
    handleClose();
  };

  const handleReset = () => {
    if (type === "transaction") {
      handleChange("Today");
    } else {
      setValue("");
      selectedAction(null);
      localStorage.removeItem("dateFilter");
      localStorage.removeItem("dateFilterCustom");
      handleDateFilter(false);
    }
  };

  const handleDates = (option) => {
    const range = getDateRange(handleRange(option));
    selectedAction(range);
  };

  useEffect(() => {
    if (customValue !== "year") {
      if (maxDate && dayjs(maxDate).isBefore(dayjs(dateValue[1]))) {
        const newDates = [...dateValue];
        newDates[1] = null;
        setDateValue(newDates);
      }
    }
  }, [dateValue, maxDate]);

  useEffect(() => {
    if (dateFilter) {
      let date = localStorage.getItem("dateFilter");
      let custom = localStorage.getItem("dateFilterCustom");
      setValue(date);
      setCustomValue(custom);
      setDateValue([dayjs(selected.startDate), dayjs(selected.endDate)]);
    }
  }, [anchorEl]);

  useEffect(() => {
    if (dateFilter && selected) {
      localStorage.setItem("dateFilter", "Today");
    }
  }, []);

  return (
    <div className="filter-date-input">
      <button
        onClick={handleClick}
        style={
          dateFilter && selected ? { color: color, borderColor: color } : null
        }
      >
        <CalendarMonthRoundedIcon color={"#353F50"} />
      </button>
      <Popover
        id={"Date Filter"}
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
            <span className="filter-popover-title">Time Period</span>
            <CancelRoundedIcon
              className="filter-popover-close"
              style={{ fill: color }}
              onClick={handleClose}
            />
          </div>
          <div className="filter-date-options">
            {DATE_OPTIONS.map((date, index) => (
              <span
                key={index}
                style={hovered === index || value === date ? customStyle : null}
                onMouseEnter={() => MouseEnter(index)}
                onMouseLeave={MouseLeave}
                onClick={(e) => handleChange(date, e)}
              >
                {date}
              </span>
            ))}
            <div>
              <Popover
                id={"date-popover"}
                open={openCustom}
                anchorEl={anchorElCustom}
                onClose={handleCloseCustom}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "center",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
              >
                <div className="filter-date-options-custom">
                  {CUSTOM_OPTIONS.map((option, index) => (
                    <span
                      key={index}
                      style={
                        hoveredCustom === index || customValue === option.value
                          ? customStyle
                          : null
                      }
                      onMouseEnter={() => MouseEnterCustom(index)}
                      onMouseLeave={MouseLeaveCustom}
                      onClick={() => handleDateFilterChange(option.value)}
                    >
                      {option.label}
                    </span>
                  ))}
                </div>
              </Popover>
            </div>
            <div
              className="filter-date-custom"
              style={
                value === "Custom" && anchorElCustom === null && customValue
                  ? {
                      display: "block",
                      padding: customValue === "year" ? "6px 12px" : null,
                    }
                  : {
                      display: "none",
                    }
              }
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                {customValue === "year" ? (
                  <DatePicker
                    views={["year"]}
                    value={dateValue[0]}
                    maxDate={currentYear}
                    minDate={minYear}
                    autoFocus={false}
                    onChange={(newValue) => handleCustomDate(newValue)}
                    disableFuture
                    disableHighlightToday
                  />
                ) : (
                  <DemoContainer components={["SingleInputDateRangeField"]}>
                    <DateRangePicker
                      value={dateValue}
                      onChange={(newValue) => handleDate(newValue)}
                      slots={{ field: SingleInputDateRangeField }}
                      name="allowedRange"
                      disableFuture
                      currentMonthCalendarPosition={2}
                      maxDate={maxDate}
                    />
                  </DemoContainer>
                )}
              </LocalizationProvider>
            </div>
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
              validation={value && dateValue[1]}
              color={color}
            />
          </div>
        </div>
      </Popover>
    </div>
  );
}
