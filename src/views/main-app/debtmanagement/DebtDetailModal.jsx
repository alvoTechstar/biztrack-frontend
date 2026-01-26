import React from "react";
import { X, CreditCard } from "lucide-react";

const DebtDetailModal = ({
    showDetailModal,
    setShowDetailModal,
    selectedDebt,
    setSelectedDebt,
    setShowPaymentOptionsModal,
    actionLoading,
    formatCurrency,
    formatDate,
    isOverdue
}) => {
    // Reverted to original conditional rendering (no fixed backdrop)
    if (!showDetailModal || !selectedDebt) return null;

    // Helper for compact detail fields
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

    return (
        // Reverted to original container classes (no fixed inset or backdrop)
        <div className="bg-white rounded-lg shadow-xl border border-gray-100">
            <div className="p-5 max-h-[85vh] overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                        Debt Details
                    </h3>
                    <button
                        onClick={() => {
                            setShowDetailModal(false);
                            setSelectedDebt(null);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        disabled={actionLoading}
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Main Content */}
                <div className="space-y-6">

                    {/* Compact Primary Information: Transaction ID, Name, Phone, Amount in one row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b pb-4 border-gray-100">
                        <CompactDetailField
                            label="ID"
                            value={selectedDebt.transactionId}
                        />
                        <CompactDetailField
                            label="Customer"
                            value={selectedDebt.customerName}
                        />
                        <CompactDetailField
                            label="Phone"
                            value={selectedDebt.customerPhone}
                        />
                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">
                                Amount
                            </label>
                            <p className="mt-0.5 text-m font-bold text-gray-900">
                                {formatCurrency(selectedDebt.amount)}
                            </p>
                        </div>
                    </div>

                    {/* Status & Dates Information */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                        {/* Status */}
                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">
                                Status
                            </label>
                            <span className={`inline-flex items-center px-3 py-0.5 text-xs font-semibold rounded-full mt-1 
                                ${selectedDebt.status === "Completed"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}>
                                {selectedDebt.status}
                                {isOverdue(selectedDebt.expectedPaymentDate, selectedDebt.status) && (
                                    <span className="ml-2 bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full text-xs font-bold">
                                        OVERDUE
                                    </span>
                                )}
                            </span>
                        </div>

                        {/* Created Date */}
                        <CompactDetailField
                            label="Created Date"
                            value={selectedDebt.createdDate}
                            isDate={true}
                        />

                        {/* Due Date - Styled for Overdue */}
                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">
                                Due Date
                            </label>
                            <p className={`mt-0.5 text-sm font-semibold ${isOverdue(selectedDebt.expectedPaymentDate, selectedDebt.status)
                                ? "text-red-600"
                                : "text-gray-800"
                                }`}>
                                {formatDate(selectedDebt.expectedPaymentDate)}
                            </p>
                        </div>

                        {/* Date Paid */}
                        <CompactDetailField
                            label="Date Paid"
                            value={selectedDebt.datePaid}
                            isDate={true}
                        />
                    </div>

                    {/* Items Information */}
                    {/* Items Information */}
                    {selectedDebt.items && selectedDebt.items.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                Items Purchased
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
                                        {selectedDebt.items.map((item, index) => (
                                            <tr key={index} className="border-b last:border-b-0">
                                                <td className="py-2 text-sm text-gray-900">{item.productName}</td>
                                                <td className="py-2 text-sm text-gray-700">{item.quantity}</td>
                                                <td className="py-2 text-sm text-gray-700 text-right">{formatCurrency(item.unitPrice)}</td>
                                                <td className="py-2 text-sm font-semibold text-gray-900 text-right">
                                                    {formatCurrency(item.totalPrice)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    {/* Optional: Add a totals row */}
                                    <tfoot>
                                        <tr className="border-t border-gray-300">
                                            <td colSpan="3" className="py-2 text-sm font-semibold text-gray-900 text-right">
                                                Total Amount:
                                            </td>
                                            <td className="py-2 text-sm font-bold text-gray-900 text-right">
                                                {formatCurrency(selectedDebt.totalAmount)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {selectedDebt.notes && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">
                                Notes
                            </h4>
                            <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200">
                                {selectedDebt.notes}
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-gray-100 flex justify-center"> {/* Added flex and justify-center */}
                        {selectedDebt.status === "Pending" && (
                            <button
                                onClick={() => {
                                    setShowDetailModal(false);
                                    setShowPaymentOptionsModal(true);
                                }}
                                disabled={actionLoading}
                                className="max-w-xs w-full bg-green-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <CreditCard className="h-4 w-4" />
                                {actionLoading ? 'Processing...' : 'Complete Payment'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DebtDetailModal;