import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  LineChart, BarChart, CartesianGrid, XAxis, YAxis,
  Tooltip, Legend, Line, Bar, ResponsiveContainer,
} from 'recharts';
import {
  BarChart3, TrendingUp, DollarSign, ShoppingBag,
  Calendar, Printer, CreditCard, Receipt,
} from 'lucide-react';
import { GET } from '../../../../../services/DatabaseServiceImp';
import URLS from '../../../../../utilities/Endpoints';
import { useTheme } from '../../../../../components/theme/ThemeContext';
import ContentLoader from '../../../../../components/Loader/ContentLoader';
import Toaster from '../../../../../components/Toaster';
import DataTable from '../../../../../components/datatable';
import KpiCard from '../../../hotel/dashboard/admin/KpiCard';
import PaymentBreakdownChart from '../../../super-admin/reports/PaymentBreakdownChart';

// ── Date helpers ───────────────────────────────────────────────
const startOfDay   = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
// Monday-based weeks to match the Mon–Sun chart buckets (and the admin
// dashboard). A Sunday-based cut-off piles the weekend onto Sunday, leaving
// the line flat at 0 across Mon–Sat.
const startOfWeek  = (d) => { const x = startOfDay(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
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

// ── Real-data normalizers ──────────────────────────────────────
// Backend hotel rows store the amount as `totalAmount` and items as
// productName/unitPrice; local shapes use total/name/price.
const getTxTotal = (t) => Number(t.totalAmount ?? t.total) || 0;
const getItemName = (it) => it.productName || it.name || 'Unknown item';
const getItemPrice = (it) => Number(it.unitPrice ?? it.price) || 0;

// ── Chart builders (completed orders only — enforced at fetch) ─
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
      .reduce((s, t) => s + getTxTotal(t), 0);
    return { time, sales: Math.round(sales) };
  });
}

function buildWeeklyChart(txs) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const totals = Object.fromEntries(days.map(d => [d, 0]));
  txs.forEach(t => {
    const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(t.createdAt).getDay()];
    totals[day] = (totals[day] || 0) + getTxTotal(t);
  });
  return days.map(time => ({ time, sales: Math.round(totals[time]) }));
}

function buildMonthlyChart(txs) {
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const totals = [0, 0, 0, 0];
  const monthStart = startOfMonth(new Date());
  txs.forEach(t => {
    const diffDays = Math.floor((new Date(t.createdAt) - monthStart) / 86400000);
    const wk = Math.min(Math.floor(diffDays / 7), 3);
    if (wk >= 0) totals[wk] += getTxTotal(t);
  });
  return weeks.map((time, i) => ({ time, sales: Math.round(totals[i]) }));
}

function buildTableData(txs) {
  const map = {};
  txs.forEach(t => {
    (t.items || []).forEach((item) => {
      const key = getItemName(item);
      if (!map[key]) map[key] = { product: key, quantity: 0, revenue: 0 };
      map[key].quantity += Number(item.quantity) || 1;
      map[key].revenue  += getItemPrice(item) * (Number(item.quantity) || 1);
    });
  });
  return Object.values(map)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((r, i) => ({
      id:       `item-${i}`,
      product:  r.product,
      quantity: r.quantity,
      revenue:  Math.round(r.revenue),
    }));
}

const TOP_ITEMS_HEADERS = [
  { title: "#", key: "rank" },
  { title: "Product", key: "product" },
  { title: "Quantity", key: "quantity" },
  { title: "Revenue", key: "revenueDisplay" },
];

