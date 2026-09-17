import React from "react";
import { Plus } from "lucide-react";

const ProductCard = ({
  product,
  quantity,
  onQuantityChange,
  onAddToCart,
  formatCurrency,
}) => {
  const isOutOfStock = product.availableStock <= 0;
  const isLowStock = product.availableStock > 0 && product.availableStock <= 5;

  const handleQuantityChange = (productId, value) => {
    // Allow empty input for better UX when typing
    if (value === "") {
      onQuantityChange(productId, "");
      return;
    }
    
    // Convert to number and validate it's a positive number
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      onQuantityChange(productId, numValue);
    }
  };

  const handleAddToCart = () => {
    // If quantity is empty or invalid, use default of 1
    const finalQuantity = quantity && quantity > 0 ? quantity : 1;
    onAddToCart(product, finalQuantity);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-3 sm:p-4">
      <div className="flex justify-between items-start gap-2 mb-2">
        <h3 className="text-base font-semibold text-gray-900 leading-tight">
          {product.name}
        </h3>
        <span
          className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap
            ${
              isOutOfStock
                ? "bg-red-100 text-red-700"
                : isLowStock
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }
          `}
        >
          {isOutOfStock
            ? "Out of Stock"
            : isLowStock
            ? `Low (${product.availableStock})`
            : `In Stock (${product.availableStock})`}
        </span>
      </div>

      <p className="text-sm font-bold text-green-600 mb-3">
        {formatCurrency(product.price)}
      </p>

      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="1"
          className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          value={quantity || ""}
          onChange={(e) => handleQuantityChange(product.id, e.target.value)}
          onBlur={(e) => {
            // If input is empty on blur, reset to default
            if (e.target.value === "") {
              onQuantityChange(product.id, 1);
            }
          }}
          disabled={isOutOfStock}
        />
        <button
          onClick={handleAddToCart}
          className="flex-1 bg-blue-600 text-white px-2 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={isOutOfStock}
        >
          <Plus className="h-4 w-4" />
          Sell
        </button>
      </div>
    </div>
  );
};

export default ProductCard;