import React from "react";
import { Plus, Minus, Trash2 } from "lucide-react";

const CartItem = ({
  item,
  onUpdateQuantity,
  onRemoveFromCart,
  formatCurrency,
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-800 flex-1">{item.name}</h4>
        <button
          onClick={() => onRemoveFromCart(item.id)}
          className="text-red-500 hover:text-red-700 ml-2"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="font-semibold px-2">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">
            {formatCurrency(item.price)} each
          </p>
          <p className="font-semibold text-green-600">
            {formatCurrency(item.price * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
