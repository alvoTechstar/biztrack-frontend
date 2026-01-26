// src/views/main-app/reports/super-admin/components/BusinessPerformanceCharts.jsx
import React, { useMemo, useState } from "react";
import { Paper, Typography, Chip, Box, CircularProgress } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TrendingUp, Building, Award, Trophy, Users } from "lucide-react";
import BusinessCommissionTable from "./BusinessCommissionTable";

const formatKSh = (amount) => {
  if (!amount || isNaN(amount)) return "KSh 0.00";
  return `KSh ${parseFloat(amount).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Generate colors for bars
const BAR_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444',
  '#6B7280', '#EC4899', '#14B8A6', '#8B4513', '#2E8B57',
  '#FF6347', '#9370DB', '#20B2AA', '#FF4500', '#DA70D6'
];

const BusinessPerformanceChart = ({ data = [], loading = false, title = "Business Performance" }) => {
  // State for table selection
  const [selectedItems, setSelectedItems] = useState([]);

  // Process data from API
  const businessPerformanceData = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return {
        all: [],
        top5: [],
        totalCommission: 0,
        isSampleData: false,
        isEmpty: true
      };
    }

    // If data is already processed (from API response)
    if (data.length > 0 && data[0].name && data[0].commission !== undefined) {
      const sortedBusinesses = [...data].sort((a, b) => b.commission - a.commission);
      const totalCommission = sortedBusinesses.reduce((sum, business) => sum + business.commission, 0);

      // Calculate percentages if not present
      sortedBusinesses.forEach(business => {
        if (!business.percentage) {
          business.percentage = totalCommission > 0
            ? parseFloat(((business.commission / totalCommission) * 100).toFixed(1))
            : 0;
        }
        if (!business.id) {
          business.id = business.name.replace(/\s+/g, '-').toLowerCase();
        }
      });

      return {
        all: sortedBusinesses,
        top5: sortedBusinesses.slice(0, 5),
        totalCommission,
        isSampleData: false,
        isEmpty: false
      };
    }

    // If data is raw transactions from API
    const businessCommissions = data.reduce((acc, curr) => {
      const businessName = curr?.businessName || curr?.business?.name || "Unknown Business";
      const commission = parseFloat(curr?.commission) || 
                        (parseFloat(curr?.totalAmount) || 0) * 0.05; // 5% commission if not specified
      
      if (businessName && commission > 0) {
        if (!acc[businessName]) {
          acc[businessName] = {
            name: businessName,
            commission: 0,
            transactions: 0,
            type: curr?.businessType || curr?.business?.type || 'Unknown'
          };
        }
        acc[businessName].commission += commission;
        acc[businessName].transactions += 1;
      }
      return acc;
    }, {});

    const sortedBusinesses = Object.values(businessCommissions)
      .sort((a, b) => b.commission - a.commission);

    const totalCommission = sortedBusinesses.reduce((sum, business) => sum + business.commission, 0);

    // Add percentages and IDs
    sortedBusinesses.forEach((business, index) => {
      business.percentage = totalCommission > 0
        ? parseFloat(((business.commission / totalCommission) * 100).toFixed(1))
        : 0;
      business.id = `${business.name.replace(/\s+/g, '-').toLowerCase()}-${index}`;
    });

    return {
      all: sortedBusinesses,
      top5: sortedBusinesses.slice(0, 5),
      totalCommission,
      isSampleData: false,
      isEmpty: sortedBusinesses.length === 0
    };
  }, [data]);

  // Loading state
  if (loading) {
    return (
      <Paper className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <Typography variant="h6" className="font-bold text-gray-900">
              {title}
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              Loading business performance data...
            </Typography>
          </div>
        </div>
        <Box className="h-[350px] flex items-center justify-center">
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  // Empty state
  if (businessPerformanceData.isEmpty) {
    return (
      <Paper className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <Typography variant="h6" className="font-bold text-gray-900">
              {title}
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              No business performance data available
            </Typography>
          </div>
        </div>
        <Box className="h-[350px] flex flex-col items-center justify-center">
          <Building size={48} className="text-gray-400 mb-4" />
          <Typography variant="body1" className="text-gray-500 mb-2">
            No business data found
          </Typography>
          <Typography variant="body2" className="text-gray-400">
            Try selecting a different date range
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Custom tooltip for bar chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Building size={16} className="text-blue-600" />
            </div>
            <p className="font-semibold text-gray-900 truncate">{label}</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Commission:</span>
              <span className="font-bold text-blue-700">{formatKSh(data.commission)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Market Share:</span>
              <span className="font-medium text-green-600">{data.percentage?.toFixed(1) || 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Transactions:</span>
              <span className="font-medium text-purple-600">{data.transactions || 0}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${Math.min(data.percentage || 0, 100)}%` }}
              />
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Table selection handlers
  const toggleSelectAll = () => {
    if (selectedItems.length === businessPerformanceData.all.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(businessPerformanceData.all.map(business => business.id));
    }
  };

  const toggleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  return (
    <Paper className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <Typography variant="h6" className="font-bold text-gray-900">
            {title}
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            Top performing businesses by commission earnings
          </Typography>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mt-4 sm:mt-0">
          <div className="bg-blue-50 px-3 py-2 rounded-lg">
            <p className="text-xs text-gray-600">Total Businesses</p>
            <p className="text-lg font-bold text-blue-700">
              {businessPerformanceData.all.length}
            </p>
          </div>
          <div className="bg-green-50 px-3 py-2 rounded-lg">
            <p className="text-xs text-gray-600">Total Commission</p>
            <p className="text-lg font-bold text-green-700">
              {formatKSh(businessPerformanceData.totalCommission)}
            </p>
          </div>
          <div className="bg-purple-50 px-3 py-2 rounded-lg">
            <p className="text-xs text-gray-600">Top 5 Share</p>
            <p className="text-lg font-bold text-purple-700">
              {businessPerformanceData.top5.reduce((sum, b) => sum + b.percentage, 0).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Chart and Table Section */}
      <div className="space-y-6">
        {/* Bar Chart */}
        <div className="h-[350px]">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={20} className="text-amber-500" />
              <Typography variant="subtitle1" className="font-semibold text-gray-800">
                Top Businesses Performance
              </Typography>
            </div>
            <Typography variant="body2" className="text-gray-500">
              Commission distribution among leading businesses
            </Typography>
          </div>

          <ResponsiveContainer width="100%" height="85%">
            <BarChart
              data={businessPerformanceData.top5}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tickFormatter={(value) => {
                  if (value >= 1000) return `KSh ${(value / 1000).toFixed(0)}K`;
                  return `KSh ${value}`;
                }}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value) => (
                  <span className="text-sm font-medium text-gray-700">{value}</span>
                )}
              />
              <Bar
                dataKey="commission"
                name="Commission Earnings"
                radius={[4, 4, 0, 0]}
              >
                {businessPerformanceData.top5.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={BAR_COLORS[index % BAR_COLORS.length]}
                    className="hover:opacity-90 transition-opacity"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Business Rankings Table */}
        <div className="mt-6">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Award size={20} className="text-purple-500" />
              <Typography variant="subtitle1" className="font-semibold text-gray-800">
                Business Rankings
              </Typography>
              <Chip
                label={`${businessPerformanceData.all.length} Businesses`}
                size="small"
                icon={<Users size={14} />}
                className="ml-2"
                style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
              />
            </div>
            <Typography variant="body2" className="text-gray-500">
              Detailed breakdown of all businesses by commission earnings
            </Typography>
          </div>

          {/* BusinessCommissionTable component */}
          <BusinessCommissionTable
            businessData={businessPerformanceData.all}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            toggleSelectAll={toggleSelectAll}
            toggleSelectItem={toggleSelectItem}
          />
        </div>
      </div>
    </Paper>
  );
};

export default BusinessPerformanceChart;