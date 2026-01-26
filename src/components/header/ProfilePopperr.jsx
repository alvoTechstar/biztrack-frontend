import React, { useState } from "react";
import { Popover } from "@mui/material";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useTheme } from "../theme/ThemeContext";

export default function ProfilePopper({
  anchorEl,
  handleClose,
  handleLogout,
  handleOpenProfile,
}) {
  const [hovered, setHovered] = useState(-1);
  const open = Boolean(anchorEl);
  const { primaryColor } = useTheme();

  const defaultTextColor = "text-gray-700"; // Tailwind text color
  const defaultIconColor = "#4B5563"; // Tailwind text-gray-600

  const POPPER_ITEMS = [
    {
      key: "myProfile",
      title: "My Profile",
      icon: <PersonOutlinedIcon fontSize="small" />,
      action: () => {
        handleClose();
        handleOpenProfile();
      },
    },
    {
      key: "logout",
      title: "Logout",
      icon: <LogoutRoundedIcon fontSize="small" />,
      action: () => {
        handleClose();
        handleLogout();
      },
    },
  ];

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      transformOrigin={{ vertical: "top", horizontal: "center" }}
      PaperProps={{
        className: "rounded-lg shadow-lg w-48 mt-3",
      }}
    >
      <div className="flex flex-col py-2">
        {POPPER_ITEMS.map((item, index) => {
          const isHovered = hovered === index;

          return (
            <button
              key={item.key}
              onClick={item.action}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(-1)}
              className={`flex items-center px-4 py-2 text-sm w-full text-left transition ${
                isHovered ? "text-white" : defaultTextColor
              }`}
              style={{
                backgroundColor: isHovered
                  ? `${primaryColor}CC`
                  : "transparent",
              }}
            >
              <span
                className="mr-3"
                style={{
                  color: isHovered ? "#fff" : defaultIconColor,
                }}
              >
                {item.icon}
              </span>
              {item.title}
            </button>
          );
        })}
      </div>
    </Popover>
  );
}
