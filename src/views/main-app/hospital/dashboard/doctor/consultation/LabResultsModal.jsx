import React from "react";
import { Modal, Box, Typography } from "@mui/material";

import TextInput from "../../../../../../components/Input/TextInput";
import SelectInput from "../../../../../../components/Input/SelectInput";
import AppFormButton from "../../../../../../components/buttons/AppFormButton";
import { useTheme } from "../../../../../../components/theme/ThemeContext";
import TextBoxInput from "../../../../../../components/Input/TextBoxInput";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", md: 600 },
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const statusOptions = [
  { value: "normal", label: "Normal" },
  { value: "abnormal", label: "Abnormal" },
];

const LabResultModal = ({
  open,
  onClose,
  currentLabTestName,
  labResultValue,
  setLabResultValue,
  labResultUnit,
  setLabResultUnit,
  labResultStatus,
  setLabResultStatus,
  labResultNotes,
  setLabResultNotes,
  onSubmit,
}) => {
  const { primaryColor } = useTheme();

  // The submit button is valid if value, unit, and status all have truthy values.
  const isSubmitValid =
    !!labResultValue && !!labResultUnit && !!labResultStatus;

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="lab-result-modal-title"
      aria-describedby="lab-result-modal-description"
    >
      <Box sx={modalStyle}>
        <Typography
          id="lab-result-modal-title"
          variant="h6"
          component="h2"
          className="mb-4 text-gray-800 font-bold"
        >
          Submit Result for: {currentLabTestName}
        </Typography>

        <TextInput
          label="Value"
          placeholder="Enter result value"
          value={labResultValue}
          onChange={(e) => setLabResultValue(e.target.value)}
          required // Mark as required for validation visibility if TextInput supports it
        />

        <TextInput
          label="Unit"
          placeholder="Enter unit (e.g., mg/dL)"
          value={labResultUnit}
          onChange={(e) => setLabResultUnit(e.target.value)}
          required // Mark as required
        />

        <SelectInput
          label="Status"
          placeholder="Select status" // Placeholder for SelectInput
          options={statusOptions}
          value={labResultStatus}
          onChange={(e) => setLabResultStatus(e.target.value)}
          required // Mark as required
        />

        <TextBoxInput
          label="Notes"
          placeholder="Add any additional notes"
          input={labResultNotes}
          handleInput={(e) => setLabResultNotes(e.target.value)}
        />

        <Box className="flex justify-between gap-3 mt-6">
          <AppFormButton
            text="Cancel"
            action={onClose}
            color="invert"
            validation={true}
          />
          <AppFormButton
            text="Submit Result"
            action={onSubmit}
            color={primaryColor}
            validation={isSubmitValid}
          />
        </Box>
      </Box>
    </Modal>
  );
};

export default LabResultModal;
