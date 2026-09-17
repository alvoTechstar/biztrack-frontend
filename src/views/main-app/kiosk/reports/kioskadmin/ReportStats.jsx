// kiosk-admin/ReportStats.jsx
import React from "react";
import { Users, Package, Percent, Target } from "lucide-react";

const ReportStats = ({ kioskStats, inventoryData, loading, formatCurrency }) => {
  const cards = [
    {
      title: "Active Customers",
      value: kioskStats.activeCustomers || '0',
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Inventory Value",
      value: formatCurrency(inventoryData.totalValue || 0),
      icon: Package,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Profit Margin",
      value: kioskStats.profitMargin ? `${kioskStats.profitMargin}%` : '0%',
      icon: Percent,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Target Progress",
      value: kioskStats.targetProgress ? `${kioskStats.targetProgress}%` : '0%',
      icon: Target,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {loading ? (
        Array(4).fill(0).map((_, i) => (
          <div key={i} className="rounded-2xl p-3 sm:p-4 bg-white border border-gray-100 shadow-sm">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-3"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))
      ) : (
        cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl p-3 sm:p-4 bg-white border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">{card.title}</p>
              <div className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg shrink-0 ${card.iconBg}`}>
                <card.icon size={16} className={card.iconColor} />
              </div>
            </div>
            <p className="text-base sm:text-xl font-bold text-gray-900 mt-2 truncate">{card.value}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default ReportStats;
