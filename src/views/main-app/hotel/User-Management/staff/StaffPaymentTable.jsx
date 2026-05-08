import React from "react";
import { Box, Typography, Button, Stack, Chip } from "@mui/material";
import DataTable from "../../../../../components/datatable";

const staffPayments = [
  {
    id: 1,
    name: "John Doe",
    role: "Cashier",
    amount: 1500,
    status: "Paid",
    date: "2024-05-25",
  },
  {
    id: 2,
    name: "Jane Smith",
    role: "Waiter",
    amount: 1200,
    status: "Pending",
    date: "2024-05-20",
  },
  {
    id: 3,
    name: "Michael Brown",
    role: "Kiosk Admin",
    amount: 1800,
    status: "Paid",
    date: "2024-05-15",
  },
  {
    id: 4,
    name: "Emily Johnson",
    role: "Shopkeeper",
    amount: 1600,
    status: "Pending",
    date: "2024-05-10",
  },
  {
    id: 5,
    name: "Alice Lee",
    role: "Waiter",
    amount: 1400,
    status: "Paid",
    date: "2024-05-12",
  },
  {
    id: 6,
    name: "Bob Smith",
    role: "Cashier",
    amount: 1300,
    status: "Pending",
    date: "2024-05-08",
  },
  {
    id: 7,
    name: "Grace Kim",
    role: "Shopkeeper",
    amount: 1500,
    status: "Paid",
    date: "2024-05-05",
  },
  {
    id: 8,
    name: "Tom Hardy",
    role: "Waiter",
    amount: 1250,
    status: "Pending",
    date: "2024-05-03",
  },
    {
    id: 9,
    name: "Michael Brown",
    role: "Kiosk Admin",
    amount: 1800,
    status: "Paid",
    date: "2024-05-15",
  },
  {
    id: 10,
    name: "Emily Johnson",
    role: "Shopkeeper",
    amount: 1600,
    status: "Pending",
    date: "2024-05-10",
  },
  {
    id: 11,
    name: "Alice Lee",
    role: "Waiter",
    amount: 1400,
    status: "Paid",
    date: "2024-05-12",
  },
  {
    id: 12,
    name: "Bob Smith",
    role: "Cashier",
    amount: 1300,
    status: "Pending",
    date: "2024-05-08",
  },
  {
    id: 13,
    name: "Grace Kim",
    role: "Shopkeeper",
    amount: 1500,
    status: "Paid",
    date: "2024-05-05",
  },
  {
    id: 14,
    name: "Tom Hardy",
    role: "Waiter",
    amount: 1250,
    status: "Pending",
    date: "2024-05-03",
  },
];

const columns = [
  { label: "ID", field: "id" },
  { label: "Name", field: "name" },
  { label: "Role", field: "role" },
  { label: "Amount (Ksh)", field: "amount" },
  { label: "Date", field: "date" },
];

const StaffPaymentTable = () => {
  const renderCell = (row, col) => {
    if (col.field === "amount") {
      return `Ksh ${row.amount.toLocaleString()}`;
    }
    return row[col.field];
  };

  const renderActions = (row) => {
    if (row.status === "Paid") {
      return (
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => alert(`Viewing details for ${row.name}`)}
          >
            View
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => alert(`Printing receipt for ${row.name}`)}
          >
            Print
          </Button>
        </Stack>
      );
    }
    return (
      <Button
        variant="contained"
        size="small"
        color="success"
        onClick={() => alert(`Marking ${row.name}'s payment as paid`)}
      >
        Mark as Paid
      </Button>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Staff Payments
      </Typography>
      <DataTable
        columns={columns}
        data={staffPayments}
        renderCell={renderCell}
        renderActions={renderActions}
      />
    </Box>
  );
};

export default StaffPaymentTable;
