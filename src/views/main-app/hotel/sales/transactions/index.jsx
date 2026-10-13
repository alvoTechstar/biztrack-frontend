import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, DollarSign, History } from "lucide-react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { GET } from "../../../../../services/DatabaseServiceImp";
import URLS from "../../../../../utilities/Endpoints";
import ContentLoader from "../../../../../components/Loader/ContentLoader";
import Toaster from "../../../../../components/Toaster";
import SearchInput from "../../../../../components/Input/SearchInput";
import DateRangeInput from "../../../../../components/Input/DateRangeInput";
import FilterInput from "../../../../../components/Input/FilterInput";
import { useTheme } from "../../../../../components/theme/ThemeContext";
import KpiCard from "../../dashboard/admin/KpiCard";
import RecentOrdersTable from "../../dashboard/admin/recentOrdersTable";

// Backend stores the amount as `totalAmount` (kiosk convention) on some
// orders and `total` on others — every hotel view normalises with ??.
const getTxTotal = (t) => Number(t.totalAmount ?? t.total) || 0;
const getTxDate = (t) => t.createdAt || t.timestamp || t.date || null;

const isToday = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
};

const toRow = (t) => {
  const iso = getTxDate(t);
  const dt = iso ? new Date(iso) : new Date();
  return {
    id: t.transactionId || t.orderId || t.orderNumber || t._id,
    waiter: t.waiter || t.shopkeeperName || "—",
    amount: getTxTotal(t),
    date: dt.toISOString().split("T")[0],
    time: dt.toTimeString().slice(0, 8),
    status: t.status
      ? t.status.charAt(0).toUpperCase() + t.status.slice(1)
      : "Pending",
    foodItems: (t.items || [])
      .map((i) => i.name || i.productName || "")
      .filter(Boolean),
    paymentMethod: String(t.paymentMethod || "").toLowerCase(),
  };
};

const formatKsh = (n) => `KSh ${Number(n).toLocaleString()}`;

dayjs.extend(customParseFormat);

// ISO day-bounds for the API query — unambiguous for the backend,
// unlike the DD-MM-YYYY strings used in UI state.
const toRangeQuery = (selectedDates) => {
  const start = dayjs(selectedDates?.startDate, "DD-MM-YYYY").startOf("day");
  const end = dayjs(selectedDates?.endDate, "DD-MM-YYYY").endOf("day");
  if (!start.isValid() || !end.isValid()) return "";
  return `?startDate=${encodeURIComponent(start.toISOString())}&endDate=${encodeURIComponent(end.toISOString())}`;
};

