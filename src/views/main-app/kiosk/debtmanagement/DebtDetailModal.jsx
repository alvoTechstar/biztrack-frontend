import React from "react";
import { CreditCard } from "lucide-react";

const DebtDetailModal = ({
    selectedDebt,
    setShowDetailModal,
    setShowPaymentOptionsModal,
    actionLoading,
    formatCurrency,
    formatDate,
    isOverdue
}) => {
    if (!selectedDebt) return null;

    const isPaid = selectedDebt.debtPaid === true;
    const isDebtOverdue = !isPaid && isOverdue(selectedDebt.expectedPaymentDate, selectedDebt.status);

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

    const formatQuantityWithUnit = (quantity, unit) => {
        const formattedQuantity = Number(quantity).toFixed(2).replace(/\.?0+$/, '');
        const displayUnit = unit || 'units';
        return `${formattedQuantity} ${displayUnit}`;
    };

    return (
        <div className="space-y-6">
            {/* Compact Primary Information: Transaction ID, Name, Phone, Amount in one row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b pb-4 border-gray-100">
                <CompactDetailField label="ID" value={selectedDebt.transactionId} />
                <CompactDetailField label="Customer" value={selectedDebt.customerName} />
                <CompactDetailField label="Phone" value={selectedDebt.customerPhone} />
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
                <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">
                        Status
                    </label>
                    <span className={`inline-flex items-center px-3 py-0.5 text-xs font-semibold rounded-full mt-1
                        ${isPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {isPaid ? "Recovered" : "Pending"}
                        {isDebtOverdue && (
                            <span className="ml-2 bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full text-xs font-bold">
                                OVERDUE
                            </span>
                        )}
                    </span>
                </div>

                <CompactDetailField label="Created Date" value={selectedDebt.createdDate} isDate={true} />

                <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">
                        Due Date
                    </label>
                    <p className={`mt-0.5 text-sm font-semibold ${isDebtOverdue ? "text-red-600" : "text-gray-800"}`}>
                        {formatDate(selectedDebt.expectedPaymentDate)}
                    </p>
                </div>

                <CompactDetailField label="Date Paid" value={selectedDebt.datePaid} isDate={true} />
            </div>

            {/* Items Information */}
            {selectedDebt.items && selectedDebt.items.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-gray-900">
                        Items Purchased ({selectedDebt.items.length})
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
                                {selectedDebt.items.map((item, index) => {
                                    const quantity = item.quantity || 1;
                                    const unit = item.unit || 'units';
                                    const unitPrice = item.unitPrice || item.price || 0;
                                    const totalPrice = item.totalPrice || (quantity * unitPrice);

                                    return (
                                        <tr key={index} className="border-b last:border-b-0">
                                            <td className="py-2 text-sm text-gray-900">
                                                {item.productName || 'Unknown Product'}
                                            </td>
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
                            <tfoot>
                                <tr className="border-t border-gray-300">
                                    <td colSpan="3" className="py-2 text-sm font-semibold text-gray-900 text-right">
                                        Total Amount:
                                    </td>
                                    <td className="py-2 text-sm font-bold text-gray-900 text-right">
                                        {formatCurrency(selectedDebt.totalAmount || selectedDebt.amount)}
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
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Notes</h4>
                    <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200">
                        {selectedDebt.notes}
                    </p>
                </div>
            )}

            {/* Action Buttons */}
            {!isPaid && (
                <div className="pt-4 border-t border-gray-100 flex justify-center">
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
                </div>
            )}
        </div>
    );
};

export default DebtDetailModal;
