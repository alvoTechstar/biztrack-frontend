import React from 'react';
import { useState } from 'react';
import { LineChart, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Bar, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, DollarSign, ShoppingBag, Calendar, Filter } from 'lucide-react';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('daily');
  const [chartType, setChartType] = useState('line');
  const [dateRange, setDateRange] = useState({
    daily: 'Today',
    weekly: 'This Week',
    monthly: 'This Month'
  });

  // Sample data for demonstrations
  const generateReportData = (period) => {
    if (period === 'daily') {
      return [
        { time: '6AM', sales: 120, profit: 48 },
        { time: '9AM', sales: 300, profit: 135 },
        { time: '12PM', sales: 550, profit: 220 },
        { time: '3PM', sales: 420, profit: 168 },
        { time: '6PM', sales: 650, profit: 260 },
        { time: '9PM', sales: 380, profit: 152 },
      ];
    } else if (period === 'weekly') {
      return [
        { time: 'Mon', sales: 1200, profit: 480 },
        { time: 'Tue', sales: 1500, profit: 600 },
        { time: 'Wed', sales: 1100, profit: 440 },
        { time: 'Thu', sales: 1700, profit: 680 },
        { time: 'Fri', sales: 2100, profit: 840 },
        { time: 'Sat', sales: 2500, profit: 1000 },
        { time: 'Sun', sales: 1900, profit: 760 },
      ];
    } else {
      return [
        { time: 'Week 1', sales: 8500, profit: 3400 },
        { time: 'Week 2', sales: 9200, profit: 3680 },
        { time: 'Week 3', sales: 7800, profit: 3120 },
        { time: 'Week 4', sales: 9500, profit: 3800 },
      ];
    }
  };

  const reportData = generateReportData(activeTab);
  
  const tableData = {
    daily: [
      { id: 1, product: 'Product A', quantity: 15, revenue: 375.00, profit: 150.00 },
      { id: 2, product: 'Product B', quantity: 8, revenue: 160.00, profit: 64.00 },
      { id: 3, product: 'Product C', quantity: 12, revenue: 540.00, profit: 216.00 },
      { id: 4, product: 'Product D', quantity: 20, revenue: 240.00, profit: 96.00 },
      { id: 5, product: 'Product E', quantity: 10, revenue: 199.50, profit: 79.80 },
    ],
    weekly: [
      { id: 1, product: 'Product A', quantity: 78, revenue: 1950.00, profit: 780.00 },
      { id: 2, product: 'Product B', quantity: 45, revenue: 900.00, profit: 360.00 },
      { id: 3, product: 'Product C', quantity: 62, revenue: 2790.00, profit: 1116.00 },
      { id: 4, product: 'Product D', quantity: 120, revenue: 1440.00, profit: 576.00 },
      { id: 5, product: 'Product E', quantity: 56, revenue: 1119.20, profit: 447.68 },
    ],
    monthly: [
      { id: 1, product: 'Product A', quantity: 312, revenue: 7800.00, profit: 3120.00 },
      { id: 2, product: 'Product B', quantity: 198, revenue: 3960.00, profit: 1584.00 },
      { id: 3, product: 'Product C', quantity: 245, revenue: 11025.00, profit: 4410.00 },
      { id: 4, product: 'Product D', quantity: 480, revenue: 5760.00, profit: 2304.00 },
      { id: 5, product: 'Product E', quantity: 233, revenue: 4648.35, profit: 1859.34 },
    ],
  };

  const summaryData = {
    daily: { totalSales: 2420, totalProfit: 968, totalOrders: 65, avgOrderValue: 37.23 },
    weekly: { totalSales: 12000, totalProfit: 4800, totalOrders: 352, avgOrderValue: 34.09 },
    monthly: { totalSales: 35000, totalProfit: 14000, totalOrders: 1423, avgOrderValue: 24.60 }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleDownload = () => {
    // Here you would implement PDF generation/download
    alert('Downloading report as PDF...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Sales Reports</h1>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {/* Controls Section */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'daily' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                onClick={() => handleTabChange('daily')}
              >
                Daily
              </button>
              <button
                className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'weekly' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                onClick={() => handleTabChange('weekly')}
              >
                Weekly
              </button>
              <button
                className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'monthly' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                onClick={() => handleTabChange('monthly')}
              >
                Monthly
              </button>
            </div>
            
            <div className="flex gap-2">
              <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-md">
                <Calendar size={18} className="text-gray-500" />
                <select 
                  className="bg-transparent border-none outline-none text-gray-700 pr-8"
                  value={dateRange[activeTab]}
                  onChange={(e) => setDateRange({...dateRange, [activeTab]: e.target.value})}
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
                <button
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${chartType === 'line' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  onClick={() => setChartType('line')}
                >
                  Line
                </button>
                <button
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${chartType === 'bar' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  onClick={() => setChartType('bar')}
                >
                  Bar
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-gray-500 font-medium">Filter:</span>
              <select className="bg-gray-100 border-none rounded-md p-1 px-3 text-sm">
                <option>All Products</option>
                <option>Product A</option>
                <option>Product B</option>
                <option>Product C</option>
              </select>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">Sales Trend - {dateRange[activeTab]}</h2>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={reportData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#718096" />
                  <YAxis stroke="#718096" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    name="Sales ($)" 
                    stroke="#4F46E5" 
                    strokeWidth={2} 
                    dot={{ stroke: '#4F46E5', strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 6 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    name="Profit ($)" 
                    stroke="#10B981" 
                    strokeWidth={2} 
                    dot={{ stroke: '#10B981', strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              ) : (
                <BarChart data={reportData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#718096" />
                  <YAxis stroke="#718096" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" name="Sales ($)" fill="#4F46E5" barSize={30} />
                  <Bar dataKey="profit" name="Profit ($)" fill="#10B981" barSize={30} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <DollarSign size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Sales</p>
              <p className="text-2xl font-bold">${summaryData[activeTab].totalSales.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <TrendingUp size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Profit</p>
              <p className="text-2xl font-bold">${summaryData[activeTab].totalProfit.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <ShoppingBag size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Orders</p>
              <p className="text-2xl font-bold">{summaryData[activeTab].totalOrders.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
            <div className="bg-amber-100 p-3 rounded-full mr-4">
              <DollarSign size={24} className="text-amber-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Avg. Order Value</p>
              <p className="text-2xl font-bold">${summaryData[activeTab].avgOrderValue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-md p-4 overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Sales Details</h2>
            <div className="text-sm text-gray-500">Showing top 5 products</div>
          </div>
          
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData[activeTab].map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{item.product}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">${item.revenue.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">${item.profit.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan="2" className="px-6 py-3 text-left font-medium">Total</td>
                <td className="px-6 py-3 text-left font-medium">
                  {tableData[activeTab].reduce((sum, item) => sum + item.quantity, 0)}
                </td>
                <td className="px-6 py-3 text-left font-medium text-blue-600">
                  ${tableData[activeTab].reduce((sum, item) => sum + item.revenue, 0).toFixed(2)}
                </td>
                <td className="px-6 py-3 text-left font-medium text-green-600">
                  ${tableData[activeTab].reduce((sum, item) => sum + item.profit, 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </main>
    </div>
  );
}