// Shared hotel transactions ledger — visible to cashiers and hotel admins.
// Focuses on today's transactions by default; "All" reveals the full history.
function HotelTransactions() {
  const navigate = useNavigate();
  const { primaryColor } = useTheme();
  const currentUser = useSelector((s) => s.auth?.value);
  const businessId = String(
    currentUser?.businessId ||
      currentUser?.institutionId ||
      currentUser?.associatedBusinessId ||
      ""
  ).trim();
  const isCashier = String(currentUser?.role || "").toLowerCase().includes("cashier");

  const [transactions, setTransactions] = useState([]);
  // Unfiltered copy — feeds the summary cards + status options so they stay
  // correct even when the ledger query below is date-ranged.
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Date filter — opens focused on today, Reset reveals the full history
  const todayStr = dayjs().format("DD-MM-YYYY");
  const [dateFilter, setDateFilter] = useState(true);
  const [selectedDates, setSelectedDates] = useState({ startDate: todayStr, endDate: todayStr });
  const [dateAnchorEl, setDateAnchorEl] = useState(null);

  // Advanced filter — Payment + Status (same FilterInput as Menu Management)
  const [selectedItems, setSelectedItems] = useState([]);
  const [tableFilter, setTableFilter] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

  const [toaster, setToaster] = useState({ open: false, state: "true", title: "", message: "" });
  const showToaster = useCallback((success, title, message) => {
    setToaster({ open: true, state: success ? "true" : "false", title, message });
  }, []);
  const closeToaster = useCallback(() => setToaster((prev) => ({ ...prev, open: false })), []);

  const fetchTransactions = useCallback(async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const baseEndpoint = URLS.TRANSACTIONS.GET_TRANSACTIONS_BY_BUSINESS.replace(
        ":businessId",
        businessId
      );
      // Date range goes out with the ledger query — today by default,
      // so the backend only returns the slice we're actually showing.
      const rangeQuery =
        dateFilter && selectedDates?.startDate && selectedDates?.endDate
          ? toRangeQuery(selectedDates)
          : "";
      const [ledgerRes, summaryRes] = await Promise.all([
        GET(baseEndpoint + rangeQuery),
        // Unfiltered snapshot for the summary cards (single source of truth
        // for totals even when the ledger is narrowed to a date range).
        GET(baseEndpoint),
      ]);
      if (ledgerRes?.success) {
        setTransactions(
          (ledgerRes.data || ledgerRes.transactions || []).filter(
            (t) => t.type === "hotel_order" || !t.type
          )
        );
      } else {
        throw new Error(ledgerRes?.message || "Failed to load transactions");
      }
      if (summaryRes?.success) {
        setAllTransactions(
          (summaryRes.data || summaryRes.transactions || []).filter(
            (t) => t.type === "hotel_order" || !t.type
          )
        );
      }
    } catch (err) {
      showToaster(false, "Error", err.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [businessId, dateFilter, selectedDates, showToaster]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Summary reads from the unfiltered snapshot (falls back to the ledger
  // if the snapshot hasn't landed yet).
  const summarySource = allTransactions.length > 0 ? allTransactions : transactions;

  const todayTx = useMemo(
    () => summarySource.filter((t) => isToday(getTxDate(t))),
    [summarySource]
  );
  // Revenue counts only CLOSED (completed/paid) orders. Served orders are
  // still OPEN — food delivered, awaiting payment — so they must not inflate revenue.
  const isClosed = (t) => String(t.status || "").toLowerCase() === "completed";
  const todayClosedTx = useMemo(() => todayTx.filter(isClosed), [todayTx]);
  const todayRevenue = useMemo(
    () => todayClosedTx.reduce((s, t) => s + getTxTotal(t), 0),
    [todayClosedTx]
  );

  const paymentLabel = (method) =>
    method === "mpesa" ? "M-Pesa" : method === "cash" ? "Cash" : null;

  const paymentFilters = [
    { label: "Cash", value: "Cash" },
    { label: "M-Pesa", value: "M-Pesa" },
  ];

  const statusFilters = useMemo(
    () =>
      [...new Set(summarySource.map((t) => toRow(t).status))].map((s) => ({
        label: s,
        value: s,
      })),
    [summarySource]
  );

  const rows = useMemo(() => {
    let result = transactions.map(toRow);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (o) =>
          String(o.id ?? "").toLowerCase().includes(term) ||
          String(o.waiter ?? "").toLowerCase().includes(term) ||
          (o.foodItems || []).some((i) => String(i).toLowerCase().includes(term)) ||
          String(o.status ?? "").toLowerCase().includes(term)
      );
    }
    if (dateFilter && selectedDates?.startDate && selectedDates?.endDate) {
      const { startDate, endDate } = selectedDates;
      result = result.filter((o) => {
        const dt = dayjs(`${o.date}T${o.time}`);
        const from = dayjs(startDate, "DD-MM-YYYY").startOf("day");
        const to = dayjs(endDate, "DD-MM-YYYY").endOf("day");
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
  }, [transactions, searchTerm, dateFilter, selectedDates, tableFilter, selectedItems]);

  const handleOrderAction = useCallback(
    (id, action) => {
      if (action === "print") {
        window.print();
        return;
      }
      // In-progress orders go back to the fulfilment queue
      navigate(isCashier ? "/orders/complete" : "/orders/hotel");
    },
    [navigate, isCashier]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ContentLoader
          state={true}
          loading={true}
          loadingText="Loading transactions..."
          loadedText=""
          color={primaryColor}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 pb-20">
      <h1 className="text-2xl font-bold text-gray-800 mb-1 p-2">
        Transactions
        {currentUser?.businessName && (
          <span className="text-lg font-normal text-gray-600 ml-2">
            - {currentUser.businessName}
          </span>
        )}
      </h1>
      <p className="text-sm text-gray-500 px-2 mb-6">
        Every payment received at the till — today first, full history on demand.
      </p>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <KpiCard
          icon={<ShoppingCart size={22} />}
          title="Today · closed"
          value={todayClosedTx.length}
          color="blue"
          footer="Paid & closed today (served still open)"
        />
        <KpiCard
          icon={<DollarSign size={22} />}
          title="Revenue Today"
          value={formatKsh(todayRevenue)}
          color="green"
          footer="Collected today — closed orders only"
        />
        <KpiCard
          icon={<History size={22} />}
          title="All Time"
          value={summarySource.length}
          color="purple"
          footer="Transactions on record"
        />
      </div>

      {/* Filters — same inputs as everywhere else: search, date, advanced filter */}
      <div className="bg-white p-4 mb-4">
        <div className="flex gap-4 flex-wrap items-center">
          <div className="min-w-64">
            <SearchInput
              id="transaction-search"
              placeholder="Search by ID, waiter, food or status..."
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
            label="transaction-filter"
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

      {/* Ledger */}
      <div className="bg-white rounded-xl shadow-md px-4 pt-2 pb-4">
        <RecentOrdersTable
          orders={rows}
          onActionClick={handleOrderAction}
          dates={dateFilter ? selectedDates : null}
        />
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
}

export default HotelTransactions;
