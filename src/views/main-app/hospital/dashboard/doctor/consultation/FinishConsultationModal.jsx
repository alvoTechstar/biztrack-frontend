import React from "react";
import { Modal, Box, Typography } from "@mui/material";

// Import your custom AppFormButton component
// Verify this path is correct for your project
import AppFormButton from "../../../../../../components/buttons/AppFormButton";

// Import useTheme to get the primary color for the "Finish" button
import { useTheme } from "../../../../../../components/theme/ThemeContext";

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

const FinishConsultationModal = ({
  open,
  onClose,
  message,
  onConfirm,
  hasPendingLabs,
  // If the modal itself can be in a loading state or have validation that
  // disables its buttons, you'd pass isLoading and validation down here.
  // For now, assuming buttons are always clickable within the open modal.
}) => {
  // Access the primaryColor from your theme context to pass to AppFormButton
  const { primaryColor } = useTheme();

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="finish-consultation-modal-title"
      aria-describedby="finish-consultation-modal-description"
    >
      <Box sx={modalStyle}>
        <Typography
          id="finish-consultation-modal-title"
          variant="h6"
          component="h2"
          className="mb-4 text-gray-800 font-bold"
        >
          Confirm Consultation Completion
        </Typography>
        <Typography
          id="finish-consultation-modal-description"
          // Apply Tailwind classes for color and font-weight
          className="font-medium" // Added font-medium class
          sx={{ mt: 2, color: "#4B5563" }} // Direct hex for Tailwind's text-gray-600, or remove sx if Tailwind handles all styling
        >
          {message}
        </Typography>
        {/* Box to align buttons to the right and add spacing */}
        <Box className="flex justify-end gap-3 mt-6">
          {/* Cancel Button - uses "invert" color for outlined style */}
          <AppFormButton
            text="Cancel"
            action={onClose} // Maps to the `action` prop in your AppFormButton
            color="invert" // This will apply the white background, text-gray-800, and border
            validation={true} // Cancel button should always be enabled
            // No isLoading for cancel button, assuming it's instantly responsive
          />

          {/* Finish Button - uses primaryColor for the background */}
          <AppFormButton
            text={hasPendingLabs ? "Confirm Pending & Finish" : "Finish"}
            action={onConfirm} // Maps to the `action` prop in your AppFormButton
            color={primaryColor} // Pass your theme's primary color for the background
            validation={true} // Finish button should be enabled by default in this modal
            // No isLoading prop is passed to this modal, so AppFormButton's isLoading will be undefined (falsy)
          />
        </Box>
      </Box>
    </Modal>
  );
};

export default FinishConsultationModal;
