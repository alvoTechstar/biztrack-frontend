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
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-400",
      iconColor: "text-white",
      description: `${salesData?.statusCounts?.completed || 0} Completed`,
      subtitle: `${salesData?.statusCounts?.pending || 0} Pending`,
      progress: Math.min((salesData?.statusCounts?.completed || 0) / (salesData?.statusCounts?.total || 1) * 100, 100)
    },
    {
      id: 2,
      title: "Sales Revenue",
      value: formatCurrency(salesData?.totalRevenue || 0),
      icon: DollarSign,
      iconBg: "bg-gradient-to-br from-emerald-500 to-green-400",
      iconColor: "text-white",
      description: "Cash/M-PESA only",
      subtitle: "No debt included",
      progress: 85
    },
    {
      id: 3,
      title: "Active Debts",
      value: debtData?.statusCounts?.pending || 0,
      icon: AlertCircle,
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-400",
      iconColor: "text-white",
      description: formatCurrency(debtData?.totalOutstanding || 0),
      subtitle: `${debtData?.statusCounts?.completed || 0} recovered`,
      progress: Math.min((debtData?.statusCounts?.pending || 0) / ((debtData?.statusCounts?.total || 0) + 1) * 100, 100)
    },
    {
      id: 4,
      title: "Recovery Rate",
      value: `${debtData?.recoveryRate || 0}%`,
      icon: TrendingDown,
      iconBg: "bg-gradient-to-br from-purple-500 to-pink-400",
      iconColor: "text-white",
      description: "Debt efficiency",
      subtitle: `${debtData?.statusCounts?.completed || 0} of ${debtData?.statusCounts?.total || 0}`,
      progress: Math.min(debtData?.recoveryRate || 0, 100)
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div 
          key={card.id}
          className="group relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 border border-gray-100 hover:border-gray-200 overflow-hidden"
        >
          {/* Left accent border */}
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-400 opacity-80"></div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${card.iconBg} shadow-sm`}>
                  <card.icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {card.title}
                </p>
              </div>
              
              <p className="text-xl font-bold text-gray-900 mb-1">
                {card.value}
              </p>
              
              <div className="text-xs text-gray-600">
                <span className="font-medium">{card.description}</span>
                {card.subtitle && (
                  <span className="text-gray-500 ml-2">• {card.subtitle}</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Compact progress bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div 
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${card.progress}%`,
                  background: card.id === 1 ? "linear-gradient(90deg, #3b82f6, #06b6d4)" :
                             card.id === 2 ? "linear-gradient(90deg, #10b981, #22c55e)" :
                             card.id === 3 ? "linear-gradient(90deg, #f59e0b, #f97316)" :
                             "linear-gradient(90deg, #8b5cf6, #ec4899)"
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Performance</span>
              <span className="font-medium">{Math.round(card.progress)}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportCards;