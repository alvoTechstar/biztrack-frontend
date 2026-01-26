import React, { useState, useEffect } from 'react';
import { Clock, Eye, Check, X, Filter } from 'lucide-react';

export default function HotelOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('active');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching data from an API
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        // In a real application, this would be an API call
        // For now, we'll use mock data
        const mockOrders = [
          {
            id: 'ORD-5432',
            location: 'Room 301',
            items: ['Club Sandwich', 'French Fries', 'Coke'],
            waiter: 'John Doe',
            total: 28.50,
            status: 'pending',
            timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 mins ago
          },
          {
            id: 'ORD-5431',
            location: 'Table 12',
            items: ['Caesar Salad', 'Grilled Chicken', 'White Wine'],
            waiter: 'Emily Smith',
            total: 45.75,
            status: 'in-progress',
            timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 mins ago
          },
          {
            id: 'ORD-5430',
            location: 'Room 205',
            items: ['Breakfast Buffet', 'Coffee'],
            waiter: 'Robert Johnson',
            total: 32.00,
            status: 'served',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
          },
          {
            id: 'ORD-5429',
            location: 'Pool Bar',
            items: ['Margarita', 'Nachos'],
            waiter: 'Lisa Wong',
            total: 18.25,
            status: 'cancelled',
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
          },
          {
            id: 'ORD-5428',
            location: 'Table 7',
            items: ['Steak', 'Mashed Potatoes', 'Red Wine'],
            waiter: 'Mark Davis',
            total: 64.50,
            status: 'served',
            timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
          },
        ];
        
        setOrders(mockOrders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();

    // Simulate real-time updates with polling
    const pollingInterval = setInterval(() => {
      fetchOrders();
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(pollingInterval);
  }, []);

  // Filter orders based on active filter
  useEffect(() => {
    if (activeFilter === 'active') {
      setFilteredOrders(orders.filter(order => 
        order.status === 'pending' || order.status === 'in-progress'));
    } else if (activeFilter === 'completed') {
      setFilteredOrders(orders.filter(order => order.status === 'served'));
    } else if (activeFilter === 'cancelled') {
      setFilteredOrders(orders.filter(order => order.status === 'cancelled'));
    } else {
      setFilteredOrders(orders);
    }
  }, [orders, activeFilter]);

  // Handle status change
  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prevOrders => prevOrders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'served':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format status text
  const formatStatus = (status) => {
    switch (status) {
      case 'in-progress':
        return 'In Progress';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      
      {/* Filter Tabs */}
      <div className="flex mb-6 border-b">
        <button
          className={`px-4 py-2 font-medium ${activeFilter === 'active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveFilter('active')}
        >
          Active Orders
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeFilter === 'completed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveFilter('completed')}
        >
          Completed
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeFilter === 'cancelled' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveFilter('cancelled')}
        >
          Cancelled
        </button>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Table/Room
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Waiter
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2">Loading orders...</span>
                  </div>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.location}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <ul className="space-y-1">
                      {order.items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.waiter}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatTime(order.timestamp)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        className="p-1 rounded-full hover:bg-gray-100"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5 text-gray-500" />
                      </button>
                      
                      {(order.status === 'pending' || order.status === 'in-progress') && (
                        <>
                          <button
                            className="p-1 rounded-full hover:bg-green-100"
                            title="Mark as Served"
                            onClick={() => handleStatusChange(order.id, 'served')}
                          >
                            <Check className="h-5 w-5 text-green-500" />
                          </button>
                          
                          <button
                            className="p-1 rounded-full hover:bg-red-100"
                            title="Cancel Order"
                            onClick={() => handleStatusChange(order.id, 'cancelled')}
                          >
                            <X className="h-5 w-5 text-red-500" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}