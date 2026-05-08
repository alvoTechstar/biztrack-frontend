import React from "react";
import {
  ShoppingCart,
  DollarSign,
  CreditCard,
  TrendingUp,
  Clock,
  User,
  Package,
} from "lucide-react";

const CashierDashboard = () => {
  // Mock data - structured for easy backend integration
  const mockOrders = [
    {
      id: "ORD-001",
      customerName: "John Doe",
      paymentMethod: "M-Pesa",
      totalAmount: 850,
      paymentTime: "09:15 AM",
      items: [
        { name: "Bread", quantity: 2, price: 120 },
        { name: "Milk", quantity: 1, price: 180 },
        { name: "Eggs", quantity: 1, price: 350 },
        { name: "Soda", quantity: 2, price: 100 },
      ],
      status: "completed",
    },
    {
      id: "ORD-002",
      customerName: "Jane Smith",
      paymentMethod: "Cash",
      totalAmount: 420,
      paymentTime: "10:30 AM",
      items: [
        { name: "Bread", quantity: 1, price: 120 },
        { name: "Butter", quantity: 1, price: 300 },
      ],
      status: "completed",
    },
    {
      id: "ORD-003",
      customerName: "Mike Johnson",
      paymentMethod: "M-Pesa",
      totalAmount: 650,
      paymentTime: "11:45 AM",
      items: [
        { name: "Rice", quantity: 1, price: 250 },
        { name: "Cooking Oil", quantity: 1, price: 400 },
      ],
      status: "completed",
    },
    {
      id: "ORD-004",
      customerName: "",
      paymentMethod: "Cash",
      totalAmount: 240,
      paymentTime: "12:20 PM",
      items: [{ name: "Soda", quantity: 3, price: 80 }],
      status: "completed",
    },
    {
      id: "ORD-005",
      customerName: "Sarah Wilson",
      paymentMethod: "M-Pesa",
      totalAmount: 980,
      paymentTime: "01:15 PM",
      items: [
        { name: "Bread", quantity: 2, price: 120 },
        { name: "Chicken", quantity: 1, price: 500 },
        { name: "Tomatoes", quantity: 1, price: 150 },
        { name: "Onions", quantity: 1, price: 90 },
      ],
      status: "completed",
    },
    {
      id: "ORD-006",
      customerName: "David Brown",
      paymentMethod: "Cash",
      totalAmount: 320,
      paymentTime: "02:45 PM",
      items: [
        { name: "Bread", quantity: 1, price: 120 },
        { name: "Jam", quantity: 1, price: 200 },
      ],
      status: "completed",
    },
  ];

  // Calculate summary metrics
  const calculateSummary = () => {
    const completedOrders = mockOrders.filter(
      (order) => order.status === "completed"
    );

    const totalOrders = completedOrders.length;
    const totalRevenue = completedOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    const paymentMethodCount = completedOrders.reduce((acc, order) => {
      acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + 1;
      return acc;
    }, {});

    // Calculate top selling product
    const productSales = {};
    completedOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (productSales[item.name]) {
          productSales[item.name] += item.quantity;
        } else {
          productSales[item.name] = item.quantity;
        }
      });
    });

    const topProduct = Object.entries(productSales).reduce(
      (max, [product, quantity]) => {
        return quantity > max.quantity ? { name: product, quantity } : max;
      },
      { name: "", quantity: 0 }
    );

    return {
      totalOrders,
      totalRevenue,
      mpesaTransactions: paymentMethodCount["M-Pesa"] || 0,
      cashTransactions: paymentMethodCount["Cash"] || 0,
      topProduct,
    };
  };

  const summary = calculateSummary();

  // Format items for display
  const formatItems = (items) => {
    return items.map((item) => `${item.quantity}x ${item.name}`).join(", ");
  };

  // Summary Card Component
  const SummaryCard = ({ title, value, icon: Icon, bgColor, textColor }) => (
    <div className={`${bgColor} rounded-lg p-6 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${textColor}`} />
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cashier Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Today's Sales Overview - {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title="Total Orders Today"
          value={summary.totalOrders}
          icon={ShoppingCart}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
        <SummaryCard
          title="Total Revenue"
          value={`KES ${summary.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
        <SummaryCard
          title="M-Pesa vs Cash"
          value={`${summary.mpesaTransactions} | ${summary.cashTransactions}`}
          icon={CreditCard}
          bgColor="bg-purple-50"
          textColor="text-purple-600"
        />
        <SummaryCard
          title="Top Selling Product"
          value={`${summary.topProduct.name} (${summary.topProduct.quantity})`}
          icon={TrendingUp}
          bgColor="bg-orange-50"
          textColor="text-orange-600"
        />
      </div>

      {/* Detailed Orders Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Today's Completed Orders
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items Ordered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount (KES)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockOrders
                .filter((order) => order.status === "completed")
                .map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {order.paymentTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-start">
                        <Package className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="break-words">
                          {formatItems(order.items)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      KES {order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.paymentMethod === "M-Pesa"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        <CreditCard className="h-3 w-3 mr-1" />
                        {order.paymentMethod}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {mockOrders.filter((order) => order.status === "completed").length ===
          0 && (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No completed orders for today</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashierDashboard;
