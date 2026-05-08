import React from "react";
import DataTable from "../../../../components/datatable";
import { useTheme } from "../../../../components/theme/ThemeContext";

const DebtDataTable = ({
    tableData,
    selectedRows,
    setSelectedRows,
    handleRowSelect,
    handleActionSelected,
    setSelectAll,
    searchFilter
}) => {
    const tableHeaders = [
        { key: "createdDate", title: "Created Date" },
        { key: "transactionId", title: "Transaction Id" },
        { key: "customerName", title: "Customer Name" },
        { key: "customerPhone", title: "Phone Number" },
        { key: "amount", title: "Amount" },
        { key: "expectedPaymentDate", title: "Due Date" },
        { key: "datePaid", title: "Paid Date" },
        { key: "paymentMethod", title: "Payment Method" },
        { key: "status", title: "Status" },
        { key: "action", title: "Actions" },
    ];

    const tableActions = ['pay', 'view'];
      const { primaryColor } = useTheme();
    

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <DataTable
                type="debts"
                clickable={true}
                color={primaryColor}
                data={tableData}
                headers={tableHeaders}
                actions={tableActions}
                selected={selectedRows}
                selectedAction={setSelectedRows}
                selectedRow={handleRowSelect}
                actionSelected={handleActionSelected}
                selectAll={setSelectAll}
                searchFilter={searchFilter}
            // No need for customRenderCell since DataTable handles it internally
            />
        </div>
    );
};

export default DebtDataTable;