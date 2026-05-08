import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Box,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "../../../../../components/theme/ThemeContext";

const ViewQueueModal = ({ open, onClose, data }) => {
  const theme = useTheme();
  const PrimaryColor = theme.primaryColor;
  if (!data) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <div className="grid grid-cols-2 items-center">
          <span className="text-lg font-semibold text-gray-800">
            Patient Queue Details
          </span>
          <div className="flex justify-end">
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                backgroundColor: PrimaryColor,
                color: "white",
                borderRadius: "50%",
                "&:hover": {
                  backgroundColor: PrimaryColor,
                  opacity: 0.9,
                },
                padding: "3px",
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        </div>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Box className="space-y-4 py-3 px-1">
          <div className="grid grid-cols-2 gap-4 items-center">
            <span className="text-sm font-medium text-gray-600 text-right">
              Queue ID:
            </span>
            <span className="text-sm text-gray-900 text-left">
              {data.queueId}
            </span>

            <span className="text-sm font-medium text-gray-600 text-right">
              Patient Name:
            </span>
            <span className="text-sm text-gray-900 text-left">
              {data.patientName}
            </span>

            <span className="text-sm font-medium text-gray-600 text-right">
              Service:
            </span>
            <span className="text-sm text-gray-900 text-left">
              {data.service}
            </span>

            <span className="text-sm font-medium text-gray-600 text-right">
              Status:
            </span>
            <span className="text-sm capitalize text-gray-900 text-left">
              {data.status}
            </span>

            <span className="text-sm font-medium text-gray-600 text-right">
              Time Added:
            </span>
            <span className="text-sm text-gray-900 text-left">
              {formatFullTimestamp(data.timeAdded)}
            </span>
          </div>
        </Box>
      </DialogContent>
      <Divider />
    </Dialog>
  );
};

// Helper function to format date
const formatFullTimestamp = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

export default ViewQueueModal;
