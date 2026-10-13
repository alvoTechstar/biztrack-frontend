import React from "react";
import { Package } from "lucide-react";
import dayjs from "dayjs";
import DataTable from "../../../../../components/datatable";
import OrderStatusPill from "../../../../../components/datatable/OrderStatusPill";
import TableActions from "../../../../../components/datatable/TableActions";
import { useTheme } from "../../../../../components/theme/ThemeContext";

const RECENT_ORDERS_HEADERS = [
  { title: "Date & Time", key: "datetime" },
  { title: "Transaction ID", key: "id" },
  { title: "Waiter", key: "waiter" },
  { title: "Food", key: "food" },
  { title: "Amount", key: "amount" },
  { title: "Status", key: "status" },
  { title: "Action", key: "action" },
];

const actionsForStatus = (status) =>
  status === "Pending" ? ["edit", "print"] : ["print"];

const RecentOrdersTable = ({ orders = [], onActionClick, dates = null }) => {
  const theme = useTheme();

  const handleActionSelected = (action, id) => {
    if (onActionClick) onActionClick(id, action);
  };

  // Flatten rows for the shared DataTable (same pattern as kiosk TransactionsTable)
  const transformedOrders = orders.map((o) => ({
    ...o,
    id: String(o.id ?? "N/A"),
    waiter: o.waiter || "—",
    food: (o.foodItems || []).filter(Boolean).join(", ") || "—",
    amount: Number(o.amount) || 0,
    datetime:
      o.date && o.time
        ? dayjs(`${o.date}T${o.time}`).format("DD/MM/YYYY HH:mm:ss")
        : "—",
    status: o.status || "Pending",
    availableActions: actionsForStatus(o.status),
    action: String(o.id ?? ""),
  }));

  const renderCell = (column, header) => {
    if (header.key === "amount") {
      return `KSh ${Number(column.amount || 0).toLocaleString()}`;
    }
    if (header.key === "status") {
      return <OrderStatusPill status={column.status} />;
    }
    if (header.key === "action") {
      return (
        <TableActions
          status={column.status}
          actions={column.availableActions || ["print"]}
          id={column.id}
          action={handleActionSelected}
        />
      );
    }
    return column[header.key];
  };

  if (transformedOrders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200 mt-4">
        <Package size={48} className="text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-700 mb-1">No orders yet</h3>
        <p className="text-gray-500">No orders have been recorded for this business.</p>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <div className="flex justify-start items-center mb-2">
        <div className="text-sm text-gray-500">
          {dates?.startDate && dates?.endDate
            ? `Showing results for ${dates.startDate} to ${dates.endDate}`
            : "Showing all results"}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <DataTable
          data={transformedOrders}
          headers={RECENT_ORDERS_HEADERS}
          type="recent-orders"
          selected={[]}
          selectedAction={() => {}}
          selectAll={false}
          all={false}
          actionSelected={handleActionSelected}
          selectedRow={() => {}}
          actions={["print"]}
          clickable={false}
          color={theme.primaryColor}
          customRenderCell={renderCell}
        />
      </div>
    </div>
  );
};

export default RecentOrdersTable;
