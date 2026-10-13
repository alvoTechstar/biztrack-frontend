import React from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import StoreIcon from "@mui/icons-material/Store";
import ListIcon from "@mui/icons-material/List";
import PeopleIcon from "@mui/icons-material/People";
import BarChartIcon from "@mui/icons-material/BarChart";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";

export const MENU = [
  // Super Admin
  {
    key: "dashboard",
    title: "Dashboard",
    icon: <DashboardIcon />,
    permissions: ["Super Admin"],
    path: "/dashboard/super-admin",
  },
  {
    key: "business",
    title: "Businesses",
    icon: <PeopleIcon />,
    permissions: ["Super Admin"],
    path: "/businesses",
  },
  {
    key: "users",
    title: "User Management",
    icon: <PeopleIcon />,
    permissions: ["Super Admin"],
    path: "/user-management",
  },
  {
    key: "reports",
    title: "Reports",
    icon: <BarChartIcon />,
    permissions: ["Super Admin"],
    path: "/reports",
  },

  // Hotel Admin — menu lives with the Kitchen Admin now
  {
    key: "hotel-dashboard",
    title: "Dashboard",
    icon: <DashboardIcon />,
    permissions: ["Hotel Admin"],
    path: "/dashboard/hotel-admin",
  },
  {
    key: "hotel-users",
    title: "User Management",
    icon: <PeopleIcon />,
    permissions: ["Hotel Admin"],
    path: "/staff",
  },
  {
    key: "hotel-transactions",
    title: "Transactions",
    icon: <ListIcon />,
    permissions: ["Hotel Admin"],
    path: "/transactions/hotel",
  },
  {
    key: "expenses",
    title: "Expenses & Payouts",
    icon: <AccountBalanceWalletIcon />,
    permissions: ["Hotel Admin"],
    path: "/hotel/expenses",
  },
  {
    key: "hotel-reports",
    title: "Reports",
    icon: <BarChartIcon />,
    permissions: ["Hotel Admin"],
    path: "/hotel/reports",
  },

  // Cashier
  {
    key: "cashier-dashboard",
    title: "Dashboard",
    icon: <DashboardIcon />,
    permissions: ["Cashier"],
    path: "/dashboard/cashier",
  },  {
    key: "complete-order",
    title: "Process Payments",
    icon: <ListIcon />,
    permissions: ["Cashier"],
    path: "/orders/complete",
  },
  {
    key: "cashier-transactions",
    title: "Transactions",
    icon: <ListIcon />,
    permissions: ["Cashier"],
    path: "/transactions/hotel",
  },

  // Kitchen Admin — owns the menu and the kitchen queue
  {
    key: "kitchen-menu",
    title: "Menu Management",
    icon: <StoreIcon />,
    permissions: ["Kitchen Admin"],
    path: "/menu-management",
  },
  {
    key: "kitchen-ingredients",
    title: "Ingredient Management",
    icon: <StoreIcon />,
    permissions: ["Kitchen Admin"],
    path: "/products/ingredient-management",
  },
  {
    key: "kitchen-display",
    title: "Kitchen Display",
    icon: <RestaurantIcon />,
    permissions: ["Kitchen Admin"],
    path: "/hotel/kitchen",
  },

  // Waiter
  {
    key: "waiter-dashboard",
    title: "My Orders",
    icon: <DashboardIcon />,
    permissions: ["Waiter"],
    path: "/dashboard/waiter",
  },
  {
    key: "waiter-create-order",
    title: "New Order",
    icon: <ListIcon />,
    permissions: ["Waiter"],
    path: "/dashboard/create-order",
  },

  // Kiosk Admin
  {
    key: "kiosk-dashboard",
    title: "Dashboard",
    icon: <DashboardIcon />,
    permissions: ["Kiosk Admin"],
    path: "/dashboard/kiosk",
  },
  {
    key: "kiosk-stock",
    title: "Stock Management",
    icon: <StoreIcon />,
    permissions: ["Kiosk Admin"],
    path: "/products/stock-management",
  },
  {
    key: "kiosk-staff",
    title: "User Management",
    icon: <PeopleIcon />,
    permissions: ["Kiosk Admin"],
    path: "/kiosk/user-management",
  },
  {
    key: "kiosk-debts",
    title: "Kiosk Debts",
    icon: <AccountBalanceWalletIcon />,
    permissions: ["Kiosk Admin"],
    path: "/kiosk/debts",
  },
  {
    key: "kiosk-reports",
    title: "Reports",
    icon: <BarChartIcon />,
    permissions: ["Kiosk Admin"],
    path: "/kioskreports",
  },

  // Shopkeeper
  {
    key: "shopkeeper-sales",
    title: "Kiosk Sales",
    icon: <ListIcon />,
    permissions: ["Shopkeeper"],
    path: "/shopkeeper/sales",
  },
  {
    key: "shopkeeper-debts",
    title: "Kiosk Debts",
    icon: <AccountBalanceWalletIcon />,
    permissions: ["Shopkeeper"],
    path: "/shopkeeper/debts",
  },
  {
    key: "shopkeeper-reports",
    title: "Reports",
    icon: <BarChartIcon />,
    permissions: ["Shopkeeper"],
    path: "/shopkeeper/reports",
  },

  // Hospital Admin
  {
    key: "hospital-dashboard",
    title: "Dashboard",
    icon: <DashboardIcon />,
    permissions: ["Hospital Admin"],
    path: "/dashboard/hospital-admin",
  },
  {
    key: "hospital-patients",
    title: "Patients",
    icon: <LocalHospitalIcon />,
    permissions: ["Hospital Admin"],
    path: "/hospital/patients",
  },
  {
    key: "hospital-staff",
    title: "Staff Management",
    icon: <PeopleIcon />,
    permissions: ["Hospital Admin"],
    path: "/hospital/staff",
  },
  {
    key: "pharmacy-stock",
    title: "Pharmacy Stock",
    icon: <LocalPharmacyIcon />,
    permissions: ["Hospital Admin"],
    path: "/pharmacy/stock",
  },
  {
    key: "hospital-reports",
    title: "Reports",
    icon: <BarChartIcon />,
    permissions: ["Hospital Admin"],
    path: "/hospital/admin-reports",
  },

  // Receptionist
  {
    key: "receptionist-dashboard",
    title: "Reception Queue",
    icon: <DashboardIcon />,
    permissions: ["Receptionist"],
    path: "/patient/queue",
  },
  {
    key: "receptionist-patients",
    title: "Patient Records",
    icon: <LocalHospitalIcon />,
    permissions: ["Receptionist"],
    path: "/patient/records",
  },

  // Doctor
  {
    key: "doctor-dashboard",
    title: "Dashboard",
    icon: <DashboardIcon />,
    permissions: ["Doctor"],
    path: "/dashboard/doctor",
  },
  {
    key: "doctor-patients",
    title: "My Patients",
    icon: <LocalHospitalIcon />,
    permissions: ["Doctor"],
    path: "/doctor/patients",
  },

  // Nurse
  // Only a placeholder dashboard route exists for this role so far - no
  // /nurse/patients or /nurse/vitals page has been built yet. Add those menu
  // entries back once real routes exist for them.
  {
    key: "nurse-dashboard",
    title: "Dashboard",
    icon: <DashboardIcon />,
    permissions: ["Nurse"],
    path: "/dashboard/nurse",
  },

  // Pharmacist
  // Same as Nurse above - only the placeholder dashboard route exists.
  {
    key: "pharmacist-dashboard",
    title: "Dashboard",
    icon: <DashboardIcon />,
    permissions: ["Pharmacist"],
    path: "/dashboard/pharmacist",
  },

  // Lab Technician
  // Same as Nurse/Pharmacist above - only the placeholder dashboard route exists.
  {
    key: "labtech-dashboard",
    title: "Dashboard",
    icon: <DashboardIcon />,
    permissions: ["Lab Technician"],
    path: "/dashboard/labtechnician",
  },
];