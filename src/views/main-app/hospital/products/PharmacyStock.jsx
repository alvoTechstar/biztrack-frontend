import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  Package,
  Calendar,
  User,
  Tag,
  Hash,
  DollarSign,
  TrendingUp,
  Pill,
  ShoppingCart,
} from "lucide-react";

const PharmacyStock = () => {
  const [medicines, setMedicines] = useState([
    {
      id: 1,
      name: "Paracetamol",
      category: "Analgesic",
      quantity: 150,
      buyingPrice: 5.5,
      sellingPrice: 8.0,
      expiryDate: "2024-08-15",
      supplier: "MedSupply Co.",
      status: "in_stock",
    },
    {
      id: 2,
      name: "Amoxicillin",
      category: "Antibiotic",
      quantity: 8,
      buyingPrice: 12.0,
      sellingPrice: 18.5,
      expiryDate: "2024-12-10",
      supplier: "PharmaCorp",
      status: "low_stock",
    },
    {
      id: 3,
      name: "Aspirin",
      category: "Analgesic",
      quantity: 75,
      buyingPrice: 3.25,
      sellingPrice: 5.75,
      expiryDate: "2024-03-20",
      supplier: "HealthMeds Ltd",
      status: "expired",
    },
    {
      id: 4,
      name: "Insulin",
      category: "Hormone",
      quantity: 25,
      buyingPrice: 45.0,
      sellingPrice: 65.0,
      expiryDate: "2024-09-30",
      supplier: "BioPharm Inc",
      status: "in_stock",
    },
    {
      id: 5,
      name: "Ibuprofen",
      category: "Anti-inflammatory",
      quantity: 5,
      buyingPrice: 7.8,
      sellingPrice: 12.0,
      expiryDate: "2024-07-05",
      supplier: "MedSupply Co.",
      status: "low_stock",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    buyingPrice: "",
    sellingPrice: "",
    expiryDate: "",
    supplier: "",
  });

  // Filter medicines based on search term
  const filteredMedicines = useMemo(() => {
    if (!searchTerm) return medicines;

    return medicines.filter(
      (medicine) =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [medicines, searchTerm]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `Ksh ${parseFloat(amount).toFixed(2)}`;
  };

  // Calculate profit per unit
  const calculateProfitPerUnit = (sellingPrice, buyingPrice) => {
    return sellingPrice - buyingPrice;
  };

  // Calculate potential profit for all stock
  const calculateTotalProfit = (sellingPrice, buyingPrice, quantity) => {
    return (sellingPrice - buyingPrice) * quantity;
  };

  // Determine medicine status based on quantity and expiry date
  const getMedicineStatus = (quantity, expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);

    if (expiry < today) return "expired";
    if (quantity <= 10) return "low_stock";
    return "in_stock";
  };

  // Get status icon and color
  const getStatusIcon = (status) => {
    switch (status) {
      case "expired":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "low_stock":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "in_stock":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case "expired":
        return "Expired";
      case "low_stock":
        return "Low Stock";
      case "in_stock":
        return "In Stock";
      default:
        return "";
    }
  };

  // Get row background color based on status
  const getRowBgColor = (status) => {
    switch (status) {
      case "expired":
        return "bg-red-50 hover:bg-red-100 border-l-4 border-red-400";
      case "low_stock":
        return "bg-orange-50 hover:bg-orange-100 border-l-4 border-orange-400";
      default:
        return "hover:bg-gray-50";
    }
  };

  // Open modal for adding new medicine
  const handleAddNew = () => {
    setEditingMedicine(null);
    setFormData({
      name: "",
      category: "",
      quantity: "",
      buyingPrice: "",
      sellingPrice: "",
      expiryDate: "",
      supplier: "",
    });
    setIsModalOpen(true);
  };

  // Open modal for editing medicine
  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      category: medicine.category,
      quantity: medicine.quantity.toString(),
      buyingPrice: medicine.buyingPrice.toString(),
      sellingPrice: medicine.sellingPrice.toString(),
      expiryDate: medicine.expiryDate,
      supplier: medicine.supplier,
    });
    setIsModalOpen(true);
  };

  // Delete medicine
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      setMedicines(medicines.filter((medicine) => medicine.id !== id));
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (
      !formData.name ||
      !formData.category ||
      !formData.quantity ||
      !formData.buyingPrice ||
      !formData.sellingPrice ||
      !formData.expiryDate ||
      !formData.supplier
    ) {
      alert("Please fill in all fields");
      return;
    }

    const quantity = parseInt(formData.quantity);
    const buyingPrice = parseFloat(formData.buyingPrice);
    const sellingPrice = parseFloat(formData.sellingPrice);
    const status = getMedicineStatus(quantity, formData.expiryDate);

    if (buyingPrice <= 0 || sellingPrice <= 0) {
      alert("Prices must be greater than 0");
      return;
    }

    if (sellingPrice <= buyingPrice) {
      if (
        !window.confirm(
          "Selling price is not higher than buying price. This will result in no profit or loss. Continue?"
        )
      ) {
        return;
      }
    }

    if (editingMedicine) {
      // Update existing medicine
      setMedicines(
        medicines.map((medicine) =>
          medicine.id === editingMedicine.id
            ? {
                ...medicine,
                name: formData.name,
                category: formData.category,
                quantity: quantity,
                buyingPrice: buyingPrice,
                sellingPrice: sellingPrice,
                expiryDate: formData.expiryDate,
                supplier: formData.supplier,
                status: status,
              }
            : medicine
        )
      );
    } else {
      // Add new medicine
      const newMedicine = {
        id: Math.max(...medicines.map((m) => m.id)) + 1,
        name: formData.name,
        category: formData.category,
        quantity: quantity,
        buyingPrice: buyingPrice,
        sellingPrice: sellingPrice,
        expiryDate: formData.expiryDate,
        supplier: formData.supplier,
        status: status,
      };
      setMedicines([...medicines, newMedicine]);
    }

    setIsModalOpen(false);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalItems = medicines.reduce((sum, med) => sum + med.quantity, 0);
    const totalValue = medicines.reduce(
      (sum, med) => sum + med.sellingPrice * med.quantity,
      0
    );
    const totalCost = medicines.reduce(
      (sum, med) => sum + med.buyingPrice * med.quantity,
      0
    );
    const totalProfit = totalValue - totalCost;
    const expiredCount = medicines.filter(
      (med) => med.status === "expired"
    ).length;
    const lowStockCount = medicines.filter(
      (med) => med.status === "low_stock"
    ).length;

    return {
      totalItems,
      totalValue,
      totalCost,
      totalProfit,
      expiredCount,
      lowStockCount,
    };
  }, [medicines]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center">
              <Pill className="text-blue-600 mr-3" size={32} />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Pharmacy Stock Management
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Manage medicines, track inventory, and monitor profitability
                </p>
              </div>
            </div>
            <button
              onClick={handleAddNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              Add New Medicine
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summaryStats.totalItems}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summaryStats.totalValue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Potential Profit
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summaryStats.totalProfit)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alerts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summaryStats.expiredCount + summaryStats.lowStockCount}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search medicines by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200  mb-10">
          <div className="overflow-x-auto ">
            <table className="w-full ">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-left py-2 px-4 font-semibold text-gray-800">
                    Name
                  </th>
                  <th className="text-left text-sm y-2 px-4 font-semibold text-gray-800">
                    Category
                  </th>
                  <th className="text-left text-sm py-2 px-4 font-semibold text-gray-800">
                    Quantity
                  </th>
                  <th className="text-left text-sm py-2 px-4 font-semibold text-gray-800">
                    Buying Price
                  </th>
                  <th className="text-left text-sm py-2 px-4 font-semibold text-gray-800">
                    Selling Price
                  </th>
                  <th className="text-left text-sm py-2 px-4 font-semibold text-gray-800">
                    Profit/Unit
                  </th>
                  <th className="text-left text-sm py-2 px-4 font-semibold text-gray-800">
                    Expiry Date
                  </th>
                  <th className="text-left text-sm py-2 px-4 font-semibold text-gray-800">
                    Supplier
                  </th>
                  <th className="text-left text-sm py-2 px-4 font-semibold text-gray-800">
                    Status
                  </th>
                  <th className="text-left text-sm py-2 px-4 font-semibold text-gray-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((medicine) => (
                  <tr
                    key={medicine.id}
                    className={`border-b border-gray-100 transition-all duration-150 ${getRowBgColor(
                      medicine.status
                    )}`}
                  >
                    <td className="py-2 px-4 text-sm font-medium text-gray-900">
                      {medicine.name}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {medicine.category}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700 font-medium">
                      {medicine.quantity}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {formatCurrency(medicine.buyingPrice)}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {formatCurrency(medicine.sellingPrice)}
                    </td>
                    <td className="py-2 px-4 text-sm">
                      <span
                        className={`font-medium ${
                          calculateProfitPerUnit(
                            medicine.sellingPrice,
                            medicine.buyingPrice
                          ) > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(
                          calculateProfitPerUnit(
                            medicine.sellingPrice,
                            medicine.buyingPrice
                          )
                        )}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {formatDate(medicine.expiryDate)}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-700">
                      {medicine.supplier}
                    </td>
                    <td className="py-2 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(medicine.status)}
                        <span className="text-sm font-medium">
                          {getStatusText(medicine.status)}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(medicine)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                          title="Edit Medicine"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(medicine.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                          title="Delete Medicine"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredMedicines.length === 0 && (
              <div className="text-center py-12">
                <Pill className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No medicines found
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Add your first medicine to get started"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <ShoppingCart size={24} className="text-blue-600" />
                    {editingMedicine ? "Edit Medicine" : "Add New Medicine"}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Pill size={16} />
                      Medicine Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                      placeholder="Enter medicine name"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Tag size={16} />
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) =>
                        handleInputChange("category", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                      placeholder="Enter category"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Hash size={16} />
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        handleInputChange("quantity", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                      placeholder="Enter quantity"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <DollarSign size={16} />
                      Buying Price (Ksh)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.buyingPrice}
                      onChange={(e) =>
                        handleInputChange("buyingPrice", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                      placeholder="Enter buying price"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <TrendingUp size={16} />
                      Selling Price (Ksh)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sellingPrice}
                      onChange={(e) =>
                        handleInputChange("sellingPrice", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                      placeholder="Enter selling price"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar size={16} />
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) =>
                        handleInputChange("expiryDate", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <User size={16} />
                      Supplier
                    </label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) =>
                        handleInputChange("supplier", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                      placeholder="Enter supplier name"
                      required
                    />
                  </div>
                </div>

                {/* Profit Preview */}
                {formData.buyingPrice && formData.sellingPrice && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">
                      Profit Analysis
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Profit per unit:</span>
                        <span
                          className={`ml-2 font-medium ${
                            parseFloat(formData.sellingPrice) -
                              parseFloat(formData.buyingPrice) >
                            0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(
                            parseFloat(formData.sellingPrice || 0) -
                              parseFloat(formData.buyingPrice || 0)
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">
                          Total potential profit:
                        </span>
                        <span
                          className={`ml-2 font-medium ${
                            parseFloat(formData.sellingPrice) -
                              parseFloat(formData.buyingPrice) >
                            0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(
                            (parseFloat(formData.sellingPrice || 0) -
                              parseFloat(formData.buyingPrice || 0)) *
                              parseInt(formData.quantity || 0)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-6">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    {editingMedicine ? "Update Medicine" : "Add Medicine"}
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacyStock;
