import React from "react";
import {
  TrendingUp,
  DollarSign,
  AlertCircle,
  TrendingDown,
} from "lucide-react";
import { formatCurrency } from "../../../../../utilities/Sharedfunctions.jsx";

const ReportCards = ({ salesData, debtData }) => {
  const cards = [
    {
      id: 1,
      title: "Today's Sales",
      value: salesData?.statusCounts?.total || 0,
      icon: TrendingUp,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      caption: `${salesData?.statusCounts?.completed || 0} completed · ${salesData?.statusCounts?.pending || 0} pending`,
    },
    {
      id: 2,
      title: "Sales Revenue",
      value: formatCurrency(salesData?.totalRevenue || 0),
      icon: DollarSign,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      caption: "Cash/M-PESA only, no debt",
    },
    {
      id: 3,
      title: "Active Debts",
      value: debtData?.statusCounts?.pending || 0,
      icon: AlertCircle,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      caption: `${formatCurrency(debtData?.totalOutstanding || 0)} · ${debtData?.statusCounts?.completed || 0} recovered`,
    },
    {
      id: 4,
      title: "Recovery Rate",
      value: `${debtData?.recoveryRate || 0}%`,
      icon: TrendingDown,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      caption: `${debtData?.statusCounts?.completed || 0} of ${debtData?.statusCounts?.total || 0} debts`,
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className="rounded-2xl p-3 sm:p-4 bg-white border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">{card.title}</p>
            <div className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg shrink-0 ${card.iconBg}`}>
              <card.icon size={16} className={card.iconColor} />
            </div>
          </div>
          <p className="text-base sm:text-xl font-bold text-gray-900 mt-2 truncate">{card.value}</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{card.caption}</p>
        </div>
      ))}
    </div>
  );
};

export default ReportCards;
