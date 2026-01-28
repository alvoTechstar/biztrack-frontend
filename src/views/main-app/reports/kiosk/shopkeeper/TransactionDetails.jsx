import React from "react";
import { X, CreditCard, ArrowLeft } from "lucide-react";
import { formatCurrency } from "../../../../../utilities/Sharedfunctions.jsx";

const TransactionDetailsModal = ({ open, onClose, transaction }) => {
  // Same pattern as DebtDetailModal - return null if not open
  if (!open || !transaction) return null;

  // Safe date handling
  const transactionDate = transaction.timestamp || transaction.createdAt || new Date();
  const transactionTime = new Date(transactionDate).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const formattedDate = new Date(transactionDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isDebtTransaction = transaction.paymentMethod === "Debt" ||
    transaction.paymentMethod === "debt" ||
    transaction.originalPaymentMethod === "Debt" ||
    transaction.originalPaymentMethod === "debt";
  const wasDebtPaid = transaction.debtPaid || (isDebtTransaction && transaction.status === "Completed");

  // Calculate totals
  const calculateItemTotal = (item) => {
    const quantity = item.quantity || 1;
    const price = item.price || item.unitPrice || item.product?.price || 0;
    return quantity * price;
  };

  const calculateItemsTotal = () => {
    if (!transaction.items || !Array.isArray(transaction.items)) return 0;
    return transaction.items.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  // Format quantity with unit
  const formatQuantityWithUnit = (quantity, unit) => {
    const formattedQuantity = Number(quantity).toFixed(2).replace(/\.?0+$/, '');
    const displayUnit = unit || 'units';
    return `${formattedQuantity} ${displayUnit}`;
  };

  // Helper for compact detail fields (same as DebtDetailModal)
  const CompactDetailField = ({ label, value, className = "text-gray-800", isCurrency = false, isDate = false }) => (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wider text-gray-500 truncate">
        {label}
      </label>
      <p className={`mt-0.5 text-sm font-semibold ${className}`}>
        {isCurrency ? formatCurrency(value) : isDate ? formatDate(value) : value || "N/A"}
      </p>
    </div>
  );

  // Status badge
  const getStatusBadge = (status) => {
    const normalizedStatus = (status || "").toLowerCase();
    switch (normalizedStatus) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentMethodBadge = (method) => {
    const normalizedMethod = (method || "").toLowerCase();
    switch (normalizedMethod) {
      case "cash":
        return "bg-green-100 text-green-700";
      case "mpesa":
      case "m-pesa":
        return "bg-blue-100 text-blue-700";
      case "debt":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Reverted to original container classes (no fixed inset or backdrop) - same as DebtDetailModal
  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-100">
      <div className="p-5 max-h-[85vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            {isDebtTransaction ? "Debt Transaction Details" : "Transaction Details"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-6">

          {/* Compact Primary Information */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b pb-4 border-gray-100">
            <CompactDetailField
              label="Transaction ID"
              value={transaction.transactionId || transaction._id || transaction.id}
            />
            <CompactDetailField
              label="Date"
              value={formattedDate}
            />
            <CompactDetailField
              label="Time"
              value={transactionTime}
            />
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">
                Amount
              </label>
              <p className="mt-0.5 text-base font-bold text-gray-900">
                {formatCurrency(transaction.total || transaction.totalAmount || calculateItemsTotal())}
              </p>
            </div>
          </div>

          {/* Status & Payment Information */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

            {/* Status */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </label>
              <span className={`inline-flex items-center px-3 py-0.5 text-xs font-semibold rounded-full mt-1 ${getStatusBadge(transaction.status)}`}>
                {transaction.status || "Unknown"}
              </span>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">
                Payment Method
              </label>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-3 py-0.5 text-xs font-semibold rounded-full ${getPaymentMethodBadge(transaction.paymentMethod)}`}>
                  {transaction.paymentMethod || "N/A"}
                </span>
                {isDebtTransaction && (
                  <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full text-xs font-bold">
                    DEBT
                  </span>
                )}
              </div>
            </div>

            {/* Shopkeeper */}
            {transaction.shopkeeperName && (
              <CompactDetailField
                label="Shopkeeper"
                value={transaction.shopkeeperName}
              />
            )}
          </div>

          {/* Debt Information Box */}
          {isDebtTransaction && (
            <div className={`p-4 rounded-lg ${wasDebtPaid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className={`h-5 w-5 ${wasDebtPaid ? 'text-green-600' : 'text-red-600'}`} />
                <h3 className={`text-base font-semibold ${wasDebtPaid ? 'text-green-800' : 'text-red-800'}`}>
                  {wasDebtPaid ? '✓ Debt Recovered' : '⚠ Outstanding Debt'}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transaction.expectedPaymentDate && (
                  <CompactDetailField
                    label="Expected Payment Date"
                    value={transaction.expectedPaymentDate}
                    isDate={true}
                  />
                )}

                {wasDebtPaid && transaction.datePaid && (
                  <CompactDetailField
                    label="Date Paid"
                    value={transaction.datePaid}
                    isDate={true}
                  />
                )}

                {wasDebtPaid && transaction.debtPaymentMethod && (
                  <CompactDetailField
                    label="Payment Method Used"
                    value={transaction.debtPaymentMethod}
                    className="capitalize"
                  />
                )}
              </div>
            </div>
          )}

          {/* Customer Information */}
          {(transaction.customerName || transaction.phone || transaction.customerPhone) && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Customer Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transaction.customerName && (
                  <CompactDetailField
                    label="Customer Name"
                    value={transaction.customerName}
                  />
                )}
                {(transaction.phone || transaction.customerPhone) && (
                  <CompactDetailField
                    label="Phone Number"
                    value={transaction.phone || transaction.customerPhone}
                  />
                )}
              </div>
            </div>
          )}

          {/* Items Information - Same table structure as DebtDetailModal */}
          {transaction.items && transaction.items.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Items Purchased ({transaction.items.length})
              </h3>
              <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1.5 text-xs font-medium text-gray-500">Item</th>
                      <th className="text-left py-1.5 text-xs font-medium text-gray-500">Qty</th>
                      <th className="text-right py-1.5 text-xs font-medium text-gray-500">Unit Price</th>
                      <th className="text-right py-1.5 text-xs font-medium text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaction.items.map((item, index) => {
                      const itemName = item.productName || item.name || item.product?.productName || "Unknown Product";
                      const quantity = item.quantity || 1;
                      const unit = item.unit || 'units';
                      const unitPrice = item.price || item.unitPrice || item.product?.price || 0;
                      const totalPrice = quantity * unitPrice;

                      return (
                        <tr key={index} className="border-b last:border-b-0">
                          <td className="py-2 text-sm text-gray-900">{itemName}</td>
                          <td className="py-2 text-sm text-gray-700 font-medium">
                            {formatQuantityWithUnit(quantity, unit)}
                          </td>
                          <td className="py-2 text-sm text-gray-700 text-right">
                            <div>{formatCurrency(unitPrice)}</div>
                            <div className="text-xs text-gray-500">per {unit}</div>
                          </td>
                          <td className="py-2 text-sm font-semibold text-gray-900 text-right">
                            {formatCurrency(totalPrice)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Totals row */}
                  <tfoot>
                    <tr className="border-t border-gray-300">
                      <td colSpan="3" className="py-2 text-sm font-semibold text-gray-900 text-right">
                        Total Amount:
                      </td>
                      <td className="py-2 text-sm font-bold text-gray-900 text-right">
                        {formatCurrency(transaction.total || transaction.totalAmount || calculateItemsTotal())}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Cash Payment Details */}
          {transaction.paymentMethod === "Cash" && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Cash Payment Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CompactDetailField
                  label="Amount Paid"
                  value={transaction.amountPaid || transaction.total}
                  isCurrency={true}
                />
                <CompactDetailField
                  label="Change Given"
                  value={transaction.change || 0}
                  isCurrency={true}
                />
              </div>
            </div>
          )}

          {/* Notes */}
          {transaction.notes && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Notes</h4>
              <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200">
                {transaction.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;