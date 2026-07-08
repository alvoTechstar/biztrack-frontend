import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  LineChart, BarChart, CartesianGrid, XAxis, YAxis,
  Tooltip, Legend, Line, Bar, ResponsiveContainer,
} from 'recharts';
import { Download, TrendingUp, DollarSign, ShoppingBag, Calendar, Filter } from 'lucide-react';
import { GET } from '../../../../../services/DatabaseServiceImp';
import URLS from '../../../../../utilities/Endpoints';

// ── Date helpers ───────────────────────────────────────────────
const startOfDay   = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const startOfWeek  = (d) => { const x = startOfDay(d); x.setDate(x.getDate() - x.getDay()); return x; };
const startOfMonth = (d) => { const x = startOfDay(d); x.setDate(1); return x; };
const yesterday    = () => { const d = new Date(); d.setDate(d.getDate()-1); return d; };
const lastWeekStart = () => { const d = startOfWeek(new Date()); d.setDate(d.getDate()-7); return d; };
const lastWeekEnd   = () => { const d = startOfWeek(new Date()); d.setDate(d.getDate()-1); return d; };
const lastMonthStart = () => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth()-1); d.setHours(0,0,0,0); return d; };
const lastMonthEnd  = () => { const d = new Date(); d.setDate(0); d.setHours(23,59,59,999); return d; };

function filterByRange(transactions, range) {
  const now   = new Date();
  const today = startOfDay(now);
  const yd    = startOfDay(yesterday());
  switch (range) {
    case 'Today':      return transactions.filter(t => new Date(t.createdAt) >= today);
    case 'Yesterday':  return transactions.filter(t => {
      const d = new Date(t.createdAt);
      return d >= yd && d < today;
    });
    case 'This Week':  return transactions.filter(t => new Date(t.createdAt) >= startOfWeek(now));
    case 'Last Week':  return transactions.filter(t => {
      const d = new Date(t.createdAt);
      return d >= lastWeekStart() && d <= lastWeekEnd();
    });
    case 'This Month': return transactions.filter(t => new Date(t.createdAt) >= startOfMonth(now));
    case 'Last Month': return transactions.filter(t => {
      const d = new Date(t.createdAt);
      return d >= lastMonthStart() && d <= lastMonthEnd();
    });
    default:           return transactions;
  }
}

// ── Chart builders ─────────────────────────────────────────────
const PROFIT_MARGIN = 0.40; // 40% estimated margin

function buildDailyChart(txs) {
  const buckets = [
    { time: '6AM',  from:  6, to:  9 },
    { time: '9AM',  from:  9, to: 12 },
    { time: '12PM', from: 12, to: 15 },
    { time: '3PM',  from: 15, to: 18 },
    { time: '6PM',  from: 18, to: 21 },
    { time: '9PM',  from: 21, to: 24 },
  ];
  return buckets.map(({ time, from, to }) => {
    const sales = txs
      .filter(t => { const h = new Date(t.createdAt).getHours(); return h >= from && h < to; })
      .reduce((s, t) => s + Number(t.total || 0), 0);
    return { time, sales: Math.round(sales), profit: Math.round(sales * PROFIT_MARGIN) };
  });
}

function buildWeeklyChart(txs) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const totals = Object.fromEntries(days.map(d => [d, 0]));
  txs.forEach(t => {
    const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(t.createdAt).getDay()];
    totals[day] = (totals[day] || 0) + Number(t.total || 0);
  });
  return days.map(time => ({
    time,
    sales:  Math.round(totals[time]),
    profit: Math.round(totals[time] * PROFIT_MARGIN),
  }));
}

function buildMonthlyChart(txs) {
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const totals = [0, 0, 0, 0];
  const monthStart = startOfMonth(new Date());
  txs.forEach(t => {
    const diffDays = Math.floor((new Date(t.createdAt) - monthStart) / 86400000);
    const wk = Math.min(Math.floor(diffDays / 7), 3);
    if (wk >= 0) totals[wk] += Number(t.total || 0);
  });
  return weeks.map((time, i) => ({
    time,
    sales:  Math.round(totals[i]),
    profit: Math.round(totals[i] * PROFIT_MARGIN),
  }));
}

