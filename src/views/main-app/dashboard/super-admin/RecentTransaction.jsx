import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import DataTable from "../../../../components/datatable";

// Mock data for RecentTransactions
const mockRecentTransactionsData = [
  {
    id: "TRX001",
    businessName: "Grand Hyatt Nairobi",
    amount: 12500.00,
    date: "2025-06-05",
    status: "Completed",
  },
  {
    id: "TRX002",
    businessName: "Mama Oliech Kiosk",
    amount: 850.50,
    date: "2025-06-06",
    status: "Pending",
  },
  {
    id: "TRX003",
    businessName: "Aga Khan Hospital",
    amount: 3750.25,
    date: "2025-06-07",
    status: "Failed",
  },
  {
    id: "TRX004",
    businessName: "Karen Butchery",
    amount: 1200.00,
    date: "2025-06-07",
    status: "Completed",
  },
  {
    id: "TRX005",
    businessName: "Nairobi Safari Tours",
    amount: 5000.00,
    date: "2025-06-08",
    status: "Completed",
  },
];

// Define headers in the format your DataTable expects
const headers = [
  { key: "date", title: "Date" },
  { key: "businessName", title: "Business" },
  { key: "amount", title: "Amount" },
  { key: "status", title: "Status" },
];

const RecentTransactions = ({ transactions = mockRecentTransactionsData }) => {
  return (
    <Card className="shadow-md">
      <CardContent>
        <Typography variant="h6" className="font-semibold mb-4">
          Recent Transactions
        </Typography>
        <DataTable
          data={transactions.slice(0, 5)} // Show only first 5 transactions
          headers={headers}
          type="default"
          pagination={false} // No pagination for recent transactions
          searchFilter=""
          selected={[]}
          selectAll={false}
          // Callback functions your DataTable needs
          selectedRow={(e, row) => console.log("Row selected:", row)}
          selectedAction={(selected) => console.log("Selected actions:", selected)}
          actionSelected={(action, id) => console.log("Action:", action, "ID:", id)}
        />
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;