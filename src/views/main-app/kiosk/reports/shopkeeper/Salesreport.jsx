import React, { useMemo } from "react";
import { TrendingUp, ShoppingCart, DollarSign, Eye } from "lucide-react";
import DataTable from "../../../../../components/datatable";
import SummaryCard from "./SummaryCard";
import StatusBadge from "./StatusBadge";
import renderFirstItemWithCount from "./renderFirstItemWithCount";
import { formatCurrency, formatTime } from "../../../../../utilities/Sharedfunctions.jsx";

const SalesReport = ({ salesData, color, onViewTransaction }) => {
  // Add safe access with defaults
  const safeSalesData = salesData || {};
  const salesTransactions = safeSalesData.salesTransactions || [];
  const statusCounts = safeSalesData.statusCounts || {
    completed: 0,
    pending: 0,
    failed: 0,
    total: 0
  };
  const mostSoldProduct = safeSalesData.mostSoldProduct || { name: "None", quantity: 0 };
  const totalRevenue = safeSalesData.totalRevenue || 0;

  const salesTableData = useMemo(() => {
    return salesTransactions
      .sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt))
      .map((transaction) => ({
        id: transaction._id || transaction.id,
        time: formatTime(transaction.timestamp || transaction.createdAt),
        transactionId: transaction.transactionId || (transaction._id ? transaction._id.slice(-6).toUpperCase() : 'N/A'),
        amount: formatCurrency(transaction.totalAmount || transaction.total || 0),
        paymentMethod: transaction.paymentMethod || transaction.type || "Unknown",
        status: transaction.status || "Unknown",
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
  }, [salesTransactions, onViewTransaction]);

  const salesHeaders = [
    { key: "time", title: "Time" },
    { key: "transactionId", title: "Transaction ID" },
    { key: "amount", title: "Amount" },
    {
      key: "paymentMethod",
      title: "Payment Method",
      render: (value) => <StatusBadge status={value} type="payment" />
    },
    {
      key: "status",
      title: "Status",
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: "items",
      title: "Items",
      render: (value) => renderFirstItemWithCount(value)
    },
    {
      key: "action",
      title: "Actions",
      isAction: true
    },
  ];

  const customRenderCell = (column, header) => {
    if (header.key === "paymentMethod") {
      return <StatusBadge status={column.paymentMethod} type="payment" />;
    }
    if (header.key === "status") {
      return <StatusBadge status={column.status} />;
    }
    if (header.key === "items") {
      return renderFirstItemWithCount(column.items);
    }
    if (header.key === "action") {
      return column.action;
    }
    return column[header.key];
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <SummaryCard
          title="Sales Revenue"
          value={formatCurrency(totalRevenue)}
          icon={TrendingUp}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
          description="Cash & M-PESA only"
        />
        <SummaryCard
          title="Completed Sales"
          value={statusCounts.completed}
          icon={ShoppingCart}
          bgColor="bg-green-100"
          iconColor="text-green-600"
          description={`${statusCounts.pending} pending transactions`}
        />
        <SummaryCard
          title="Top Product"
          value={mostSoldProduct.name}
          icon={DollarSign}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
          description={`${mostSoldProduct.quantity} units sold`}
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Today's Sales Transactions ({statusCounts.total})
            </h3>
            <div className="flex gap-2">
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                {statusCounts.completed} Completed
              </span>
              {statusCounts.pending > 0 && (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  {statusCounts.pending} Pending
                </span>
              )}
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
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No sales transactions today</p>
            </div>
          ) : (
            <DataTable
              type="sales"
              clickable={false}
              color={color}
              data={salesTableData}
              headers={salesHeaders}
              actions={[]}
              customRenderCell={customRenderCell}
              showActionsColumn={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
