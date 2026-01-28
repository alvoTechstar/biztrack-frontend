import React from "react";
import { Trash2, Minus, Plus } from "lucide-react";

const CartItem = ({
  item,
  onUpdateQuantity,
  onRemoveFromCart,
  formatCurrency,
}) => {
  const unit = item.unit || "units";

  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-gray-800">{item.name}</h4>
          <p className="text-sm text-gray-500">
            {formatCurrency(item.price)} per {unit}
          </p>
        </div>
        <button
          onClick={() => onRemoveFromCart(item.id)}
          className="text-red-500 hover:text-red-700 p-1"
          title="Remove from cart"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 0.25)}
            className="bg-gray-200 hover:bg-gray-300 p-1 rounded"
            title="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={item.quantity}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value) && value > 0) {
                  onUpdateQuantity(item.id, value);
                }
              }}
              className="w-20 px-2 py-1 text-center border border-gray-300 rounded"
            />
            <span className="text-sm text-gray-600 whitespace-nowrap">
              {unit}
            </span>
          </div>
          
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 0.25)}
            className="bg-gray-200 hover:bg-gray-300 p-1 rounded"
            title="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        <div className="text-right">
          <p className="font-semibold text-green-600">
            {formatCurrency(item.price * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartItem;