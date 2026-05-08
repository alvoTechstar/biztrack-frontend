import React, { useMemo } from "react";
import { TrendingUp, ShoppingCart, DollarSign, Eye } from "lucide-react";
import DataTable from "../../../../../components/datatable";
import SummaryCard from "./SummaryCard";
import StatusBadge from "./StatusBadge";
import { formatCurrency, formatTime } from "../../../../../utilities/Sharedfunctions.jsx";

// Custom function to show only first item + count
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

// Alternative: Show item summary with tooltip
const renderItemSummary = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return <span className="text-gray-500">No items</span>;
  }
  
  const firstItem = items[0];
  const itemName = firstItem.productName || firstItem.name || "Unknown Product";
  const quantity = firstItem.quantity || 1;
  
  return (
    <div className="group relative">
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
      
      {/* Tooltip on hover showing all items */}
      {items.length > 1 && (
        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
          <div className="bg-gray-800 text-white text-xs rounded py-2 px-3 shadow-lg">
            <div className="font-medium mb-1">All Items:</div>
            {items.slice(0, 5).map((item, index) => {
              const name = item.productName || item.name || "Unknown Product";
              const qty = item.quantity || 1;
              return (
                <div key={index} className="flex justify-between gap-4">
                  <span>{name}</span>
                  <span className="text-gray-300">({qty}x)</span>
                </div>
              );
            })}
            {items.length > 5 && (
              <div className="text-gray-400 mt-1">
                ... and {items.length - 5} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
      render: (value) => renderFirstItemWithCount(value) // Show only first item + count
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
      return renderFirstItemWithCount(column.items); // Show only first item + count
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

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
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

export default SalesReport;