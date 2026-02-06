// kiosk-admin/SalesDashboard.jsx
import React, { useState, useMemo, useEffect } from "react";
import {
  DollarSign,
  ShoppingCart,
  CreditCard,
  Users,
  MoreVertical,
  PieChartIcon,
  Calendar,
  Download,
  Package,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Filter,
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
        averageSale: 0,
        topProducts: []
      };
    }

    // Calculate additional metrics from filteredTransactions
    const completedTransactions = (filteredTransactions || []).filter(t =>
      t.status?.toLowerCase() === 'completed'
    );

    // Get top selling products from filtered transactions
    const productMap = {};
    completedTransactions.forEach(t => {
      if (t.items && Array.isArray(t.items)) {
        t.items.forEach(item => {
          const productName = item.productName || 'Unknown Product';
          if (!productMap[productName]) {
            productMap[productName] = {
              name: productName,
              quantity: 0,
              revenue: 0
            };
          }
          productMap[productName].quantity += item.quantity || 1;
          productMap[productName].revenue += (item.price || 0) * (item.quantity || 1);
        });
      }
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      ...salesData,
      averageSale: salesData.transactionCount > 0 ? salesData.totalRevenue / salesData.transactionCount : 0,
      topProducts
    };
  }, [salesData, filteredTransactions]);

  // Date range handlers
  const handleDateClick = (event) => {
    setDateAnchorEl(event.currentTarget);
  };

  const handleDateClose = () => {
    setDateAnchorEl(null);
  };

  const handleDateFilterChange = (hasFilter) => {
    console.log("Date filter changed:", hasFilter);
  };

  // Filter handlers
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleTableFilterChange = (hasFilter) => {
    console.log("Table filter changed:", hasFilter);
  };

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

  // StatCard Component (define locally if not passed from parent)
  const LocalStatCard = ({ title, value, growth, icon, color, suffix = "", loading: isLoading }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color} bg-opacity-10`}>
          {icon}
        </div>
        {!isLoading && growth !== undefined && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
            {growth >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
            {Math.abs(growth)}%
          </span>
        )}
      </div>
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      ) : (
        <>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}{suffix}</h3>
          <p className="text-sm text-gray-600">{title}</p>
          {growth !== undefined && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-xs text-gray-500">
                <span>{growth >= 0 ? 'Increase' : 'Decrease'} from previous period</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  // Use provided StatCard or local one
  const CardComponent = StatCard || LocalStatCard;

  return (
    <div className="space-y-8">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time sales analytics and transaction monitoring</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Loading..." : "Refresh"}
          </button>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Input */}
            <div className="relative inline-flex">
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
              {selectedDateRange && (
                <span className="ml-2 text-sm text-gray-700 whitespace-nowrap hidden sm:inline">
                  {getDateRangeLabel()}
                </span>
              )}
            </div>

            {/* Filter Input */}
            <div className="relative inline-flex">
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
              {getActiveFilterCount() > 0 && (
                <span className="ml-2 text-sm text-gray-700 whitespace-nowrap hidden sm:inline">
                  {getActiveFilterCount()} filter(s)
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            disabled={loading}
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Date Range and Filter Indicators */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-blue-600" size={20} />
            <div>
              <p className="text-sm font-medium text-blue-900">Viewing data for</p>
              <p className="text-lg font-bold text-blue-700">{getDateRangeLabel()}</p>
            </div>
          </div>

          {getActiveFilterCount() > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="text-blue-600" size={20} />
              <div>
                <p className="text-sm font-medium text-blue-900">Active Filters</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(selectedFilters || localSelectedFilters).map(filter => {
                    const filterOption = filterOptions.find(opt => opt.value === filter);
                    return (
                      <span
                        key={filter}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                      >
                        {filterOption?.label || filter}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="text-right">
            <p className="text-sm text-blue-600">
              {filteredTransactions?.length || 0} filtered transactions
            </p>
            <p className="text-lg font-bold text-blue-900">
              {formatCurrency(filteredData.totalRevenue)} total revenue
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardComponent
          title="Total Revenue"
          value={formatCurrency(filteredData.totalRevenue)}
          growth={revenueGrowth}
          icon={<DollarSign className="text-blue-600" size={24} />}
          color="from-blue-500 to-blue-600"
          loading={loading}
        />

        <CardComponent
          title="Transactions"
          value={filteredTransactions?.length || 0}
          growth={transactionGrowth}
          icon={<ShoppingCart className="text-green-600" size={24} />}
          color="from-green-500 to-green-600"
          loading={loading}
        />

        <CardComponent
          title="Average Sale"
          value={formatCurrency(filteredData.averageSale)}
          growth={revenueGrowth > transactionGrowth ? revenueGrowth : transactionGrowth}
          icon={<CreditCard className="text-purple-600" size={24} />}
          color="from-purple-500 to-purple-600"
          loading={loading}
        />

        <CardComponent
          title="Payment Methods"
          value={filteredData.paymentMethods.length}
          growth={0}
          icon={<Users className="text-orange-600" size={24} />}
          color="from-orange-500 to-orange-600"
          loading={loading}
        />
      </div>

      {/* Charts Section - Only show if we have data */}
      {filteredData.dailyTrend.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Trend Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative">
              {loading && <LoadingOverlay />}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                  <p className="text-sm text-gray-600">Daily performance overview</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Showing {filteredData.dailyTrend.length} days</span>
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
                    <YAxis axisLine={false} tickLine={false} />
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
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative">
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
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative">
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
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
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
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
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


      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 mb-1">Success Rate</p>
              <h4 className="text-2xl font-bold text-blue-900">
                {filteredTransactions?.length > 0
                  ? `${Math.round((filteredTransactions.filter(t => t.status?.toLowerCase() === 'completed').length / filteredTransactions.length) * 100)}%`
                  : '0%'}
              </h4>
              <p className="text-sm text-blue-700">Completed transactions</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <CheckCircle className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 mb-1">Average Items</p>
              <h4 className="text-2xl font-bold text-green-900">
                {filteredTransactions?.length > 0
                  ? (filteredTransactions.reduce((sum, t) => sum + (t.items?.length || 0), 0) / filteredTransactions.length).toFixed(1)
                  : '0.0'}
              </h4>
              <p className="text-sm text-green-700">Items per transaction</p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <ShoppingCart className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 mb-1">Top Product</p>
              <h4 className="text-xl font-bold text-purple-900 truncate">
                {filteredData.topProducts?.[0]?.name || 'N/A'}
              </h4>
              <p className="text-sm text-purple-700">
                {filteredData.topProducts?.[0]?.quantity || 0} units sold
              </p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <Package className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;