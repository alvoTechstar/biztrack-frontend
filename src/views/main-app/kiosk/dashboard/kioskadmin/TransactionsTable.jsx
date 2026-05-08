import React from 'react';
import { Package } from "lucide-react";
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
    { title: "Shopkeeper", key: "shopkeeper" },
    { title: "Status", key: "status" },
    { title: "Action", key: "action" },
];

const TransactionsTable = ({
    todayTransactions = [],
    onViewTransaction,
}) => {
    const theme = useTheme();
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
                onViewTransaction(transaction);
                break;
            default:
                console.warn('Unknown action:', action);
        }
    };

    const handleRowClick = (row) => { };
    const getActionsForTransaction = (status) => {
        return ['View'];
    };

    // Transform transaction data for the DataTable
    const transformedTransactions = todayTransactions.map(transaction => {
        const datetime = transaction.timestamp || transaction.createdAt;
        return {
            ...transaction,
            id: transaction.transactionId || transaction._id?.substring(0, 8) || 'N/A',
            datetime: `${formatDisplayDate(datetime)} ${formatDisplayTime(datetime)}`,
            products: transaction.items
                ? transaction.items.map(item => item.productName).join(", ")
                : "No items",
            amount: `KSh ${(transaction.totalAmount || 0).toLocaleString()}`,
            payment: transaction.paymentMethod?.charAt(0).toUpperCase() + transaction.paymentMethod?.slice(1) || 'Unknown',
            status: transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1) || 'Unknown',
            shopkeeper: transaction.shopkeeperName || 'N/A',
            action: transaction.transactionId || transaction._id,
        };
    });

    // No Results State
    if (todayTransactions.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200 mt-4">
                <Package size={48} className="text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-700 mb-1">No transactions today</h3>
                <p className="text-gray-500">No sales transactions have been recorded for today yet.</p>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                    Total Transactions 
                </h3>
                <div className="text-sm text-gray-500">
                    Showing {todayTransactions.length} transaction{todayTransactions.length !== 1 ? 's' : ''}
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
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
                />
            </div>
        </div>
    );
};

export default TransactionsTable;