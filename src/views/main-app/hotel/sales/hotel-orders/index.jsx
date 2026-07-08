import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hotelOrderActions } from "../../../../../store";
import { Clock, ChevronDown, ChevronUp, CheckCircle, XCircle, ChefHat, Bell, RefreshCw } from "lucide-react";
import { GET } from "../../../../../services/DatabaseServiceImp";
import URLS from "../../../../../utilities/Endpoints";

const STATUS_STYLES = {
  pending:       "bg-yellow-100 text-yellow-800",
  "in-progress": "bg-blue-100 text-blue-800",
  ready:         "bg-purple-100 text-purple-800",
  served:        "bg-green-100 text-green-800",
  completed:     "bg-emerald-100 text-emerald-800",
  cancelled:     "bg-red-100 text-red-800",
};

const STATUS_LABEL = {
  pending:       "Pending",
  "in-progress": "In Progress",
  ready:         "Ready",
  served:        "Served",
  completed:     "Completed",
  cancelled:     "Cancelled",
};

const formatKsh = (amount) => `KSh ${Number(amount).toLocaleString()}`;

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", hour12: true });

const elapsed = (iso) => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
};

const FILTERS = ["all", "active", "served", "cancelled"];

// Backend transaction items use productName/unitPrice; local ones use name/price
const normalizeItems = (items = []) =>
  items.map((it) => ({
    name: it.productName || it.name || "",
    quantity: Number(it.quantity) || 1,
    price: Number(it.unitPrice ?? it.price) || 0,
    category: it.category || "",
    image: it.image || "",
  }));

// Transform a backend transaction to our Redux order shape
const toOrder = (t) => ({
  id:           t.transactionId || t.orderId || t.orderNumber || t._id || t.id,
  backendId:    t._id || t.id,
  tableNumber:  t.tableNumber || "—",
  items:        normalizeItems(t.items),
  total:        Number(t.totalAmount ?? t.total) || 0,
  status:       t.status || "pending",
  waiter:       t.shopkeeperName || t.waiter || "",
  note:         t.notes || t.note || "",
  paymentMethod: t.paymentMethod || null,
  createdAt:    t.createdAt || t.timestamp,
  updatedAt:    t.updatedAt,
});

export default function HotelOrders() {
  const dispatch    = useDispatch();
  const currentUser = useSelector((s) => s.auth?.value);
  const orders      = useSelector((state) => state.hotelOrders.orders);

  const businessId = String(
    currentUser?.businessId || currentUser?.institutionId ||
    currentUser?.associatedBusinessId || ""
  ).trim();

  const [activeFilter, setActiveFilter]   = useState("active");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [refreshing, setRefreshing]       = useState(false);

  // ── Fetch & merge on mount ────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    if (!businessId) return;
    setRefreshing(true);
    try {
      const endpoint = URLS.TRANSACTIONS.GET_TRANSACTIONS_BY_BUSINESS
        .replace(":businessId", businessId);
      const res = await GET(endpoint);
      if (res?.success) {
        const incoming = (res.data || res.transactions || [])
          .filter((t) => t.type === "hotel_order" || !t.type)
          .map(toOrder);
        dispatch(hotelOrderActions.mergeOrders(incoming));
      }
    } catch (_) {}
    finally { setRefreshing(false); }
  }, [businessId, dispatch]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") return ["pending", "in-progress", "ready"].includes(o.status);
    if (activeFilter === "served") return o.status === "served" || o.status === "completed";
    if (activeFilter === "cancelled") return o.status === "cancelled";
    return true;
  });

  const counts = {
    active: orders.filter((o) => ["pending", "in-progress", "ready"].includes(o.status)).length,
    served: orders.filter((o) => o.status === "served" || o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  const updateStatus = (id, status) =>
    dispatch(hotelOrderActions.updateOrderStatus({ id, status }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Hotel Orders</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{orders.length} total orders</span>
          <button
            onClick={fetchOrders}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
              activeFilter === f
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {f === "active" ? `Active (${counts.active})`
              : f === "served" ? `Served (${counts.served})`
              : f === "cancelled" ? `Cancelled (${counts.cancelled})`
              : "All"}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Clock size={44} className="mb-3 opacity-30" />
          <p>No orders in this category.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left">Order</th>
                <th className="px-5 py-3 text-left">Table</th>
                <th className="px-5 py-3 text-left">Items</th>
                <th className="px-5 py-3 text-left">Waiter</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Time</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((order) => {
                const total = order.total ?? order.items.reduce((s, i) => s + i.price * i.quantity, 0);
                const isExpanded = expandedOrder === order.id;
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-mono font-semibold text-gray-800">{order.id}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{order.tableNumber}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                        <button
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="mt-2 pl-3 border-l-2 border-indigo-200 space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <span>{item.quantity}× {item.name}</span>
                              <span className="text-gray-400">{formatKsh(item.price * item.quantity)}</span>
                            </div>
                          ))}
                          {order.note && (
                            <p className="text-xs text-amber-600 mt-1 italic">"{order.note}"</p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{order.waiter || "—"}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-800 text-right">
                      {formatKsh(total)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status] || "bg-gray-100 text-gray-500"}`}>
                        {STATUS_LABEL[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {order.createdAt ? elapsed(order.createdAt) : "—"}
                      </div>
                      {order.createdAt && (
                        <div className="text-gray-300">{formatTime(order.createdAt)}</div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center gap-1.5 justify-end flex-wrap">
                        {order.status === "pending" && (
                          <>
                            <button
                              onClick={() => updateStatus(order.id, "in-progress")}
                              title="Send to Kitchen"
                              className="flex items-center gap-1 px-2.5 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium transition-colors"
                            >
                              <ChefHat size={12} /> Kitchen
                            </button>
                            <button
                              onClick={() => updateStatus(order.id, "cancelled")}
                              title="Cancel Order"
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        {order.status === "in-progress" && (
                          <>
                            <button
                              onClick={() => updateStatus(order.id, "ready")}
                              title="Mark as Ready"
                              className="flex items-center gap-1 px-2.5 py-1 text-xs bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 font-medium transition-colors"
                            >
                              <Bell size={12} /> Ready
                            </button>
                            <button
                              onClick={() => updateStatus(order.id, "cancelled")}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        {order.status === "ready" && (
                          <button
                            onClick={() => updateStatus(order.id, "served")}
                            title="Mark as Served"
                            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium transition-colors"
                          >
                            <CheckCircle size={12} /> Served
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
