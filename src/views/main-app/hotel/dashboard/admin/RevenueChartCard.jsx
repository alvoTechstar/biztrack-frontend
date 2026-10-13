import React from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import { TrendingUp } from "lucide-react";

// Same card language as the kiosk dashboard charts:
// white rounded card + gradient header, subtle grid, compact ticks,
// shared tooltip styling. Props unchanged.
const RevenueChartCard = ({
  data = [],
  dateRange,
  onDateRangeChange,
  title = "Revenue Trends",
}) => {
  const hasData = (data || []).some((d) => Number(d.value) > 0);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-gray-700 font-medium">{title}</h3>
          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={onDateRangeChange}
              className="text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-2 py-1.5 shadow-sm outline-none cursor-pointer"
              aria-label="Revenue range"
            >
              <option value="7_days">This Week (Mon–Sun)</option>
              <option value="this_month">This Month</option>
            </select>
            <TrendingUp size={20} className="text-blue-600 shrink-0" />
          </div>
        </div>
      </div>

      <div className="px-2 py-2">
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              margin={{ top: 10, right: 16, left: 0, bottom: 24 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                label={{
                  value: dateRange === "this_month" ? "Months" : "Days of the week",
                  position: "insideBottom",
                  offset: -8,
                  fontSize: 11,
                  fill: "#6b7280",
                }}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `KSh ${value.toLocaleString()}`}
                width={90}
                label={{
                  value: "Amount (KSh)",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 11,
                  fill: "#6b7280",
                }}
              />
              <RechartsTooltip
                formatter={(value) => [`KSh ${Number(value).toLocaleString()}`, "Revenue"]}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  padding: "6px 8px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                name="Revenue"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500 text-sm">
            No revenue data
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueChartCard;