function buildTableData(txs) {
  const map = {};
  txs.forEach(t => {
    (t.items || []).forEach((item, i) => {
      const key = item.name || `Item ${i+1}`;
      if (!map[key]) map[key] = { product: key, quantity: 0, revenue: 0 };
      map[key].quantity += item.quantity || 1;
      map[key].revenue  += Number(item.price || 0) * (item.quantity || 1);
    });
  });
  return Object.values(map)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((r, i) => ({
      id:       i + 1,
      product:  r.product,
      quantity: r.quantity,
      revenue:  Math.round(r.revenue),
      profit:   Math.round(r.revenue * PROFIT_MARGIN),
    }));
}

function buildSummary(txs) {
  const totalSales  = Math.round(txs.reduce((s, t) => s + Number(t.total || 0), 0));
  const totalOrders = txs.length;
  return {
    totalSales,
    totalProfit: Math.round(totalSales * PROFIT_MARGIN),
    totalOrders,
    avgOrderValue: totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0,
  };
}

// ── Component ──────────────────────────────────────────────────
export default function ReportsPage() {
  const currentUser = useSelector((s) => s.auth?.value);
  const businessId  = String(
    currentUser?.businessId || currentUser?.institutionId ||
    currentUser?.associatedBusinessId || ''
  ).trim();

  const [activeTab, setActiveTab] = useState('daily');
  const [chartType, setChartType] = useState('line');
  const [dateRange, setDateRange] = useState({
    daily: 'Today', weekly: 'This Week', monthly: 'This Month',
  });
  const [allTransactions, setAllTransactions] = useState([]);

  // ── Fetch ─────────────────────────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    if (!businessId) return;
    try {
      const endpoint = URLS.TRANSACTIONS.GET_TRANSACTIONS_BY_BUSINESS
        .replace(':businessId', businessId);
      const res = await GET(endpoint);
      if (res?.success) {
        setAllTransactions(
          (res.data || res.transactions || [])
            .filter(t => t.type === 'hotel_order' || !t.type)
        );
      }
    } catch (_) {}
  }, [businessId]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  // ── Compute from real data ────────────────────────────────────
  const periodTx = useMemo(
    () => filterByRange(allTransactions, dateRange[activeTab]),
    [allTransactions, activeTab, dateRange]
  );

  const reportData = useMemo(() => {
    if (activeTab === 'daily')   return buildDailyChart(periodTx);
    if (activeTab === 'weekly')  return buildWeeklyChart(periodTx);
    return buildMonthlyChart(periodTx);
  }, [activeTab, periodTx]);

  const tableData = useMemo(() => ({
    daily:   buildTableData(filterByRange(allTransactions, dateRange.daily)),
    weekly:  buildTableData(filterByRange(allTransactions, dateRange.weekly)),
    monthly: buildTableData(filterByRange(allTransactions, dateRange.monthly)),
  }), [allTransactions, dateRange]);

  const summaryData = useMemo(() => ({
    daily:   buildSummary(filterByRange(allTransactions, dateRange.daily)),
    weekly:  buildSummary(filterByRange(allTransactions, dateRange.weekly)),
    monthly: buildSummary(filterByRange(allTransactions, dateRange.monthly)),
  }), [allTransactions, dateRange]);

  const handleTabChange   = (tab) => setActiveTab(tab);
  const handleDownload    = () => alert('PDF download coming soon.');

  // ── Render — JSX identical to original ───────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Sales Reports</h1>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {['daily', 'weekly', 'monthly'].map(tab => (
                <button
                  key={tab}
                  className={`px-4 py-2 rounded-md font-medium capitalize transition-colors ${
                    activeTab === tab ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                  onClick={() => handleTabChange(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-md">
                <Calendar size={18} className="text-gray-500" />
                <select
                  className="bg-transparent border-none outline-none text-gray-700 pr-8"
                  value={dateRange[activeTab]}
                  onChange={(e) => setDateRange({ ...dateRange, [activeTab]: e.target.value })}
                >
                  <option>Today</option>
                  <option>Yesterday</option>
                  <option>This Week</option>
                  <option>Last Week</option>
                  <option>This Month</option>
                  <option>Last Month</option>
                </select>
              </div>
              <button
                className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md flex items-center gap-2 transition-colors"
                onClick={handleDownload}
              >
                <Download size={18} />
                <span className="hidden md:inline">Download PDF</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2 mb-2">
            <div className="flex gap-2 items-center">
              <span className="text-gray-500 font-medium">Chart Type:</span>
              <div className="flex bg-gray-100 rounded-md p-1">
                {['line', 'bar'].map(t => (
                  <button
                    key={t}
                    className={`px-3 py-1 rounded-md text-sm font-medium capitalize transition-colors ${
                      chartType === t ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    }`}
                    onClick={() => setChartType(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-gray-500 font-medium">Filter:</span>
              <select className="bg-gray-100 border-none rounded-md p-1 px-3 text-sm">
                <option>All Products</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">Sales Trend — {dateRange[activeTab]}</h2>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={reportData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#718096" />
                  <YAxis stroke="#718096" />
                  <Tooltip formatter={(v) => `KSh ${v.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="sales"  name="Sales (KSh)"       stroke="#4F46E5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="profit" name="Est. Profit (KSh)"  stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              ) : (
                <BarChart data={reportData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#718096" />
                  <YAxis stroke="#718096" />
                  <Tooltip formatter={(v) => `KSh ${v.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="sales"  name="Sales (KSh)"      fill="#4F46E5" barSize={30} />
                  <Bar dataKey="profit" name="Est. Profit (KSh)" fill="#10B981" barSize={30} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4"><DollarSign size={24} className="text-blue-600" /></div>
            <div>
              <p className="text-gray-500 text-sm">Total Sales</p>
              <p className="text-2xl font-bold">KSh {summaryData[activeTab].totalSales.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4"><TrendingUp size={24} className="text-green-600" /></div>
            <div>
              <p className="text-gray-500 text-sm">Est. Profit (40%)</p>
              <p className="text-2xl font-bold">KSh {summaryData[activeTab].totalProfit.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4"><ShoppingBag size={24} className="text-purple-600" /></div>
            <div>
              <p className="text-gray-500 text-sm">Orders</p>
              <p className="text-2xl font-bold">{summaryData[activeTab].totalOrders.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
            <div className="bg-amber-100 p-3 rounded-full mr-4"><DollarSign size={24} className="text-amber-600" /></div>
            <div>
              <p className="text-gray-500 text-sm">Avg. Order Value</p>
              <p className="text-2xl font-bold">KSh {summaryData[activeTab].avgOrderValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Product table */}
        <div className="bg-white rounded-lg shadow-md p-4 overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Sales Details</h2>
            <div className="text-sm text-gray-500">Top 5 products by revenue</div>
          </div>
          {tableData[activeTab].length === 0 ? (
            <p className="text-center text-gray-400 py-8">No orders for this period</p>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Profit</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tableData[activeTab].map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.product}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">KSh {item.revenue.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">KSh {item.profit.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan="2" className="px-6 py-3 text-left font-medium">Total</td>
                  <td className="px-6 py-3 text-left font-medium">
                    {tableData[activeTab].reduce((s, i) => s + i.quantity, 0)}
                  </td>
                  <td className="px-6 py-3 text-left font-medium text-blue-600">
                    KSh {tableData[activeTab].reduce((s, i) => s + i.revenue, 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-left font-medium text-green-600">
                    KSh {tableData[activeTab].reduce((s, i) => s + i.profit, 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
