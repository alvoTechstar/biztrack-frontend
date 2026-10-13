import React from "react";
import { X, Printer, StickyNote } from "lucide-react";

const formatKsh = (n) => `KSh ${Number(n).toLocaleString()}`;

// Shared hotel order details — opened from the View action in the waiter,
// cashier (and anywhere else an order row appears). Print lives inside,
// next to any extra actions the caller passes (e.g. Mark served).
export default function OrderDetailsModal({
  open,
  onClose,
  order,
  statusBadge = null,
  accentColor = "#4F46E5",
  onPrint,
  extraActions = null,
}) {
  if (!open || !order) return null;

  const items = order.items || [];
  const itemCount = items.reduce((s, i) => s + Number(i.quantity || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="font-mono font-bold text-gray-800 truncate">{order.id}</h2>
            {statusBadge}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 ml-2"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div>
              <p className="text-xs text-gray-400">Table</p>
              <p className="font-semibold text-gray-800">{order.tableNumber || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Time</p>
              <p className="font-semibold text-gray-800">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString("en-KE", {
                      day: "numeric",
                      month: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "—"}
              </p>
            </div>
            {order.waiter ? (
              <div>
                <p className="text-xs text-gray-400">Waiter</p>
                <p className="font-semibold text-gray-800">{order.waiter}</p>
              </div>
            ) : null}
            {order.paymentMethod ? (
              <div>
                <p className="text-xs text-gray-400">Payment</p>
                <p className="font-semibold text-gray-800 capitalize">
                  {order.paymentMethod === "mpesa" ? "M-Pesa" : order.paymentMethod}
                </p>
              </div>
            ) : null}
          </div>

          <p className="text-xs text-gray-400 mb-2">
            Items ({itemCount})
          </p>
          <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 mb-4">
            {items.length === 0 ? (
              <p className="px-3 py-3 text-sm text-gray-400">No items</p>
            ) : (
              items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="text-gray-700 min-w-0 truncate">
                    <span className="font-bold text-gray-500">{item.quantity}× </span>
                    {item.name}
                  </span>
                  <span className="font-semibold text-gray-800 ml-3 shrink-0">
                    {formatKsh(Number(item.quantity || 0) * Number(item.price || 0))}
                  </span>
                </div>
              ))
            )}
          </div>

          {order.note ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-2.5 py-1.5 text-xs text-yellow-800 flex items-start gap-1.5 mb-4">
              <StickyNote size={12} className="shrink-0 mt-0.5" />
              {order.note}
            </div>
          ) : null}

          <div className="flex justify-between items-center text-sm border-t border-gray-200 pt-3">
            <span className="text-gray-500">Total</span>
            <span className="font-bold text-gray-900 text-lg">
              {formatKsh(order.total || 0)}
            </span>
          </div>
        </div>

        {/* Footer — print lives here */}
        <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 border-t border-gray-200 shrink-0">
          {extraActions}
          <button
            type="button"
            onClick={() => onPrint && onPrint(order)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
            style={{ backgroundColor: accentColor }}
          >
            <Printer size={15} /> Print
          </button>
        </div>
      </div>
    </div>
  );
}
