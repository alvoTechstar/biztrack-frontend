import React, { useState, useMemo } from "react";
import { Box, IconButton } from "@mui/material";
import DataTable from "../../../../../../components/datatable";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PatientHistoryPage from "./PatientHistoryPage";

const mockPatients = [
  {
    id: "PAT-001",
    name: "Aisha Hassan",
    nationalId: "12345678",
    dateRegistered: "2023-01-15",
    gender: "Female",
    phoneNumber: "+254712345678",
    age: 42,
  },
  {
    id: "PAT-002",
    name: "John Doe",
    nationalId: "87654321",
    dateRegistered: "2023-02-20",
    gender: "Male",
    phoneNumber: "+254723456789",
    age: 30,
  },
  {
    id: "PAT-003",
    name: "Sarah Conners",
    nationalId: "98761234",
    dateRegistered: "2022-11-01",
    gender: "Female",
    phoneNumber: "+254734567890",
    age: 55,
  },
];

const PatientListPage = () => {
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter patients based on search term
  const filteredPatients = useMemo(() => {
    if (!searchTerm) return mockPatients;
    
    const lowercasedSearch = searchTerm.toLowerCase();
    return mockPatients.filter(patient => 
      patient.name.toLowerCase().includes(lowercasedSearch) ||
      patient.id.toLowerCase().includes(lowercasedSearch) ||
      patient.nationalId.toLowerCase().includes(lowercasedSearch) ||
      patient.phoneNumber.toLowerCase().includes(lowercasedSearch)
    );
  }, [searchTerm]);

  const columns = [
    { label: "Patient ID", field: "id" },
    { label: "Name", field: "name" },
    { label: "National ID", field: "nationalId" },
    { label: "Date Registered", field: "dateRegistered" },
    { label: "Gender", field: "gender" },
    { label: "Age", field: "age", align: "right" },
    { label: "Phone", field: "phoneNumber" },
    {
      label: "View",
      field: "actions",
      align: "center",
      render: (row) => (
        <IconButton
          onClick={() => setSelectedPatientId(row.id)}
          color="primary"
          aria-label="view patient"
        >
          <VisibilityIcon />
        </IconButton>
      ),
    },
  ];

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleBackToList = () => {
    setSelectedPatientId(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      {selectedPatientId ? (
        <PatientHistoryPage
          patientId={selectedPatientId}
          onBackToList={handleBackToList}
        />
      ) : (
        <DataTable
          title="Patient Records"
          columns={columns}
          data={filteredPatients}  // Use filtered data
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          pagination={true}
        />
      )}
    </Box>
  );
};

export default PatientListPage;