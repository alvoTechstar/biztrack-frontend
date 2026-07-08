import React from "react";
import { useTheme } from "../theme/ThemeContext";

const NaviButton = ({ text, action, alignment = "left" }) => {
  const { primaryColor } = useTheme(); // Access primaryColor from the theme context

  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };


  const buttonTextStyle = {
    color: primaryColor || "#353f50", 
  };

  return (
    <div className={`${alignmentClasses[alignment]} w-full`}>
      <button
        type="button"
        onClick={action}
        className="text-[14px] leading-4 font-bold"
        style={buttonTextStyle}
      >
        {text}
      </button>
    </div>
  );
};

export default NaviButton;