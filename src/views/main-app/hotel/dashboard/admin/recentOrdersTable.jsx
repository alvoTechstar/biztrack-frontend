import React from "react";
import DataTable from "../../../../../components/datatable";
import { Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";
import dayjs from "dayjs";

const RecentOrdersTable = ({ 
  orders, 
  onActionClick
}) => {
  // Status action mapping
  const statusActionMap = {
    "In Progress": ["edit", "print"],
    "Completed": ["print"],
    "default": ["print"]
  };

  // Custom action configurations
  const customActionConfigs = {
    edit: {
      label: "Edit",
      icon: <EditIcon fontSize="small" />,
      color: "primary",
    },
    print: {
      label: "Print",
      icon: <PrintIcon fontSize="small" />,
      color: "secondary",
    },
  };

  // Status styles
  const statusStyles = {
    "Completed": { 
      backgroundColor: "#d4edda", 
      color: "#155724",
      borderColor: "#c3e6cb"
    },
    "In Progress": { 
      backgroundColor: "#fff3cd", 
      color: "#856404",
      borderColor: "#ffeeba"
    },
    "default": {
      backgroundColor: "#e2e3e5",
      color: "#383d41",
      borderColor: "#d6d8db"
    }
  };

  // Columns definition
  const columns = [
    { field: "id", label: "Order ID", minWidth: 90 },
    { field: "waiter", label: "Waiter", minWidth: 100 },
    {
      field: "foodItems",
      label: "Food",
      minWidth: 150,
      render: (row) => row.foodItems?.join(", "),
    },
    {
      field: "amount",
      label: "Amount",
      minWidth: 90,
      render: (row) => `KSh ${row.amount?.toLocaleString()}`,
    },
    {
      field: "dateTimeCombined",
      label: "Date and Time",
      minWidth: 150,
      render: (row) => row.date && row.time 
        ? dayjs(`${row.date}T${row.time}`).format("DD/MM/YYYY HH:mm:ss")
        : "",
    },
    {
      field: "status",
      label: "Status",
      minWidth: 100,
      render: (row) => (
        <span style={{
          padding: "4px 8px",
          borderRadius: "5px",
          border: "1px solid",
          ...statusStyles[row.status] || statusStyles.default
        }}>
          {row.status}
        </span>
      )
    },
    {
      label: "Actions",
      isActionColumn: true,
      minWidth: 120,
    },
  ];

  const handleAction = (actionKey, row) => onActionClick(row.id, actionKey);

  return (
    <Box>
      <DataTable
        columns={columns}
        data={orders}
        title=""
        pagination={true}
        statusField="status"
        statusActionMap={statusActionMap}
        customActionConfigs={customActionConfigs}
        onAction={handleAction}
        showToolbar={false} // Toolbar removed since search is gone
        customStatusStyles={statusStyles}
      />
    </Box>
  );
};

export default RecentOrdersTable;