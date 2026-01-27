import React, { useMemo, useEffect } from "react";
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
  // Add role variants from your routes
  "hotel-cashier": "hotel-cashier",
  "hotel-waiter": "hotel-waiter",
  "kiosk-shopkeeper": "kiosk-shopkeeper",
  "hospital-receptionist": "hospital-receptionist",
  "hospital-doctor": "hospital-doctor",
  "hospital-nurse": "hospital-nurse",
  "hospital-pharmacist": "hospital-pharmacist",
  "hospital-labtechnician": "hospital-labtechnician",
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

  // Debug logging (remove in production)
  useEffect(() => {
    console.log("AppRoutes Debug:", {
      hasUser: !!user,
      userRole,
      userRawRole: user?.role || user?._doc?.role,
      allowedRoles,
      path: window.location.pathname
    });
  }, [user, userRole, allowedRoles]);

  // Early returns for performance
  if (!user || !userRole) {
    return <Navigate to="/login" replace />;
  }

  // If no roles specified, allow access
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check authorization
  const isAllowed = allowedRoles.includes(userRole);

  if (!isAllowed) {
    console.warn(`Access denied. User role: ${userRole}, Allowed roles: ${allowedRoles.join(", ")}`);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default AppRoutes;