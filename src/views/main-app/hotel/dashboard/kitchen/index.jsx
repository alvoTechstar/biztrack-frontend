import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hotelOrderActions } from "../../../../../store";
import { ChefHat, Clock, Bell, CheckCircle, AlertCircle, UtensilsCrossed } from "lucide-react";
import { useTheme } from "../../../../../components/theme/ThemeContext";

const formatKsh = (amount) => `KSh ${Number(amount).toLocaleString()}`;

const elapsed = (iso) => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min";
  if (mins < 60) return `${mins} mins`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
};

const isUrgent = (iso) =>
  Math.floor((Date.now() - new Date(iso).getTime()) / 60000) >= 15;

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    border: "border-amber-400",
    bg: "bg-amber-50",
    badge: "bg-amber-100 text-amber-800",
    dot: "bg-amber-400",
  },
  "in-progress": {
    label: "Cooking",
    border: "border-blue-400",
    bg: "bg-blue-50",
    badge: "bg-blue-100 text-blue-800",
    dot: "bg-blue-400",
  },
};

const OrderCard = ({ order, onStartCooking, onMarkReady }) => {
  const [, forceUpdate] = useState(0);
  const urgent = isUrgent(order.createdAt);
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  // Re-render every minute to update elapsed time
  useEffect(() => {
    const id = setInterval(() => forceUpdate((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={`relative rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-5 flex flex-col gap-3 shadow-sm transition-all hover:shadow-md ${
        urgent ? "ring-2 ring-red-400 ring-offset-1" : ""
      }`}
    >
      {/* Urgent badge */}
      {urgent && (
        <span className="absolute -top-3 left-4 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <AlertCircle size={11} /> Urgent
        </span>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="font-bold text-gray-800 text-lg">{order.id}</span>
          <p className="text-sm font-semibold text-gray-600 mt-0.5">
            📍 {order.tableNumber}
          </p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${cfg.badge}`}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1.5`} />
          {cfg.label}
        </span>
      </div>

      {/* Time */}
      <div className={`flex items-center gap-1.5 text-sm ${urgent ? "text-red-600 font-semibold" : "text-gray-500"}`}>
        <Clock size={13} />
        {elapsed(order.createdAt)}
        {urgent && " — needs attention!"}
      </div>

      {/* Items */}
      <div className="border-t border-gray-200 pt-3 space-y-1.5">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between items-center text-sm">
            <span className="text-gray-700">
              <span className="font-bold text-gray-900">{item.quantity}×</span>{" "}
              {item.name}
            </span>
            <span className="text-gray-400 text-xs">{formatKsh(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      {/* Note */}
      {order.note && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-800">
          📝 {order.note}
        </div>
      )}

      {/* Waiter */}
      <p className="text-xs text-gray-400">Waiter: {order.waiter || "—"}</p>

      {/* Action button */}
      <div className="pt-1">
        {order.status === "pending" && (
          <button
            onClick={() => onStartCooking(order.id)}
            className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <ChefHat size={15} /> Start Cooking
          </button>
        )}
        {order.status === "in-progress" && (
          <button
            onClick={() => onMarkReady(order.id)}
            className="w-full py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Bell size={15} /> Mark Ready
          </button>
        )}
      </div>
    </div>
  );
};

const KitchenDisplay = () => {
  const dispatch = useDispatch();
  const { primaryColor } = useTheme();
  const allOrders = useSelector((s) => s.hotelOrders.orders);
  const [activeFilter, setActiveFilter] = useState("all");
  const [, tick] = useState(0);

  // Tick every minute for elapsed time badges
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const kitchenOrders = allOrders.filter(
    (o) => o.status === "pending" || o.status === "in-progress"
  );

  const pendingCount    = kitchenOrders.filter((o) => o.status === "pending").length;
  const inProgressCount = kitchenOrders.filter((o) => o.status === "in-progress").length;
  const urgentCount     = kitchenOrders.filter((o) => isUrgent(o.createdAt)).length;

  const displayed =
    activeFilter === "all"
      ? kitchenOrders
      : kitchenOrders.filter((o) => o.status === activeFilter);

  // Sort: urgent first, then by oldest first
  const sorted = [...displayed].sort((a, b) => {
    const aUrgent = isUrgent(a.createdAt);
    const bUrgent = isUrgent(b.createdAt);
    if (aUrgent && !bUrgent) return -1;
    if (!aUrgent && bUrgent) return 1;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const startCooking = (id) =>
    dispatch(hotelOrderActions.updateOrderStatus({ id, status: "in-progress" }));

  const markReady = (id) =>
    dispatch(hotelOrderActions.updateOrderStatus({ id, status: "ready" }));

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <div className="bg-white border-b shadow-sm px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: primaryColor }}
          >
            <ChefHat size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Kitchen Display</h1>
            <p className="text-xs text-gray-500">
              {new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", hour12: true })}
              {" — "}
              {new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 flex-wrap">
          <Stat label="Total" value={kitchenOrders.length} color="text-gray-700" />
          <Stat label="Pending" value={pendingCount} color="text-amber-600" />
          <Stat label="Cooking" value={inProgressCount} color="text-blue-600" />
          {urgentCount > 0 && (
            <Stat label="Urgent" value={urgentCount} color="text-red-600" pulse />
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white border-b px-6 flex gap-1">
        {[
          { key: "all", label: "All Orders", count: kitchenOrders.length },
          { key: "pending", label: "Pending", count: pendingCount },
          { key: "in-progress", label: "Cooking", count: inProgressCount },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeFilter === tab.key
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                activeFilter === tab.key ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Order grid */}
      <div className="p-6">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <UtensilsCrossed size={56} className="mb-4 opacity-30" />
            <p className="text-xl font-semibold">
              {kitchenOrders.length === 0
                ? "No orders in the kitchen right now"
                : "No orders in this category"}
            </p>
            <p className="text-sm mt-1 opacity-60">Orders will appear here when waiters submit them</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sorted.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStartCooking={startCooking}
                onMarkReady={markReady}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Stat = ({ label, value, color, pulse }) => (
  <div className={`text-center ${pulse ? "animate-pulse" : ""}`}>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    <p className="text-xs text-gray-500">{label}</p>
  </div>
);

export default KitchenDisplay;
