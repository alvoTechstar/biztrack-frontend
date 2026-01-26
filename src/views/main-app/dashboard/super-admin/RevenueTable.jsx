import React, { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import DataTable from "../../../../components/datatable";
import { useTheme } from "../../../../components/theme/ThemeContext";

const RevenueTable = ({ revenueData = [] }) => {
  const theme = useTheme();

  const headers = [
    { key: "id", title: "Transaction ID" },
    { key: "businessName", title: "Business Name" },
    { key: "businessType", title: "Business Type" },
    { key: "date", title: "Date" },
    { key: "amount", title: "Amount (KSh)" },
    { key: "commission", title: "Commission Earned (KSh)" },
  ];

  const tableData = useMemo(() => {
    if (!revenueData || revenueData.length === 0) {
      return [];
    }
    return revenueData.map((item, index) => {
      const transactionId = item?.transactionId ||
        item?.id ||
        item?._id ||
        `TXN${String(index + 1).padStart(3, '0')}`;

      const businessName = item?.businessName || 'Unknown Business';
      const businessType = item?.businessType || 'Unknown';

      const dateValue = item?.timestamp ||
        item?.createdAt ||
        item?.date ||
        item?.transactionDate ||
        item?.createdDate ||
        new Date().toISOString();

      const formattedDate = new Date(dateValue).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      const amount = parseFloat(item?.totalAmount) ||
        parseFloat(item?.amount) ||
        parseFloat(item?.transactionAmount) ||
        parseFloat(item?.total) ||
        parseFloat(item?.amountPaid) || 0;

      const commissionRate = item?.commissionRate || 0.05; // 5% default
      const commission = amount * commissionRate;

      return {
        id: transactionId,
        businessName: businessName,
        businessType: typeof businessType === 'string' && businessType.length > 0
          ? businessType.charAt(0).toUpperCase() + businessType.slice(1).toLowerCase()
          : 'Unknown',
        date: formattedDate,
        amount: amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        commission: commission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        rawAmount: amount,
        rawCommission: commission
      };
    });
  }, [revenueData]);

  const totals = useMemo(() => {
    if (tableData.length === 0) {
      return { totalAmount: 0, totalCommission: 0 };
    }

    return tableData.reduce((acc, item) => ({
      totalAmount: acc.totalAmount + (item.rawAmount || 0),
      totalCommission: acc.totalCommission + (item.rawCommission || 0)
    }), { totalAmount: 0, totalCommission: 0 });
  }, [tableData]);
  if (!revenueData || revenueData.length === 0) {
    return (
      <Box className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <div className="text-gray-400 text-4xl mb-3">📊</div>
        <Typography variant="h6" className="font-semibold text-gray-700 mb-1">
          No Revenue Data Available
        </Typography>
        <Typography variant="body2" className="text-gray-500">
          Revenue data will appear here once transactions are recorded
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Box
          className="rounded-lg p-4 border"
          style={{
            background: `linear-gradient(to bottom right, ${theme.primaryColor || '#3b82f6'}15, ${theme.primaryColor || '#3b82f6'}25)`,
            borderColor: `${theme.primaryColor || '#3b82f6'}40`
          }}
        >
          <Typography
            variant="body2"
            className="font-semibold mb-1"
            style={{ color: theme.primaryColor || '#2563eb' }}
          >
            Total Transactions
          </Typography>
          <Typography
            variant="h5"
            className="font-bold"
            style={{ color: theme.primaryColor || '#1e40af' }}
          >
            {tableData.length}
          </Typography>
        </Box>

        <Box
          className="rounded-lg p-4 border border-green-200"
          style={{
            background: 'linear-gradient(to bottom right, #10b98115, #10b98125)'
          }}
        >
          <Typography variant="body2" className="text-green-600 font-semibold mb-1">
            Total Amount
          </Typography>
          <Typography variant="h5" className="text-green-900 font-bold">
            KSh {totals.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
        </Box>

        <Box
          className="rounded-lg p-4 border border-purple-200"
          style={{
            background: 'linear-gradient(to bottom right, #8b5cf615, #8b5cf625)'
          }}
        >
          <Typography variant="body2" className="text-purple-600 font-semibold mb-1">
            Total Commission Earned
          </Typography>
          <Typography variant="h5" className="text-purple-900 font-bold">
            KSh {totals.totalCommission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
        </Box>
      </Box>

      {/* Data Table */}
      <Box className="bg-white rounded-lg shadow-sm">
        <DataTable
          data={tableData}
          headers={headers}
          type="default"
          pagination={true}
          itemsPerPage={10}
          searchFilter=""
          actions={["view"]}
          selected={[]}
          selectAll={false}
          color={theme.primaryColor || "primary"}
          selectedRow={(e, row) => console.log("Row selected:", row)}
          selectedAction={(selected) => console.log("Selected actions:", selected)}
          actionSelected={(action, id) => {
            console.log("Action:", action, "ID:", id);
            if (action === "view") {
              const transaction = tableData.find(item => item.id === id);
              alert(`Transaction Details:\n\nID: ${transaction.id}\nBusiness: ${transaction.businessName}\nAmount: KSh ${transaction.amount}\nCommission: KSh ${transaction.commission}`);
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default RevenueTable;