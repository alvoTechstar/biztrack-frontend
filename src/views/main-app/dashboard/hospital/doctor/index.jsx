import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HistoryIcon from "@mui/icons-material/History";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";

// Import the individual components
import DoctorDashboard from "./DoctorDashboard";
import ConsultationPage from "./ConsultationPage";
import PatientHistory from "./patientshistory/PatientHistoryPage";

// Mock Data - Centralized for easier management (can be moved to a separate file, e.g., 'data.js')
const mockPatients = [
  {
    id: "p001",
    queueNo: 1,
    name: "Alice Smith",
    reason: "Flu symptoms", // This will map to 'service'
    age: 34,
    gender: "Female",
    timeIn: "09:00 AM", // This will map to 'timeAdded'
    status: "waiting", // Changed 'pending' to 'waiting' to align with DoctorDashboard's expectations
  },
  {
    id: "p002",
    queueNo: 2,
    name: "Bob Johnson",
    reason: "Sprained ankle",
    age: 28,
    gender: "Male",
    timeIn: "09:15 AM",
    status: "in_progress", // Example of an in-progress patient
  },
  {
    id: "p003",
    queueNo: 3,
    name: "Charlie Brown",
    reason: "Routine check-up",
    age: 50,
    gender: "Male",
    timeIn: "09:30 AM",
    status: "waiting",
  },
  {
    id: "p004",
    queueNo: 3,
    name: "Charlie Brown",
    reason: "Routine check-up",
    age: 50,
    gender: "Male",
    timeIn: "09:30 AM",
    status: "waiting",
  },
  {
    id: "p005",
    queueNo: 3,
    name: "Charlie Brown",
    reason: "Routine check-up",
    age: 50,
    gender: "Male",
    timeIn: "09:30 AM",
    status: "waiting",
  },
  {
    id: "p006",
    queueNo: 3,
    name: "Charlie Brown",
    reason: "Routine check-up",
    age: 50,
    gender: "Male",
    timeIn: "09:30 AM",
    status: "waiting",
  },
  {
    id: "p007",
    queueNo: 3,
    name: "Charlie Brown",
    reason: "Routine check-up",
    age: 50,
    gender: "Male",
    timeIn: "09:30 AM",
    status: "waiting",
  },
  {
    id: "p008",
    queueNo: 3,
    name: "Charlie Brown",
    reason: "Routine check-up",
    age: 50,
    gender: "Male",
    timeIn: "09:30 AM",
    status: "waiting",
  },
  {
    id: "p009",
    queueNo: 4,
    name: "Diana Prince",
    reason: "Headache",
    age: 42,
    gender: "Female",
    timeIn: "09:45 AM",
    status: "completed", // Example of a completed patient
  },
  {
    id: "p0010",
    queueNo: 5,
    name: "Eve Adams",
    reason: "Stomach pain",
    age: 22,
    gender: "Female",
    timeIn: "10:00 AM",
    status: "waiting",
  },
  {
    id: "p0011",
    queueNo: 6,
    name: "Frank White",
    reason: "Dental checkup",
    age: 30,
    gender: "Male",
    timeIn: "10:15 AM",
    status: "completed", // Another completed patient
  },
];

const mockLabTestOptions = [
  "Complete Blood Count (CBC)",
  "Urinalysis",
  "Lipid Panel",
  "Thyroid Function Test (TFT)",
  "Blood Glucose Test",
  "Liver Function Test (LFT)",
  "Kidney Function Test (KFT)",
];

const mockReferralDepartments = [
  "Pharmacy",
  "Lab",
  "Nurse Station",
  "Radiology",
  "Specialist Consultation",
];

const initialMockPatientHistory = [
  {
    id: "h001",
    patientId: "p001",
    name: "Alice Smith",
    date: "2024-05-10",
    reason: "Persistent cough",
    diagnosis: "Bronchitis",
    prescriptions: [
      { name: "Amoxicillin", dosage: "500mg", frequency: "TID" },
      { name: "Cough Syrup", dosage: "10ml", frequency: "TDS" },
    ],
    labResults: ["CBC: Normal", "Sputum Culture: Positive for Bacteria"],
    notes:
      "Patient presented with a persistent cough for 3 days, accompanied by mild fever. Prescribed antibiotics and cough syrup.",
  },
  {
    id: "h002",
    patientId: "p001",
    name: "Alice Smith",
    date: "2023-11-22",
    reason: "Seasonal Flu",
    diagnosis: "Influenza A",
    prescriptions: [
      { name: "Oseltamivir", dosage: "75mg", frequency: "BID" },
      { name: "Paracetamol", dosage: "500mg", frequency: "TDS" },
    ],
    labResults: ["Rapid Flu Test: Positive"],
    notes:
      "Patient experienced fever, body aches, and cough. Confirmed Influenza A. Advised rest and hydration.",
  },
  {
    id: "h003",
    patientId: "p002",
    name: "Bob Johnson",
    date: "2024-01-15",
    reason: "Knee pain",
    diagnosis: "Mild Osteoarthritis",
    prescriptions: [{ name: "Ibuprofen", dosage: "400mg", frequency: "PRN" }],
    labResults: ["X-Ray: Mild joint space narrowing"],
    notes:
      "Complained of knee pain after exercise. Recommended physical therapy and NSAIDs for pain management.",
  },
];

