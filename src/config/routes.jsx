// src/config/routes.js
import React from "react";
import Login from "../views/sign-in/Login";
import ForgotPassword from "../views/sign-in/ForgotPassword";
import SuperAdminDashboard from "../views/main-app/dashboard/super-admin";
import HotelAdminDashboard from "../views/main-app/dashboard/hotel/admin";
import CashierDashboard from "../views/main-app/dashboard/hotel/cashier";
import CreateOrder from "../views/main-app/sales/CreateOrder";
import CompleteOrder from "../views/main-app/sales/CompleteOrder";
import MenuManagement from "../views/main-app/products/menumanagement";
import IngredientsManagementPage from "../views/main-app/products/ingredient-management";
import StaffManagement from "../views/main-app/User-Management/hotel";
import StaffPayment from "../views/main-app/User-Management/hotel/staff/StaffPayment";
import HotelOrders from "../views/main-app/sales/hotel-orders";
import HotelExpenses from "../views/main-app/expenses/hotel/Hotelexpenses";
import Dashboard from "../views/main-app/dashboard/kiosk/kioskadmin";
import InventoryPage from "../views/main-app/products/inventory";
import KioskStaffManagement from "../views/main-app/User-Management/kiosk";
import KioskAdminReportsPage from "../views/main-app/reports/kiosk/kioskadmin/KioskAdminReportsPage";
import SalesPage from "../views/main-app/sales/kiosk";
import ShopkeeperReportsPage from "../views/main-app/reports/kiosk/shopkeeper/ShopkeeperReportsPage";
import DebtManagement from "../views/main-app/debtmanagement/index.jsx";
import HospitalAdminDashboard from "../views/main-app/dashboard/hospital/hospitaladmin/HospitalAdminDashboard";
import PharmacyStock from "../views/main-app/products/hospital/PharmacyStock";
import HospitalStaff from "../views/main-app/User-Management/hospital/hospitalStaff";
import HospitalReports from "../views/main-app/reports/hospital/hospitaladmin/HospitalAdminReports";
import NotFound from "../components/notfound";
import Unauthorized from "../components/notfound/Unauthorized";
import ReceptionistQueuePage from "../views/main-app/patients/receptionist/index.jsx";
import SuperAdminReports from "../views/main-app/reports/super-admin";
import ReceptionistPatientRecordsPage from "../views/main-app/patients/patientrecords/receptionist/index.jsx";
import AdminPatientRecordsPage from "../views/main-app/patients/patientrecords/admin/index.jsx";
import DoctorView from "../views/main-app/dashboard/hospital/doctor/index.jsx";
import PatientListPage from "../views/main-app/dashboard/hospital/doctor/patientshistory/PatientListPage.jsx";
import StockManagementPage from "../views/main-app/products/kiosk/stock-management/index.jsx";
import BusinessesPage from "../views/main-app/User-Management/super-admin/businesses/index.jsx";
import UsersPage from "../views/main-app/User-Management/super-admin/user-management/index.jsx";

