import React from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import PublishRoundedIcon from "@mui/icons-material/PublishRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import "./buttons.css";

export default function AddButton({ text, color, action }) {
  return (
    <div
      className={color === "invert" ? "add-button cancel" : "add-button"}
      style={color !== "invert" ? { backgroundColor: color } : null}
      onClick={action}
    >
      {text.includes("Export") ? (
        <PublishRoundedIcon />
      ) : color === "invert" ? (
        <PaymentsRoundedIcon />
      ) : (
        <AddRoundedIcon />
      )}
      <span>{text}</span>
    </div>
  );
}