function DoctorView() {
  // State to control which "page" is currently displayed
  const [currentPage, setCurrentPage] = useState("dashboard"); // 'dashboard', 'consultation', 'history'
  const [patients, setPatients] = useState(mockPatients);
  const [currentPatient, setCurrentPatient] = useState(null); // Patient currently being consulted
  const [history, setHistory] = useState(initialMockPatientHistory);

  // Helper to transform mockPatients for DoctorDashboard
  const transformedPatients = patients.map((p) => ({
    id: p.id,
    queueId: `Q${String(p.queueNo).padStart(3, "0")}`, // Format queueNo to Q001, Q002 etc.
    patientName: p.name,
    service: p.reason, // Map 'reason' to 'service'
    // Convert "HH:MM AM/PM" to a valid Date ISO string for proper sorting and display
    timeAdded: new Date(
      `${new Date().toDateString()} ${p.timeIn}`
    ).toISOString(),
    status: p.status,
  }));

  // Functions to navigate between pages
  const goToDashboard = () => setCurrentPage("dashboard");
  const goToHistory = () => setCurrentPage("history");
  const goToConsultation = (patientId) => {
    // Find the patient using their original ID from the 'patients' state
    const selectedPatient = patients.find((p) => p.id === patientId);
    if (selectedPatient) {
      setCurrentPatient(selectedPatient);
      setCurrentPage("consultation");
    }
  };

  const finishConsultation = (patientId, consultationDetails) => {
    const patientIndex = patients.findIndex((p) => p.id === patientId);
    if (patientIndex !== -1) {
      const updatedPatients = [...patients];
      updatedPatients[patientIndex] = {
        ...updatedPatients[patientIndex],
        status: "completed",
      };
      setPatients(updatedPatients);

      // Add to history
      const newHistoryEntry = {
        id: `h${Date.now()}`, // Unique ID
        patientId: patientId,
        name: updatedPatients[patientIndex].name,
        date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
        reason: updatedPatients[patientIndex].reason,
        diagnosis: consultationDetails.diagnosis,
        prescriptions: consultationDetails.prescriptions,
        labResults: consultationDetails.requestedLabTests,
        notes: consultationDetails.symptoms, // Storing symptoms as notes for history
      };
      setHistory((prevHistory) => [newHistoryEntry, ...prevHistory]);
    }
    setCurrentPatient(null); // Clear current patient after finishing
    setCurrentPage("dashboard"); // Go back to dashboard
  };

  // The DoctorDashboard component expects `patients` to be the full queue data.
  // The filtering for 'pending' is done *inside* DoctorDashboard now.
  // The 'completedPatientsCount' is also calculated inside DoctorDashboard.

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {currentPage === "dashboard" && (
        <DoctorDashboard
          patients={transformedPatients} // Pass the transformed data
          currentPatient={
            currentPatient
              ? {
                  ...currentPatient,
                  queueId: `Q${String(currentPatient.queueNo).padStart(
                    3,
                    "0"
                  )}`,
                  patientName: currentPatient.name,
                }
              : null
          } // Ensure currentPatient also has queueId and patientName
          onViewPatient={goToConsultation}
          onGoToHistory={goToHistory}
          // completedPatientsCount is now calculated internally by DoctorDashboard
        />
      )}
      {currentPage === "consultation" && (
        <ConsultationPage
          currentPatient={currentPatient} // ConsultationPage uses the original patient structure
          finishConsultation={finishConsultation}
          onCancelConsultation={goToDashboard}
          mockLabTestOptions={mockLabTestOptions}
          mockReferralDepartments={mockReferralDepartments}
        />
      )}
      {currentPage === "history" && (
        <PatientHistory
          patientHistory={history}
          onGoToDashboard={goToDashboard}
        />
      )}
    </div>
  );
}

export default DoctorView;
