import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  Download,
  Printer,
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Package,
  AlertTriangle,
  CheckCircle,
  Percent,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Sparkles,
  Target,
  Trophy,
  Star,
  ChevronRight,
  Filter,
  MoreVertical,
  Eye,
  RefreshCw,
  HelpCircle,
} from "lucide-react";

// Enhanced mock data with more realistic values
const mockSalesData = {
  totalRevenue: 485650,
  previousRevenue: 412350,
  transactionCount: 342,
  previousTransactions: 298,
  paymentMethods: [
    { method: "M-Pesa", amount: 285430, count: 198, color: "#10B981" },
    { method: "Cash", amount: 142850, count: 89, color: "#3B82F6" },
    // { method: "Card", amount: 57370, count: 55, color: "#8B5CF6" },
    // { method: "Bank Transfer", amount: 28000, count: 22, color: "#F59E0B" },
  ],
  dailyTrend: [
    { day: "Mon", revenue: 65000, transactions: 45 },
    { day: "Tue", revenue: 72000, transactions: 52 },
    { day: "Wed", revenue: 81000, transactions: 58 },
    { day: "Thu", revenue: 78500, transactions: 55 },
    { day: "Fri", revenue: 95000, transactions: 68 },
    { day: "Sat", revenue: 102000, transactions: 73 },
    { day: "Sun", revenue: 83150, transactions: 59 },
  ],
};

const mockProductData = [
  { name: "Coca Cola 500ml", quantitySold: 145, revenue: 21750, stock: 120, category: "Beverages" },
  { name: "Bread Loaf", quantitySold: 89, revenue: 13350, stock: 45, category: "Food" },
  { name: "Milk 1L", quantitySold: 67, revenue: 8040, stock: 32, category: "Dairy" },
  { name: "Rice 2kg", quantitySold: 34, revenue: 8500, stock: 28, category: "Grains" },
  { name: "Cooking Oil 1L", quantitySold: 28, revenue: 9800, stock: 18, category: "Cooking" },
  { name: "Sugar 1kg", quantitySold: 42, revenue: 6300, stock: 25, category: "Groceries" },
  { name: "Tea Leaves 250g", quantitySold: 38, revenue: 5700, stock: 22, category: "Beverages" },
  { name: "Soap Bar", quantitySold: 56, revenue: 6720, stock: 40, category: "Personal Care" },
];

const mockDebtData = [
  { customer: "John Kamau", amount: 2500, status: "Pending", date: "2024-01-15", days: 5, phone: "+254712345678" },
  { customer: "Mary Wanjiku", amount: 1800, status: "Completed", date: "2024-01-10", days: 0, phone: "+254723456789" },
  { customer: "Peter Otieno", amount: 3200, status: "Pending", date: "2024-01-20", days: 10, phone: "+254734567890" },
  { customer: "Grace Njeri", amount: 950, status: "Completed", date: "2024-01-18", days: 0, phone: "+254745678901" },
  { customer: "Samuel Omondi", amount: 4200, status: "Overdue", date: "2024-01-05", days: 15, phone: "+254756789012" },
  { customer: "Esther Adhiambo", amount: 1500, status: "Pending", date: "2024-01-22", days: 2, phone: "+254767890123" },
];

const mockStaffData = [
  { name: "Alice Muthoni", transactions: 89, totalSales: 145630, avgSale: 1637, rating: 4.8, imageColor: "#3B82F6" },
  { name: "David Kiprop", transactions: 76, totalSales: 125890, avgSale: 1656, rating: 4.5, imageColor: "#10B981" },
  { name: "Sarah Achieng", transactions: 92, totalSales: 168420, avgSale: 1831, rating: 4.9, imageColor: "#8B5CF6" },
  { name: "James Mwangi", transactions: 85, totalSales: 142760, avgSale: 1679, rating: 4.6, imageColor: "#F59E0B" },
  { name: "Linda Chebet", transactions: 78, totalSales: 135420, avgSale: 1736, rating: 4.7, imageColor: "#EC4899" },
];

const COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899", "#EF4444", "#06B6D4", "#84CC16"];

const getInitials = (name) => {
  return name.split(" ").map(n => n[0]).join("").toUpperCase();
};

export default function KioskAdminReportsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [dateFilter, setDateFilter] = useState("today");
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: "",
  });
  const [viewMode, setViewMode] = useState("grid");

  const formatCurrency = (amount) => {
    return `KSh ${amount.toLocaleString()}`;
  };

  const calculateGrowth = (current, previous) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const handleExport = (format) => {
    console.log(`Exporting as ${format}`);
    // Implementation would depend on your backend/export library
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate totals for debt report
  const totalOutstanding = mockDebtData
    .filter((item) => item.status === "Pending" || item.status === "Overdue")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalRecovered = mockDebtData
    .filter((item) => item.status === "Completed")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalDebt = mockDebtData.reduce((sum, item) => sum + item.amount, 0);

  const tabs = [
    { id: 0, label: "Sales Dashboard", icon: <BarChart3 size={18} /> },
    { id: 1, label: "Product Analytics", icon: <Package size={18} /> },
    { id: 2, label: "Debt Management", icon: <CreditCard size={18} /> },
    { id: 3, label: "Staff Performance", icon: <Users size={18} /> },
  ];

  const revenueGrowth = calculateGrowth(mockSalesData.totalRevenue, mockSalesData.previousRevenue);
  const transactionGrowth = calculateGrowth(mockSalesData.transactionCount, mockSalesData.previousTransactions);

  const StatCard = ({ title, value, growth, icon, color, suffix = "" }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color} bg-opacity-10`}>
          {icon}
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {growth >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
          {Math.abs(growth)}%
        </span>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}{suffix}</h3>
      <p className="text-sm text-gray-600">{title}</p>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center text-xs text-gray-500">
          <span>Compared to last period</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white  p-4 md:p-6">
      {/* Enhanced Header with Glass Effect */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-5 rounded-3xl blur-xl"></div>
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Activity className="text-white" size={24} />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
              </div>
              <p className="text-gray-600 ml-1">
                Real-time insights and comprehensive business analytics
                <span className="inline-flex items-center ml-2 text-blue-600">
                  <Sparkles size={16} className="mr-1" />
                  Powered by AI Insights
                </span>
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm">
                <RefreshCw size={18} />
                <span className="font-medium">Refresh Data</span>
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all duration-200 shadow-lg shadow-blue-500/30">
                <HelpCircle size={18} />
                <span className="font-medium">Quick Insights</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Customers</p>
                  <p className="text-2xl font-bold text-gray-900">1,248</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="text-blue-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inventory Value</p>
                  <p className="text-2xl font-bold text-gray-900">KSh 2.4M</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package className="text-green-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Profit Margin</p>
                  <p className="text-2xl font-bold text-gray-900">24.8%</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Percent className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Target Progress</p>
                  <p className="text-2xl font-bold text-gray-900">78%</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Target className="text-orange-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Control Panel */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-8 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                {dateFilter === "custom" && (
                  <div className="flex gap-3">
                    <div className="relative">
                      <input
                        type="date"
                        value={customDateRange.start}
                        onChange={(e) =>
                          setCustomDateRange((prev) => ({
                            ...prev,
                            start: e.target.value,
                          }))
                        }
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <span className="flex items-center text-gray-500">to</span>
                    <div className="relative">
                      <input
                        type="date"
                        value={customDateRange.end}
                        onChange={(e) =>
                          setCustomDateRange((prev) => ({
                            ...prev,
                            end: e.target.value,
                          }))
                        }
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                <button className="inline-flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                  <Filter size={18} />
                  <span>More Filters</span>
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-2 rounded-lg transition-all ${viewMode === "grid" ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  Grid View
                </button>
                <button
                  onClick={() => setViewMode("detailed")}
                  className={`px-4 py-2 rounded-lg transition-all ${viewMode === "detailed" ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  Detailed View
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleExport("pdf")}
                  className="inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/30"
                >
                  <FileText size={18} />
                  <span>PDF Report</span>
                </button>
                <button
                  onClick={() => handleExport("csv")}
                  className="inline-flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Download size={18} />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Printer size={18} />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="border-t border-gray-200">
          <div className="flex px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 mr-8 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className={`transition-colors ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'}`}>
                  {tab.icon}
                </span>
                {tab.label}
                {activeTab === tab.id && (
                  <ChevronRight className="ml-1" size={16} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Tab 1: Enhanced Sales Dashboard */}
        {activeTab === 0 && (
          <div className="space-y-8">
            {/* Top Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Revenue"
                value={formatCurrency(mockSalesData.totalRevenue)}
                growth={revenueGrowth}
                icon={<DollarSign className="text-blue-600" size={24} />}
                color="from-blue-500 to-blue-600"
              />
              <StatCard
                title="Transactions"
                value={mockSalesData.transactionCount}
                growth={transactionGrowth}
                icon={<ShoppingCart className="text-green-600" size={24} />}
                color="from-green-500 to-green-600"
                suffix=""
              />
              <StatCard
                title="Average Sale"
                value={formatCurrency(Math.round(mockSalesData.totalRevenue / mockSalesData.transactionCount))}
                growth={2.4}
                icon={<CreditCard className="text-purple-600" size={24} />}
                color="from-purple-500 to-purple-600"
              />
              <StatCard
                title="Customer Count"
                value="342"
                growth={8.7}
                icon={<Users className="text-orange-600" size={24} />}
                color="from-orange-500 to-orange-600"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Trend Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                    <p className="text-sm text-gray-600">Daily performance overview</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={20} />
                  </button>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockSalesData.dailyTrend}>
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
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                    <p className="text-sm text-gray-600">Breakdown by payment type</p>
                  </div>
                  <PieChartIcon className="text-gray-400" size={20} />
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockSalesData.paymentMethods}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="amount"
                      >
                        {mockSalesData.paymentMethods.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 space-y-3">
                  {mockSalesData.paymentMethods.map((method) => (
                    <div key={method.method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: method.color }} />
                        <span className="font-medium">{method.method}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(method.amount)}</p>
                        <p className="text-sm text-gray-500">{method.count} transactions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Daily Performance */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
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
                  <BarChart data={mockSalesData.dailyTrend}>
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
          </div>
        )}

        {/* Tab 2: Enhanced Product Analytics */}
        {activeTab === 1 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Product Performance Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Top Performing Products</h3>
                    <p className="text-sm text-gray-600">By revenue and quantity sold</p>
                  </div>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>This Month</option>
                    <option>Last Month</option>
                    <option>This Quarter</option>
                  </select>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockProductData.slice(0, 6)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={150} axisLine={false} tickLine={false} />
                      <RechartsTooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                      <Bar dataKey="revenue" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Stock Overview */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Stock Alert</h3>
                    <p className="text-sm text-gray-600">Low stock items</p>
                  </div>
                  <AlertTriangle className="text-yellow-500" size={20} />
                </div>
                <div className="space-y-4">
                  {mockProductData
                    .filter(item => item.stock < 30)
                    .map((product, index) => (
                      <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{product.name}</span>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                            Low Stock
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Current Stock: {product.stock}</span>
                          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                            Reorder
                          </button>
                        </div>
                        <div className="mt-2">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-500 rounded-full"
                              style={{ width: `${(product.stock / 100) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Product Sales Details</h3>
                    <p className="text-sm text-gray-600">Complete product performance breakdown</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    View All Products
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Quantity Sold
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mockProductData.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                                <Package className="text-blue-600" size={20} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">SKU: PROD{1000 + index}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                            {product.quantitySold}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="text-sm font-semibold text-gray-900">{formatCurrency(product.revenue)}</div>
                            <div className="text-xs text-gray-500">
                              {formatCurrency(Math.round(product.revenue / product.quantitySold))} avg
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex items-center">
                              <span className={`text-sm font-medium ${product.stock < 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                                {product.stock} units
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Enhanced Debt Management */}
        {activeTab === 2 && (
          <div className="space-y-8">
            {/* Debt Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <AlertTriangle size={24} />
                  <span className="text-sm opacity-90">Outstanding</span>
                </div>
                <h3 className="text-3xl font-bold mb-2">{formatCurrency(totalOutstanding)}</h3>
                <p className="text-sm opacity-90">Total amount pending</p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="text-xs opacity-80">From {mockDebtData.filter(d => d.status !== 'Completed').length} customers</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle size={24} />
                  <span className="text-sm opacity-90">Recovered</span>
                </div>
                <h3 className="text-3xl font-bold mb-2">{formatCurrency(totalRecovered)}</h3>
                <p className="text-sm opacity-90">Successfully collected</p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="text-xs opacity-80">{((totalRecovered / totalDebt) * 100).toFixed(1)}% recovery rate</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <CreditCard size={24} />
                  <span className="text-sm opacity-90">Total Debt</span>
                </div>
                <h3 className="text-3xl font-bold mb-2">{formatCurrency(totalDebt)}</h3>
                <p className="text-sm opacity-90">Overall debt portfolio</p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="text-xs opacity-80">{mockDebtData.length} total records</div>
                </div>
              </div>
            </div>

            {/* Debt Distribution Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Debt Distribution</h3>
                    <p className="text-sm text-gray-600">By status and amount</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    Send Reminders
                  </button>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      innerRadius="20%" 
                      outerRadius="90%" 
                      data={mockDebtData.map(d => ({ ...d, fill: d.status === 'Completed' ? '#10B981' : d.status === 'Overdue' ? '#EF4444' : '#F59E0B' }))}
                      startAngle={180}
                      endAngle={0}
                    >
                      <RadialBar 
                        minAngle={15} 
                        label={{ position: 'insideStart', fill: '#fff' }} 
                        background 
                        clockWise 
                        dataKey="amount" 
                      />
                      <Legend />
                      <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Debt Status Overview */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Debt Status</h3>
                <div className="space-y-4">
                  {['Pending', 'Completed', 'Overdue'].map((status) => {
                    const count = mockDebtData.filter(d => d.status === status).length;
                    const amount = mockDebtData.filter(d => d.status === status).reduce((sum, d) => sum + d.amount, 0);
                    const color = status === 'Completed' ? 'green' : status === 'Overdue' ? 'red' : 'yellow';
                    
                    return (
                      <div key={status} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{status}</span>
                          <span className={`px-2 py-1 bg-${color}-100 text-${color}-800 text-xs rounded-full`}>
                            {count} customers
                          </span>
                        </div>
                        <p className="text-xl font-semibold text-gray-900">{formatCurrency(amount)}</p>
                        <div className="mt-2">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-${color}-500 rounded-full`}
                              style={{ width: `${(count / mockDebtData.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Enhanced Debt Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Customer Debt Details</h3>
                    <p className="text-sm text-gray-600">Manage and track customer debts</p>
                  </div>
                  <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:opacity-90 transition-all">
                    <Download size={18} />
                    Export List
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Days
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mockDebtData.map((debt, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                                <Users className="text-gray-600" size={20} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{debt.customer}</div>
                                <div className="text-sm text-gray-500">Debt ID: DBT{1000 + index}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{debt.phone}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="text-sm font-semibold text-gray-900">{formatCurrency(debt.amount)}</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              debt.status === "Completed" 
                                ? "bg-green-100 text-green-800" 
                                : debt.status === "Overdue"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {debt.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className={`text-sm font-medium ${
                              debt.days > 10 ? 'text-red-600' : 
                              debt.days > 5 ? 'text-yellow-600' : 
                              'text-gray-600'
                            }`}>
                              {debt.days} days
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                <Eye size={16} />
                              </button>
                              <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                                <CheckCircle size={16} />
                              </button>
                              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                <AlertTriangle size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Enhanced Staff Performance */}
        {activeTab === 3 && (
          <div className="space-y-8">
            {/* Staff Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockStaffData.map((staff, index) => (
                <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: staff.imageColor }}
                      >
                        {getInitials(staff.name)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{staff.name}</h4>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              className={i < Math.floor(staff.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
                            />
                          ))}
                          <span className="text-xs text-gray-600 ml-1">{staff.rating}</span>
                        </div>
                      </div>
                    </div>
                    <MoreVertical className="text-gray-400" size={20} />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Transactions</span>
                      <span className="font-semibold">{staff.transactions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Sales</span>
                      <span className="font-semibold text-green-600">{formatCurrency(staff.totalSales)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg. Sale</span>
                      <span className="font-semibold">{formatCurrency(staff.avgSale)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Performance</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        staff.avgSale > 1800 
                          ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800"
                          : staff.avgSale > 1700
                          ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800"
                          : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800"
                      }`}>
                        {staff.avgSale > 1800 ? "Top Performer" : staff.avgSale > 1700 ? "Excellent" : "Good"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Staff Performance Trend</h3>
                    <p className="text-sm text-gray-600">Average sale comparison</p>
                  </div>
                  <Trophy className="text-yellow-500" size={24} />
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockStaffData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <RechartsTooltip formatter={(value) => [formatCurrency(value), 'Average Sale']} />
                      <Line 
                        type="monotone" 
                        dataKey="avgSale" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ r: 6, fill: "#3B82F6" }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Performer */}
              <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <Trophy size={24} />
                  <span className="text-sm opacity-90">Top Performer</span>
                </div>
                <div className="text-center mb-6">
                  <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                    {getInitials(mockStaffData[2].name)}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{mockStaffData[2].name}</h3>
                  <div className="flex items-center justify-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < 5 ? "fill-white" : ""} />
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="opacity-90">Transactions</span>
                    <span className="font-semibold">{mockStaffData[2].transactions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-90">Total Sales</span>
                    <span className="font-semibold">{formatCurrency(mockStaffData[2].totalSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-90">Avg. Sale</span>
                    <span className="font-semibold">{formatCurrency(mockStaffData[2].avgSale)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Staff Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Detailed Performance</h3>
                    <p className="text-sm text-gray-600">Complete staff performance metrics</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    Download Report
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Staff Member
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Transactions
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Total Sales
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Average Sale
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Conversion Rate
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Performance Score
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mockStaffData.map((staff, index) => {
                        const performanceScore = Math.round((staff.avgSale / 2000) * 100);
                        return (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div 
                                  className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold mr-3"
                                  style={{ backgroundColor: staff.imageColor }}
                                >
                                  {getInitials(staff.name)}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                                  <div className="text-sm text-gray-500">Employee ID: EMP{1000 + index}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="text-sm font-semibold">{staff.transactions}</div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="text-sm font-semibold text-green-600">{formatCurrency(staff.totalSales)}</div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="text-sm font-semibold">{formatCurrency(staff.avgSale)}</div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="text-sm font-semibold">
                                {Math.round((staff.transactions / 100) * 100)}%
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="inline-flex items-center">
                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      performanceScore >= 90 ? 'bg-green-500' :
                                      performanceScore >= 80 ? 'bg-blue-500' :
                                      performanceScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${performanceScore}%` }}
                                  />
                                </div>
                                <span className="ml-2 text-sm font-semibold">{performanceScore}/100</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View Details">
                                  <Eye size={16} />
                                </button>
                                <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Award Bonus">
                                  <Trophy size={16} />
                                </button>
                                <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg" title="Send Message">
                                  <Users size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-gray-600">
          <div className="mb-4 md:mb-0">
            <p>© 2024 Kiosk Management System. All rights reserved.</p>
            <p className="mt-1">Last updated: Today at 14:30</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              System Status: <span className="font-medium text-green-600">Operational</span>
            </span>
            <span>•</span>
            <span>Data refresh: Auto (Every 5 min)</span>
          </div>
        </div>
      </div>
    </div>
  );
}