import React, { useMemo, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart, DollarSign, CreditCard,
  TrendingUp, Clock, Package, ArrowRight,
} from "lucide-react";
import { hotelOrderActions } from "../../../../../store";
import { GET } from "../../../../../services/DatabaseServiceImp";
import URLS from "../../../../../utilities/Endpoints";

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

const isToday = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth()    === now.getMonth()    &&
    d.getDate()     === now.getDate()
  );
};

const formatKsh = (n) => `KSh ${Number(n).toLocaleString()}`;

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-KE", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

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

const PAYMENT_BADGE = {
  mpesa: "bg-green-100 text-green-800",
  cash:  "bg-blue-100 text-blue-800",
};

const CashierDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const allOrders = useSelector((s) => s.hotelOrders.orders);
  const currentUser = useSelector((s) => s.auth?.value);

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

  // Fetch on mount, then poll so new waiter orders appear without a manual refresh
  useEffect(() => {
    fetchOrders();
    const id = setInterval(fetchOrders, 30000);
    return () => clearInterval(id);
  }, [fetchOrders]);

  // Today's completed orders
  const completedToday = useMemo(
    () => allOrders.filter(
      (o) => o.status === "completed" && isToday(o.updatedAt || o.createdAt)
    ),
    [allOrders]
  );

  // Pending payment (served, ready, in-progress, pending)
  const awaitingPayment = allOrders.filter((o) =>
    ["served", "ready", "in-progress", "pending"].includes(o.status)
  ).length;

  const totalRevenue = useMemo(
    () => completedToday.reduce((s, o) => s + Number(o.total || 0), 0),
    [completedToday]
  );

  const mpesaCount = completedToday.filter((o) => o.paymentMethod === "mpesa").length;
  const cashCount  = completedToday.filter((o) => o.paymentMethod === "cash").length;

  const topProduct = useMemo(() => {
    const counts = {};
    completedToday.forEach((o) =>
      o.items?.forEach((item) => {
        counts[item.name] = (counts[item.name] || 0) + item.quantity;
      })
    );
    const entries = Object.entries(counts);
    if (!entries.length) return { name: "—", qty: 0 };
    const [name, qty] = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
    return { name, qty };
  }, [completedToday]);

  const formatItems = (items = []) =>
    items.slice(0, 3).map((i) => `${i.quantity}× ${i.name}`).join(", ") +
    (items.length > 3 ? ` +${items.length - 3} more` : "");

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cashier Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString("en-KE", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>

        {awaitingPayment > 0 && (
          <button
            onClick={() => navigate("/orders/complete")}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm"
          >
            <ShoppingCart size={15} />
            {awaitingPayment} order{awaitingPayment !== 1 ? "s" : ""} awaiting payment
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Orders Completed Today"
          value={completedToday.length}
          icon={ShoppingCart}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
          sub={awaitingPayment > 0 ? `${awaitingPayment} awaiting payment` : "All caught up!"}
        />
        <SummaryCard
          title="Revenue Today"
          value={formatKsh(totalRevenue)}
          icon={DollarSign}
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
        <SummaryCard
          title="M-Pesa vs Cash"
          value={`${mpesaCount} · ${cashCount}`}
          icon={CreditCard}
          bgColor="bg-purple-50"
          textColor="text-purple-600"
          sub={`M-Pesa: ${mpesaCount}  |  Cash: ${cashCount}`}
        />
        <SummaryCard
          title="Top Selling Item"
          value={topProduct.name}
          icon={TrendingUp}
          bgColor="bg-orange-50"
          textColor="text-orange-600"
          sub={topProduct.qty > 0 ? `${topProduct.qty} sold today` : "No sales yet"}
        />
      </div>

      {/* Completed orders table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Today's Completed Orders
          </h2>
          <button
            onClick={() => navigate("/orders/complete")}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            Process orders <ArrowRight size={14} />
          </button>
        </div>

        {completedToday.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No completed orders yet today</p>
            <p className="text-sm mt-1 opacity-60">
              Completed orders will appear here after payment is processed
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">Order ID</th>
                  <th className="px-5 py-3 text-left">Table</th>
                  <th className="px-5 py-3 text-left">Time</th>
                  <th className="px-5 py-3 text-left">Items</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-left">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...completedToday]
                  .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
                  .map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-sm font-mono font-semibold text-gray-800">
                        {order.id}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {order.tableNumber}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="text-gray-400" />
                          {formatTime(order.updatedAt || order.createdAt)}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        <div className="flex items-start gap-1">
                          <Package size={13} className="text-gray-400 mt-0.5 shrink-0" />
                          <span>{formatItems(order.items)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-gray-800 text-right whitespace-nowrap">
                        {formatKsh(order.total || 0)}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          PAYMENT_BADGE[order.paymentMethod] || "bg-gray-100 text-gray-600"
                        }`}>
                          <CreditCard size={10} />
                          {order.paymentMethod === "mpesa" ? "M-Pesa" : order.paymentMethod === "cash" ? "Cash" : order.paymentMethod || "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashierDashboard;
