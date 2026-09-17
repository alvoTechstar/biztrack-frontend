import React from "react";
import { AlertTriangle, CheckCircle, CreditCard, TrendingUp } from "lucide-react";

const DebtSummaryCards = ({ summary, formatCurrency }) => {
  const cards = [
    {
      title: "Pending Debt",
      value: formatCurrency(summary.totalPending),
      caption: `${summary.pendingCount} ${summary.pendingCount === 1 ? "debt" : "debts"}`,
      icon: AlertTriangle,
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
    {
      title: "Recovered",
      value: formatCurrency(summary.totalCollected),
      caption: `${summary.completedCount} ${summary.completedCount === 1 ? "debt" : "debts"}`,
      icon: CheckCircle,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Overdue",
      value: formatCurrency(summary.totalOverdue),
      caption: `${summary.overdueCount} ${summary.overdueCount === 1 ? "debt" : "debts"}`,
      icon: CreditCard,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      title: "Recovery Rate",
      value: `${summary.recoveryRate}%`,
      caption: `${summary.totalDebts} total ${summary.totalDebts === 1 ? "debt" : "debts"}`,
      icon: TrendingUp,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => (
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
          <p className="text-xs text-gray-400 mt-0.5 truncate">{card.caption}</p>
        </div>
      ))}
    </div>
  );
};

export default DebtSummaryCards;
