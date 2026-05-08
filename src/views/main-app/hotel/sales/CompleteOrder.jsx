import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Check, RefreshCw } from 'lucide-react';

const CompleteOrder = () => {
  // Mock initial orders (simulating what a waiter might have created)
  const initialOrders = [
    {
      id: "ORD-001",
      tableNumber: 5,
      items: [
        { name: "Chicken Burger", quantity: 2, price: 850 },
        { name: "French Fries", quantity: 1, price: 300 },
        { name: "Soda", quantity: 2, price: 150 }
      ],
      status: "Pending",
      timestamp: new Date().toISOString()
    },
    {
      id: "ORD-002",
      tableNumber: 3,
      items: [
        { name: "Beef Steak", quantity: 1, price: 1200 },
        { name: "Caesar Salad", quantity: 1, price: 500 },
        { name: "Wine", quantity: 1, price: 900 }
      ],
      status: "Pending",
      timestamp: new Date().toISOString()
    }
  ];

  // State management
  const [orders, setOrders] = useState(initialOrders);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'manual'
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, orderId: null });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState({ type: '', message: '' });
  
  // Manual order form state
  const [manualOrder, setManualOrder] = useState({
    tableNumber: '',
    items: [{ name: '', quantity: 1, price: '' }]
  });

  // Expand/collapse order details
  const toggleOrderExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  // Open payment modal
  const openPaymentModal = (orderId) => {
    setPaymentModal({ isOpen: true, orderId });
    setPaymentMethod('cash');
    setCashAmount('');
    setPhoneNumber('');
    setPaymentMessage({ type: '', message: '' });
  };

  // Close payment modal
  const closePaymentModal = () => {
    setPaymentModal({ isOpen: false, orderId: null });
  };

  // Calculate total amount for an order
  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Calculate change for cash payment
  const calculateChange = (cashAmount, totalAmount) => {
    const cash = parseFloat(cashAmount);
    if (!isNaN(cash) && cash >= totalAmount) {
      return cash - totalAmount;
    }
    return 0;
  };

  // Process payment
  const processPayment = () => {
    const order = orders.find(o => o.id === paymentModal.orderId);
    const total = calculateTotal(order.items);
    
    if (paymentMethod === 'cash') {
      const cash = parseFloat(cashAmount);
      if (isNaN(cash) || cash < total) {
        setPaymentMessage({ type: 'error', message: 'Insufficient cash amount' });
        return;
      }
      
      // Update order status
      completeOrder(paymentModal.orderId, 'Completed - Cash');
      setPaymentMessage({ type: 'success', message: `Payment completed. Change: ${calculateChange(cashAmount, total)}` });
    } else {
      // M-Pesa flow
      if (!phoneNumber || phoneNumber.length < 10) {
        setPaymentMessage({ type: 'error', message: 'Please enter a valid phone number' });
        return;
      }
      
      setProcessingPayment(true);
      setPaymentMessage({ type: 'info', message: 'Processing M-Pesa payment...' });
      
      // Simulate STK push and payment
      setTimeout(() => {
        // Generate random success (80% chance) or failure
        const success = Math.random() > 0.2;
        
        if (success) {
          completeOrder(paymentModal.orderId, 'Completed - M-Pesa');
          setPaymentMessage({ type: 'success', message: 'M-Pesa payment successful!' });
        } else {
          setPaymentMessage({ type: 'error', message: 'M-Pesa payment failed. Try again.' });
        }
        
        setProcessingPayment(false);
      }, 3000);
    }
  };

  // Complete order with new status
  const completeOrder = (orderId, newStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    
    // Close modal after a delay if successful
    if (newStatus.startsWith('Completed')) {
      setTimeout(() => closePaymentModal(), 2000);
    }
  };

  // Handle manual order submission
  const submitManualOrder = () => {
    // Basic validation
    if (!manualOrder.tableNumber || 
        manualOrder.items.some(item => !item.name || !item.price)) {
      alert('Please fill all required fields');
      return;
    }
    
    // Create new order
    const newOrder = {
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      tableNumber: parseInt(manualOrder.tableNumber),
      items: manualOrder.items.map(item => ({
        name: item.name,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price)
      })),
      status: "Pending",
      timestamp: new Date().toISOString()
    };
    
    // Add to orders list
    setOrders(prevOrders => [...prevOrders, newOrder]);
    
    // Reset form
    setManualOrder({
      tableNumber: '',
      items: [{ name: '', quantity: 1, price: '' }]
    });
    
    // Switch to pending orders tab
    setActiveTab('pending');
  };

  // Handle manual order item changes
  const updateManualOrderItem = (index, field, value) => {
    const updatedItems = [...manualOrder.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    setManualOrder({
      ...manualOrder,
      items: updatedItems
    });
  };

  // Add new item to manual order
  const addManualOrderItem = () => {
    setManualOrder({
      ...manualOrder,
      items: [...manualOrder.items, { name: '', quantity: 1, price: '' }]
    });
  };

  // Remove item from manual order
  const removeManualOrderItem = (index) => {
    if (manualOrder.items.length > 1) {
      const updatedItems = [...manualOrder.items];
      updatedItems.splice(index, 1);
      
      setManualOrder({
        ...manualOrder,
        items: updatedItems
      });
    }
  };

  // Render order status with appropriate styling
  const renderOrderStatus = (status) => {
    let className = "px-2 py-1 rounded text-xs font-medium";
    
    if (status === "Pending") {
      className += " bg-yellow-100 text-yellow-800";
    } else if (status.includes("Completed - Cash")) {
      className += " bg-green-100 text-green-800";
    } else if (status.includes("Completed - M-Pesa")) {
      className += " bg-blue-100 text-blue-800";
    }
    
    return <span className={className}>{status}</span>;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Cashier Dashboard</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`py-2 px-4 font-medium ${activeTab === 'pending' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          Pending Orders
        </button>
        <button 
          onClick={() => setActiveTab('manual')}
          className={`py-2 px-4 font-medium ${activeTab === 'manual' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          Manual Receipt
        </button>
      </div>
      
      {/* Pending Orders Tab */}
      {activeTab === 'pending' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Orders</h2>
          
          {orders.length === 0 ? (
            <p className="text-gray-500">No orders available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">Order ID</th>
                    <th className="py-3 px-4 text-left">Table</th>
                    <th className="py-3 px-4 text-left">Items</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className={order.status !== "Pending" ? "bg-gray-50" : ""}>
                      <td className="py-3 px-4">{order.id}</td>
                      <td className="py-3 px-4">{order.tableNumber}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span>{order.items.length} items</span>
                          <button 
                            onClick={() => toggleOrderExpand(order.id)}
                            className="ml-2 text-gray-600 hover:text-gray-900"
                          >
                            {expandedOrder === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                        
                        {expandedOrder === order.id && (
                          <div className="mt-2 pl-2 border-l-2 border-gray-200">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="text-sm py-1">
                                <span>{item.quantity}x {item.name}</span>
                                <span className="ml-2 text-gray-600">${item.price}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        ${calculateTotal(order.items).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {renderOrderStatus(order.status)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {order.status === "Pending" ? (
                          <button
                            onClick={() => openPaymentModal(order.id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm"
                          >
                            Complete
                          </button>
                        ) : (
                          <span className="text-sm text-gray-500">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Manual Receipt Tab */}
      {activeTab === 'manual' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Manual Receipt Entry</h2>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Table Number
              </label>
              <input
                type="number"
                value={manualOrder.tableNumber}
                onChange={(e) => setManualOrder({...manualOrder, tableNumber: e.target.value})}
                className="w-24 border border-gray-300 rounded-md px-3 py-2"
                min="1"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Items
              </label>
              
              {manualOrder.items.map((item, index) => (
                <div key={index} className="flex flex-wrap items-center mb-2 gap-2">
                  <input
                    type="text"
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => updateManualOrderItem(index, 'name', e.target.value)}
                    className="flex-1 min-w-[200px] border border-gray-300 rounded-md px-3 py-2"
                  />
                  
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateManualOrderItem(index, 'quantity', e.target.value)}
                    className="w-16 border border-gray-300 rounded-md px-3 py-2"
                    min="1"
                  />
                  
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => updateManualOrderItem(index, 'price', e.target.value)}
                    className="w-24 border border-gray-300 rounded-md px-3 py-2"
                    min="0"
                    step="0.01"
                  />
                  
                  <button
                    onClick={() => removeManualOrderItem(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                    title="Remove item"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              
              <button
                onClick={addManualOrderItem}
                className="mt-2 text-blue-500 hover:text-blue-700 text-sm font-medium"
              >
                + Add Item
              </button>
            </div>
            
            <div className="mb-4 py-2 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-lg">
                  ${calculateTotal(manualOrder.items.map(item => ({
                    ...item, 
                    price: parseFloat(item.price) || 0,
                    quantity: parseInt(item.quantity) || 0
                  }))).toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={submitManualOrder}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
              >
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Payment Modal */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center border-b border-gray-200 p-4">
              <h3 className="text-lg font-medium">Complete Payment</h3>
              <button onClick={closePaymentModal} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              {/* Order summary */}
              {(() => {
                const order = orders.find(o => o.id === paymentModal.orderId);
                if (!order) return null;
                
                const total = calculateTotal(order.items);
                return (
                  <div className="mb-4 bg-gray-50 p-3 rounded">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Order ID:</span>
                      <span>{order.id}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Table:</span>
                      <span>{order.tableNumber}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>${total.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}
              
              {/* Payment method selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      className="mr-2"
                    />
                    Cash
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mpesa"
                      checked={paymentMethod === 'mpesa'}
                      onChange={() => setPaymentMethod('mpesa')}
                      className="mr-2"
                    />
                    M-Pesa
                  </label>
                </div>
              </div>
              
              {/* Cash payment form */}
              {paymentMethod === 'cash' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount Received
                  </label>
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    min="0"
                    step="0.01"
                  />
                  
                  {(() => {
                    const order = orders.find(o => o.id === paymentModal.orderId);
                    if (!order) return null;
                    
                    const total = calculateTotal(order.items);
                    const cash = parseFloat(cashAmount);
                    
                    if (!isNaN(cash) && cash > 0) {
                      return (
                        <div className="mt-2 p-2 bg-gray-50 rounded">
                          <div className="flex justify-between">
                            <span>Change:</span>
                            <span className={cash >= total ? "font-bold" : "text-red-600"}>
                              ${calculateChange(cashAmount, total).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
              
              {/* M-Pesa payment form */}
              {paymentMethod === 'mpesa' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g. 0712345678"
                    maxLength="12"
                  />
                </div>
              )}
              
              {/* Payment messages */}
              {paymentMessage.message && (
                <div className={`p-3 rounded mb-4 ${
                  paymentMessage.type === 'error' ? 'bg-red-100 text-red-800' :
                  paymentMessage.type === 'success' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {paymentMessage.message}
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closePaymentModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={processingPayment}
                >
                  Cancel
                </button>
                <button
                  onClick={processPayment}
                  disabled={processingPayment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  {processingPayment ? (
                    <>
                      <RefreshCw size={16} className="mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check size={16} className="mr-2" />
                      Complete Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompleteOrder;