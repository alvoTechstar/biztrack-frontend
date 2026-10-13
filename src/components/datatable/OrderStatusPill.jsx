import React from "react";

// Canonical hotel order statuses as stored by the backend
// (pending → in-progress → ready → served → completed, plus cancelled).
// served = food delivered to the customer but the order is still OPEN
// (awaiting payment); completed = CLOSED by the cashier after payment.
export const ORDER_STATUS_META = {
  pending: {
    label: "Pending",
    classes: "bg-amber-100 text-amber-800",
  },
  "in-progress": {
    label: "In Progress",
    classes: "bg-blue-100 text-blue-800",
  },
  ready: {
    label: "Ready",
    classes: "bg-purple-100 text-purple-800",
  },
  served: {
    label: "Served",
    classes: "bg-pink-100 text-pink-800",
  },
  completed: {
    label: "Completed",
    classes: "bg-green-100 text-green-800",
  },
  cancelled: {
    label: "Cancelled",
    classes: "bg-red-100 text-red-800",
  },
};

// Lifecycle order — used to sort status filter options consistently.
export const ORDER_STATUS_ORDER = [
  "pending",
  "in-progress",
  "ready",
  "served",
  "completed",
  "cancelled",
];

// Display label for a backend status (falls back to a capitalized raw value
// so unknown statuses never render blank).
export const formatOrderStatus = (status) => {
  const key = String(status || "").toLowerCase();
  if (ORDER_STATUS_META[key]) return ORDER_STATUS_META[key].label;
  const raw = String(status || "").trim();
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "—";
};

// Rectangle pill with a small border radius and a fixed width so every
// status renders identically across kitchen / waiter / cashier / admin.
export default function OrderStatusPill({ status, className = "" }) {
  const key = String(status || "").toLowerCase();
  const meta = ORDER_STATUS_META[key];
  return (
    <span
      className={`inline-block w-28 px-2 py-0.5 rounded text-xs font-semibold text-center whitespace-nowrap ${
        meta ? meta.classes : "bg-gray-100 text-gray-600"
      } ${className}`}
    >
      {formatOrderStatus(status)}
    </span>
  );
}
