import React from "react";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "../theme/ThemeContext";
import { hexWithAlpha } from "../../utilities/Sharedfunctions.jsx";

const Modal = ({ isOpen, onClose, title, children }) => {
  const theme = useTheme();
  const PrimaryColor = theme.primaryColor || "#edb211ff";

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backdropFilter: "blur(2px)",
        backgroundColor: "rgba(92, 91, 91, 0.1)",
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full" style={{
        maxHeight: "calc(100vh - 2rem)", 
        display: "flex",
        flexDirection: "column"
      }}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <IconButton
            onClick={onClose}
            size="small"
            aria-label="Close"
            sx={{
              backgroundColor: hexWithAlpha(PrimaryColor, 0.08),
              color: PrimaryColor,
              borderRadius: "50%",
              // && doubles specificity so this beats MUI's own hover rule —
              // otherwise only the white icon applies and the × vanishes.
              "&&:hover": {
                backgroundColor: PrimaryColor,
                color: "#fff",
              },
              padding: "3px",
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
        <div className="p-4 overflow-y-auto" style={{
          flex: 1,
          maxHeight: "calc(100vh - 10rem)" // Allows content area to scroll if needed
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;