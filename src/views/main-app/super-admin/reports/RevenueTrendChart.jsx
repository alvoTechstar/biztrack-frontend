// src/views/main-app/reports/super-admin/components/RevenueTrendChart.jsx
import React, { useMemo } from "react";
import { Paper, Typography, Box } from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import ContentLoader from "../../../../components/Loader/ContentLoader";
import { useTheme as useAppTheme } from "../../../../components/theme/ThemeContext";

const formatKSh = (amount) => {
  if (!amount || isNaN(amount)) return "KSh 0.00";
  return `KSh ${parseFloat(amount).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const RevenueTrendChart = ({ data = [], loading = false, title = "Revenue Trend", year }) => {
  const { primaryColor } = useAppTheme();
  // `data` arrives already aggregated into a fixed Jan-Dec series (12 entries,
  // months with no revenue filled with 0) by processSalesData in the parent page -
  // just reshape the field name here.
  const revenueTrendData = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.map(item => ({
      date: item.date,
      commission: parseFloat(item.amount) || 0
    }));
  }, [data]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (revenueTrendData.length === 0) {
      return {
        totalRevenue: 0,
        avgDailyRevenue: 0,
        trendPercentage: 0,
        isTrendingUp: false,
        maxRevenue: 0,
        minRevenue: 0,
      };
    }

    const totalRevenue = revenueTrendData.reduce((sum, item) => sum + item.commission, 0);
    const avgDailyRevenue = totalRevenue / revenueTrendData.length;
    const maxRevenue = Math.max(...revenueTrendData.map(item => item.commission));
    const minRevenue = Math.min(...revenueTrendData.map(item => item.commission));

    // Calculate trend
    let trendPercentage = 0;
    let isTrendingUp = false;

    if (revenueTrendData.length >= 2) {
      const last = revenueTrendData[revenueTrendData.length - 1].commission;
      const first = revenueTrendData[0].commission;

      if (first > 0) {
        trendPercentage = ((last - first) / first) * 100;
        isTrendingUp = trendPercentage > 0;
      }
    }

    return {
      totalRevenue,
      avgDailyRevenue,
      trendPercentage: Math.abs(trendPercentage).toFixed(1),
      isTrendingUp,
      maxRevenue,
      minRevenue,
    };
  }, [revenueTrendData]);

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
              Loading {year}'s monthly revenue...
            </Typography>
          </div>
        </div>
        <Box className="h-[350px] flex items-center justify-center">
          <ContentLoader
            state={true}
            loading={true}
            loadingText={`Loading ${year}'s monthly revenue...`}
            loadedText=""
            color={primaryColor}
          />
        </Box>
      </Paper>
    );
  }

  // Empty state
  if (revenueTrendData.length === 0) {
    return (
      <Paper className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <Typography variant="h6" className="font-bold text-gray-900">
              {title}
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              No revenue trend data available
            </Typography>
          </div>
        </div>
        <Box className="h-[350px] flex flex-col items-center justify-center">
          <TrendingUp size={48} className="text-gray-400 mb-4" />
          <Typography variant="body1" className="text-gray-500 mb-2">
            No revenue data found
          </Typography>
          <Typography variant="body2" className="text-gray-400">
            Try selecting a different date range
          </Typography>
        </Box>
      </Paper>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg min-w-[180px]">
          <p className="font-semibold text-gray-900 mb-1">{label}</p>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Commission:</span>
              <span className="font-medium text-blue-600">
                {formatKSh(payload[0].value)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Month Rank:</span>
              <span className="font-medium text-green-600">
                {revenueTrendData.findIndex(item => item.date === label) + 1}/{revenueTrendData.length}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Paper className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header with Title and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <Typography variant="h6" className="font-bold text-gray-900">
            {title}
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            Monthly commission earnings across {year}
          </Typography>
        </div>

        {/* Stats Cards */}
        <div className="flex gap-3 mt-4 sm:mt-0">
          <div className="bg-blue-50 px-3 py-2 rounded-lg">
            <p className="text-xs text-gray-600">Total Revenue</p>
            <p className="text-lg font-bold text-blue-700">
              {formatKSh(stats.totalRevenue)}
            </p>
          </div>
          <div className="bg-green-50 px-3 py-2 rounded-lg">
            <p className="text-xs text-gray-600">Avg. Monthly</p>
            <p className="text-lg font-bold text-green-700">
              {formatKSh(stats.avgDailyRevenue)}
            </p>
          </div>
          <div className={`px-3 py-2 rounded-lg ${stats.isTrendingUp ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className="text-xs text-gray-600">Trend</p>
            <p className={`text-lg font-bold ${stats.isTrendingUp ? 'text-green-700' : 'text-red-700'}`}>
              {stats.trendPercentage}%
              <span className="ml-1">{stats.isTrendingUp ? '↗' : '↘'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={revenueTrendData}
            margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
          >
            <defs>
              <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickMargin={10}
              interval={0}
            />

            <YAxis
              tickFormatter={(value) => {
                if (value >= 1000) return `KSh ${(value / 1000).toFixed(0)}K`;
                return `KSh ${value}`;
              }}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              width={64}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="commission"
              name="Monthly Commission"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorCommission)"
              activeDot={{
                r: 6,
                stroke: '#ffffff',
                strokeWidth: 2,
                fill: '#3b82f6'
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Paper>
  );
};

export default RevenueTrendChart;