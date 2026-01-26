import React, { useMemo } from "react";
import { Clock, AlertCircle, DollarSign, Eye, TrendingDown, TrendingUp } from "lucide-react";
import DataTable from "../../../../../components/datatable";
import SummaryCard from "./SummaryCard";
import StatusBadge from "./StatusBadge";
import { formatCurrency, formatTime } from "../../../../../utilities/SharedFunctions";

// Custom function to show only first item + count (EXACT SAME AS SALES REPORT)
const renderFirstItemWithCount = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return <span className="text-gray-500">No items</span>;
  }
  
  const firstItem = items[0];
  const itemName = firstItem.productName || firstItem.name || "Unknown Product";
  const quantity = firstItem.quantity || 1;
  
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium text-sm">
        {itemName} ({quantity}x)
      </span>
      {items.length > 1 && (
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
          +{items.length - 1} more
        </span>
      )}
    </div>
  );
};

const DebtReport = ({ debtData, color, onViewTransaction }) => {
  // Add safe access with defaults
  const safeDebtData = debtData || {};
  
  const debtTransactions = safeDebtData.debtTransactions || [];
  const statusCounts = safeDebtData.statusCounts || {
    pending: 0,
    completed: 0,
    failed: 0,
    total: 0
  };
  const totalOutstanding = safeDebtData.totalOutstanding || 0;
  const totalRecovered = safeDebtData.totalRecovered || 0;
  const recoveryRate = safeDebtData.recoveryRate || 0;

  const debtTableData = useMemo(() => {
    return debtTransactions
      .sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt))
      .map((transaction) => ({
        id: transaction._id || transaction.id,
        time: formatTime(transaction.timestamp || transaction.createdAt),
        transactionId: transaction.transactionId || (transaction._id ? transaction._id.slice(-6).toUpperCase() : 'N/A'),
        amount: formatCurrency(transaction.totalAmount || transaction.total || 0),
        customerName: transaction.customerName || "Unknown Customer",
        customerPhone: transaction.customerPhone || transaction.phone || "N/A",
        status: transaction.status || "Unknown",
        notes: transaction.notes || "",
        items: transaction.items || [],
        action: (
          <button
            onClick={() => onViewTransaction(transaction._id || transaction.id)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="View transaction details"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
        ),
        _original: transaction,
      }));
  }, [debtTransactions, onViewTransaction]);

  const debtHeaders = [
    { key: "time", title: "Time" },
    { key: "transactionId", title: "Transaction ID" },
    { key: "customerName", title: "Customer" },
    { key: "customerPhone", title: "Phone" },
    { key: "amount", title: "Amount" },
    { 
      key: "status", 
      title: "Status",
      render: (value) => <StatusBadge status={value} />
    },
    { 
      key: "items", 
      title: "Items",
      render: (value) => renderFirstItemWithCount(value) // USING THE SAME FUNCTION
    },
    { 
      key: "action", 
      title: "Actions",
      isAction: true
    },
  ];

  const customRenderCell = (column, header) => {
    if (header.key === "status") {
      return <StatusBadge status={column.status} />;
    }
    if (header.key === "items") {
      return renderFirstItemWithCount(column.items); // USING THE SAME FUNCTION
    }
    if (header.key === "action") {
      return column.action;
    }
    return column[header.key];
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Outstanding Debt"
          value={formatCurrency(totalOutstanding)}
          icon={AlertCircle}
          bgColor="bg-yellow-100"
          iconColor="text-yellow-600"
          description={`${statusCounts.pending} pending debts`}
        />
        <SummaryCard
          title="Debt Recovered"
          value={formatCurrency(totalRecovered)}
          icon={TrendingUp}
          bgColor="bg-green-100"
          iconColor="text-green-600"
          description={`${statusCounts.completed} completed debts`}
        />
        <SummaryCard
          title="Recovery Rate"
          value={`${recoveryRate}%`}
          icon={DollarSign}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
          description="Success rate of debt collection"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Today's Debt Transactions ({statusCounts.total})
            </h3>
            <div className="flex gap-2">
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                {statusCounts.pending} Pending
              </span>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                {statusCounts.completed} Collected
              </span>
              {statusCounts.failed > 0 && (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                  {statusCounts.failed} Failed
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="p-4">
          {statusCounts.total === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No debt transactions today</p>
            </div>
          ) : (
            <DataTable
              type="debt"
              clickable={false}
              color={color}
              data={debtTableData}
              headers={debtHeaders}
              actions={[]}
              selectedRow={(e, row) => {
                console.log('Row clicked:', row.id);
              }}
              actionSelected={(action, id) => {
                console.log('Action selected:', action, id);
              }}
              customRenderCell={customRenderCell}
              showActionsColumn={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DebtReport;