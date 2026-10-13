import React, { useMemo, useEffect, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart, DollarSign, CreditCard,
  TrendingUp, Clock, Package, ArrowRight,
} from "lucide-react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { hotelOrderActions } from "../../../../../store";
import { GET } from "../../../../../services/DatabaseServiceImp";
import URLS from "../../../../../utilities/Endpoints";
import SearchInput from "../../../../../components/Input/SearchInput";
import DateRangeInput from "../../../../../components/Input/DateRangeInput";
import FilterInput from "../../../../../components/Input/FilterInput";
import DataTable from "../../../../../components/datatable";
import OrderDetailsModal from "../../../../../components/modal/OrderDetailsModal";
import OrderStatusPill from "../../../../../components/datatable/OrderStatusPill";
import PaymentChannelPill from "../../../../../components/datatable/PaymentChannelPill";
import { printOrderReceipt } from "../../../../../utilities/ReceiptPrinter";

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

dayjs.extend(customParseFormat);

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

const ACCENT = "#4F46E5";

const CLOSED_ORDERS_TABLE_HEADERS = [
  { title: "Order ID", key: "orderNo" },
  { title: "Table", key: "tableDisplay" },
  { title: "Waiter", key: "waiterDisplay" },
  { title: "Time", key: "timeDisplay" },
  { title: "Items", key: "itemsDisplay" },
  { title: "Amount", key: "totalDisplay" },
  { title: "Payment", key: "paymentDisplay" },
  { title: "Status", key: "statusPill" },
  { title: "Action", key: "action" },
];

const CashierDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const allOrders = useSelector((s) => s.hotelOrders.orders);
  const currentUser = useSelector((s) => s.auth?.value);

  // View modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filters — same inputs as everywhere else: search, date, payment/status
  const [searchTerm, setSearchTerm] = useState("");
  const todayStr = dayjs().format("DD-MM-YYYY");
  const [dateFilter, setDateFilter] = useState(true);
  const [selectedDates, setSelectedDates] = useState({ startDate: todayStr, endDate: todayStr });
  const [dateAnchorEl, setDateAnchorEl] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [tableFilter, setTableFilter] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

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

  // Today's CLOSED orders (completed = paid by cashier).
  // Served orders are still OPEN (food delivered, awaiting payment) —
  // they live in /orders/complete until payment closes them.
  const completedToday = useMemo(
    () => allOrders.filter(
      (o) => o.status === "completed" && isToday(o.updatedAt || o.createdAt)
    ),
    [allOrders]
  );

  // Open orders awaiting payment (served = delivered, still open until cashier closes)
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

  const paymentLabel = (method) =>
    method === "mpesa" ? "M-Pesa" : method === "cash" ? "Cash" : null;

  const paymentFilters = [
    { label: "Cash", value: "Cash" },
    { label: "M-Pesa", value: "M-Pesa" },
  ];

  const statusFilters = useMemo(
    () =>
      [...new Set(completedToday.map((o) => o.status))].map((s) => ({
        label: String(s).charAt(0).toUpperCase() + String(s).slice(1),
        value: s,
      })),
    [completedToday]
  );

  const filteredOrders = useMemo(() => {
    const sorted = [...completedToday].sort(
      (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    );
    let result = sorted;
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
        const dt = dayjs(o.updatedAt || o.createdAt);
        return dt.isAfter(from) && dt.isBefore(to);
      });
    }
    if (tableFilter && selectedItems.length > 0) {
      result = result.filter((o) =>
        selectedItems.some((sel) => {
          if (sel === "Cash" || sel === "M-Pesa") return paymentLabel(o.paymentMethod) === sel;
          return o.status === sel;
        })
      );
    }
    return result;
  }, [completedToday, searchTerm, dateFilter, selectedDates, tableFilter, selectedItems]);

  // Print the receipt for a completed order (bill for anything still open)
  const printReceipt = (order) => {
    printOrderReceipt(order, {
      businessName: currentUser?.businessName,
      businessTagline: "Restaurant",
      variant: order.status === "completed" ? "receipt" : "bill",
    });
  };

  // ── Reusable DataTable rows (same pattern as /orders/complete) ──
  const tableRows = filteredOrders.map((o) => ({
    id: o.id,
    orderNo: <span className="font-mono font-semibold">{o.id}</span>,
    tableDisplay: o.tableNumber || "—",
    waiterDisplay: o.waiter || "—",
    timeDisplay: (
      <span className="flex items-center gap-1 whitespace-nowrap">
        <Clock size={12} className="text-gray-400" />
        {formatTime(o.updatedAt || o.createdAt)}
      </span>
    ),
    itemsDisplay: (
      <span className="flex items-start gap-1">
        <Package size={13} className="text-gray-400 mt-0.5 shrink-0" />
        <span>{formatItems(o.items)}</span>
      </span>
    ),
    totalDisplay: <span className="font-semibold whitespace-nowrap">{formatKsh(o.total || 0)}</span>,
    paymentDisplay: <PaymentChannelPill method={o.paymentMethod} />,
    statusPill: <OrderStatusPill status={o.status} />,
    availableActions: ["view"],
  }));

  const handleActionSelected = (action, id) => {
    if (String(action).toLowerCase() !== "view") return;
    const order = filteredOrders.find((o) => o.id === id);
    if (order) setSelectedOrder(order);
  };

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
          title="Orders Closed Today"
          value={completedToday.length}
          icon={ShoppingCart}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
          sub={awaitingPayment > 0 ? `${awaitingPayment} open · awaiting payment` : "All caught up!"}
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

      {/* Filters — same inputs as everywhere else: search, date, payment/status */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex gap-4 flex-wrap items-center">
          <div className="min-w-64">
            <SearchInput
              id="cashier-order-search"
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
            color={ACCENT}
            selected={selectedDates}
            dateFilter={dateFilter}
            anchorEl={dateAnchorEl}
            selectedAction={setSelectedDates}
            handleDateFilter={setDateFilter}
            handleClose={() => setDateAnchorEl(null)}
            handleClick={(e) => setDateAnchorEl(e.currentTarget)}
          />

          <FilterInput
            color={ACCENT}
            label="cashier-order-filter"
            filters={paymentFilters}
            filters2={statusFilters}
            options={["Payment", "Status"]}
            selected={selectedItems}
            selectedAction={setSelectedItems}
            selected2={selectedItems}
            selectedAction2={setSelectedItems}
            tableFilter={tableFilter}
            handleTableFilter={setTableFilter}
            anchorEl={filterAnchorEl}
            handleClose={() => setFilterAnchorEl(null)}
            handleClick={(e) => setFilterAnchorEl(e.currentTarget)}
          />
        </div>
      </div>

      {/* Completed orders table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 pt-4 pb-2 border-b border-gray-100">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-gray-900">
              Today's Closed Orders
            </h2>
            <button
              onClick={() => navigate("/orders/complete")}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 shrink-0"
            >
              Process orders <ArrowRight size={14} />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {dateFilter && selectedDates?.startDate && selectedDates?.endDate
              ? `Showing results for ${selectedDates.startDate} to ${selectedDates.endDate}`
              : "Showing all results"}
          </p>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No closed orders yet today</p>
            <p className="text-sm mt-1 opacity-60">
              Served orders stay open until payment — close them in Process orders
            </p>
          </div>
        ) : (
          <div className="ml-2">
            <DataTable
              data={tableRows}
              headers={CLOSED_ORDERS_TABLE_HEADERS}
              type="hotel-orders"
              selected={[]}
              selectedAction={() => {}}
              selectAll={() => {}}
              all={false}
              actionSelected={handleActionSelected}
              selectedRow={() => {}}
              clickable={false}
              color={ACCENT}
            />
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
        accentColor={ACCENT}
        onPrint={printReceipt}
      />
    </div>
  );
};

export default CashierDashboard;
