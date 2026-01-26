import React, { useState } from "react";
import {
  Card,
  CardContent,
  Button,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircle from "@mui/icons-material/CheckCircle";
import ArrowForward from "@mui/icons-material/ArrowForward";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DataTable from "../../../../../components/datatable/index";
import { useTheme } from "../../../../../components/theme/ThemeContext";

// 🔹 Centralized status mapping
const statusColorMap = {
  waiting: { label: "Waiting", color: "warning" },
  in_progress: { label: "In Consultation", color: "info" },
  awaiting_lab: { label: "Awaiting Lab", color: "secondary" },
  return_to_doctor: { label: "Return to Doctor", color: "primary" },
  to_nurse: { label: "To Nurse", color: "secondary" },
  to_pharmacy: { label: "To Pharmacy", color: "secondary" },
  completed: { label: "Completed", color: "success" },
  cancelled: { label: "Cancelled", color: "error" },
  draft: { label: "Draft", color: "default" },
};

const getDoctorQueueData = (allQueuePatients) => {
  return allQueuePatients.filter(
    (p) => p.status === "waiting" || p.status === "in_progress"
  );
};

const DoctorDashboard = ({
  patients: allQueuePatients,
  currentPatient,
  onViewPatient,
  onGoToHistory,
}) => {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const pendingPatients = getDoctorQueueData(allQueuePatients);

  const patientQueueColumns = [
    { field: "queueId", label: "Queue ID", minWidth: "100px" },
    { field: "patientName", label: "Patient Name", minWidth: "160px" },
    { field: "service", label: "Service", minWidth: "120px" },
    {
      field: "timeAdded",
      label: "Time Added",
      minWidth: "200px",
      render: (row) => {
        const date = new Date(row.timeAdded);
        const formatted = date.toLocaleString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
        return (
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontWeight: 500 }}
          >
            {formatted}
          </Typography>
        );
      },
    },
    {
      field: "status",
      label: "Status",
      minWidth: "100px",
      render: (row) => {
        const statusInfo = statusColorMap[row.status] || {
          label: row.status,
          color: "default",
        };
        return (
          <Chip
            label={statusInfo.label}
            size="small"
            color={statusInfo.color}
            sx={{
              borderRadius: "4px",
              height: "24px",
              fontSize: "0.75rem",
              textTransform: "capitalize",
            }}
          />
        );
      },
    },
    {
      field: "actions",
      label: "Action",
      minWidth: "90px",
      align: "center",
      render: (row) => (
        <Chip
          icon={<VisibilityIcon fontSize="small" />}
          label="View"
          size="small"
          variant="filled"
          onClick={(e) => {
            e.stopPropagation();
            handleDataTableAction("view_patient_details", row);
          }}
          sx={{
            borderRadius: "4px",
            height: "24px",
            fontSize: "0.75rem",
            cursor: "pointer",
            color: "white",
            backgroundColor: PrimaryColor,
            "& .MuiChip-icon": {
              color: "grey.800",
              fontSize: "16px",
            },
            "&:hover": {
              backgroundColor: PrimaryColor,
              opacity: 0.9,
              color: "white",
              "& .MuiChip-icon": {
                color: "grey.800",
              },
            },
          }}
        />
      ),
    },
  ];

  const customActionConfigs = {
    view_patient_details: {
      icon: <VisibilityIcon fontSize="small" />,
      label: "View",
      tooltip: "View Patient Details",
      variant: "contained",
      color: "primary",
      size: "small",
      sx: {
        minWidth: "70px",
        height: "30px",
        fontSize: "0.75rem",
        padding: "0 8px",
        "& .MuiButton-startIcon": {
          marginRight: "4px",
        },
      },
    },
  };

  const statusActionMap = {
    waiting: ["view_patient_details"],
    in_progress: ["view_patient_details"],
    cancelled: ["view_patient_details"],
    completed: ["view_patient_details"],
  };

  const handleDataTableAction = (actionKey, row) => {
    if (actionKey === "view_patient_details") {
      onViewPatient(row.id);
    }
  };

  const filterOptions = React.useMemo(() => {
    const services = [...new Set(allQueuePatients.map((r) => r.service))];
    return services.map((service) => ({ value: service, label: service }));
  }, [allQueuePatients]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");

  const theme = useTheme();
  const PrimaryColor = theme.primaryColor;

  const filteredDoctorPatients = React.useMemo(() => {
    let data = pendingPatients;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(term)
        )
      );
    }

    if (filterType) {
      data = data.filter((row) => row.service === filterType);
    }

    return data;
  }, [pendingPatients, searchTerm, filterType]);

  const completedPatientsCount = allQueuePatients.filter(
    (p) => p.status === "completed"
  ).length;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-center">
        <div className="flex flex-col items-start col-span-2">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome, Doctor!
          </h1>
          <p className="text-lg text-gray-600">{today}</p>
        </div>
        <Box className="flex justify-end col-span-1">
          <Button
            variant="outlined"
            color="secondary"
            onClick={onGoToHistory}
            startIcon={<HistoryIcon />}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            View Patient History
          </Button>
        </Box>
      </div>

      {currentPatient && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md shadow-md mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <Typography variant="h6" fontWeight="600">
              Currently Seeing:
            </Typography>
            <Typography variant="body1">
              {currentPatient.patientName} (Queue ID: {currentPatient.queueId})
            </Typography>
            <Box mt={1}>
              <Chip
                label={
                  statusColorMap[currentPatient.status]?.label ||
                  currentPatient.status
                }
                color={
                  statusColorMap[currentPatient.status]?.color || "default"
                }
                size="small"
                sx={{
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  textTransform: "capitalize",
                }}
              />
            </Box>
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              handleDataTableAction("view_patient_details", currentPatient)
            }
            startIcon={<ArrowForward />}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 500,
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              "&:hover": {
                boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
              },
            }}
          >
            View Current Consultation
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card sx={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <DashboardIcon color="primary" sx={{ fontSize: "2.5rem", mb: 1 }} />
            <Typography variant="h5" fontWeight="bold">
              {allQueuePatients.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Patients Today
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <CheckCircle color="success" sx={{ fontSize: "2.5rem", mb: 1 }} />
            <Typography variant="h5" fontWeight="bold">
              {completedPatientsCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <HistoryIcon color="warning" sx={{ fontSize: "2.5rem", mb: 1 }} />
            <Typography variant="h5" fontWeight="bold">
              {pendingPatients.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending
            </Typography>
          </CardContent>
        </Card>
      </div>

      <Typography variant="h5" fontWeight="bold" mb={3}>
        Patient Queue
      </Typography>

      <DataTable
        columns={patientQueueColumns}
        data={filteredDoctorPatients}
        statusField="status"
        statusActionMap={statusActionMap}
        customActionConfigs={customActionConfigs}
        onAction={handleDataTableAction}
        title="Current Queue"
        showToolbar={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterOptions={filterOptions}
        filterValue={filterType}
        onFilterChange={setFilterType}
        pagination={true}
        rowsPerPageOptions={[5]}
        defaultRowsPerPage={5}
      />
    </div>
  );
};

export default DoctorDashboard;
