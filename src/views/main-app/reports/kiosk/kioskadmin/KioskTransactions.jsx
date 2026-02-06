// kiosk-admin/TransactionsTable.jsx
import React, { useState, useMemo } from 'react';
import { Package, Calendar, Filter, Download, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import DataTable from "../../../../../components/datatable";
import { useTheme } from '../../../../../components/theme/ThemeContext';

// Helper functions
const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const formatDisplayTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

// Define headers
const TRANSACTIONS_TABLE_HEADERS = [
    { title: "Transaction ID", key: "id" },
    { title: "Date & Time", key: "datetime" },
    { title: "Products", key: "products" },
    { title: "Total Amount", key: "amount" },
    { title: "Payment Method", key: "payment" },
    { title: "Status", key: "status" },
    { title: "Action", key: "action" },
];

const KioskTransactionsTable = ({
    todayTransactions = [],
    onViewTransaction,
    timeRange = 'today',
    dateRangeLabel = '',
    loading = false
}) => {
    const theme = useTheme();
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');

    const handleActionSelected = (action, id) => {
        const transaction = todayTransactions.find(t =>
            t.transactionId === id ||
            t._id === id ||
            (t._id && t._id.substring(0, 8) === id)
        );
        if (!transaction) {
            console.error('Transaction not found with id:', id);
            return;
        }
        switch (action.toLowerCase()) {
            case 'view':
                onViewTransaction?.(transaction);
                break;
            default:
                console.warn('Unknown action:', action);
        }
    };

    const handleRowClick = (row) => {
        handleActionSelected('view', row.transactionId || row._id);
    };

    const getActionsForTransaction = (status) => {
        return ['View'];
    };

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        if (!Array.isArray(todayTransactions)) return [];

        let filtered = [...todayTransactions];

        if (statusFilter !== 'all') {
            filtered = filtered.filter(t =>
                t.status?.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        if (paymentFilter !== 'all') {
            filtered = filtered.filter(t =>
                t.paymentMethod?.toLowerCase() === paymentFilter.toLowerCase()
            );
        }

        return filtered;
    }, [todayTransactions, statusFilter, paymentFilter]);

    // Transform transaction data for the DataTable
    const transformedTransactions = useMemo(() => {
        return filteredTransactions.map((transaction, index) => {
            const datetime = transaction.createdAt || transaction.timestamp || new Date().toISOString();
            const items = transaction.items || [];

            return {
                ...transaction,
                id: transaction.transactionId || transaction._id?.substring(0, 8) || `TXN${index + 1}`,
                datetime: `${formatDisplayDate(datetime)} ${formatDisplayTime(datetime)}`,
                products: items.length > 0
                    ? items.slice(0, 2).map(item => item.productName || 'Item').join(", ")
                    : "No items",
                amount: `KSh ${(transaction.totalAmount || 0).toLocaleString('en-KE', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`,
                payment: transaction.paymentMethod?.charAt(0).toUpperCase() + transaction.paymentMethod?.slice(1) || 'Cash',
                status: transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1) || 'Pending',
                action: transaction.transactionId || transaction._id || `TXN${index + 1}`,
            };
        });
    }, [filteredTransactions]);

    // Calculate summary
    const summary = useMemo(() => {
        if (!Array.isArray(todayTransactions)) {
            return {
                totalAmount: 0,
                completedCount: 0,
                totalCount: 0,
                successRate: 0
            };
        }

        const completedTransactions = todayTransactions.filter(t =>
            t.status?.toLowerCase() === 'completed'
        );

        const totalAmount = completedTransactions.reduce((sum, t) =>
            sum + (parseFloat(t.totalAmount) || 0), 0
        );

        const completedCount = completedTransactions.length;
        const totalCount = todayTransactions.length;
        const successRate = totalCount > 0
            ? Math.round((completedCount / totalCount) * 100)
            : 0;

        return {
            totalAmount,
            completedCount,
            totalCount,
            successRate
        };
    }, [todayTransactions]);

    // No Results State
    if (todayTransactions.length === 0 && !loading) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Package size={48} className="text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-700 mb-1">No transactions found</h3>
                <p className="text-gray-500">
                    {timeRange === 'today'
                        ? "No sales transactions have been recorded for today yet."
                        : `No transactions found for ${dateRangeLabel || 'the selected period'}. Try selecting a different time range.`
                    }
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading transactions...</p>
            </div>
        );
    }

    // Status badge component
    const StatusBadge = ({ status }) => {
        const statusMap = {
            'Completed': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            'Failed': { color: 'bg-red-100 text-red-800', icon: XCircle },
            'Cancelled': { color: 'bg-gray-100 text-gray-800', icon: XCircle }
        };

        const statusInfo = statusMap[status] || { color: 'bg-gray-100 text-gray-800', icon: AlertTriangle };
        const Icon = statusInfo.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                <Icon size={12} />
                {status}
            </span>
        );
    };

    return (
        <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700">
                            Transactions {dateRangeLabel && `- ${dateRangeLabel}`}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>{timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span>{summary.completedCount} completed</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Status Filter */}
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                            <Filter size={14} className="text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-transparent text-sm text-gray-700 focus:outline-none"
                            >
                                <option value="all">All Status</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>

                        {/* Payment Filter */}
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                            <Filter size={14} className="text-gray-400" />
                            <select
                                value={paymentFilter}
                                onChange={(e) => setPaymentFilter(e.target.value)}
                                className="bg-transparent text-sm text-gray-700 focus:outline-none"
                            >
                                <option value="all">All Payments</option>
                                <option value="cash">Cash</option>
                                <option value="mpesa">M-Pesa</option>
                                <option value="card">Card</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <p className="text-xs text-blue-600 font-medium mb-1">Total Amount</p>
                        <p className="text-lg font-bold text-blue-900">
                            KSh {summary.totalAmount.toLocaleString('en-KE', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </p>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                        <p className="text-xs text-green-600 font-medium mb-1">Completed</p>
                        <p className="text-lg font-bold text-green-900">{summary.completedCount}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                        <p className="text-xs text-gray-600 font-medium mb-1">Total Transactions</p>
                        <p className="text-lg font-bold text-gray-900">{summary.totalCount}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                        <p className="text-xs text-purple-600 font-medium mb-1">Success Rate</p>
                        <p className="text-lg font-bold text-purple-900">{summary.successRate}%</p>
                    </div>
                </div>
            </div>

            {/* DataTable */}
            <div className="p-6">
                {filteredTransactions.length > 0 ? (
                    <DataTable
                        data={transformedTransactions}
                        headers={TRANSACTIONS_TABLE_HEADERS}
                        type="transaction-table"
                        selected={[]}
                        selectedAction={() => { }}
                        selectAll={false}
                        all={false}
                        actionSelected={handleActionSelected}
                        selectedRow={handleRowClick}
                        actions={getActionsForTransaction}
                        clickable={true}
                        color={theme.primaryColor}
                        pagination={true}
                        itemsPerPage={10}
                        searchFilter=""
                        customRenderer={{
                            status: (value, row) => <StatusBadge status={value} />,
                            action: (value, row) => (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleActionSelected('view', value);
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    View Details
                                </button>
                            )
                        }}
                    />
                ) : (
                    <div className="text-center py-12">
                        <AlertTriangle size={48} className="text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">No filtered transactions</h3>
                        <p className="text-gray-500">Try adjusting your filters to see transactions.</p>
                    </div>
                )}
            </div>

            {/* Footer Summary */}
            {filteredTransactions.length > 0 && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="text-sm text-gray-500">
                            Showing {filteredTransactions.length} of {todayTransactions.length} transactions
                            {statusFilter !== 'all' && ` • Filtered by: ${statusFilter}`}
                            {paymentFilter !== 'all' && ` • Payment: ${paymentFilter}`}
                        </div>
                        <div className="text-sm text-gray-500">
                            Last updated: {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KioskTransactionsTable;