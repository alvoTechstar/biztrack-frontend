import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hotelOrderActions } from "../../../../../store";
import { useNavigate } from "react-router-dom";
import {
  Plus, Clock, CheckCircle, ChefHat, Bell,
  ShoppingBag, AlertCircle, UtensilsCrossed, Printer,
} from "lucide-react";
import { useTheme } from "../../../../../components/theme/ThemeContext";
import { GET, PUT } from "../../../../../services/DatabaseServiceImp";
import URLS from "../../../../../utilities/Endpoints";
import MenuItemImage from "../../../../../components/menu/MenuItemImage";
import { printOrderReceipt } from "../../../../../utilities/ReceiptPrinter";

const formatKsh = (n) => `KSh ${Number(n).toLocaleString()}`;

// Backend transaction items use productName/unitPrice; local ones use name/price
const normalizeItems = (items = []) =>
  items.map((it) => ({
    name: it.productName || it.name || "",
    quantity: Number(it.quantity) || 1,
    price: Number(it.unitPrice ?? it.price) || 0,
    category: it.category || "",
    image: it.image || "",
  }));

// Transform a backend transaction to the Redux order shape
const toOrder = (t) => ({
  id:            t.transactionId || t.orderId || t.orderNumber || t._id || t.id,
  backendId:     t._id || t.id,
  tableNumber:   t.tableNumber || "—",
  items:         normalizeItems(t.items),
  total:         Number(t.totalAmount ?? t.total) || 0,
  status:        t.status || "pending",
  waiter:        t.shopkeeperName || t.waiter || "",
  note:          t.notes || t.note || "",
  paymentMethod: t.paymentMethod || null,
  createdAt:     t.createdAt || t.timestamp,
  updatedAt:     t.updatedAt,
});

const elapsed = (iso) => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min";
  if (mins < 60) return `${mins} mins`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

const STATUS_CONFIG = {
  pending: {
    label: "Waiting for Kitchen",
    icon: Clock,
    cardBorder: "border-amber-300",
    cardBg: "bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-400",
  },
  "in-progress": {
    label: "Kitchen Cooking",
    icon: ChefHat,
    cardBorder: "border-blue-300",
    cardBg: "bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-400",
  },
  ready: {
    label: "Ready — Collect Now!",
    icon: Bell,
    cardBorder: "border-green-400",
    cardBg: "bg-green-50",
    badge: "bg-green-100 text-green-700",
    dot: "bg-green-500",
  },
  served: {
    label: "Served",
    icon: CheckCircle,
    cardBorder: "border-gray-200",
    cardBg: "bg-gray-50",
    badge: "bg-gray-100 text-gray-500",
    dot: "bg-gray-300",
  },
};

const OrderCard = ({ order, onMarkServed, onPrintBill }) => {
  const [, tick] = useState(0);
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  const isReady = order.status === "ready";

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={`rounded-2xl border-2 ${cfg.cardBorder} ${cfg.cardBg} p-4 flex flex-col gap-3 shadow-sm transition-all ${
        isReady ? "ring-2 ring-green-400 ring-offset-1 shadow-green-100 shadow-md" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-gray-800">{order.id}</p>
          <p className="text-sm font-semibold text-gray-600">📍 {order.tableNumber}</p>
        </div>
        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${cfg.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${isReady ? "animate-pulse" : ""}`} />
          {cfg.label}
        </span>
      </div>

      {/* Time */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <Clock size={11} />
        {elapsed(order.createdAt)}
        {" · "}
        {new Date(order.createdAt).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", hour12: true })}
      </div>

      {/* Items */}
      <div className="border-t border-gray-200 pt-2.5 space-y-1.5">
        {order.items.slice(0, 4).map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 text-sm">
            <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-white shadow-sm">
              <MenuItemImage
                src={item.image}
                name={item.name}
                category={item.category}
                emojiSize="text-base"
              />
            </div>
            <span className="text-gray-700 min-w-0 truncate flex-1">{item.name}</span>
            <span className="text-xs font-bold text-gray-500 bg-white/70 border border-gray-200 rounded-full px-2 py-0.5 shrink-0">
              ×{item.quantity}
            </span>
          </div>
        ))}
        {order.items.length > 4 && (
          <p className="text-xs text-gray-400 pl-11">+{order.items.length - 4} more items</p>
        )}
      </div>

      {/* Note */}
      {order.note && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-2.5 py-1.5 text-xs text-yellow-800">
          📝 {order.note}
        </div>
      )}

      {/* Total */}
      <div className="flex justify-between items-center text-sm border-t border-gray-200 pt-2">
        <span className="text-gray-500">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
        <span className="font-bold text-gray-800">{formatKsh(order.total)}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {isReady && (
          <button
            onClick={() => onMarkServed(order.id)}
            className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle size={15} /> Mark as Served
          </button>
        )}
        <button
          onClick={() => onPrintBill(order)}
          title="Print bill for the table"
          className={`${
            isReady ? "px-3" : "flex-1"
          } py-2.5 border border-gray-300 bg-white text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center gap-2`}
        >
          <Printer size={15} />
          {!isReady && "Print Bill"}
        </button>
      </div>
    </div>
  );
};

const StatChip = ({ label, value, color, pulse }) => (
  <div className={`bg-white rounded-xl border px-4 py-3 text-center shadow-sm min-w-[80px] ${pulse ? "animate-pulse" : ""}`}>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
  </div>
);

const WaiterDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { primaryColor, businessName } = useTheme();
  const currentUser = useSelector((s) => s.auth?.value);
  const allOrders = useSelector((s) => s.hotelOrders.orders);
  const [activeFilter, setActiveFilter] = useState("active");
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const businessId = String(
    currentUser?.businessId || currentUser?.institutionId || currentUser?.associatedBusinessId || ""
  ).trim();

  // Fetch orders from backend, merging into Redux (keeps local status if ahead)
  const fetchOrders = useCallback(async () => {
    if (!businessId) return;
    try {
      const endpoint = URLS.TRANSACTIONS.GET_TRANSACTIONS_BY_BUSINESS.replace(":businessId", businessId);
      const res = await GET(endpoint);
      if (res?.success) {
        const incoming = (res.data || res.transactions || [])
          .filter((t) => t.type === "hotel_order" || !t.type)
          .map(toOrder);
        dispatch(hotelOrderActions.mergeOrders(incoming));
      }
    } catch (_) {
      // Keep showing local orders if the fetch fails
    }
  }, [businessId, dispatch]);

  // Fetch on mount, then poll so kitchen status changes appear without a manual refresh
  useEffect(() => {
    fetchOrders();
    const id = setInterval(fetchOrders, 30000);
    return () => clearInterval(id);
  }, [fetchOrders]);

  const waiterName = currentUser?.name || currentUser?.username || currentUser?.firstName || "Waiter";

  // My orders — filter by waiter name match (case-insensitive)
  const myOrders = allOrders.filter((o) => {
    const match = (o.waiter || "").toLowerCase().includes(waiterName.toLowerCase()) ||
      waiterName.toLowerCase().includes((o.waiter || "").toLowerCase());
    return match;
  });

  const readyOrders    = myOrders.filter((o) => o.status === "ready");
  const activeOrders   = myOrders.filter((o) => ["pending", "in-progress", "ready"].includes(o.status));
  const servedToday    = myOrders.filter((o) => o.status === "served" || o.status === "completed");

  const displayed =
    activeFilter === "active"
      ? activeOrders
      : activeFilter === "ready"
      ? readyOrders
      : servedToday;

  // Sort: ready first, then by oldest
  const sorted = [...displayed].sort((a, b) => {
    if (a.status === "ready" && b.status !== "ready") return -1;
    if (a.status !== "ready" && b.status === "ready") return 1;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const markServed = (id) => {
    dispatch(hotelOrderActions.updateOrderStatus({ id, status: "served" }));
    // Persist to backend so the cashier sees the order as served (fire-and-forget)
    const order = allOrders.find((o) => o.id === id);
    const backendId = order?.backendId || order?.id;
    if (backendId) {
      PUT(URLS.TRANSACTIONS.UPDATE_TRANSACTION.replace(":id", backendId), {
        status: "served",
      }).catch(() => {/* non-blocking */});
    }
  };

  // Print the bill the waiter hands to the table; paid orders print as a receipt
  const printBill = (order) => {
    printOrderReceipt(order, {
      businessName,
      businessTagline: "Restaurant",
      variant: order.status === "completed" ? "receipt" : "bill",
    });
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {greeting()}, {waiterName}!
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard/create-order")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 shadow-sm"
          style={{ backgroundColor: primaryColor }}
        >
          <Plus size={16} /> New Order
        </button>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3 mb-6">
        <StatChip label="Active"  value={activeOrders.length}  color="text-indigo-600" />
        <StatChip label="Ready"   value={readyOrders.length}   color="text-green-600"  pulse={readyOrders.length > 0} />
        <StatChip label="Served Today" value={servedToday.length} color="text-gray-600" />
      </div>

      {/* Ready alert banner */}
      {readyOrders.length > 0 && (
        <div className="mb-5 bg-green-600 text-white rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-md">
          <Bell size={20} className="shrink-0 animate-bounce" />
          <div>
            <p className="font-bold">
              {readyOrders.length} order{readyOrders.length !== 1 ? "s" : ""} ready to collect!
            </p>
            <p className="text-sm text-green-100">
              Go to the kitchen to pick up and serve your tables.
            </p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-5">
        {[
          { key: "active", label: `Active (${activeOrders.length})` },
          { key: "ready",  label: `Ready (${readyOrders.length})` },
          { key: "served", label: `Served Today (${servedToday.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeFilter === tab.key
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Order grid */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <UtensilsCrossed size={52} className="mb-4 opacity-30" />
          <p className="text-lg font-semibold">
            {myOrders.length === 0
              ? "No orders yet — create one to get started"
              : "Nothing here right now"}
          </p>
          {myOrders.length === 0 && (
            <button
              onClick={() => navigate("/dashboard/create-order")}
              className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus size={15} /> Create First Order
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sorted.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onMarkServed={markServed}
              onPrintBill={printBill}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WaiterDashboard;
