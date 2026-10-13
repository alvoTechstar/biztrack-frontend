import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { Box, Typography } from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  DollarSign as RevenueIcon,
  Users as StaffIcon,
  UtensilsCrossed as MenuIcon,
  TriangleAlert as AlertIcon,
} from "lucide-react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import KpiCard from "./KpiCard";
import RevenueChartCard from "./RevenueChartCard";
import OrdersByCategoryChartCard from "./OrdersByCategoryChartCard";
import RecentOrdersTable from "./recentOrdersTable";
import DateRangeInput from "../../../../../components/Input/DateRangeInput";
import SearchInput from "../../../../../components/Input/SearchInput";
import ContentLoader from "../../../../../components/Loader/ContentLoader";
import { useTheme } from "../../../../../components/theme/ThemeContext";
import { GET } from "../../../../../services/DatabaseServiceImp";
import URLS from "../../../../../utilities/Endpoints";

dayjs.extend(customParseFormat);

// ── Helpers ────────────────────────────────────────────────────
const isToday = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate();
};

const isYesterday = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return d.getFullYear() === y.getFullYear() &&
    d.getMonth() === y.getMonth() &&
    d.getDate() === y.getDate();
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Backend stores the amount as `totalAmount` (kiosk convention) on some
// orders and `total` on others — every hotel view normalises with ??.
const getTxTotal = (t) => Number(t.totalAmount ?? t.total) || 0;
const getTxDate = (t) => t.createdAt || t.timestamp || t.date || null;
// Revenue counts ONLY completed (paid, closed) orders — open orders
// (pending → served) must never inflate revenue figures.
const isClosed = (t) => String(t.status || "").toLowerCase() === "completed";

function buildDailyChartData(transactions) {
  // Current week, Monday → Sunday
  const WEEK_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const totals = {};
  WEEK_ORDER.forEach((d) => (totals[d] = 0));
  const now = new Date();
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  transactions.forEach((t) => {
    if (!isClosed(t)) return;
    const iso = getTxDate(t);
    if (!iso) return;
    const d = new Date(iso);
    if (d >= monday && d < nextMonday) {
      totals[DAY_NAMES[d.getDay()]] += getTxTotal(t);
    }
  });
  return WEEK_ORDER.map((name) => ({ name, value: totals[name] }));
}

function buildMonthlyChartData(transactions) {
  // Full Jan–Dec axis, always: months with no revenue stay 0 instead of the
  // line starting/ending mid-year. Current year only — without the year guard
  // every year's September/October stacked into the same buckets.
  const year = new Date().getFullYear();
  const totals = {};
  MONTH_NAMES.forEach((m) => (totals[m] = 0));
  transactions.forEach((t) => {
    if (!isClosed(t)) return;
    const iso = getTxDate(t);
    if (!iso) return;
    const d = new Date(iso);
    if (d.getFullYear() !== year) return;
    totals[MONTH_NAMES[d.getMonth()]] += getTxTotal(t);
  });
  return MONTH_NAMES.map((name) => ({ name, value: totals[name] }));
}

