import React, { useState } from "react";
import {
  Paper,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Collapse,
} from "@mui/material"; // Removed Modal and Box imports
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

import {
  SEARCH_BY_PHONE,
  SEARCH_BY_ID,
  STATUS_OPTIONS,
  VISIT_TYPES_QUEUE,
} from "./Constants";

import TextInput from "../../../../../components/Input/TextInput";
import AppFormButton from "../../../../../components/buttons/AppFormButton";
import SelectInput from "../../../../../components/Input/SelectInput";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import NaviButton from "../../../../../components/buttons/Navibutton";

import { useTheme } from "../../../../../components/theme/ThemeContext";

// Define UI states
const UI_STATE = {
  SEARCH: "search",
  RESULTS: "results",
  NOT_FOUND: "notFound",
};

const NewQueue = ({
  isOpen,
  onClose,
  patients, // This prop should ideally always be an array, even if empty
  queue,
  onAddExistingPatientToQueue,
  onOpenRegisterModal,
}) => {
  const [searchType, setSearchType] = useState(SEARCH_BY_PHONE);
  const [searchValue, setSearchValue] = useState("");
  const [foundPatient, setFoundPatient] = useState(null);
  const [errorPanelMessage, setErrorPanelMessage] = useState("");
  const [selectedVisitTypePanel, setSelectedVisitTypePanel] = useState(
    VISIT_TYPES_QUEUE[0]
  );
  const [uiState, setUiState] = useState(UI_STATE.SEARCH);

  const theme = useTheme();
  const PrimaryColor = theme.primaryColor;

  const handleSearchPatient = () => {
    setErrorPanelMessage("");
    setFoundPatient(null);
    setUiState(UI_STATE.SEARCH);

    if (!searchValue.trim()) {
      setErrorPanelMessage("Please enter a search value.");
      return;
    }

    if (!Array.isArray(patients)) {
      console.error(
        "NewQueue: 'patients' prop is not an array or is null/undefined. Received:",
        patients
      );
      setErrorPanelMessage(
        "An internal error occurred. Patient data is currently unavailable."
      );
      return;
    }

    const patient = patients.find((p) =>
      searchType === SEARCH_BY_PHONE
        ? p.phoneNumber === searchValue.trim()
        : p.nationalId === searchValue.trim()
    );

    if (patient) {
      const inActiveQueue = queue.find(
        (q) =>
          q.patientId === patient.id &&
          q.status !== STATUS_OPTIONS.DONE &&
          q.status !== STATUS_OPTIONS.CANCELLED
      );
      if (inActiveQueue) {
        setErrorPanelMessage(
          `Patient ${patient.fullName} is already in the queue (Status: ${inActiveQueue.status}).`
        );
        setFoundPatient(null);
        setUiState(UI_STATE.SEARCH);
        return;
      }
      setFoundPatient(patient);
      setUiState(UI_STATE.RESULTS);
    } else {
      setUiState(UI_STATE.NOT_FOUND);
    }
  };

  const handleAddPatient = () => {
    if (foundPatient && selectedVisitTypePanel) {
      onAddExistingPatientToQueue(foundPatient, selectedVisitTypePanel);
      resetPanelState();
    }
  };

  const resetPanelState = () => {
    setSearchValue("");
    setFoundPatient(null);
    setSelectedVisitTypePanel(VISIT_TYPES_QUEUE[0]);
    setErrorPanelMessage("");
    setUiState(UI_STATE.SEARCH);
    onClose();
  };

  const getAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return "N/A";

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    return age;
  };

  // Only render if isOpen is true
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50">
      <Paper
        elevation={4}
        className="p-4 md:p-6 mb-6 relative z-10 w-full md:max-w-2xl bg-white rounded-lg shadow-xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Add Patient to Queue</h2>
          <div className="flex items-end">
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                backgroundColor: PrimaryColor, // Set the background color to your theme's primary color
                color: "white", // Set the icon (text) color to white
                borderRadius: "50%", // Make it perfectly circular
                "&:hover": {
                  backgroundColor: PrimaryColor, // Keep background color on hover
                  opacity: 0.9, // Slightly dim on hover for visual feedback
                },
                // Optional: Add padding if the icon looks too small in the circle
                padding: "3px", // Adjust as needed, 'size="small"' default padding is often 5px
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center" />
          <div className="flex justify-end mr-16">
            <NaviButton
              text="Add New Patient"
              action={() => {
                onClose();
                onOpenRegisterModal();
              }}
              color={PrimaryColor}
              size="small"
              validation={true}
              isLoading={false}
            />
          </div>
        </div>

        {errorPanelMessage && (
          <Alert severity="error" className="mb-4">
            {errorPanelMessage}
          </Alert>
        )}

        {/* Search UI */}
        <Collapse in={uiState === UI_STATE.SEARCH}>
          <div className="flex flex-col gap-4">
            <RadioGroup
              row
              value={searchType}
              onChange={(e) => {
                setSearchType(e.target.value);
                setSearchValue("");
                setFoundPatient(null);
                setErrorPanelMessage("");
              }}
            >
              <FormControlLabel
                value={SEARCH_BY_PHONE}
                control={
                  <Radio
                    sx={{
                      "&.Mui-checked": {
                        // Style when the radio button is checked
                        color: PrimaryColor,
                      },
                    }}
                  />
                }
                label="Phone Number"
              />
              <FormControlLabel
                value={SEARCH_BY_ID}
                control={
                  <Radio
                    sx={{
                      "&.Mui-checked": {
                        // Style when the radio button is checked
                        color: PrimaryColor,
                      },
                    }}
                  />
                }
                label="National ID"
              />
            </RadioGroup>
            <TextInput
              label={`Enter ${searchType}`}
              placeholder="Enter value here"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              size="small"
            />
            <AppFormButton
              text="Search"
              color={PrimaryColor}
              icon={<SearchIcon />}
              action={handleSearchPatient}
              validation={!!searchValue}
              isLoading={false}
            />
          </div>
        </Collapse>

        {/* Results UI */}
        <Collapse in={uiState === UI_STATE.RESULTS}>
          {foundPatient && (
            <div className="mt-6 bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-6 font-sans text-gray-700">
              <h3 className="text-xl font-semibold text-gray-800">
                Patient Found
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <span className="font-bold text-gray-600">Full Name:</span>{" "}
                  {foundPatient.fullName}
                </div>
                <div>
                  <span className="font-bold text-gray-600">Gender:</span>{" "}
                  {foundPatient.gender}
                </div>
                <div>
                  <span className="font-bold text-gray-600">Age:</span>{" "}
                  {getAge(foundPatient.dob)} yrs
                </div>
                <div>
                  <span className="font-bold text-gray-600">Phone:</span>{" "}
                  {foundPatient.phoneNumber}
                </div>
                <div>
                  <span className="font-bold text-gray-600">National ID:</span>{" "}
                  {foundPatient.nationalId}
                </div>
                <div>
                  <span className="font-bold text-gray-600">Address:</span>{" "}
                  {foundPatient.address || "N/A"}
                </div>
                <div className="sm:col-span-2">
                  <span className="font-bold text-gray-600">Insurance:</span>{" "}
                  {foundPatient.insuranceProvider || "Not provided"}
                </div>
              </div>

              <div className="w-full max-w-xs">
                <SelectInput
                  id="visit-type"
                  name="visitType"
                  label="Visit Type"
                  options={VISIT_TYPES_QUEUE.map((type) => ({
                    label: type,
                    value: type,
                  }))}
                  value={selectedVisitTypePanel}
                  onChange={(e) => setSelectedVisitTypePanel(e.target.value)}
                  required
                  error={false}
                  errorMessage=""
                  color={PrimaryColor}
                />
              </div>

              <div className="pt-2">
                <AppFormButton
                  text="Add to Queue"
                  color={PrimaryColor}
                  icon={null}
                  action={handleAddPatient}
                  validation={true}
                  isLoading={false}
                />
              </div>
            </div>
          )}
        </Collapse>

        {/* Patient Not Found UI */}
        <Collapse in={uiState === UI_STATE.NOT_FOUND}>
          <div className="mt-6 border border-red-500 bg-red-50 rounded-2xl p-6 text-center space-y-4 font-sans">
            <div className="flex justify-center">
              <ReportProblemOutlinedIcon
                className="text-red-500"
                style={{ fontSize: "3rem" }}
              />
            </div>
            <h3 className="text-lg font-semibold text-red-700">
              Oops! No patient found
            </h3>
            <p className="text-sm text-red-600">
              We couldn't locate any patient with the details you provided. You
              can register them below.
            </p>
            <div className="flex justify-center">
              <AppFormButton
                text="Register New Patient"
                color="#ef4444"
                icon={null}
                action={() => {
                  onClose();
                  onOpenRegisterModal();
                }}
                validation={true}
                isLoading={false}
              />
            </div>
          </div>
        </Collapse>
      </Paper>
    </div>
  );
};

export default NewQueue;
