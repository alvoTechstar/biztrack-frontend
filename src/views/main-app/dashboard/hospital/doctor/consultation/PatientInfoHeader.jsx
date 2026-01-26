import React from "react";
import { AppBar, Toolbar, Typography, Chip } from "@mui/material";
import {
  CheckCircleOutline,
  Science,
  LocalHospital,
  DoneAll,
} from "@mui/icons-material";
import { useTheme } from "../../../../../../components/theme/ThemeContext";
const PatientInfoHeader = ({ patientInfo }) => {
  const { PrimaryColor } = useTheme(); // Access your custom primary color

  const getStatusChipProps = (status) => {
    switch (status) {
      case "Active Consultation":
        return {
          label: "Active Consultation",
          chipColor: "success",
          icon: <CheckCircleOutline />,
          sx: { bgcolor: PrimaryColor + "1A", color: PrimaryColor }, // A light tint of PrimaryColor, text is PrimaryColor
        };
      case "Awaiting Lab Results":
        return {
          label: "Awaiting Lab Results",
          chipColor: "warning",
          icon: <Science />,
          sx: { bgcolor: "#FFC107", color: "#333" }, // Bright yellow for warning, dark text
        };
      case "Referred to Nurse":
        return {
          label: "Referred to Nurse",
          chipColor: "info",
          icon: <LocalHospital />,
          sx: { bgcolor: "#2196F3", color: "#FFF" }, // Blue for info, white text
        };
      case "Consultation Completed":
        return {
          label: "Completed", // Shorter label for completion
          chipColor: "primary",
          icon: <DoneAll />,
          sx: { bgcolor: PrimaryColor, color: "#FFF" }, // Solid PrimaryColor for completed, white text
        };
      default:
        return {
          label: status,
          chipColor: "default",
          icon: null,
          sx: { bgcolor: "#E0E0E0", color: "#424242" }, // Grey for default, dark grey text
        };
    }
  };

  const { label, chipColor, icon, sx } = getStatusChipProps(
    patientInfo.consultationStatus
  );

  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: "white", // White background for the AppBar
        boxShadow: 3, // Using MUI's shadow system
      }}
    >
      <Toolbar
        sx={{
          flexDirection: { xs: "column", sm: "row" }, // Responsive flex direction
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          py: 2,
          px: 4,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "text.primary", // Use MUI's default text color for consistency
            fontWeight: "semibold",
            mb: { xs: 2, sm: 0 }, // Responsive margin bottom
          }}
        >
          {patientInfo.name} ({patientInfo.age} / {patientInfo.gender}) - Queue:{" "}
          {patientInfo.queueNumber}
        </Typography>
        <Chip
          label={label}
          icon={icon}
          color={chipColor} // This prop can still be used for semantic styling if your theme uses it
          sx={{
            ...sx, // Apply the custom background and text color from getStatusChipProps
            "& .MuiChip-icon": { color: "inherit !important" }, // Ensure icon color matches chip text
            fontWeight: "medium",
          }}
        />
      </Toolbar>
    </AppBar>
  );
};

export default PatientInfoHeader;
