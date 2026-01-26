import React, { useState } from "react";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import { Button } from "@mui/material";
import DataTable from "../../../components/datatable";

export default function CreateOrder() {
  const menuItems = [
    { id: 1, name: "Cheeseburger", price: 8.99 },
    { id: 2, name: "Caesar Salad", price: 7.5 },
    { id: 3, name: "Margherita Pizza", price: 12.99 },
    { id: 4, name: "Spaghetti Carbonara", price: 11.5 },
    { id: 5, name: "Fish & Chips", price: 10.99 },
  ];

  const [orders, setOrders] = useState([]);
  const [orderIdCounter, setOrderIdCounter] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const [tableNumber, setTableNumber] = useState("");
  const [editingOrderId, setEditingOrderId] = useState(null);

  const startOrder = () => {
    setIsCreating(true);
    setSelectedItems([]);
    setTableNumber("");
    setEditingOrderId(null);
  };

  const formatCurrency = (amt) => `$${amt.toFixed(2)}`;

  const addItem = () => {
    const item = menuItems.find((m) => m.id === parseInt(selectedItemId));
    if (!item) return;
    const updatedItems = [...selectedItems];
    const existing = updatedItems.find((i) => i.menuItemId === item.id);
    if (existing) {
      existing.quantity += quantity;
      existing.subtotal = existing.quantity * existing.price;
    } else {
      updatedItems.push({
        id: Date.now(),
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity,
        subtotal: item.price * quantity,
      });
    }
    setSelectedItems(updatedItems);
    setSelectedItemId("");
    setQuantity(1);
  };

  const removeItem = (id) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== id));
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, i) => sum + i.subtotal, 0);
  };

  const submitOrder = () => {
    const newOrder = {
      id: `ORD${String(orderIdCounter).padStart(3, "0")}`,
      tableNumber,
      items: selectedItems,
      total: calculateTotal(selectedItems),
      status: "Pending",
      timestamp: new Date().toLocaleString(),
    };

    if (editingOrderId) {
      setOrders((prev) =>
        prev.map((o) => (o.id === editingOrderId ? newOrder : o))
      );
    } else {
      setOrders((prev) => [...prev, newOrder]);
      setOrderIdCounter((prev) => prev + 1);
    }

    setIsCreating(false);
    setSelectedItems([]);
    setTableNumber("");
    setEditingOrderId(null);
  };

  const editOrder = (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    setEditingOrderId(orderId);
    setTableNumber(order.tableNumber);
    setSelectedItems(order.items);
    setIsCreating(true);
  };

  const deleteOrder = (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
  };

  const columns = [
    { label: 'Order ID', field: 'id' },
    { label: 'Table Number', field: 'tableNumber' },
    { label: 'Menu', field: 'itemsSummary' },
    { label: 'Timestamp', field: 'timestamp' },
    { label: 'Total', field: 'total' },
    { label: 'Status', field: 'status' },
  ];
  

  const renderActions = (order) => (
    <div className="flex gap-2">
      <button
        onClick={() => editOrder(order.id)}
        className="text-blue-600 hover:text-blue-800"
        title="Edit"
      >
        <Pencil size={16} />
      </button>
      <button
        onClick={() => deleteOrder(order.id)}
        className="text-red-600 hover:text-red-800"
        title="Delete"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      {!isCreating && (
        <div>
          <Button
            onClick={startOrder}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Order
          </Button>

          <DataTable
            columns={columns}
            data={orders.map((order) => ({
              id: order.id,
              tableNumber: order.tableNumber,
              itemsSummary: order.items
                .map((i) => `${i.name} x${i.quantity}`)
                .join(", "),
              timestamp: order.timestamp,
              total: formatCurrency(order.total),
              status: order.status,
            }))}
            renderActions={renderActions}
          />
        </div>
      )}

      {isCreating && (
        <div className="bg-gray-50 p-4 rounded shadow mt-4">
          <h2 className="text-xl font-semibold mb-4">
            {editingOrderId ? "Edit" : "Create"} Order
          </h2>

          <label className="block mb-2">Table Number</label>
          <input
            type="text"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />

          <div className="grid grid-cols-2 gap-4 mb-4">
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">Select item</option>
              {menuItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - {formatCurrency(item.price)}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              min={1}
              className="p-2 border rounded"
            />
          </div>

          <Button
            onClick={addItem}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Plus className="inline mr-1" /> Add Item
          </Button>

          {selectedItems.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Items</h3>
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-2 bg-white shadow rounded mb-2"
                >
                  <div>
                    <p>
                      {item.name} x {item.quantity}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                  <Button
                    onClick={() => removeItem(item.id)}
                    className="text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="font-semibold text-right mt-2">
                Total: {formatCurrency(calculateTotal(selectedItems))}
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </Button>
            <Button
              onClick={submitOrder}
              disabled={!tableNumber || selectedItems.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {editingOrderId ? "Save Changes" : "Submit Order"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
