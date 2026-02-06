// kiosk-admin/ReportStats.jsx
import React from "react";
import { Users, Package, Percent, Target } from "lucide-react";

const ReportStats = ({ kioskStats, inventoryData, loading, formatCurrency }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {loading ? (
        Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))
      ) : (
        <>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kioskStats.activeCustomers || '0'}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inventory Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(inventoryData.totalValue || 0)}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profit Margin</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kioskStats.profitMargin ? `${kioskStats.profitMargin}%` : '0%'}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Percent className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Target Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kioskStats.targetProgress ? `${kioskStats.targetProgress}%` : '0%'}
                </p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportStats;