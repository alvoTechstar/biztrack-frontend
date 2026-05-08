import React from "react";
import { AlertTriangle, CheckCircle, DollarSign, TrendingUp, CreditCard } from "lucide-react";

const DebtSummaryCards = ({ summary, formatCurrency, debts }) => {
  const summaryCards = [
    {
      title: "Pending Debt",
      amount: summary.totalPending,
      count: summary.pendingCount,
      color: "red",
      icon: AlertTriangle,
      formattedAmount: formatCurrency(summary.totalPending),
      description: "Amount still owed"
    },
    {
      title: "Recovered Amount",
      amount: summary.totalCollected,
      count: summary.completedCount,
      color: "green",
      icon: CheckCircle,
      formattedAmount: formatCurrency(summary.totalCollected),
      description: "Successfully collected"
    },
    {
      title: "Total Overdue",
      amount: summary.totalOverdue,
      count: summary.overdueCount,
      color: "orange",
      icon: CreditCard,
      formattedAmount: formatCurrency(summary.totalOverdue),
      description: "Past due date"
    },
    {
      title: "Recovery Rate",
      amount: summary.recoveryRate,
      count: null,
      color: "blue",
      icon: TrendingUp,
      formattedAmount: `${summary.recoveryRate}%`,
      description: "Of total debt recovered"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {summaryCards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className={`bg-${card.color}-100 p-2 rounded-lg`}>
              <card.icon className={`h-5 w-5 text-${card.color}-600`} />
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-${card.color}-100 text-${card.color}-800`}>
              {card.count !== null ? `${card.count} ${card.count === 1 ? 'item' : 'items'}` : 'Rate'}
            </span>
          </div>
          
          <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
          <p className={`text-2xl font-bold text-${card.color}-700 mb-1`}>
            {card.formattedAmount}
          </p>
          <p className="text-xs text-gray-500">
            {card.description}
          </p>
          
          {card.title === "Recovered Amount" && summary.completedCount > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-600">
                Avg: {formatCurrency(summary.totalCollected / summary.completedCount)} per debt
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DebtSummaryCards;