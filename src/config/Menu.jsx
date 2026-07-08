import React from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import StoreIcon from "@mui/icons-material/Store";
import ListIcon from "@mui/icons-material/List";
import PeopleIcon from "@mui/icons-material/People";
import BarChartIcon from "@mui/icons-material/BarChart";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import InventoryIcon from "@mui/icons-material/Inventory";
import MedicationIcon from "@mui/icons-material/Medication";
import ScienceIcon from "@mui/icons-material/Science";
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

  // Hotel Admin
  {
    key: "hotel-dashboard",
    title: "Dashboard",
    icon: <DashboardIcon />,
    permissions: ["Hotel Admin"],
    path: "/dashboard/hotel-admin",
  },
  {
    key: "menu-management",
    title: "Menu Management",
    icon: <StoreIcon />,
    permissions: ["Hotel Admin"],
    path: "/menu-management",
  },
  {
    key: "ingredients",
    title: "Ingredient Management",
    icon: <StoreIcon />,
    permissions: ["Hotel Admin"],
    path: "/products/ingredient-management",
  },
  {
    key: "inventory",
    title: "Inventory",
    icon: <StoreIcon />,
    permissions: ["Hotel Admin"],
    path: "/inventory",
  },
  {
    key: "hotel-users",
    title: "User Management",
    icon: <PeopleIcon />,
    permissions: ["Hotel Admin"],
    path: "/staff",
  },
  {
    key: "staff-payment",
    title: "Staff Payments",
    icon: <PeopleIcon />,
    permissions: ["Hotel Admin"],
    path: "/staffpayment",
  },
  {
    key: "hotel-orders",
    title: "All Orders",
    icon: <ListIcon />,
    permissions: ["Hotel Admin"],
    path: "/orders/hotel",
  },
  {
    key: "hotel-kitchen",
    title: "Kitchen Display",
    icon: <RestaurantIcon />,
    permissions: ["Hotel Admin"],
    path: "/hotel/kitchen",
  },
  {
    key: "expenses",
    title: "Expenses",
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
  },
  {
    key: "complete-order",
    title: "Process Payments",
    icon: <ListIcon />,
    permissions: ["Cashier"],
    path: "/orders/complete",
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
  {
    key: "doctor-appointments",
    title: "Appointments",
    icon: <ListIcon />,
    permissions: ["Doctor"],
    path: "/doctor/appointments",
  },

  // Nurse
  {
    key: "nurse-dashboard",
    title: "Dashboard",
    icon: <DashboardIcon />,
    permissions: ["Nurse"],
    path: "/dashboard/nurse",
  },
  {
    key: "nurse-patients",
    title: "Patient Care",
    icon: <LocalHospitalIcon />,
    permissions: ["Nurse"],
    path: "/nurse/patients",
  },
  {
    key: "nurse-vitals",
    title: "Vitals",
    icon: <InventoryIcon />,
    permissions: ["Nurse"],
    path: "/nurse/vitals",
  },

  // Pharmacist
  {
    key: "pharmacist-dashboard",
    title: "Dashboard",
    icon: <DashboardIcon />,
    permissions: ["Pharmacist"],
    path: "/dashboard/pharmacist",
  },
  {
    key: "pharmacist-inventory",
    title: "Inventory",
    icon: <MedicationIcon />,
    permissions: ["Pharmacist"],
    path: "/pharmacist/inventory",
  },
  {
    key: "pharmacist-dispense",
    title: "Dispense Drugs",
    icon: <StoreIcon />,
    permissions: ["Pharmacist"],
    path: "/pharmacist/dispense",
  },

  // Lab Technician
  {
    key: "labtech-dashboard",
    title: "Dashboard",
    icon: <DashboardIcon />,
    permissions: ["Lab Technician"],
    path: "/dashboard/labtech",
  },
  {
    key: "labtech-tests",
    title: "Tests",
    icon: <ScienceIcon />,
    permissions: ["Lab Technician"],
    path: "/labtech/tests",
  },
  {
    key: "labtech-results",
    title: "Results",
    icon: <BarChartIcon />,
    permissions: ["Lab Technician"],
    path: "/labtech/results",
  },
];