function buildCategoryData(transactions) {
  const counts = {};
  transactions.forEach((t) => {
    (t.items || []).forEach((item) => {
      const cat = item.category || "Food";
      counts[cat] = (counts[cat] || 0) + (item.quantity || 1);
    });
  });
  // Raw counts — the card derives percentages, like the kiosk payment donut
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function toRecentOrder(t) {
  const iso = getTxDate(t);
  const dt = iso ? new Date(iso) : new Date();
  return {
    id:        t.transactionId || t.orderId || t.orderNumber || t._id,
    waiter:    t.waiter || t.shopkeeperName || "—",
    amount:    getTxTotal(t),
    date:      dt.toISOString().split("T")[0],
    time:      dt.toTimeString().slice(0, 8),
    status:    t.status
      ? t.status.charAt(0).toUpperCase() + t.status.slice(1)
      : "Pending",
    foodItems: (t.items || []).map((i) => i.name || i.productName || "").filter(Boolean),
  };
}

// ── Component ──────────────────────────────────────────────────
function HotelAdminDashboard() {
  const currentUser = useSelector((s) => s.auth?.value);
  const { primaryColor } = useTheme();
  const businessId  = String(
    currentUser?.businessId || currentUser?.institutionId ||
    currentUser?.associatedBusinessId || ""
  ).trim();

  const [currentTime, setCurrentTime]         = useState(new Date());
  const [revenueDateRange, setRevenueDateRange] = useState("7_days");
  const [searchTerm, setSearchTerm]           = useState("");
  const [dateFilter, setDateFilter]           = useState(false);
  const [selectedDates, setSelectedDates]     = useState(null);
  const [dateAnchorEl, setDateAnchorEl]       = useState(null);

  // API state
  const [transactions, setTransactions] = useState([]);
  const [staffCount, setStaffCount]     = useState(0);
  const [menuCount, setMenuCount]       = useState(0);
  const [unavailableCount, setUnavailableCount] = useState(0);
  const [loading, setLoading]           = useState(true);

  // ── Fetch all dashboard data ──────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!businessId) { setLoading(false); return; }
    try {
      // Transactions (orders)
      const txEndpoint = URLS.TRANSACTIONS.GET_TRANSACTIONS_BY_BUSINESS
        .replace(":businessId", businessId);
      const txRes = await GET(txEndpoint);
      if (txRes?.success) {
        setTransactions(
          (txRes.data || txRes.transactions || [])
            .filter((t) => t.type === "hotel_order" || !t.type)
        );
      }
    } catch (_) {}

    try {
      // Menu items — hotel menus live under MENU, not kiosk PRODUCTS
      const mEndpoint = URLS.MENU.GET_ITEMS_BY_BUSINESS
        .replace(":businessId", businessId);
      const mRes = await GET(mEndpoint);
      if (mRes?.success) {
        const items = mRes.items || mRes.data || [];
        setMenuCount(items.filter((p) => p.available !== false).length);
        setUnavailableCount(items.filter((p) => p.available === false).length);
      }
    } catch (_) {}

    try {
      // Staff (users for this business) — business endpoint first,
      // then all-users filtered client-side (same as User-Management)
      let users = [];
      try {
        const uRes = await GET(`/api/users/business/${businessId}`);
        if (uRes?.success && Array.isArray(uRes.data)) users = uRes.data;
      } catch (_) {}
      if (users.length === 0) {
        try {
          const allRes = await GET(URLS.USERS.GET_ALL_USERS);
          if (allRes?.success && Array.isArray(allRes.data)) {
            users = allRes.data.filter((u) => {
              if (!u) return false;
              return [u.businessId, u.businessUUID, u.associatedBusinessId, u.institutionId]
                .some((v) => String(v || "").trim() === businessId);
            });
          }
        } catch (_) {}
      }
      setStaffCount(users.filter((u) =>
        String(u.status || "").toUpperCase() === "ACTIVE" || u.isActive === true
      ).length);
    } catch (_) {}
    setLoading(false);
  }, [businessId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Clock ticker
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // ── Derived KPI values (today vs yesterday, like kiosk) ─────
  // Revenue KPIs count completed orders only — open orders are not revenue.
  const todayTx     = useMemo(() => transactions.filter((t) => isToday(getTxDate(t))), [transactions]);
  const yesterdayTx = useMemo(() => transactions.filter((t) => isYesterday(getTxDate(t))), [transactions]);
  const todayOrders = todayTx.length;
  const todayRev    = useMemo(() => todayTx.filter(isClosed).reduce((s, t) => s + getTxTotal(t), 0), [todayTx]);
  const yesterdayOrders = yesterdayTx.length;
  const yesterdayRev = useMemo(
    () => yesterdayTx.filter(isClosed).reduce((s, t) => s + getTxTotal(t), 0),
    [yesterdayTx]
  );

  const pctChange = (today, yesterday) => {
    if (yesterday > 0) return ((today - yesterday) / yesterday) * 100;
    return today > 0 ? 100 : 0;
  };
  const formatChange = (pct) => `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
  const ordersChange = formatChange(pctChange(todayOrders, yesterdayOrders));
  const revenueChange = formatChange(pctChange(todayRev, yesterdayRev));

  // ── Chart data ────────────────────────────────────────────────
  const revenueChartData = useMemo(
    () => revenueDateRange === "this_month"
      ? buildMonthlyChartData(transactions)
      : buildDailyChartData(transactions),
    [transactions, revenueDateRange]
  );

  const categoryChartData = useMemo(
    () => buildCategoryData(transactions),
    [transactions]
  );

  // ── Recent orders ─────────────────────────────────────────────
  const allRecentOrders = useMemo(
    () => [...transactions]
      .sort((a, b) => new Date(getTxDate(b)) - new Date(getTxDate(a)))
      .slice(0, 50)
      .map(toRecentOrder),
    [transactions]
  );

  const filteredRecentOrders = useMemo(() => {
    let result = [...allRecentOrders];
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
        const dt   = dayjs(`${o.date}T${o.time}`);
        const from = dayjs(startDate, "DD-MM-YYYY").startOf("day");
        const to   = dayjs(endDate,   "DD-MM-YYYY").endOf("day");
        return dt.isAfter(from) && dt.isBefore(to);
      });
    }
    return result;
  }, [allRecentOrders, searchTerm, dateFilter, selectedDates]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleRevenueDateRangeChange = (e) => setRevenueDateRange(e.target.value);
  const handleOrderAction            = (_orderId, _type) => {};
  const handleDateClick              = (e) => setDateAnchorEl(e.currentTarget);
  const handleDateClose              = ()  => setDateAnchorEl(null);
  const handleDateFilter             = (v) => setDateFilter(v);
  const handleSelectedDates          = (d) => setSelectedDates(d);
  const handleSearchChange           = (v) => setSearchTerm(v);
  const handleClearSearch            = ()  => setSearchTerm("");

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return "Good Morning";
    if (h < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

  // ── Render ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="main-app-view">
            <div className="main-app-content-container">
              <ContentLoader
                state={true}
                loading={true}
                loadingText="Loading dashboard..."
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
    <div className="min-h-screen bg-gray-50 p-2 pb-20">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          {getGreeting()}, Admin!
        </Typography>
        <Box textAlign="right">
          <Typography variant="subtitle1">{formatDate(currentTime)}</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Last updated: {currentTime.toLocaleTimeString()}
          </Typography>
        </Box>
      </Box>

      {/* KPI Cards — same card language as kiosk StatsCard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
        <KpiCard
          icon={<ShoppingCartIcon size={22} />}
          title="Orders Today"
          value={todayOrders}
          change={ordersChange}
          color="blue"
        />
        <KpiCard
          icon={<RevenueIcon size={22} />}
          title="Revenue Today"
          value={`KSh ${todayRev.toLocaleString()}`}
          change={revenueChange}
          color="green"
        />
        <KpiCard
          icon={<StaffIcon size={22} />}
          title="Active Staff"
          value={staffCount}
          color="purple"
          footer="Active right now"
        />
        <KpiCard
          icon={<MenuIcon size={22} />}
          title="Menu Items"
          value={menuCount}
          color="amber"
          footer="Ready to serve"
        />
        <KpiCard
          icon={<AlertIcon size={22} />}
          title="Unavailable"
          value={unavailableCount}
          color="red"
          footer="Hidden from waiters"
        />
      </div>

      {/* Charts — same card language as kiosk charts */}
      <div className="flex flex-col md:flex-row gap-6 mb-8 items-stretch">
        <div className="w-full md:w-2/3">
          <RevenueChartCard
            data={revenueChartData}
            dateRange={revenueDateRange}
            onDateRangeChange={handleRevenueDateRangeChange}
          />
        </div>
        <div className="w-full md:w-1/3">
          <OrdersByCategoryChartCard data={categoryChartData} />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mb-8">
        <Box sx={{ borderRadius: 2, boxShadow: 1, padding: 3, marginBottom: 2 }}>
          <Box display="flex" alignItems="center" gap={4} mb={2}>
            <Box display="flex" alignItems="center" gap={4}>
              <span className="text-xl text-semibold">Recent Orders</span>
              <SearchInput
                id="order-search"
                placeholder="Search orders"
                input={searchTerm}
                handleInput={handleSearchChange}
                handleClear={handleClearSearch}
              />
              <DateRangeInput
                type="orders"
                color="#4F46E5"
                selected={selectedDates}
                dateFilter={dateFilter}
                anchorEl={dateAnchorEl}
                selectedAction={handleSelectedDates}
                handleDateFilter={handleDateFilter}
                handleClose={handleDateClose}
                handleClick={handleDateClick}
              />
            </Box>
          </Box>
          <RecentOrdersTable
            orders={filteredRecentOrders}
            onActionClick={handleOrderAction}
            dates={dateFilter ? selectedDates : null}
          />
        </Box>
      </div>
    </div>
  );
}

export default HotelAdminDashboard;