// ── Component ──────────────────────────────────────────────────
export default function ReportsPage() {
  const currentUser = useSelector((s) => s.auth?.value);
  const { primaryColor } = useTheme();
  const accent = primaryColor || '#4F46E5';
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
  const [loading, setLoading] = useState(true);
  const [toaster, setToaster] = useState({ open: false, state: 'true', title: '', message: '' });

  // ── Fetch: completed (paid, closed) hotel orders only ──────────
  // Open orders (pending → served) are not revenue and stay out of every figure.
  const fetchTransactions = useCallback(async () => {
    if (!businessId) { setLoading(false); return; }
    setLoading(true);
    try {
      const endpoint = URLS.TRANSACTIONS.GET_TRANSACTIONS_BY_BUSINESS
        .replace(':businessId', businessId);
      const res = await GET(endpoint);
      if (res?.success) {
        setAllTransactions(
          (res.data || res.transactions || [])
            .filter(t => (t.type === 'hotel_order' || !t.type)
              && String(t.status || '').toLowerCase() === 'completed')
        );
      } else {
        throw new Error(res?.message || 'Failed to load report data');
      }
    } catch (err) {
      setToaster({ open: true, state: 'false', title: 'Error', message: err.message || 'Failed to load report data' });
    } finally {
      setLoading(false);
    }
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

  const kpis = useMemo(() => {
    const revenue = periodTx.reduce((s, t) => s + getTxTotal(t), 0);
    const orders = periodTx.length;
    const cash = periodTx.filter(t => String(t.paymentMethod || '').toLowerCase() === 'cash').length;
    const mpesa = periodTx.filter(t => String(t.paymentMethod || '').toLowerCase() === 'mpesa').length;
    return {
      revenue: Math.round(revenue),
      orders,
      avgOrderValue: orders > 0 ? Math.round(revenue / orders) : 0,
      cash,
      mpesa,
    };
  }, [periodTx]);

  const topItems = useMemo(() => buildTableData(periodTx), [periodTx]);
  const topItemRows = useMemo(() => topItems.map((r, i) => ({
    id: r.id,
    rank: i + 1,
    product: r.product,
    quantity: r.quantity,
    revenueDisplay: `KSh ${Number(r.revenue).toLocaleString()}`,
  })), [topItems]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ContentLoader
          state={true}
          loading={true}
          loadingText="Loading report data..."
          loadedText=""
          color={accent}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      {/* Header — same language as super-admin reports */}
      <header className="flex items-center gap-3 mb-6">
        <div
          className="flex items-center justify-center w-11 h-11 rounded-xl text-white shadow-sm shrink-0"
          style={{ backgroundColor: accent }}
        >
          <BarChart3 size={22} />
        </div>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
            Hotel Reports
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Revenue and sales performance — completed orders only
          </p>
        </div>
      </header>

      {/* KPI cards — hotel KpiCard, real completed-order figures */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          icon={<DollarSign size={22} />}
          title="Revenue"
          value={`KSh ${kpis.revenue.toLocaleString()}`}
          color="green"
          footer={`${kpis.orders} completed order${kpis.orders !== 1 ? 's' : ''} · ${dateRange[activeTab]}`}
        />
        <KpiCard
          icon={<ShoppingBag size={22} />}
          title="Completed Orders"
          value={kpis.orders}
          color="blue"
          footer={`Paid and closed · ${dateRange[activeTab]}`}
        />
        <KpiCard
          icon={<TrendingUp size={22} />}
          title="Avg. Order Value"
          value={`KSh ${kpis.avgOrderValue.toLocaleString()}`}
          color="purple"
          footer="Revenue per completed order"
        />
        <KpiCard
          icon={<CreditCard size={22} />}
          title="M-Pesa vs Cash"
          value={`${kpis.mpesa} · ${kpis.cash}`}
          color="amber"
          footer={`M-Pesa: ${kpis.mpesa}  |  Cash: ${kpis.cash}`}
        />
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex bg-gray-100 rounded-xl p-1 w-fit">
            {['daily', 'weekly', 'monthly'].map(tab => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  activeTab === tab ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-xl">
              <Calendar size={16} className="text-gray-500" />
              <select
                className="bg-transparent border-none outline-none text-gray-700 text-sm pr-6"
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
            <div className="flex bg-gray-100 rounded-xl p-1">
              {['line', 'bar'].map(t => (
                <button
                  key={t}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                    chartType === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setChartType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              className="text-white py-2 px-4 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:opacity-90"
              style={{ backgroundColor: accent }}
              onClick={handlePrint}
            >
              <Printer size={16} />
              <span className="hidden md:inline">Print report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sales trend */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h2 className="text-base font-semibold text-gray-900">
          Sales Trend — {dateRange[activeTab]}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5 mb-4">
          Completed sales only · KSh
        </p>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={reportData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#718096" />
                <YAxis stroke="#718096" />
                <Tooltip formatter={(v) => `KSh ${Number(v).toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="sales" name="Sales (KSh)" stroke={accent} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            ) : (
              <BarChart data={reportData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#718096" />
                <YAxis stroke="#718096" />
                <Tooltip formatter={(v) => `KSh ${Number(v).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="sales" name="Sales (KSh)" fill={accent} barSize={30} radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment split + top items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PaymentBreakdownChart
          transactions={periodTx}
          title="Revenue by Payment Method"
          subtitle="Completed sales split between M-Pesa and Cash"
          totalLabel="Total Revenue"
          commissionRate={1}
        />
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Receipt size={16} className="text-gray-400" />
              Top Items by Revenue
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-2">
            Best sellers · {dateRange[activeTab]}
          </p>
          {topItemRows.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No completed orders for this period</p>
          ) : (
            <DataTable
              data={topItemRows}
              headers={TOP_ITEMS_HEADERS}
              type="hotel-report-items"
              selected={[]}
              selectedAction={() => {}}
              selectAll={() => {}}
              all={false}
              actionSelected={() => {}}
              selectedRow={() => {}}
              clickable={false}
              color={accent}
            />
          )}
        </div>
      </div>

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
