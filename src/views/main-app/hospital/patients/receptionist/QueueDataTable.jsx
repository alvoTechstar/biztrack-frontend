import React, { useState, useMemo } from "react";
import { Box, Chip, Typography } from "@mui/material";
import {
  Visibility as ViewIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import DataTable from "../../../../../components/datatable"; // adjust if needed
import ViewQueueModal from "./ViewQueueModal";

// ────────────────────────────────────────────────────────────
// Mock data (replace with real queue state later)
// ────────────────────────────────────────────────────────────
const initialRows = [
  {
    id: 1,
    queueId: "Q-001",
    patientName: "John Doe",
    service: "Consultation",
    status: "waiting",
    timeAdded: "2025-06-11T09:15:32", // ISO 8601 format
  },
  {
    id: 2,
    queueId: "Q-002",
    patientName: "Jane Mwangi",
    service: "Lab Test",
    status: "waiting",
    timeAdded: "2025-06-11T09:01:32", // ISO 8601 format
  },
  {
    id: 3,
    queueId: "Q-003",
    patientName: "Mark Otieno",
    service: "Pharmacy",
    status: "cancelled",
    timeAdded: "09:45 AM",
  },
  {
    id: 4,
    queueId: "Q-004",
    patientName: "Linda Njeri",
    service: "Consultation",
    status: "waiting",
    timeAdded: "08:50 AM",
  },
];

// ────────────────────────────────────────────────────────────
// Receptionist Queue Table
// ────────────────────────────────────────────────────────────
const QueueDataTable = () => {
  const [rows, setRows] = useState(initialRows);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");

  // Modal state
  const [viewData, setViewData] = useState(null);
  const [openView, setOpenView] = useState(false);

  // ─── Actions ───────────────────────────────────────────────
  const handleAction = (actionKey, row) => {
    if (actionKey === "view") {
      setViewData(row);
      setOpenView(true);
    } else if (actionKey === "cancel") {
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status: "cancelled" } : r))
      );
    }
  };
  const handleClose = () => {
    setOpenView(false);
    setViewData(null);
  };

  // ─── Column defs ───────────────────────────────────────────
  const columns = [
    {
      field: "queueId",
      label: "Queue ID",
      minWidth: "100px",
      render: (row) => (
        <Typography variant="body2" className="font-medium text-gray-700">
          {row.queueId}
        </Typography>
      ),
    },
    {
      field: "patientName",
      label: "Patient",
      minWidth: "160px",
      render: (row) => (
        <Typography variant="body2" className="text-gray-700 font-medium">
          {row.patientName}
        </Typography>
      ),
    },
    {
      field: "service",
      label: "Service",
      minWidth: "120px",
      render: (row) => (
        <Typography variant="body2" className="text-gray-700 font-medium">
          {row.service}
        </Typography>
      ),
    },

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
          <Typography variant="body2" className="text-gray-700 font-medium">
            {formatted}
          </Typography>
        );
      },
    },
    {
      field: "status",
      label: "Status",
      minWidth: "120px",
      render: (row) => {
        const colorMap = {
          waiting: "warning",
          in_progress: "info",
          completed: "success",
          cancelled: "error",
        };
        return (
          <Chip
            label={row.status.replace("_", " ")}
            size="small"
            color={colorMap[row.status] || "default"}
            className="capitalize"
            sx={{
              borderRadius: "5px", // Apply border radius
            }}
          />
        );
      },
    },
    {
      label: "Actions",
      isActionColumn: true,
      minWidth: "140px",
    },
  ];

  // ─── DataTable config ─────────────────────────────────────
  const customActionConfigs = {
    view: {
      icon: ViewIcon,
      label: "View",
      tooltip: "View Queue Details",
    },
    cancel: {
      icon: CancelIcon,
      label: "Cancel",
      tooltip: "Cancel Queue",
    },
  };

  const statusActionMap = {
    waiting: ["view", "cancel"],
    cancelled: ["view"],
  };

  // ─── Filter dropdown options ──────────────────────────────
  const filterOptions = useMemo(() => {
    const services = [...new Set(initialRows.map((r) => r.service))];
    return services.map((service) => ({ value: service, label: service }));
  }, []);

  // ─── Apply search & filter ────────────────────────────────
  const filteredRows = useMemo(() => {
    let data = rows;

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
  }, [rows, searchTerm, filterType]);

  // ─── Render ───────────────────────────────────────────────
  return (
    <Box className="p-4">
      <DataTable
        title="Receptionist Queue"
        columns={columns}
        data={filteredRows}
        statusField="status"
        statusActionMap={statusActionMap}
        customActionConfigs={customActionConfigs}
        pagination
        defaultRowsPerPage={5}
        rowsPerPageOptions={[5, 10, 25]}
        onAction={handleAction}
        showToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterOptions={filterOptions}
        filterValue={filterType}
        onFilterChange={setFilterType}
        
      />

      {/* View modal imported from components/modals */}
      <ViewQueueModal open={openView} onClose={handleClose} data={viewData} />
    </Box>
  );
};

export default QueueDataTable;
