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
    <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
      <div className="flex justify-between items-start mb-2 gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-800 truncate">{item.name}</h4>
          <p className="text-xs text-gray-500">
            {formatCurrency(item.price)} per {unit}
          </p>
        </div>
        <button
          onClick={() => onRemoveFromCart(item.id)}
          className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors shrink-0"
          title="Remove from cart"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 0.25)}
            className="bg-white border border-gray-200 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
            title="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
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
              className="w-14 px-1 py-1 text-center text-sm border border-gray-200 rounded-lg"
            />
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {unit}
            </span>
          </div>

          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 0.25)}
            className="bg-white border border-gray-200 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
            title="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="font-semibold text-green-600 shrink-0">
          {formatCurrency(item.price * item.quantity)}
        </p>
      </div>
    </div>
  );
};

export default CartItem;