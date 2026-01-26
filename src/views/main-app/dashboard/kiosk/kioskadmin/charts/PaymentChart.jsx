import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { Smartphone } from "lucide-react";

const PaymentChart = ({ paymentCounts }) => {
  // Include debt in the payment data
  const paymentData = [
    { name: "M-PESA", value: paymentCounts.mpesa || 0, color: "#3b82f6" },
    { name: "Cash", value: paymentCounts.cash || 0, color: "#10b981" },
    { name: "Debt", value: paymentCounts.debt || 0, color: "#ef4444" },
  ];

  // Filter out zero values for cleaner display
  const filteredData = paymentData.filter(item => item.value > 0);
  const totalPayments = filteredData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-700 font-medium text-sm">Payment Methods</h3>
          <Smartphone size={18} className="text-purple-600" />
        </div>
      </div>
      
      <div className="px-4 py-3">
        {totalPayments > 0 ? (
          <div className="flex items-center">
            {/* Chart on the left */}
            <div className="w-2/5 pr-3">
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={filteredData}
                      cx="50%"
                      cy="50%"
                      innerRadius={28}
                      outerRadius={42}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {filteredData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value, name) => [`${value}`, name]}
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        padding: '6px 8px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Stats on the right - Compact styling */}
            <div className="w-3/5">
              <div className="space-y-2">
                {filteredData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-gray-600">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-gray-800">{item.value}</span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({((item.value / totalPayments) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* Total - Compact */}
                <div className="pt-1 border-t border-gray-100 mt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">Total</span>
                    <span className="text-xs font-bold text-gray-800">{totalPayments}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-28">
            <div className="text-gray-300 mb-1">
              <Smartphone className="h-6 w-6" />
            </div>
            <p className="text-xs text-gray-400">No payments today</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentChart;