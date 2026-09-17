// kiosk-admin/SalesDashboard.jsx
import React, { useState, useMemo, useEffect } from "react";
import {
  DollarSign,
  ShoppingCart,
  CreditCard,
  Users,
  MoreVertical,
  PieChartIcon,
  Download,
  Package,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import KioskTransactionsTable from "./KioskTransactions";
import DateRangeInput from "../../../../../components/Input/DateRangeInput";
import FilterInput from "../../../../../components/Input/FilterInput";
import { useTheme } from "../../../../../components/theme/ThemeContext";

const SalesDashboard = ({
  salesData, // Receive sales data from parent
  loading,
  revenueGrowth,
  transactionGrowth,
  formatCurrency,
  StatCard,
  LoadingOverlay,
  RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  Line,
  COLORS,
  userData,
  selectedDateRange,
  selectedFilters,
  transactions, // Receive ALL transactions from parent
  filteredTransactions, // Receive filtered transactions from parent
  onViewTransaction,
  onRefresh,
  onDateRangeChange,
  onFilterChange // Receive filter change handler from parent
}) => {
  const [dateAnchorEl, setDateAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [localSelectedFilters, setLocalSelectedFilters] = useState([]);

  // Filter options for sales dashboard
  const filterOptions = [
    { label: "Completed", value: "completed" },
    { label: "Pending", value: "pending" },
    { label: "Failed", value: "failed" },
    { label: "Refunded", value: "refunded" },
    { label: "Cash", value: "cash" },
    { label: "Mpesa", value: "mpesa" },
    { label: "Card", value: "card" },
    { label: "High Value (>10,000)", value: "high_value" },
    { label: "Low Value (<1,000)", value: "low_value" }
  ];

  const theme = useTheme();
  // Use parent's filtered data
  const filteredData = useMemo(() => {
    if (!salesData) {
      return {
        totalRevenue: 0,
        transactionCount: 0,
        paymentMethods: [],
        dailyTrend: [],
        averageSale: 0
      };
    }

    return {
      ...salesData,
      averageSale: salesData.transactionCount > 0 ? salesData.totalRevenue / salesData.transactionCount : 0
    };
  }, [salesData]);

  // Date range handlers
  const handleDateClick = (event) => {
    setDateAnchorEl(event.currentTarget);
  };

  const handleDateClose = () => {
    setDateAnchorEl(null);
  };

  const handleDateFilterChange = (hasFilter) => {};

  // Filter handlers
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleTableFilterChange = (hasFilter) => {};

  // Handle local filter change
  const handleLocalFilterChange = (filters) => {
    setLocalSelectedFilters(filters);
    // Send filter changes to parent
    if (onFilterChange) {
      onFilterChange(filters);
    }
  };

  // Export data
  const handleExport = () => {
    const data = {
      dateRange: selectedDateRange || { startDate: "Today", endDate: "Today" },
      filters: selectedFilters || localSelectedFilters,
      metrics: filteredData,
      transactions: (filteredTransactions || []).slice(0, 100) // Limit for export
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales_report_${selectedDateRange ? 'custom' : 'today'}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format date range label
  const getDateRangeLabel = () => {
    if (!selectedDateRange) {
      return "Today";
    }

    const { startDate, endDate } = selectedDateRange;

    // Parse DD-MM-YYYY format
    const [startDay, startMonth, startYear] = startDate.split('-');
    const [endDay, endMonth, endYear] = endDate.split('-');

    const startDateObj = new Date(`${startYear}-${startMonth}-${startDay}`);
    const endDateObj = new Date(`${endYear}-${endMonth}-${endDay}`);

    // Check if same day
    if (startDate === endDate) {
      return startDateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }

    return `${startDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    return (selectedFilters || localSelectedFilters).length;
  };

  // Compact tick labels for chart Y-axes (e.g. 12000 -> "12K")
  const formatAxisValue = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
    return `${value}`;
  };

  // StatCard Component (define locally if not passed from parent) — `color` is a
  // semantic key (blue/green/purple/orange), not a Tailwind gradient class string.
  const STAT_ICON_BG = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    purple: "bg-purple-50",
    orange: "bg-orange-50",
  };

  const LocalStatCard = ({ title, value, growth, icon, color = "blue", suffix = "", loading: isLoading }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">{title}</p>
        <div className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-lg shrink-0 ${STAT_ICON_BG[color] || STAT_ICON_BG.blue}`}>
          {icon}
        </div>
      </div>
      {isLoading ? (
        <div className="animate-pulse mt-3">
          <div className="h-6 bg-gray-200 rounded mb-2 w-2/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      ) : (
        <>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-2 truncate">{value}{suffix}</p>
          {growth !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(growth)}%
              </span>
              <span className="text-xs text-gray-400">vs previous period</span>
            </div>
          )}
        </>
      )}
    </div>
  );

  // Use provided StatCard or local one
  const CardComponent = StatCard || LocalStatCard;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <DateRangeInput
              type="sales"
              color={theme.primaryColor}
              selected={selectedDateRange}
              dateFilter={!!selectedDateRange}
              anchorEl={dateAnchorEl}
              selectedAction={onDateRangeChange}
              handleDateFilter={handleDateFilterChange}
              handleClose={handleDateClose}
              handleClick={handleDateClick}
            />

            <FilterInput
              color={theme.primaryColor}
              label="Sales Filters"
              filters={filterOptions}
              selected={selectedFilters || localSelectedFilters}
              selectedAction={handleLocalFilterChange}
              tableFilter={getActiveFilterCount() > 0}
              handleTableFilter={handleTableFilterChange}
              anchorEl={filterAnchorEl}
              handleClose={handleFilterClose}
              handleClick={handleFilterClick}
              options={["Filters"]}
            />

            <span className="text-sm text-gray-500 whitespace-nowrap">
              {getDateRangeLabel()}
              {getActiveFilterCount() > 0 && ` · ${getActiveFilterCount()} filter(s)`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              {loading ? "Loading..." : "Refresh"}
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardComponent
          title="Total Revenue"
          value={formatCurrency(filteredData.totalRevenue)}
          growth={revenueGrowth}
          icon={<DollarSign className="text-blue-600" size={20} />}
          color="blue"
          loading={loading}
        />

        <CardComponent
          title="Transactions"
          value={filteredTransactions?.length || 0}
          growth={transactionGrowth}
          icon={<ShoppingCart className="text-green-600" size={20} />}
          color="green"
          loading={loading}
        />

        <CardComponent
          title="Average Sale"
          value={formatCurrency(filteredData.averageSale)}
          growth={revenueGrowth > transactionGrowth ? revenueGrowth : transactionGrowth}
          icon={<CreditCard className="text-purple-600" size={20} />}
          color="purple"
          loading={loading}
        />

        <CardComponent
          title="Payment Methods"
          value={filteredData.paymentMethods.length}
          icon={<Users className="text-orange-600" size={20} />}
          color="orange"
          loading={loading}
        />
      </div>

      {/* Charts Section - Only show if we have data */}
      {filteredData.dailyTrend.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Trend Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm relative">
              {loading && <LoadingOverlay />}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                  <p className="text-sm text-gray-600">Daily performance overview</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>This week (Mon–Sun)</span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredData.dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} width={56} tickFormatter={formatAxisValue} />
                    <RechartsTooltip
                      formatter={(value) => [formatCurrency(value), 'Revenue']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      fill="url(#colorRevenue)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payment Methods Pie Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm relative">
              {loading && <LoadingOverlay />}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                  <p className="text-sm text-gray-600">Breakdown by payment type</p>
                </div>
                <PieChartIcon className="text-gray-400" size={20} />
              </div>
              <div className="h-72">
                {filteredData.paymentMethods.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={filteredData.paymentMethods}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="amount"
                        nameKey="method"
                      >
                        {filteredData.paymentMethods.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <Package size={48} className="mb-3 text-gray-300" />
                    <p>No payment data available</p>
                  </div>
                )}
              </div>
              <div className="mt-6 space-y-3">
                {filteredData.paymentMethods.length > 0 ? (
                  filteredData.paymentMethods.map((method) => (
                    <div key={method.method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: method.color }} />
                        <span className="font-medium">{method.method}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(method.amount)}</p>
                        <p className="text-sm text-gray-500">{method.count} transactions</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No payment methods recorded
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Daily Performance Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm relative">
            {loading && <LoadingOverlay />}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Daily Performance</h3>
                <p className="text-sm text-gray-600">Revenue vs Transactions</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Revenue</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Transactions</span>
                </div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} width={56} tickFormatter={formatAxisValue} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} width={40} allowDecimals={false} />
                  <RechartsTooltip
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value) : value,
                      name === 'revenue' ? 'Revenue' : 'Transactions'
                    ]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="transactions" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Package size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Sales Data Available</h3>
          <p className="text-gray-500 mb-6">No transactions found for the selected date range and filters.</p>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={18} />
            Refresh Data
          </button>
        </div>
      )}

      <KioskTransactionsTable
        todayTransactions={filteredTransactions || []}
        onViewTransaction={onViewTransaction}
        loading={loading}
        showFilters={false}
      />
    </div>
  );
};

export default SalesDashboard;