import React from "react";

// Shows only the first line item of a transaction plus a "+N more" pill,
// used by both the Sales and Debt transaction tables.
const renderFirstItemWithCount = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return <span className="text-gray-500">No items</span>;
  }

  const firstItem = items[0];
  const itemName = firstItem.productName || firstItem.name || "Unknown Product";
  const quantity = firstItem.quantity || 1;

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium text-sm">
        {itemName} ({quantity}x)
      </span>
      {items.length > 1 && (
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
          +{items.length - 1} more
        </span>
      )}
    </div>
  );
};

export default renderFirstItemWithCount;
