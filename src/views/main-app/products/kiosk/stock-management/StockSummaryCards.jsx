import React from 'react';
import { Package, AlertCircle } from 'lucide-react';

export default function StockSummaryCards({ totalProducts, lowStockCount, outOfStockCount }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
        <div className="bg-teal-100 p-3 rounded-full mr-4">
          <Package size={24} className="text-teal-600" />
        </div>
        <div>
          <p className="text-gray-500 text-sm">Total Products</p>
          <p className="text-2xl font-bold">{totalProducts}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
        <div className="bg-amber-100 p-3 rounded-full mr-4">
          <AlertCircle size={24} className="text-amber-600" />
        </div>
        <div>
          <p className="text-gray-500 text-sm">Low Stock Items</p>
          <p className="text-2xl font-bold">{lowStockCount}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 flex items-center">
        <div className="bg-red-100 p-3 rounded-full mr-4">
          <AlertCircle size={24} className="text-red-600" />
        </div>
        <div>
          <p className="text-gray-500 text-sm">Out of Stock Items</p>
          <p className="text-2xl font-bold">{outOfStockCount}</p>
        </div>
      </div>
    </div>
  );
}