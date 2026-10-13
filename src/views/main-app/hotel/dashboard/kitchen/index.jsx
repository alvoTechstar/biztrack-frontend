import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hotelOrderActions } from "../../../../../store";
import { ChefHat, Clock, CheckCircle, UtensilsCrossed, ShoppingCart, Bell, StickyNote } from "lucide-react";
import { useTheme } from "../../../../../components/theme/ThemeContext";
import { GET, PUT } from "../../../../../services/DatabaseServiceImp";
import URLS from "../../../../../utilities/Endpoints";
import Toaster from "../../../../../components/Toaster";

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

const isUrgent = (iso) =>
  Math.floor((Date.now() - new Date(iso).getTime()) / 60000) >= 15;

// Same card language as the waiter/cashier dashboards
const SummaryCard = ({ title, value, icon: Icon, bgColor, textColor, sub }) => (
  <div className={`${bgColor} rounded-2xl p-5 shadow-sm border border-white/60`}>
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
        <p className={`text-2xl font-bold ${textColor} mt-1 truncate`}>{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-3 ${bgColor.replace("50", "100")}`}>
        <Icon className={`h-5 w-5 ${textColor}`} />
      </div>
    </div>
  </div>
);

// Food is pre-cooked — everything on the menu is ready to serve.
// The kitchen board is a pure serve queue: new orders land here,
// one tap serves them straight to the waiter.
const KitchenDisplay = () => {
  const dispatch = useDispatch();
  const { primaryColor } = useTheme();
  const currentUser = useSelector((s) => s.auth?.value);
  const allOrders = useSelector((s) => s.hotelOrders.orders);
  const [, tick] = useState(0);

  // Errors only — the board itself is the status, no banners here
  const [toaster, setToaster] = useState({ open: false, state: "true", title: "", message: "" });
  const showToaster = useCallback((success, title, message) => {
    setToaster({ open: true, state: success ? "true" : "false", title, message });
  }, []);
  const closeToaster = useCallback(() => setToaster((prev) => ({ ...prev, open: false })), []);

  // Tick every minute for waiting times
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

  // Fetch on mount, then poll so waiter orders land without a refresh
  useEffect(() => {
    fetchOrders();
    const id = setInterval(fetchOrders, 30000);
    return () => clearInterval(id);
  }, [fetchOrders]);

  // Serve queue: anything not yet handed to the waiter.
  // served = food delivered to customer but order still OPEN (awaiting payment).
  // completed = CLOSED by cashier after payment. Only completed is done.
  const queue = useMemo(
    () => allOrders.filter((o) => !["served", "completed"].includes(o.status)),
    [allOrders]
  );
  const servedOpen = useMemo(
    () => allOrders.filter((o) => o.status === "served"),
    [allOrders]
  );
  const completedClosed = useMemo(
    () => allOrders.filter((o) => o.status === "completed"),
    [allOrders]
  );
  const urgentCount = queue.filter((o) => isUrgent(o.createdAt)).length;

  // Urgent first, then oldest — straight down the queue
  const sorted = useMemo(() => [...queue].sort((a, b) => {
    const aUrgent = isUrgent(a.createdAt);
    const bUrgent = isUrgent(b.createdAt);
    if (aUrgent && !bUrgent) return -1;
    if (!aUrgent && bUrgent) return 1;
    return new Date(a.createdAt) - new Date(b.createdAt);
  }), [queue]);

  const formatItems = (items = []) =>
    items.slice(0, 3).map((i) => `${i.quantity}× ${i.name}`).join(", ") +
    (items.length > 3 ? ` +${items.length - 3} more` : "");

  // One tap marks it served = waiter has taken the food to the customer.
  // The order stays OPEN (served, awaiting payment) — only the cashier
  // closes it (completed) after payment. Reverts + toasts on failure
  // so the board never lies.
  const serveOrder = useCallback(async (id) => {
    const order = allOrders.find((o) => o.id === id);
    const prevStatus = order?.status;
    dispatch(hotelOrderActions.updateOrderStatus({ id, status: "served" }));
    const backendId = order?.backendId || order?.id;
    try {
      if (!backendId) throw new Error("Missing order reference");
      await PUT(URLS.TRANSACTIONS.UPDATE_TRANSACTION.replace(":id", backendId), { status: "served" });
    } catch (_) {
      if (prevStatus) dispatch(hotelOrderActions.updateOrderStatus({ id, status: prevStatus }));
      showToaster(false, "Error", "Could not serve — check connection and retry");
    }
  }, [allOrders, dispatch, showToaster]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            <ChefHat size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Kitchen Display</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats — same cards as waiter/cashier */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="To Serve"
          value={queue.length}
          icon={Bell}
          bgColor="bg-amber-50"
          textColor="text-amber-600"
          sub={urgentCount > 0 ? `${urgentCount} waiting 15+ min` : "Queue is clear"}
        />
        <SummaryCard
          title="Served · awaiting payment"
          value={servedOpen.length}
          icon={CheckCircle}
          bgColor="bg-teal-50"
          textColor="text-teal-600"
          sub="Open — cashier closes after payment"
        />
        <SummaryCard
          title="Completed · closed"
          value={completedClosed.length}
          icon={CheckCircle}
          bgColor="bg-green-50"
          textColor="text-green-600"
          sub="Paid and closed by cashier"
        />
        <SummaryCard
          title="Total Today"
          value={queue.length + servedOpen.length + completedClosed.length}
          icon={ShoppingCart}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
      </div>

      {/* Serve queue */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 pt-4 pb-2 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Serve Queue</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {queue.length === 0
              ? "Nothing waiting — new orders land here"
              : `${queue.length} order${queue.length !== 1 ? "s" : ""} waiting to go out`}
          </p>
        </div>

        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <UtensilsCrossed size={52} className="mb-4 opacity-30" />
            <p className="text-lg font-semibold">All caught up</p>
            <p className="text-sm mt-1 opacity-60">Orders will appear here when waiters submit them</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">Order</th>
                  <th className="px-5 py-3 text-left">Table</th>
                  <th className="px-5 py-3 text-left">Waiter</th>
                  <th className="px-5 py-3 text-left">Waiting</th>
                  <th className="px-5 py-3 text-left">Items</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.map((order) => {
                  const urgent = isUrgent(order.createdAt);
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-gray-50 transition-colors ${urgent ? "bg-red-50/60" : ""}`}
                    >
                      <td className="px-5 py-3 text-sm font-mono font-semibold text-gray-800">
                        {order.id}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {order.tableNumber}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {order.waiter || "—"}
                      </td>
                      <td className="px-5 py-3 text-sm whitespace-nowrap">
                        <div className={`flex items-center gap-1 ${urgent ? "text-red-600 font-semibold" : "text-gray-500"}`}>
                          <Clock size={12} className={urgent ? "text-red-400" : "text-gray-400"} />
                          {elapsed(order.createdAt)}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        <span className="font-medium text-gray-800">{formatItems(order.items)}</span>
                        {order.note && (
                          <span className="flex items-start gap-1 mt-1 text-xs text-yellow-800">
                            <StickyNote size={12} className="shrink-0 mt-0.5" />
                            <span className="truncate max-w-[220px]">{order.note}</span>
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => serveOrder(order.id)}
                            className="px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 active:scale-95 transition-all whitespace-nowrap"
                          >
                            Serve
                          </button>
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

      <Toaster
        open={toaster.open}
        state={toaster.state}
        title={toaster.title}
        message={toaster.message}
        action={closeToaster}
        position="right"
      />
    </div>
  );
};

export default KitchenDisplay;