export const routes = [
  // Public Routes
  { path: "/", element: <Login />, isPrivate: false, allowedRoles: [] },
  { path: "/reset-password", element: <ForgotPassword />, isPrivate: false, allowedRoles: [] },
  { path: "/not-found", element: <NotFound />, isPrivate: false, allowedRoles: [] },
  { path: "/unauthorized", element: <Unauthorized />, isPrivate: false, allowedRoles: [] },

  // Super Admin (Biztrack Admin)
  { path: "/dashboard/super-admin", element: <SuperAdminDashboard />, isPrivate: true, allowedRoles: ["biztrack-admin"] },
  { path: "/businesses", element: <BusinessesPage />, isPrivate: true, allowedRoles: ["biztrack-admin"] },
  { path: "/user-management", element: <UsersPage />, isPrivate: true, allowedRoles: ["biztrack-admin"] },
  { path: "/reports", element: <SuperAdminReports />, isPrivate: true, allowedRoles: ["biztrack-admin"] },

  // Hotel Admin
  { path: "/dashboard/hotel-admin", element: <HotelAdminDashboard />, isPrivate: true, allowedRoles: ["hotel-admin"] },
  { path: "/products", element: <MenuManagement />, isPrivate: true, allowedRoles: ["hotel-admin", "kiosk-admin"] },
  { path: "/products/ingredient-management", element: <IngredientsManagementPage />, isPrivate: true, allowedRoles: ["hotel-admin"] },
  { path: "/staff", element: <StaffManagement />, isPrivate: true, allowedRoles: ["hotel-admin"] },
  { path: "/staffpayment", element: <StaffPayment />, isPrivate: true, allowedRoles: ["hotel-admin"] },
  { path: "/orders/hotel", element: <HotelOrders />, isPrivate: true, allowedRoles: ["hotel-admin"] },
  { path: "/hotel/expenses", element: <HotelExpenses />, isPrivate: true, allowedRoles: ["hotel-admin"] },

  // Cashier
  { path: "/dashboard/cashier", element: <CashierDashboard />, isPrivate: true, allowedRoles: ["hotel-cashier"] },
  { path: "/orders/complete", element: <CompleteOrder />, isPrivate: true, allowedRoles: ["hotel-cashier"] },

  // Waiter
  { path: "/dashboard/waiter", element: <CreateOrder />, isPrivate: true, allowedRoles: ["hotel-waiter"] },
  { path: "/dashboard/create-order", element: <CreateOrder />, isPrivate: true, allowedRoles: ["hotel-waiter"] },

  // Kiosk Admin
  { path: "/dashboard/kiosk", element: <Dashboard />, isPrivate: true, allowedRoles: ["kiosk-admin"] },
  { path: "/inventory", element: <InventoryPage />, isPrivate: true, allowedRoles: ["kiosk-admin"] },
  { path: "/products/stock-management", element: <StockManagementPage />, isPrivate: true, allowedRoles: ["kiosk-admin"] },
  { path: "/kiosk/user-management", element: <KioskStaffManagement />, isPrivate: true, allowedRoles: ["kiosk-admin"] },
  { path: "/kiosk/debts", element: <DebtManagement />, isPrivate: true, allowedRoles: ["kiosk-admin"] },
  { path: "/kioskreports", element: <KioskAdminReportsPage />, isPrivate: true, allowedRoles: ["kiosk-admin"] },

  // Shopkeeper
  { path: "/shopkeeper/sales", element: <SalesPage />, isPrivate: true, allowedRoles: ["kiosk-shopkeeper"] },
  { path: "/shopkeeper/debts", element: <DebtManagement />, isPrivate: true, allowedRoles: ["kiosk-shopkeeper"] },
  { path: "/shopkeeper/reports", element: <ShopkeeperReportsPage />, isPrivate: true, allowedRoles: ["kiosk-shopkeeper"] },

  // Hospital Admin
  { path: "/dashboard/hospital-admin", element: <HospitalAdminDashboard />, isPrivate: true, allowedRoles: ["hospital-admin"] },
  { path: "/pharmacy/stock", element: <PharmacyStock />, isPrivate: true, allowedRoles: ["hospital-admin"] },
  { path: "/hospital/staff", element: <HospitalStaff />, isPrivate: true, allowedRoles: ["hospital-admin"] },
  { path: "/hospital/patients", element: <AdminPatientRecordsPage />, isPrivate: true, allowedRoles: ["hospital-admin"] },
  { path: "/hospital/admin-reports", element: <HospitalReports />, isPrivate: true, allowedRoles: ["hospital-admin"] },

  // Receptionist
  { path: "/patient/queue", element: <ReceptionistQueuePage />, isPrivate: true, allowedRoles: ["hospital-receptionist"] },
  { path: "/patient/records", element: <ReceptionistPatientRecordsPage />, isPrivate: true, allowedRoles: ["hospital-receptionist"] },

  // Doctor
  { path: "/dashboard/doctor", element: <DoctorView />, isPrivate: true, allowedRoles: ["hospital-doctor"] },
  { path: "/doctor/patients", element: <PatientListPage />, isPrivate: true, allowedRoles: ["hospital-doctor"] },

  // Nurse
  { path: "/dashboard/nurse", element: <HotelAdminDashboard />, isPrivate: true, allowedRoles: ["hospital-nurse"] },

  // Pharmacist
  { path: "/dashboard/pharmacist", element: <HotelAdminDashboard />, isPrivate: true, allowedRoles: ["hospital-pharmacist"] },

  // Lab Technician
  { path: "/dashboard/labtechnician", element: <HotelAdminDashboard />, isPrivate: true, allowedRoles: ["hospital-labtechnician"] },

  // Fallback
  { path: "*", element: <div>404 Not Found</div>, isPrivate: false, allowedRoles: [] },
];