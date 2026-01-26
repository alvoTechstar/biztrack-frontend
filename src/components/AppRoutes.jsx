import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// Role mapping cache - computed once
const ROLE_MAP = {
  "Kiosk_Admin": "kiosk-admin",
  "Hotel_Admin": "hotel-admin",
  "Hospital_Admin": "hospital-admin",
  "Super_Admin": "biztrack-admin",
  "KIOSK_ADMIN": "kiosk-admin",
  "HOTEL_ADMIN": "hotel-admin",
  "HOSPITAL_ADMIN": "hospital-admin",
  "SUPER_ADMIN": "biztrack-admin",
  "kiosk-admin": "kiosk-admin",
  "hotel-admin": "hotel-admin",
  "hospital-admin": "hospital-admin",
  "biztrack-admin": "biztrack-admin",
};

const AppRoutes = ({ children, allowedRoles = [] }) => {
  const user = useSelector((state) => state.auth.value);

  // Memoize role conversion to avoid recalculations
  const userRole = useMemo(() => {
    if (!user) return null;

    const role = user._doc?.role || user.role;
    if (!role) return null;

    return ROLE_MAP[role] || role.toLowerCase().replace(/_/g, "-");
  }, [user]);

  // Early returns for performance
  if (!user) return <Navigate to="/" replace />;
  if (!userRole) return <Navigate to="/" replace />;
  if (allowedRoles.length === 0) return children;

  // Check authorization
  const isAllowed = allowedRoles.includes(userRole);

  return isAllowed ? children : <Navigate to="/unauthorized" replace />;
};

export default AppRoutes;