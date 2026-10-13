import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

// Kiosk PaymentChart palette, extended so every category gets its own color.
const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

// Same donut treatment as the kiosk PaymentChart: centered total,
// hover-for-breakdown tooltip, custom legend. `data` is raw counts
// ([{ name, value }]) — percentages are derived here, like on kiosk.
const OrdersByCategoryChartCard = ({ data = [], title = "Orders by Category" }) => {
  const filteredData = (data || []).filter((d) => Number(d.value) > 0);
  const total = filteredData.reduce((sum, d) => sum + Number(d.value), 0);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-700 font-medium text-sm">{title}</h3>
          <PieChartIcon size={18} className="text-purple-600" />
        </div>
      </div>

      <div className="px-4 py-4">
        {total > 0 ? (
          <>
            <div className="flex justify-center">
              {/* Donut chart with a centered total — hover a segment for its breakdown */}
              <div className="relative h-40 w-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={filteredData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={68}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {filteredData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value, name) => [
                        `${value} (${((value / total) * 100).toFixed(0)}%)`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        padding: "6px 8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-gray-800">{total}</span>
                  <span className="text-[10px] text-gray-500">items</span>
                </div>
              </div>
            </div>

            <ul className="mt-3 space-y-1.5">
              {filteredData.map((entry, index) => (
                <li
                  key={entry.name}
                  className="flex items-center justify-between text-xs text-gray-600"
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="truncate">{entry.name}</span>
                  </span>
                  <span className="font-medium text-gray-700 ml-2 shrink-0">
                    {entry.value} ({((entry.value / total) * 100).toFixed(0)}%)
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-28">
            <div className="text-gray-300 mb-1">
              <PieChartIcon className="h-6 w-6" />
            </div>
            <p className="text-xs text-gray-400">No orders yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersByCategoryChartCard;
