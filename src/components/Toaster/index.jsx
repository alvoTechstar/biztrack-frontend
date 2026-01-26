import React from "react";
import Snackbar from "@mui/material/Snackbar";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";

export default function Toaster({
  open,
  state,
  title,
  message,
  action,
  position,
}) {
  const vertical = "top";
  const horizontal = position || "right";

  const baseStyles =
    "flex items-center bg-white border border-[#e1e6ed] shadow-lg rounded p-3 w-full max-w-sm";
  const successStyles = "border-l-[5px] border-l-[#519e47]";
  const errorStyles = "border-l-[5px] border-l-[#dc4437]";
  const warningStyles = "bg-[#fef6cf] border border-[#fded94] border-l-[5px] border-l-[#ec9b40]";

  const iconStyles = "w-4 h-4 mr-3";
  const titleStyles = "block font-bold text-sm leading-5 text-[#353f50] font-[Averta-Bolder]";
  const messageStyles = "block text-sm leading-5 text-[#353f50] font-[Averta-Bold]";
  const warningTextStyles = "text-[#6b2b0d]";

  const getToasterStyles = () => {
    if (state === "true") return `${baseStyles} ${successStyles}`;
    if (state === "false") return `${baseStyles} ${errorStyles}`;
    return `${baseStyles} ${warningStyles}`;
  };

  const getTextColor = () => {
    return state ? "" : warningTextStyles;
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      anchorOrigin={{ vertical, horizontal }}
      onClose={() => action(false)}
      key={vertical + horizontal}
    >
      <div className={getToasterStyles()}>
        {state === "true" ? (
          <CheckCircleRoundedIcon className={iconStyles} color="success" />
        ) : state === "false" ? (
          <ErrorRoundedIcon className={iconStyles} color="error" />
        ) : null}
        <div className="w-[90%] break-words">
          <span className={`${titleStyles} ${getTextColor()}`}>{title}</span>
          <span className={`${messageStyles} ${getTextColor()}`}>{message}</span>
        </div>
      </div>
    </Snackbar>
  );
}
