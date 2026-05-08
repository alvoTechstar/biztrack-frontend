// src/components/Header.jsx

import React from "react";
import { Box, Typography, Button } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useTheme } from "../../../../../components/theme/ThemeContext";

const ReceptionHeader = ({ currentDate, onTogglePanel }) => {
  const theme = useTheme();
  const PrimaryColor = theme.primaryColor;
  return (
    <Box className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-center">
      {/* Left: Date heading */}
      <Box className="md:col-span-2">
        <span className="text-gray-700 font-semibold text-xl md:text-md">
          Showing queue for {currentDate}
        </span>
      </Box>

      {/* Right: Button */}
      <Box className="md:col-span-1 flex justify-start md:justify-end">
        <Button
          startIcon={<PersonAddIcon />}
          onClick={onTogglePanel}
          sx={{
            textTransform: "none",
            backgroundColor: `${PrimaryColor} !important`,
            color: "white !important",
            "&:hover": {
              backgroundColor: `${PrimaryColor} !important`,
              opacity: 0.9,
            },
          }}
        >
          New Queue Entry
        </Button>{" "}
      </Box>
    </Box>
  );
};

export default ReceptionHeader;
