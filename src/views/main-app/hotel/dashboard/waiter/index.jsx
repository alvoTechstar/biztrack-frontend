import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hotelOrderActions } from "../../../../../store";
import { useNavigate } from "react-router-dom";
import {
  Plus, Clock, CheckCircle, Bell,
  ShoppingCart, DollarSign, UtensilsCrossed, Eye,
  StickyNote,
} from "lucide-react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useTheme } from "../../../../../components/theme/ThemeContext";
import { GET, PUT } from "../../../../../services/DatabaseServiceImp";
import URLS from "../../../../../utilities/Endpoints";
import SearchInput from "../../../../../components/Input/SearchInput";
import DateRangeInput from "../../../../../components/Input/DateRangeInput";
import FilterInput from "../../../../../components/Input/FilterInput";
import OrderDetailsModal from "../../../../../components/modal/OrderDetailsModal";
import ContentLoader from "../../../../../components/Loader/ContentLoader";
import OrderStatusPill, {
  ORDER_STATUS_META,
  ORDER_STATUS_ORDER,
} from "../../../../../components/datatable/OrderStatusPill";
import { printOrderReceipt } from "../../../../../utilities/ReceiptPrinter";

const formatKsh = (n) => `KSh ${Number(n).toLocaleString()}`;

dayjs.extend(customParseFormat);

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

// Backend order statuses (pending → in-progress → ready → served →
// completed, plus cancelled). Pills render via the shared OrderStatusPill
// so every status is the same rectangle, same width, same small radius.

// Same card language as the cashier dashboard
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

const WaiterDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { primaryColor, businessName } = useTheme();
  const currentUser = useSelector((s) => s.auth?.value);
  const allOrders = useSelector((s) => s.hotelOrders.orders);
  const [, tick] = useState(0);

  // View modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filters — same inputs as everywhere else: search, date, status
  const [searchTerm, setSearchTerm] = useState("");
  const todayStr = dayjs().format("DD-MM-YYYY");
  const [dateFilter, setDateFilter] = useState(true);
  const [selectedDates, setSelectedDates] = useState({ startDate: todayStr, endDate: todayStr });
  const [dateAnchorEl, setDateAnchorEl] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [tableFilter, setTableFilter] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const businessId = String(
    currentUser?.businessId || currentUser?.institutionId || currentUser?.associatedBusinessId || ""
  ).trim();

  // Fetch orders from backend, merging into Redux (keeps local status if ahead)
  const fetchOrders = useCallback(async () => {
    if (!businessId) { setLoading(false); return; }
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
    } finally {
      setLoading(false);
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
  // served = food delivered to customer but order still OPEN (awaiting payment).
  // completed = CLOSED by cashier after payment. Only completed is done.
  const servedOpen     = myOrders.filter((o) => o.status === "served");
  const completedClosed = myOrders.filter((o) => o.status === "completed");
  // Sales = closed (paid) orders only — open orders are not revenue yet.
  const salesToday     = completedClosed.reduce((s, o) => s + Number(o.total || 0), 0);

  // One table, ready first, then oldest — status lives in its own column
  const sorted = useMemo(() => [...myOrders].sort((a, b) => {
    if (a.status === "ready" && b.status !== "ready") return -1;
    if (a.status !== "ready" && b.status === "ready") return 1;
    return new Date(a.createdAt) - new Date(b.createdAt);
  }), [myOrders]);

  const statusFilters = useMemo(
    () =>
      [...new Set(myOrders.map((o) => o.status))]
        .sort(
          (a, b) => ORDER_STATUS_ORDER.indexOf(a) - ORDER_STATUS_ORDER.indexOf(b)
        )
        .map((s) => ({
          label: (ORDER_STATUS_META[s] && ORDER_STATUS_META[s].label) || String(s).charAt(0).toUpperCase() + String(s).slice(1),
          value: s,
        })),
    [myOrders]
  );

  const filtered = useMemo(() => {
    let result = [...sorted];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (o) =>
          String(o.id ?? "").toLowerCase().includes(term) ||
          String(o.tableNumber ?? "").toLowerCase().includes(term) ||
          (o.items || []).some((i) => String(i.name || "").toLowerCase().includes(term)) ||
          String(o.status ?? "").toLowerCase().includes(term)
      );
    }
    if (dateFilter && selectedDates?.startDate && selectedDates?.endDate) {
      const from = dayjs(selectedDates.startDate, "DD-MM-YYYY").startOf("day");
      const to = dayjs(selectedDates.endDate, "DD-MM-YYYY").endOf("day");
      result = result.filter((o) => {
        const dt = dayjs(o.createdAt);
        return dt.isAfter(from) && dt.isBefore(to);
      });
    }
    if (tableFilter && selectedItems.length > 0) {
      result = result.filter((o) => selectedItems.includes(o.status));
    }
    return result;
  }, [sorted, searchTerm, dateFilter, selectedDates, tableFilter, selectedItems]);

  const formatItems = (items = []) =>
    items.slice(0, 3).map((i) => `${i.quantity}× ${i.name}`).join(", ") +
    (items.length > 3 ? ` +${items.length - 3} more` : "");

  // Served = waiter has taken the food to the customer. Order stays OPEN —
  // only the cashier closes it (completed) after payment.
  const markServed = (id) => {
    dispatch(hotelOrderActions.updateOrderStatus({ id, status: "served" }));
    setSelectedOrder(null);
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
      {loading ? (
        <div className="min-h-screen bg-white p-8">
          <div className="max-w-7xl mx-auto">
            <div className="main-app-view">
              <div className="main-app-content-container">
                <ContentLoader
                  state={true}
                  loading={true}
                  loadingText="Loading orders..."
                  loadedText=""
                  color={primaryColor}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
      <>
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

      {/* Stats — same cards as the cashier */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Active Orders"
          value={activeOrders.length}
          icon={ShoppingCart}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
          sub={readyOrders.length > 0 ? `${readyOrders.length} ready to collect` : "All caught up!"}
        />
        <SummaryCard
          title="Ready to Collect"
          value={readyOrders.length}
          icon={Bell}
          bgColor="bg-green-50"
          textColor="text-green-600"
          sub={readyOrders.length > 0 ? "Pick up from the kitchen" : "Nothing waiting"}
        />
        <SummaryCard
          title="Served · awaiting payment"
          value={servedOpen.length}
          icon={CheckCircle}
          bgColor="bg-teal-50"
          textColor="text-teal-600"
          sub={completedClosed.length > 0 ? `${completedClosed.length} closed by cashier` : "Still open until cashier closes"}
        />
        <SummaryCard
          title="My Sales Today"
          value={formatKsh(salesToday)}
          icon={DollarSign}
          bgColor="bg-orange-50"
          textColor="text-orange-600"
        />
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

      {/* Filters — same inputs as everywhere else: search, date, status */}
      <div className="bg-white p-4 mb-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex gap-4 flex-wrap items-center">
          <div className="min-w-64">
            <SearchInput
              id="waiter-order-search"
              placeholder="Search by order, table, item or status..."
              input={searchTerm}
              handleInput={setSearchTerm}
              handleClear={() => setSearchTerm("")}
              error={false}
              disabled={false}
            />
          </div>

          <DateRangeInput
            type="orders"
            color={primaryColor}
            selected={selectedDates}
            dateFilter={dateFilter}
            anchorEl={dateAnchorEl}
            selectedAction={setSelectedDates}
            handleDateFilter={setDateFilter}
            handleClose={() => setDateAnchorEl(null)}
            handleClick={(e) => setDateAnchorEl(e.currentTarget)}
          />

          <FilterInput
            color={primaryColor}
            label="waiter-order-filter"
            filters={statusFilters}
            options={["Status"]}
            selected={selectedItems}
            selectedAction={setSelectedItems}
            tableFilter={tableFilter}
            handleTableFilter={setTableFilter}
            anchorEl={filterAnchorEl}
            handleClose={() => setFilterAnchorEl(null)}
            handleClick={(e) => setFilterAnchorEl(e.currentTarget)}
          />
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 pt-4 pb-2 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">My Orders</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {dateFilter && selectedDates?.startDate && selectedDates?.endDate
              ? `Showing results for ${selectedDates.startDate} to ${selectedDates.endDate}`
              : "Showing all results"}
          </p>
        </div>

        {filtered.length === 0 ? (
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">Order</th>
                  <th className="px-5 py-3 text-left">Table</th>
                  <th className="px-5 py-3 text-left">Time</th>
                  <th className="px-5 py-3 text-left">Items</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((order) => {
                  return (
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
                          {elapsed(order.createdAt)}
                          {" · "}
                          {new Date(order.createdAt).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", hour12: true })}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        <span>{formatItems(order.items)}</span>
                        {order.note && (
                          <span className="flex items-start gap-1 mt-1 text-xs text-yellow-800">
                            <StickyNote size={12} className="shrink-0 mt-0.5" />
                            <span className="truncate max-w-[220px]">{order.note}</span>
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-gray-800 text-right whitespace-nowrap">
                        {formatKsh(order.total)}
                      </td>
                      <td className="px-5 py-3">
                        <OrderStatusPill status={order.status} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            title="View order details"
                            className="p-1.5 border border-gray-300 bg-white text-gray-600 rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
                          >
                            <Eye size={14} />
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

      {/* Order details — print lives inside */}
      <OrderDetailsModal
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        statusBadge={
          <OrderStatusPill status={selectedOrder?.status} />
        }
        accentColor={primaryColor}
        onPrint={printBill}
        extraActions={
          selectedOrder && selectedOrder.status === "ready" ? (
            <button
              type="button"
              onClick={() => markServed(selectedOrder.id)}
              className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 active:scale-95 transition-all"
            >
              Mark served
            </button>
          ) : null
        }
      />
      </>
      )}
    </div>
  );
};

export default WaiterDashboard;
