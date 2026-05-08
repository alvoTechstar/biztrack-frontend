import React from "react";
import { Typography, Grid, Paper, Box } from "@mui/material"; // Keeping these for now, but styling will be Tailwind
import {
  LocalHospital,
  AttachMoney,
  Science,
  Medication,
  PeopleAlt,
} from "@mui/icons-material";

// Assume these values are coming from your state or props
const totalAppointments = 1200;
const totalRevenue = 500000;
const totalLabTests = 850;
const totalMedicinesDispensed = 2100;
const newPatientsRegistered = 150;
const pharmacyProfit = 75000;
const isMobile = false; // Replace with your actual isMobile state/hook

const KPISection = () => {
  // Define custom colors for the KPI backgrounds to match the MUI ones
  // These should ideally be extended in your tailwind.config.js for reusability
  const kpiBgColors = {
    totalAppointments: "bg-[#e3f2fd]", // light blue
    totalRevenue: "bg-[#e8f5e9]", // light green
    totalLabTests: "bg-[#f3e5f5]", // light purple
    medicinesDispensed: "bg-[#ffebee]", // light red
    newPatients: "bg-[#fff3e0]", // light orange
    pharmacyProfit: "bg-[#e1f5fe]", // light cyan
  };

  return (
    <div className="w-full px-4 py-6 md:px-6">
      {" "}
      {/* Added w-full and padding */}
      <h6 className="mb-4 text-xl font-medium text-gray-800">
        Key Performance Indicators
      </h6>
      <div
        className={`grid ${
          isMobile
            ? "grid-cols-1 gap-4"
            : "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
        } gap-4 mb-8`} // Responsive grid with gaps
      >
        {[
          {
            title: "Total Appointments",
            value: totalAppointments,
            icon: <LocalHospital className="text-blue-600" />, // Using Tailwind color
            bgColorClass: kpiBgColors.totalAppointments,
          },
          {
            title: "Total Revenue",
            value: `$${totalRevenue.toLocaleString()}`,
            icon: <AttachMoney className="text-green-700" />, // Using Tailwind color
            bgColorClass: kpiBgColors.totalRevenue,
          },
          {
            title: "Total Lab Tests",
            value: totalLabTests,
            icon: <Science className="text-purple-600" />, // Using Tailwind color
            bgColorClass: kpiBgColors.totalLabTests,
          },
          {
            title: "Medicines Dispensed",
            value: totalMedicinesDispensed,
            icon: <Medication className="text-red-600" />, // Using Tailwind color
            bgColorClass: kpiBgColors.medicinesDispensed,
          },
          {
            title: "New Patients",
            value: newPatientsRegistered,
            icon: <PeopleAlt className="text-orange-500" />, // Using Tailwind color
            bgColorClass: kpiBgColors.newPatients,
          },
          {
            title: "Pharmacy Profit",
            value: `$${pharmacyProfit.toLocaleString()}`,
            icon: <AttachMoney className="text-sky-600" />, // Using Tailwind color
            bgColorClass: kpiBgColors.pharmacyProfit,
          },
        ].map((kpi, index) => (
          <div key={index} className="flex h-full flex-col">
            {" "}
            {/* flex h-full to make cards same height */}
            <div
              className={`rounded-lg p-4 shadow-md flex flex-col items-center justify-center text-center h-full transition duration-200 ease-in-out transform hover:scale-105 ${kpi.bgColorClass}`}
            >
              <div className="mb-3">
                {React.cloneElement(kpi.icon, {
                  className: "text-4xl", // Tailwind for font-size: "2.5rem"
                })}
              </div>
              <h6 className="mb-1 text-2xl font-bold text-gray-900">
                {kpi.value}
              </h6>
              <p className="text-sm text-gray-600">{kpi.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KPISection;
