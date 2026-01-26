import React from 'react';
import { Package } from "lucide-react";
import DataTable from '../../../../components/datatable';
import { useTheme } from '../../../../components/theme/ThemeContext';

const formatDisplayDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return "Invalid date";
    }
};

const formatDisplayTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch {
        return "Invalid time";
    }
};

const TRANSACTIONS_TABLE_HEADERS = [
    { title: "Transaction ID", key: "id" },
    { title: "Date & Time", key: "datetime" },
    { title: "Business", key: "business" },
    { title: "Products/Items", key: "products" },
    { title: "Total Amount", key: "amount" },
    { title: "Commission", key: "commission" },
    { title: "Payment Method", key: "payment" },
    { title: "Status", key: "status" },
    { title: "Action", key: "action" },
];

const TransactionsTable = ({
    transactions = [],
    loading = false,
    onViewTransaction,
}) => {
    const theme = useTheme();

    const handleActionSelected = (action, id) => {
        const transaction = transactions.find(t =>
            t.transactionId === id ||
            t._id === id ||
            t.id === id ||
            (t._id && t._id.toString().substring(0, 8) === id)
        );
        if (!transaction) {
            console.error('Transaction not found with id:', id);
            return;
        }
        switch (action.toLowerCase()) {
            case 'view':
                if (onViewTransaction) {
                    onViewTransaction(transaction);
                }
                break;
            default:
                console.warn('Unknown action:', action);
        }
    };

    const handleRowClick = (row) => {
        if (onViewTransaction) {
            onViewTransaction(row);
        }
    };

    const getActionsForTransaction = (status) => {
        return ['View'];
    };

    const transformedTransactions = transactions.map(transaction => {
        const businessName = transaction?.businessName ||
            transaction?.business?.name ||
            transaction?.businessId ||
            'N/A';
        const datetime = transaction?.createdAt ||
            transaction?.timestamp ||
            transaction?.transactionDate ||
            transaction?.date ||
            new Date().toISOString();

        let productsText = "No items";
        if (transaction?.items && Array.isArray(transaction.items)) {
            productsText = transaction.items.map(item =>
                item.productName || item.name || 'Product'
            ).join(", ");
        } else if (transaction?.products && Array.isArray(transaction.products)) {
            productsText = transaction.products.map(product =>
                product.name || 'Product'
            ).join(", ");
        }

        const totalAmount = parseFloat(transaction?.totalAmount) ||
            parseFloat(transaction?.amount) ||
            parseFloat(transaction?.transactionAmount) ||
            0;

        const commission = parseFloat(transaction?.commission) ||
            (totalAmount * 0.05); // 5% if not specified
        const paymentMethod = transaction?.paymentMethod ||
            transaction?.payment_method ||
            'Unknown';
        const status = transaction?.status || 'Unknown';
        const transactionId = transaction?.transactionId ||
            transaction?._id?.toString()?.substring(0, 8) ||
            transaction?.id?.toString()?.substring(0, 8) ||
            'N/A';

        return {
            ...transaction,
            id: transactionId,
            datetime: `${formatDisplayDate(datetime)} ${formatDisplayTime(datetime)}`,
            business: businessName,
            products: productsText,
            amount: `KSh ${totalAmount.toLocaleString('en-KE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`,
            commission: `KSh ${commission.toLocaleString('en-KE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`,
            payment: paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1).toLowerCase(),
            status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
            action: transactionId,
        };
    });

    if (loading) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200 mt-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">Loading transactions...</h3>
                <p className="text-gray-500">Please wait while we fetch the data.</p>
            </div>
        );
    }
    if (transactions.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200 mt-4">
                <Package size={48} className="text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-700 mb-1">No transactions found</h3>
                <p className="text-gray-500">No transactions match the selected criteria.</p>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                    Transactions Overview
                </h3>
                <div className="text-sm text-gray-500">
                    Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
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