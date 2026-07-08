import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { Box, Typography } from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
  Restaurant as RestaurantIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";

import KpiCard from "./KpiCard";
import RevenueChartCard from "./RevenueChartCard";
import OrdersByCategoryChartCard from "./OrdersByCategoryChartCard";
import RecentOrdersTable from "./recentOrdersTable";
import DateRangeInput from "../../../../../components/Input/DateRangeInput";
import SearchInput from "../../../../../components/Input/SearchInput";
import { GET } from "../../../../../services/DatabaseServiceImp";
import URLS from "../../../../../utilities/Endpoints";

// ── Helpers ────────────────────────────────────────────────────
const isToday = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate();
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildDailyChartData(transactions) {
  // Last 7 days, keyed by day name
  const totals = {};
  DAY_NAMES.forEach((d) => (totals[d] = 0));
  const now = new Date();
  transactions.forEach((t) => {
    if (!t.createdAt) return;
    const d = new Date(t.createdAt);
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays < 7) {
      totals[DAY_NAMES[d.getDay()]] += Number(t.total) || 0;
    }
  });
  // Return in order starting from 7 days ago → today
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const name = DAY_NAMES[d.getDay()];
    result.push({ name, value: totals[name] });
  }
  return result;
}

function buildMonthlyChartData(transactions) {
  const totals = {};
  MONTH_NAMES.forEach((m) => (totals[m] = 0));
  transactions.forEach((t) => {
    if (!t.createdAt) return;
    const m = MONTH_NAMES[new Date(t.createdAt).getMonth()];
    totals[m] += Number(t.total) || 0;
  });
  return MONTH_NAMES.map((name) => ({ name, value: totals[name] }))
    .filter((_, i) => i <= new Date().getMonth()); // Only up to current month
}

function buildCategoryData(transactions) {
  const counts = {};
  transactions.forEach((t) => {
    (t.items || []).forEach((item) => {
      const cat = item.category || "Food";
      counts[cat] = (counts[cat] || 0) + item.quantity;
    });
  });
  const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;
  return Object.entries(counts).map(([name, v]) => ({
    name,
    value: Math.round((v / total) * 100),
  }));
}

function toRecentOrder(t) {
  const dt = t.createdAt ? new Date(t.createdAt) : new Date();
  return {
    id:        t.orderId || t.orderNumber || t._id,
    waiter:    t.waiter || "—",
    amount:    Number(t.total) || 0,
    date:      dt.toISOString().split("T")[0],
    time:      dt.toTimeString().slice(0, 8),
    status:    t.status
      ? t.status.charAt(0).toUpperCase() + t.status.slice(1)
      : "Pending",
    foodItems: (t.items || []).map((i) => i.name),
  };
}

// ── Component ──────────────────────────────────────────────────
function HotelAdminDashboard() {
  const currentUser = useSelector((s) => s.auth?.value);
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
  const [lowStockCount, setLowStockCount] = useState(0);

  // ── Fetch all dashboard data ──────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!businessId) return;
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
      // Products (menu)
      const pEndpoint = URLS.PRODUCTS.GET_PRODUCTS_BY_BUSINESS
        .replace(":businessId", businessId);
      const pRes = await GET(pEndpoint);
      if (pRes?.success) {
        const products = pRes.products || pRes.data || [];
        setMenuCount(products.filter((p) => p.available !== false).length);
        setLowStockCount(products.filter((p) =>
          p.stock !== undefined && p.stock <= (p.lowStockThreshold || 5)
        ).length);
      }
    } catch (_) {}

    try {
      // Staff (users for this business)
      const uEndpoint = `/api/users/business/${businessId}`;
      const uRes = await GET(uEndpoint);
      if (uRes?.success) {
        const users = uRes.data || [];
        setStaffCount(users.filter((u) =>
          (u.status || "").toUpperCase() === "ACTIVE"
        ).length);
      }
    } catch (_) {}
  }, [businessId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Clock ticker
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // ── Derived KPI values ────────────────────────────────────────
  const todayTx     = useMemo(() => transactions.filter((t) => isToday(t.createdAt)), [transactions]);
  const todayOrders = todayTx.length;
  const todayRev    = useMemo(() => todayTx.reduce((s, t) => s + Number(t.total || 0), 0), [todayTx]);

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
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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
          o.id.toLowerCase().includes(term) ||
          o.waiter.toLowerCase().includes(term) ||
          (o.foodItems || []).some((i) => i.toLowerCase().includes(term)) ||
          o.status.toLowerCase().includes(term)
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

  // ── Render — JSX identical to original ───────────────────────
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

      {/* KPI Cards */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.33%-1rem)] lg:w-[calc(20%-1rem)]">
          <KpiCard
            icon={<ShoppingCartIcon />}
            title="Total Orders Today"
            value={todayOrders}
            color="#3f51b5"
          />
        </div>
        <div className="w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.33%-1rem)] lg:w-[calc(20%-1rem)]">
          <KpiCard
            icon={<AttachMoneyIcon />}
            title="Total Revenue Today"
            value={`KSh ${todayRev.toLocaleString()}`}
            color="#f44336"
          />
        </div>
        <div className="w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.33%-1rem)] lg:w-[calc(20%-1rem)]">
          <KpiCard
            icon={<PeopleIcon />}
            title="Active Staff"
            value={staffCount}
            color="#4caf50"
          />
        </div>
        <div className="w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.33%-1rem)] lg:w-[calc(20%-1rem)]">
          <KpiCard
            icon={<RestaurantIcon />}
            title="Menu Items Available"
            value={menuCount}
            color="#ff9800"
          />
        </div>
        <div className="w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.33%-1rem)] lg:w-[calc(20%-1rem)]">
          <KpiCard
            icon={<WarningIcon />}
            title="Low Stock Alerts"
            value={lowStockCount}
            color="#e91e63"
          />
        </div>
      </div>

      {/* Charts */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="w-full md:w-3/4">
          <RevenueChartCard
            data={revenueChartData}
            dateRange={revenueDateRange}
            onDateRangeChange={handleRevenueDateRangeChange}
          />
        </div>
        <div className="w-full md:w-1/4">
          <OrdersByCategoryChartCard
            data={categoryChartData.length > 0 ? categoryChartData : [{ name: "No data", value: 100 }]}
          />
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
          />
        </Box>
      </div>
    </div>
  );
}

export default HotelAdminDashboard;
