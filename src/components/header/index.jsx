import React, { useState } from "react";
import { Menu, Bell } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";
import ProfilePopper from "./ProfilePopperr";
import { useTheme } from "../theme/ThemeContext";
import { authActions } from "../../store";

export default function Topbar({ toggleSidebar, openProfile }) {
  const user = useSelector((state) => state.auth.value);
  const dispatch = useDispatch();

  const { logoUrl, primaryColor } = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem("user");
    Cookies.remove("user");
    dispatch(authActions.logout());
  };

  // Get user's full name from first and last name
  const getUserFullName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.name || "User";
  };

  // Get user's initials from first and last name
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user?.name) {
      const nameParts = user.name.split(' ').filter(Boolean);
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
      }
      return user.name.charAt(0).toUpperCase();
    }
    return "NA";
  };

  // Format role for display
  const formatRole = (role) => {
    if (!role) return "User";
    return role.replace(/[-_]/g, " ");
  };

  // Get business name from user data
  const businessName = user?.businessName || user?.organization || "My Business";
  const businessType = user?.businessType || user?.organizationType || "";

  // Get user's role
  const userRole = formatRole(user?.role);

  return (
    <header
      className="shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10"
      style={{ backgroundColor: primaryColor || "#6f42c1" }}
    >
      <div className="flex items-center gap-3">
        <button className="mr-1 text-white lg:hidden" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>

        {/* Simple Business Name | Business Type on LEFT */}
        <div className="flex items-center text-white">
          {/* Business Name */}
          <span className="font-semibold text-base">
            {businessName}
          </span>

          {/* Separator and Business Type (only if businessType exists) */}
          {businessType && (
            <>
              <span className="mx-2 font-bold">|</span>
              <span className="text-sm opacity-90">
                {businessType}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-1 text-white hover:bg-opacity-80 rounded-full transition">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            3
          </span>
        </button>

        <div
          className="flex items-center space-x-2 cursor-pointer px-2 py-1 rounded hover:bg-opacity-80 transition"
          onClick={handleClick}
        >
          <div
            className="text-white rounded-full h-7 w-7 flex items-center justify-center text-sm font-semibold"
            style={{
              backgroundColor: primaryColor
                ? `color-mix(in srgb, ${primaryColor} 50%, white)`
                : "#6f42c1",
            }}
          >
            {getInitials()}
          </div>
          <div className="hidden md:inline text-xs text-white">
            <span className="font-semibold">Hi, {getUserFullName()}</span>
            <br />
            <span className="text-xs font-medium">{userRole}</span>
          </div>
        </div>

        <ProfilePopper
          anchorEl={anchorEl}
          handleClose={handleClose}
          handleLogout={handleLogout}
          handleOpenProfile={openProfile}
        />
      </div>
    </header>
  );
}