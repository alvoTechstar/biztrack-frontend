import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hotelOrderActions } from "../../../../store";
import { RefreshCw, Printer, ShoppingCart, CheckCircle, Clock, DollarSign, Smartphone } from "lucide-react";
import { GET, PUT, POST } from "../../../../services/DatabaseServiceImp";
import URLS from "../../../../utilities/Endpoints";
import DataTable from "../../../../components/datatable";
import SearchInput from "../../../../components/Input/SearchInput";
import DateRangeInput from "../../../../components/Input/DateRangeInput";
import FilterInput from "../../../../components/Input/FilterInput";
import Modal from "../../../../components/modal/Modal";
import CashPaymentModal from "../../kiosk/sales/CashPaymentModal";
import MpesaPaymentModal from "../../kiosk/sales/MpesaPaymentModal";
import ContentLoader from "../../../../components/Loader/ContentLoader";
import Toaster from "../../../../components/Toaster";
import { useTheme } from "../../../../components/theme/ThemeContext";
import { printOrderReceipt } from "../../../../utilities/ReceiptPrinter";

const formatKsh = (amount) => `KSh ${Number(amount || 0).toLocaleString()}`;

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString("en-KE", {
    day: "2-digit", month: "short",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

// Backend transaction items use productName/unitPrice; local ones use name/price
const normalizeItems = (items = []) =>
  items.map((it) => ({
    name: it.productName || it.name || "",
    quantity: Number(it.quantity) || 1,
    price: Number(it.unitPrice ?? it.price) || 0,
    category: it.category || "",
    image: it.image || "",
  }));

// Transform a backend hotel_order transaction into the Redux order shape
const toReduxOrder = (t) => ({
  id: t.transactionId || t.orderId || t._id || t.id,
  backendId: t._id || t.id,
  tableNumber: t.tableNumber || "—",
  items: normalizeItems(t.items),
  total: Number(t.totalAmount ?? t.total) || 0,
  status: t.status || "pending",
  waiter: t.shopkeeperName || t.waiter || "",
  note: t.notes || t.note || "",
  paymentMethod: t.paymentMethod || null,
  amountPaid: Number(t.amountPaid) || null,
  change: Number(t.change) || 0,
  createdAt: t.createdAt || t.timestamp,
  updatedAt: t.updatedAt,
});

const STATUS_PILL = {
  pending: "bg-amber-100 text-amber-700",
  "in-progress": "bg-blue-100 text-blue-700",
  ready: "bg-purple-100 text-purple-700",
  served: "bg-teal-100 text-teal-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const ORDERS_TABLE_HEADERS = [
  { title: "Order ID", key: "orderNo" },
  { title: "Table", key: "tableDisplay" },
  { title: "Waiter", key: "waiterDisplay" },
  { title: "Items", key: "itemsDisplay" },
  { title: "Total", key: "totalDisplay" },
  { title: "Time", key: "timeDisplay" },
  { title: "Status", key: "statusPill" },
  { title: "Action", key: "action" },
];

const parseDMY = (s) => {
  const [d, m, y] = String(s).split("-").map(Number);
  return new Date(y, m - 1, d);
};

const SummaryCard = ({ title, value, icon: Icon, bgColor, textColor }) => (
  <div className={`${bgColor} rounded-2xl p-5 shadow-sm border border-white/60`}>
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
        <p className={`text-2xl font-bold ${textColor} mt-1 truncate`}>{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-3 ${bgColor.replace("50", "100")}`}>
        <Icon className={`h-5 w-5 ${textColor}`} />
      </div>
    </div>
  </div>
);

const isToday = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
};

export default function CompleteOrder() {
  const dispatch = useDispatch();
  const { primaryColor, businessName } = useTheme();
  const reduxOrders = useSelector((state) => state.hotelOrders.orders);
  const currentUser = useSelector((state) => state.auth?.value);

  const businessId = String(
    currentUser?.businessId || currentUser?.institutionId || currentUser?.associatedBusinessId || ""
  ).trim();
  const cashierName =
    currentUser?.name || currentUser?.firstName || currentUser?.username || "Cashier";

  // ── Filters ───────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [dateAnchorEl, setDateAnchorEl] = useState(null);
  const [tableFilter, setTableFilter] = useState(false);
  const [dateFilterOn, setDateFilterOn] = useState(false);

  // ── Modals ────────────────────────────────────────────────────
  const [viewOrder, setViewOrder] = useState(null);
  const [payOrder, setPayOrder] = useState(null);
  const [showPayOptions, setShowPayOptions] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toaster, setToaster] = useState({ open: false, state: "true", title: "", message: "" });

  const showToaster = useCallback((success, title, message) => {
    setToaster({ open: true, state: success ? "true" : "false", title, message });
  }, []);

  // ── Fetch orders (hotel_order transactions) ───────────────────
  const fetchOrders = useCallback(async () => {
    if (!businessId) { setLoading(false); return; }
    setRefreshing(true);
    try {
      const endpoint = URLS.TRANSACTIONS.GET_TRANSACTIONS_BY_BUSINESS.replace(":businessId", businessId);
      const res = await GET(endpoint);
      if (res?.success) {
        const incoming = (res.data || res.transactions || [])
          .filter((t) => t.type === "hotel_order" || !t.type)
          .map(toReduxOrder);
        dispatch(hotelOrderActions.mergeOrders(incoming));
      }
    } catch (_) {
      showToaster(false, "Error", "Failed to load orders");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [businessId, dispatch, showToaster]);

  useEffect(() => {
    fetchOrders();
    const id = setInterval(fetchOrders, 30000);
    return () => clearInterval(id);
  }, [fetchOrders]);

  // ── Filtering ─────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    let list = [...reduxOrders];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (o) =>
          (o.id || "").toLowerCase().includes(q) ||
          (o.tableNumber || "").toLowerCase().includes(q) ||
          (o.waiter || "").toLowerCase().includes(q)
      );
    }

    if (selectedItems.length > 0) {
      const statusSel = selectedItems.filter((s) =>
        ["Pending", "Completed", "Cancelled"].includes(s)
      );
      const paySel = selectedItems.filter((s) => ["Cash", "M-Pesa"].includes(s));

      list = list.filter((o) => {
        const statusOk =
          statusSel.length === 0 ||
          statusSel.some((s) => {
            if (s === "Pending") return ["pending", "in-progress", "ready", "served"].includes(o.status);
            if (s === "Completed") return o.status === "completed";
            if (s === "Cancelled") return o.status === "cancelled";
            return false;
          });
        const payOk =
          paySel.length === 0 ||
          paySel.some((p) => {
            if (p === "Cash") return o.paymentMethod === "cash";
            if (p === "M-Pesa") return o.paymentMethod === "mpesa";
            return false;
          });
        return statusOk && payOk;
      });
    }

    if (dateRange?.startDate && dateRange?.endDate) {
      const start = parseDMY(dateRange.startDate);
      const end = parseDMY(dateRange.endDate);
      end.setHours(23, 59, 59, 999);
      list = list.filter((o) => {
        const d = new Date(o.createdAt);
        return d >= start && d <= end;
      });
    }

    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [reduxOrders, searchTerm, selectedItems, dateRange]);

  // ── Table rows ────────────────────────────────────────────────
  const tableRows = filteredOrders.map((o) => {
    const itemsSummary = (o.items || [])
      .slice(0, 3)
      .map((i) => `${i.quantity}× ${i.name}`)
      .join(", ") + ((o.items || []).length > 3 ? ` +${o.items.length - 3} more` : "");

    const awaitingPayment = ["pending", "in-progress", "ready", "served"].includes(o.status);

    return {
      id: o.id,
      orderNo: <span className="font-mono font-semibold">{o.id}</span>,
      tableDisplay: o.tableNumber || "—",
      waiterDisplay: o.waiter || "—",
      itemsDisplay: (
        <span className="text-gray-600">{itemsSummary || "—"}</span>
      ),
      totalDisplay: <span className="font-semibold">{formatKsh(o.total)}</span>,
      timeDisplay: o.createdAt ? formatDateTime(o.createdAt) : "—",
      statusPill: (
        <span
          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
            STATUS_PILL[o.status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {o.status}
        </span>
      ),
      availableActions: awaitingPayment ? ["view", "pay"] : ["view"],
    };
  });

  const handleActionSelected = (action, id) => {
    const order = reduxOrders.find((o) => o.id === id);
    if (!order) return;
    if (action.toLowerCase() === "view") {
      setViewOrder(order);
    } else if (action.toLowerCase() === "pay") {
      setPayOrder(order);
      setAmountPaid("");
      setMpesaPhone("");
      setShowPayOptions(true);
    }
  };

  // ── Payment ───────────────────────────────────────────────────
  const completeOnBackend = async (order, method, paid) => {
    const backendId = order.backendId || order.id;
    const completedAt = new Date().toISOString();
    await PUT(URLS.TRANSACTIONS.UPDATE_TRANSACTION.replace(":id", backendId), {
      status: "completed",
      paymentStatus: "paid",
      paymentMethod: method,
      amountPaid: paid,
      change: method === "cash" ? Math.max(0, paid - order.total) : 0,
      completedAt,
      datePaid: completedAt,
    });
  };

  const handleCashConfirm = async () => {
    if (!payOrder) return { success: false, message: "No order selected" };
    setSubmitting(true);
    try {
      const paid = Number.parseFloat(amountPaid) || 0;
      await completeOnBackend(payOrder, "cash", paid);
      dispatch(
        hotelOrderActions.updateOrderStatus({
          id: payOrder.id,
          status: "completed",
          paymentMethod: "cash",
        })
      );
      return {
        success: true,
        change: Math.max(0, paid - payOrder.total),
        totalAmount: payOrder.total,
        transactionId: payOrder.id,
        customerName: `Table ${payOrder.tableNumber}`,
      };
    } catch (error) {
      return { success: false, message: error.message || "Failed to complete payment" };
    } finally {
      setSubmitting(false);
    }
  };

  const validatePhone = (phone) => {
    const ok = /^(?:254|\+254|0)?(7\d{8}|1\d{8})$/.test(String(phone).trim());
    return { isValid: ok, message: ok ? "" : "Invalid Kenyan phone number (e.g. 0712345678)" };
  };

  const formatPhone = (phone) => {
    let p = String(phone).trim().replace(/^\+/, "");
    if (p.startsWith("0")) p = "254" + p.slice(1);
    else if (p.startsWith("7") || p.startsWith("1")) p = "254" + p;
    return p;
  };

  const handleMpesaConfirm = async () => {
    if (!payOrder) return { success: false, message: "No order selected" };
    try {
      const res = await POST(URLS.MPESA.STK_PUSH, {
        phone: formatPhone(mpesaPhone),
        amount: payOrder.total,
        transactionId: payOrder.id,
        description: `Payment for order ${payOrder.id} (${payOrder.tableNumber})`,
        isDebtPayment: false,
        businessId,
      });
      if (res?.success) {
        return {
          success: true,
          transactionId: payOrder.id,
          checkoutRequestId: res.checkoutRequestId || res.data?.checkoutRequestId,
        };
      }
      return { success: false, message: res?.message || "Failed to initiate M-Pesa payment" };
    } catch (error) {
      return { success: false, message: error.message || "Failed to initiate M-Pesa payment" };
    }
  };

  const handleMpesaComplete = async () => {
    if (!payOrder) return;
    try {
      await completeOnBackend(payOrder, "mpesa", payOrder.total);
    } catch (_) { /* backend callback may have completed it already */ }
    dispatch(
      hotelOrderActions.updateOrderStatus({
        id: payOrder.id,
        status: "completed",
        paymentMethod: "mpesa",
      })
    );
  };

  const closePaymentFlow = (success) => {
    const method = showCashModal ? "cash" : showMpesaModal ? "mpesa" : payOrder?.paymentMethod;
    setShowCashModal(false);
    setShowMpesaModal(false);
    setShowPayOptions(false);
    if (success) {
      showToaster(true, "Payment complete", `Order ${payOrder?.id} has been paid`);
      // Auto-print the paid receipt so the waiter can take it to the table
      if (payOrder) {
        const paid = method === "cash"
          ? Number.parseFloat(amountPaid) || payOrder.total
          : payOrder.total;
        printOrderReceipt(
          {
            ...payOrder,
            status: "completed",
            paymentMethod: method,
            amountPaid: paid,
            change: Math.max(0, paid - payOrder.total),
          },
          { businessName, businessTagline: "Restaurant", variant: "receipt" }
        );
      }
      fetchOrders();
    }
    setPayOrder(null);
  };

  // ── Receipt print (from view modal) ───────────────────────────
  const printReceipt = (order) => {
    printOrderReceipt(order, {
      businessName,
      businessTagline: "Restaurant",
      variant: order.status === "completed" ? "receipt" : "bill",
    });
  };

  // ── Stats ─────────────────────────────────────────────────────
  const awaitingCount = reduxOrders.filter((o) =>
    ["pending", "in-progress", "ready", "served"].includes(o.status)
  ).length;
  const completedToday = reduxOrders.filter(
    (o) => o.status === "completed" && isToday(o.updatedAt || o.createdAt)
  );
  const revenueToday = completedToday.reduce((s, o) => s + Number(o.total || 0), 0);

  if (loading) {
    return (
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
    );
  }

  return (
    <div className="min-h-screen bg-white p-2">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6 p-2">
        <h1 className="text-2xl font-bold text-gray-800">Complete Orders</h1>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 ml-2">
        <SummaryCard
          title="Awaiting payment"
          value={awaitingCount}
          icon={Clock}
          bgColor="bg-amber-50"
          textColor="text-amber-600"
        />
        <SummaryCard
          title="Completed today"
          value={completedToday.length}
          icon={CheckCircle}
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
        <SummaryCard
          title="Revenue today"
          value={formatKsh(revenueToday)}
          icon={ShoppingCart}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
      </div>

      {/* Controls: search + date + filter */}
      <div className="bg-white p-4 mb-4 ml-2">
        <div className="flex gap-4 flex-wrap items-center">
          <div className="min-w-64">
            <SearchInput
              id="order-search"
              placeholder="Search by order, table or waiter..."
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
            selected={dateRange}
            dateFilter={dateFilterOn}
            anchorEl={dateAnchorEl}
            selectedAction={setDateRange}
            handleDateFilter={setDateFilterOn}
            handleClose={() => setDateAnchorEl(null)}
            handleClick={(e) => setDateAnchorEl(e.currentTarget)}
          />

          <FilterInput
            color={primaryColor}
            label="advanced-filter"
            filters={[
              { label: "Pending", value: "Pending" },
              { label: "Completed", value: "Completed" },
              { label: "Cancelled", value: "Cancelled" },
            ]}
            filters2={[
              { label: "Cash", value: "Cash" },
              { label: "M-Pesa", value: "M-Pesa" },
            ]}
            options={["Status", "Payment"]}
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
      <div className="ml-2 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <DataTable
          data={tableRows}
          headers={ORDERS_TABLE_HEADERS}
          type="hotel-orders"
          selected={[]}
          selectedAction={() => {}}
          selectAll={() => {}}
          all={false}
          actionSelected={handleActionSelected}
          selectedRow={() => {}}
          clickable={false}
          color={primaryColor}
        />
      </div>

      {/* ── View order modal ── */}
      {viewOrder && (
        <Modal isOpen={true} onClose={() => setViewOrder(null)} title={`Order ${viewOrder.id}`}>
          <div className="space-y-3 p-2">
            <div className="row flex justify-between text-sm">
              <span className="text-gray-500">Table</span>
              <span className="font-semibold">{viewOrder.tableNumber}</span>
            </div>
            <div className="row flex justify-between text-sm">
              <span className="text-gray-500">Waiter</span>
              <span className="font-semibold">{viewOrder.waiter || "—"}</span>
            </div>
            <div className="row flex justify-between text-sm">
              <span className="text-gray-500">Time</span>
              <span>{viewOrder.createdAt ? formatDateTime(viewOrder.createdAt) : "—"}</span>
            </div>
            <div className="row flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="capitalize font-semibold">{viewOrder.status}</span>
            </div>
            {viewOrder.paymentMethod && (
              <div className="row flex justify-between text-sm">
                <span className="text-gray-500">Payment</span>
                <span className="uppercase font-semibold">{viewOrder.paymentMethod}</span>
              </div>
            )}

            <div className="line border-t border-dashed border-gray-300 my-2" />

            <div className="space-y-1.5">
              {(viewOrder.items || []).map((item, i) => (
                <div key={i} className="row flex justify-between text-sm">
                  <span>
                    {item.quantity}× {item.name}
                  </span>
                  <span>{formatKsh(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="line border-t border-dashed border-gray-300 my-2" />

            <div className="row flex justify-between text-base font-bold">
              <span>Total</span>
              <span>{formatKsh(viewOrder.total)}</span>
            </div>

            {viewOrder.note && (
              <p className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded px-2 py-1.5">
                📝 {viewOrder.note}
              </p>
            )}
          </div>

          <div className="flex gap-3 p-2 pt-3">
            <button
              onClick={() => printReceipt(viewOrder)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Printer size={15} />
              {viewOrder.status === "completed" ? "Print receipt" : "Print bill"}
            </button>
            {["pending", "in-progress", "ready", "served"].includes(viewOrder.status) && (
              <button
                onClick={() => {
                  const order = viewOrder;
                  setViewOrder(null);
                  setPayOrder(order);
                  setAmountPaid("");
                  setMpesaPhone("");
                  setShowPayOptions(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                <ShoppingCart size={15} /> Take payment
              </button>
            )}
          </div>
        </Modal>
      )}

      {/* ── Payment method chooser (same as kiosk) ── */}
      {showPayOptions && payOrder && (
        <Modal isOpen={true} onClose={() => closePaymentFlow(false)} title="Complete Payment">
          <div className="p-2">
            <p className="text-gray-600 mb-2">
              Select payment method for order <strong>{payOrder.id}</strong> —{" "}
              <strong>{payOrder.tableNumber}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-5">
              Amount to pay: <strong>{formatKsh(payOrder.total)}</strong>
            </p>
            <div className="space-y-3">
              <button
                onClick={() => { setShowPayOptions(false); setShowCashModal(true); }}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <DollarSign className="h-5 w-5" /> Pay with Cash
              </button>
              <button
                onClick={() => { setShowPayOptions(false); setShowMpesaModal(true); }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Smartphone className="h-5 w-5" /> Pay with M-PESA
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Cash payment (kiosk modal) ── */}
      {showCashModal && payOrder && (
        <CashPaymentModal
          isOpen={true}
          onClose={closePaymentFlow}
          totalAmount={payOrder.total}
          amountPaid={amountPaid}
          onAmountPaidChange={setAmountPaid}
          onConfirmPayment={handleCashConfirm}
          formatCurrency={formatKsh}
          shopkeeperName={cashierName}
          submitting={submitting}
        />
      )}

      {/* ── M-Pesa payment (kiosk modal) ── */}
      {showMpesaModal && payOrder && (
        <MpesaPaymentModal
          isOpen={true}
          onClose={closePaymentFlow}
          totalAmount={payOrder.total}
          mpesaPhone={mpesaPhone}
          onMpesaPhoneChange={setMpesaPhone}
          onConfirmPayment={handleMpesaConfirm}
          onPaymentComplete={handleMpesaComplete}
          formatCurrency={formatKsh}
          shopkeeperName={cashierName}
          validatePhone={validatePhone}
          transactionId={payOrder.id}
        />
      )}

      <Toaster
        open={toaster.open}
        state={toaster.state}
        title={toaster.title}
        message={toaster.message}
        action={() => setToaster((prev) => ({ ...prev, open: false }))}
        position="right"
      />
    </div>
  );
}
