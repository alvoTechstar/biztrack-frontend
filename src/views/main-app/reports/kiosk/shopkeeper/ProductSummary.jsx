import React, { useMemo } from "react";
import { DollarSign } from "lucide-react";
import DataTable from "../../../../../components/datatable";
import { formatCurrency } from "../../../../../utilities/SharedFunctions";
const ProductSummary = ({ productSummary, color }) => {

  const productTableData = useMemo(() => {
    return productSummary.map((product) => ({
      id: product.name,
      name: product.name,
      quantity: product.quantity,
      revenue: formatCurrency(product.revenue),
    }));
  }, [productSummary]);

  const productHeaders = [
    { key: "name", title: "Product Name" },
    { key: "quantity", title: "Quantity Sold" },
    { key: "revenue", title: "Total Revenue" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Today's Product Sales (Non-Debt)
          </h3>
        </div>
        <div className="p-4">
          {productTableData.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No product sales today</p>
            </div>
          ) : (
            <DataTable
              type="products"
              clickable={true}
              color={color}
              data={productTableData}
              headers={productHeaders}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductSummary;