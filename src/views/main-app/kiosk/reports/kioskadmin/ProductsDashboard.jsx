// kiosk-admin/ProductsDashboard.jsx
import React, { useState, useMemo, useEffect } from "react";
import DataTable from "../../../../../components/datatable";
import { useTheme } from "../../../../../components/theme/ThemeContext";

// Import components
import DateRangeInput from "../../../../../components/Input/DateRangeInput";
import FilterInput from "../../../../../components/Input/FilterInput";

// Import missing icons
import {
  Calendar,
  Filter,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

const ProductsDashboard = ({
  productData,
  loading,
  formatCurrency,
  LoadingOverlay,
  RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Package: PackageIcon,
  AlertTriangle: AlertTriangleIcon,
  CheckCircle: CheckCircleIcon,
  userData,
  selectedDateRange,
  selectedFilters,
  onDateRangeChange,
  onFilterChange,
  onRefresh,
  filteredTransactions = []
}) => {
  const { primaryColor } = useTheme();
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [dateAnchorEl, setDateAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [localSelectedFilters, setLocalSelectedFilters] = useState([]);
  const [stockTableData, setStockTableData] = useState([]);

  // Filter options for products dashboard
  const filterOptions = [
    { label: "Low Stock (< threshold)", value: "low_stock" },
    { label: "Out of Stock", value: "out_of_stock" },
    { label: "In Stock", value: "in_stock" },
    { label: "Best Selling", value: "best_selling" },
    { label: "High Margin (>30%)", value: "high_margin" },
    { label: "Low Margin (<15%)", value: "low_margin" },
    { label: "No Sales", value: "no_sales" }
  ];

  // FIXED: Get initial stock data with proper cost price tracking
  const calculateInitialStock = useMemo(() => {
    const stockMap = {};

    if (productData && Array.isArray(productData)) {
      productData.forEach(product => {
        const productId = product._id || product.id;
        const productName = product.name || product.productName || 'Unnamed Product';
        const productSku = product.sku || product.code || 'N/A';
        
        // Parse stock quantities
        const stock = parseFloat(product.stock) ||
          parseFloat(product.quantity) ||
          parseFloat(product.currentStock) ||
          parseFloat(product.availableStock) || 0;
        
        // FIXED: Ensure cost price is properly extracted
        const costPrice = parseFloat(product.costPrice) ||
          parseFloat(product.buyingPrice) ||
          parseFloat(product.purchasePrice) ||
          parseFloat(product.wholesalePrice) || 0;
        
        // Selling price
        const sellingPrice = parseFloat(product.price) ||
          parseFloat(product.sellingPrice) ||
          parseFloat(product.unitPrice) || 0;
        
        const threshold = parseFloat(product.threshold) ||
          parseFloat(product.reorderLevel) || 10;

        if (productId) {
          // Calculate profit per unit
          const profitPerUnit = sellingPrice - costPrice;
          const profitMargin = sellingPrice > 0 ? (profitPerUnit / sellingPrice) * 100 : 0;

          stockMap[productId] = {
            id: productId,
            name: productName,
            sku: productSku,
            category: product.category || 'Uncategorized',
            initialStock: stock,
            currentStock: stock,
            costPrice: costPrice,
            sellingPrice: sellingPrice,
            profitPerUnit: profitPerUnit,
            profitMargin: profitMargin,
            threshold: threshold,
            unit: product.unit || 'units',
            totalCostValue: stock * costPrice,
            totalSaleValue: stock * sellingPrice,
            quantitySold: 0,
            revenue: 0,
            profit: 0
          };
        }
      });
    }

    return stockMap;
  }, [productData]);

  // ========== CRITICAL FIX: Calculate sold stock with accurate profit calculation ==========
  const calculateSoldStock = useMemo(() => {
    if (!filteredTransactions || !Array.isArray(filteredTransactions)) {
      return {};
    }

    const soldMap = {};

    // Process only completed transactions
    filteredTransactions.forEach(transaction => {
      const status = transaction.status?.toLowerCase();
      if (status !== 'completed' && status !== 'success' && status !== 'paid') {
        return;
      }

      if (transaction.items && Array.isArray(transaction.items)) {
        transaction.items.forEach(item => {
          const productId = item.productId || item.product?._id;
          const productName = item.productName || item.name || 'Unknown Product';

          if (!productId) return;

          const quantity = parseFloat(item.quantity) || 1;
          const unitPrice = parseFloat(item.unitPrice) || parseFloat(item.price) || 0;
          const totalPrice = parseFloat(item.totalPrice) || (quantity * unitPrice);
          
          // ==================== CRITICAL FIX: Multi-source cost price extraction ====================
          const initialProductData = calculateInitialStock[productId];
          
          // Priority 1: Cost price from transaction item itself
          let costPrice = parseFloat(item.costPrice) || 
                         parseFloat(item.buyingPrice) || 
                         parseFloat(item.cost) || 0;
          
          // Priority 2: Cost price from initial product data
          if (costPrice === 0 && initialProductData?.costPrice) {
            costPrice = initialProductData.costPrice;
          }
          
          // Priority 3: Extract from item object with different field names
          if (costPrice === 0) {
            costPrice = parseFloat(item.purchasePrice) || 
                       parseFloat(item.wholesalePrice) || 
                       parseFloat(item.unitCost) || 0;
          }
          
          // Priority 4: Calculate from profit margin if available
          if (costPrice === 0 && item.profitMargin) {
            const profitMargin = parseFloat(item.profitMargin) / 100;
            costPrice = unitPrice / (1 + profitMargin);
          }
          
          // Fallback: If still no cost price, estimate at 60% of selling price
          if (costPrice === 0 && unitPrice > 0) {
            costPrice = unitPrice * 0.6; // Reasonable default assumption
            console.warn(`⚠️ Cost price not found for product ${productId}, using 60% estimate: ${costPrice}`);
          }
          
          // ==================== Calculate profit correctly ====================
          const profitPerUnit = unitPrice - costPrice;
          const totalCost = costPrice * quantity;
          const profit = totalPrice - totalCost;

          console.log(`📊 Product ${productId}: unitPrice=${unitPrice}, costPrice=${costPrice}, profit=${profit}, totalPrice=${totalPrice}, totalCost=${totalCost}`);

          if (!soldMap[productId]) {
            soldMap[productId] = {
              quantitySold: 0,
              revenue: 0,
              costValue: 0,
              profit: 0,
              productName: productName,
              avgUnitPrice: 0,
              totalTransactions: 0
            };
          }

          soldMap[productId].quantitySold += quantity;
          soldMap[productId].revenue += totalPrice;
          soldMap[productId].costValue += totalCost;
          soldMap[productId].profit += profit;
          soldMap[productId].totalTransactions += 1;
          
          // Calculate average unit price
          soldMap[productId].avgUnitPrice = 
            (soldMap[productId].revenue / soldMap[productId].quantitySold) || unitPrice;
        });
      }
    });

    console.log('💰 Final sold map:', soldMap);
    return soldMap;
  }, [filteredTransactions, calculateInitialStock]);

  // Update stock table data
  useEffect(() => {
    const stockData = [];
    const soldData = calculateSoldStock;

    Object.values(calculateInitialStock).forEach(product => {
      const soldInfo = soldData[product.id] || {
        quantitySold: 0,
        revenue: 0,
        costValue: 0,
        profit: 0,
        productName: product.name,
        avgUnitPrice: product.sellingPrice
      };

      const remainingStock = Math.max(product.initialStock - soldInfo.quantitySold, 0);
      const stockStatus = remainingStock === 0 ? 'Out of Stock' :
        remainingStock <= (product.threshold || 0) ? 'Low Stock' : 'In Stock';

      const stockPillClass = remainingStock === 0 ? 'bg-red-100 text-red-800' :
        remainingStock <= (product.threshold || 0) ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800';

      const stockPercentage = product.initialStock > 0 ? (remainingStock / product.initialStock) * 100 : 0;

      // FIXED: Calculate accurate profit margin
      let profitMargin = 0;
      if (soldInfo.revenue > 0) {
        profitMargin = (soldInfo.profit / soldInfo.revenue) * 100;
      } else if (soldInfo.quantitySold > 0 && soldInfo.avgUnitPrice > 0) {
        // If no profit but we have sales, calculate from unit prices
        profitMargin = ((soldInfo.avgUnitPrice - product.costPrice) / soldInfo.avgUnitPrice) * 100;
      } else if (product.sellingPrice > 0) {
        // If no sales, use potential profit margin
        profitMargin = product.profitMargin || 0;
      }

      // Calculate ROI (Return on Investment)
      const roi = product.costPrice > 0 ? (soldInfo.profit / (product.costPrice * soldInfo.quantitySold)) * 100 : 0;

      stockData.push({
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        initialStock: product.initialStock,
        quantitySold: soldInfo.quantitySold,
        remainingStock: remainingStock,
        stockStatus: stockStatus,
        stockPillClass: stockPillClass,
        stockPercentage: stockPercentage,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        profitPerUnit: product.profitPerUnit,
        avgSellingPrice: soldInfo.avgUnitPrice || product.sellingPrice,
        revenue: soldInfo.revenue,
        profit: soldInfo.profit,
        profitMargin: profitMargin,
        roi: roi,
        totalCostValue: product.initialStock * product.costPrice,
        soldCostValue: soldInfo.costValue,
        remainingCostValue: remainingStock * product.costPrice,
        unit: product.unit,
        threshold: product.threshold,
        hasSales: soldInfo.quantitySold > 0,

        // Formatted values
        initialStockFormatted: `${product.initialStock.toLocaleString()} ${product.unit}`,
        quantitySoldFormatted: `${soldInfo.quantitySold.toLocaleString()} ${product.unit}`,
        remainingStockFormatted: `${remainingStock.toLocaleString()} ${product.unit}`,
        revenueFormatted: formatCurrency(soldInfo.revenue),
        profitFormatted: formatCurrency(soldInfo.profit),
        profitMarginFormatted: profitMargin !== 0 ? `${profitMargin.toFixed(1)}%` : '0%',
        roiFormatted: `${roi.toFixed(1)}%`,
        costPriceFormatted: formatCurrency(product.costPrice),
        sellingPriceFormatted: formatCurrency(product.sellingPrice),
        avgSellingPriceFormatted: formatCurrency(soldInfo.avgUnitPrice || product.sellingPrice),
        totalCostValueFormatted: formatCurrency(product.initialStock * product.costPrice),
        soldCostValueFormatted: formatCurrency(soldInfo.costValue),
        remainingCostValueFormatted: formatCurrency(remainingStock * product.costPrice),
      });
    });

    setStockTableData(stockData);
  }, [calculateInitialStock, calculateSoldStock, formatCurrency]);

  // Apply filters to stock table data
  const filteredStockData = useMemo(() => {
    let filtered = [...stockTableData];

    // Apply search filter
    if (searchFilter) {
      const searchLower = searchFilter.toLowerCase();
      filtered = filtered.filter(product => {
        const name = product.name || '';
        const sku = product.sku || '';
        const category = product.category || '';

        return name.toLowerCase().includes(searchLower) ||
          sku.toLowerCase().includes(searchLower) ||
          category.toLowerCase().includes(searchLower);
      });
    }

    // Apply filter options
    const activeFilters = selectedFilters || localSelectedFilters;
    if (activeFilters.length > 0) {
      filtered = filtered.filter(product => {
        let passesFilter = true;

        activeFilters.forEach(filter => {
          switch (filter) {
            case 'low_stock':
              passesFilter = passesFilter &&
                (product.remainingStock <= (product.threshold || 0) && product.remainingStock > 0);
              break;
            case 'out_of_stock':
              passesFilter = passesFilter && (product.remainingStock <= 0);
              break;
            case 'in_stock':
              passesFilter = passesFilter && (product.remainingStock > (product.threshold || 0));
              break;
            case 'best_selling':
              // Sort by quantity sold for best selling
              passesFilter = passesFilter && (product.quantitySold > 0);
              break;
            case 'high_margin':
              passesFilter = passesFilter && ((product.profitMargin || 0) > 30);
              break;
            case 'low_margin':
              passesFilter = passesFilter &&
                ((product.profitMargin || 0) < 15 && (product.profitMargin || 0) > 0);
              break;
            case 'no_sales':
              passesFilter = passesFilter && (product.quantitySold === 0);
              break;
            default:
            // No specific filter
          }
        });

        return passesFilter;
      });
    }

    // If best_selling filter is active, sort by quantity sold
    if (activeFilters.includes('best_selling')) {
      filtered.sort((a, b) => b.quantitySold - a.quantitySold);
    }

    return filtered;
  }, [stockTableData, searchFilter, selectedFilters, localSelectedFilters]);

  // Calculate total values with proper profit calculation
  const totalMetrics = useMemo(() => {
    if (stockTableData.length === 0) {
      return {
        totalInitialStock: 0,
        totalSold: 0,
        totalRemaining: 0,
        totalRevenue: 0,
        totalCostValue: 0,
        totalSoldCostValue: 0,
        totalRemainingCostValue: 0,
        totalProfit: 0,
        avgProfitMargin: 0,
        avgROI: 0
      };
    }

    const totalRevenue = stockTableData.reduce((sum, p) => sum + p.revenue, 0);
    const totalSoldCostValue = stockTableData.reduce((sum, p) => sum + p.soldCostValue, 0);
    const totalProfit = stockTableData.reduce((sum, p) => sum + p.profit, 0);
    
    // Calculate weighted averages
    const productsWithSales = stockTableData.filter(p => p.quantitySold > 0);
    const totalQuantitySold = stockTableData.reduce((sum, p) => sum + p.quantitySold, 0);
    
    let avgProfitMargin = 0;
    let avgROI = 0;
    
    if (productsWithSales.length > 0) {
      avgProfitMargin = productsWithSales.reduce((sum, p) => sum + p.profitMargin, 0) / productsWithSales.length;
      avgROI = productsWithSales.reduce((sum, p) => sum + p.roi, 0) / productsWithSales.length;
    }

    return {
      totalInitialStock: stockTableData.reduce((sum, p) => sum + p.initialStock, 0),
      totalSold: stockTableData.reduce((sum, p) => sum + p.quantitySold, 0),
      totalRemaining: stockTableData.reduce((sum, p) => sum + p.remainingStock, 0),
      totalRevenue: totalRevenue,
      totalCostValue: stockTableData.reduce((sum, p) => sum + p.totalCostValue, 0),
      totalSoldCostValue: totalSoldCostValue,
      totalRemainingCostValue: stockTableData.reduce((sum, p) => sum + p.remainingCostValue, 0),
      totalProfit: totalProfit,
      totalProfitPerUnit: totalSoldCostValue > 0 ? totalProfit / totalSoldCostValue : 0,
      avgProfitMargin: avgProfitMargin,
      avgROI: avgROI
    };
  }, [stockTableData]);

  // Table headers for stock tracking table
  const stockTableHeaders = [
    { key: "name", title: "Product", width: "18%" },
    { key: "category", title: "Category", width: "10%" },
    { key: "initialStockFormatted", title: "Initial", width: "8%" },
    { key: "quantitySoldFormatted", title: "Sold", width: "8%" },
    { key: "remainingStockFormatted", title: "Remaining", width: "10%" },
    { key: "revenueFormatted", title: "Revenue", width: "10%" },
    { key: "profitFormatted", title: "Profit", width: "10%" },
    { key: "profitMarginFormatted", title: "Margin", width: "8%" },
    { key: "roiFormatted", title: "ROI", width: "8%" },
    { key: "stockStatus", title: "Status", width: "10%" },
  ];

  // Date range handlers
  const handleDateClick = (event) => {
    setDateAnchorEl(event.currentTarget);
  };

  const handleDateClose = () => {
    setDateAnchorEl(null);
  };

  const handleDateFilterChange = (hasFilter) => {
    console.log("Date filter changed:", hasFilter);
  };

  // Filter handlers
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleTableFilterChange = (hasFilter) => {
    console.log("Table filter changed:", hasFilter);
  };

  // Handle date range change from parent or local
  const handleDateRangeChange = (dateRange) => {
    if (onDateRangeChange) {
      onDateRangeChange(dateRange);
    }
  };

  // Handle filter change
  const handleLocalFilterChange = (filters) => {
    if (onFilterChange) {
      onFilterChange(filters);
    } else {
      setLocalSelectedFilters(filters);
    }
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    return (selectedFilters || localSelectedFilters).length;
  };

  // Format date range label
  const getDateRangeLabel = () => {
    if (!selectedDateRange) {
      return "All Time";
    }

    const { startDate, endDate } = selectedDateRange;
    const [startDay, startMonth, startYear] = startDate.split('-');
    const [endDay, endMonth, endYear] = endDate.split('-');

    const startDateObj = new Date(`${startYear}-${startMonth}-${startDay}`);
    const endDateObj = new Date(`${endYear}-${endMonth}-${endDay}`);

    return `${startDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const customRenderCell = (column, header) => {
    switch (header.key) {
      case "stockStatus":
        return (
          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${column.stockPillClass || 'bg-gray-100 text-gray-800'}`}>
            {column.stockStatus || 'Unknown'}
          </span>
        );

      case "profitFormatted":
        return (
          <span className={`font-semibold ${(column.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {column.profitFormatted || formatCurrency(0)}
          </span>
        );

      case "profitMarginFormatted":
        const profitMargin = column.profitMargin || 0;
        const marginColor = profitMargin > 30 ? 'text-green-600' :
          profitMargin > 15 ? 'text-yellow-600' :
            profitMargin > 0 ? 'text-blue-600' : 'text-red-600';
        return (
          <span className={`font-semibold ${marginColor}`}>
            {column.profitMarginFormatted || '0%'}
          </span>
        );

      case "roiFormatted":
        const roi = column.roi || 0;
        const roiColor = roi > 100 ? 'text-green-600' :
          roi > 50 ? 'text-yellow-600' :
            roi > 0 ? 'text-blue-600' : 'text-red-600';
        return (
          <span className={`font-semibold ${roiColor}`}>
            {column.roiFormatted || '0%'}
          </span>
        );

      case "name":
        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{column.name || 'Unknown Product'}</span>
            {column.sku && column.sku !== 'N/A' && (
              <span className="text-xs text-gray-500">SKU: {column.sku}</span>
            )}
          </div>
        );

      case "remainingStockFormatted":
        const stockPercentage = column.stockPercentage || 0;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{column.remainingStockFormatted || '0 units'}</span>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div
                className={`h-1.5 rounded-full ${stockPercentage > 50 ? 'bg-green-500' : stockPercentage > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(stockPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        );

      default:
        return column[header.key] || '';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingOverlay />
      </div>
    );
  }

  // If we have no product data
  if (stockTableData.length === 0) {
    return (
      <div className="text-center py-12">
        <PackageIcon className="mx-auto mb-4 text-gray-400" size={48} />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Product Data Available</h3>
        <p className="text-gray-600">Add products to your inventory to see stock tracking.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock & Inventory Tracking</h1>
          <p className="text-gray-600 mt-1">Real-time stock levels, sales performance, and profit analysis</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              {loading ? "Loading..." : "Refresh"}
            </button>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Input */}
            <div className="relative inline-flex">
              <DateRangeInput
                type="products"
                color="#3B82F6"
                selected={selectedDateRange}
                dateFilter={!!selectedDateRange}
                anchorEl={dateAnchorEl}
                selectedAction={handleDateRangeChange}
                handleDateFilter={handleDateFilterChange}
                handleClose={handleDateClose}
                handleClick={handleDateClick}
              />
              {selectedDateRange && (
                <span className="ml-2 text-sm text-gray-700 whitespace-nowrap hidden sm:inline">
                  {getDateRangeLabel()}
                </span>
              )}
            </div>

            {/* Filter Input */}
            <div className="relative inline-flex">
              <FilterInput
                color="#3B82F6"
                label="Stock Filters"
                filters={filterOptions}
                selected={selectedFilters || localSelectedFilters}
                selectedAction={handleLocalFilterChange}
                tableFilter={getActiveFilterCount() > 0}
                handleTableFilter={handleTableFilterChange}
                anchorEl={filterAnchorEl}
                handleClose={handleFilterClose}
                handleClick={handleFilterClick}
                options={["Filters"]}
              />
              {getActiveFilterCount() > 0 && (
                <span className="ml-2 text-sm text-gray-700 whitespace-nowrap hidden sm:inline">
                  {getActiveFilterCount()} filter(s)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Date Range and Filter Indicators */}
      {(selectedDateRange || getActiveFilterCount() > 0) && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {selectedDateRange && (
              <div className="flex items-center gap-2">
                <Calendar className="text-blue-600" size={20} />
                <div>
                  <p className="text-sm font-medium text-blue-900">Viewing sales data for</p>
                  <p className="text-lg font-bold text-blue-700">{getDateRangeLabel()}</p>
                </div>
              </div>
            )}

            {getActiveFilterCount() > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="text-blue-600" size={20} />
                <div>
                  <p className="text-sm font-medium text-blue-900">Active Stock Filters</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(selectedFilters || localSelectedFilters).map(filter => {
                      const filterOption = filterOptions.find(opt => opt.value === filter);
                      return (
                        <span
                          key={filter}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                        >
                          {filterOption?.label || filter}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="text-right">
              <p className="text-sm text-blue-600">
                {filteredStockData.length} products match criteria
              </p>
              <p className="text-lg font-bold text-blue-900">
                {filteredStockData.filter(p => p.hasSales).length} products sold
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90">Total Stock Value</p>
              <h3 className="text-3xl font-bold mb-2">{formatCurrency(totalMetrics.totalRemainingCostValue)}</h3>
            </div>
            <PackageIcon size={24} className="opacity-90" />
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="text-xs opacity-80">
              {totalMetrics.totalRemaining.toLocaleString()} units remaining
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90">Total Revenue</p>
              <h3 className="text-3xl font-bold mb-2">{formatCurrency(totalMetrics.totalRevenue)}</h3>
            </div>
            <DollarSign size={24} className="opacity-90" />
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="text-xs opacity-80">
              From {totalMetrics.totalSold.toLocaleString()} units sold
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90">Total Profit</p>
              <h3 className="text-3xl font-bold mb-2">{formatCurrency(totalMetrics.totalProfit)}</h3>
            </div>
            <TrendingUp size={24} className="opacity-90" />
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="text-xs opacity-80">
              {totalMetrics.totalRevenue > 0 ?
                `${((totalMetrics.totalProfit / totalMetrics.totalRevenue) * 100).toFixed(1)}% margin` :
                'No sales'}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90">ROI %</p>
              <h3 className="text-3xl font-bold mb-2">
                {totalMetrics.totalSoldCostValue > 0 ?
                  `${((totalMetrics.totalProfit / totalMetrics.totalSoldCostValue) * 100).toFixed(1)}%` :
                  '0%'}
              </h3>
            </div>
            <BarChartIcon size={24} className="opacity-90" />
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="text-xs opacity-80">
              Return on Investment
            </div>
          </div>
        </div>
      </div>

      {/* Stock Health Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-red-900">Out of Stock</h3>
              <p className="text-3xl font-bold text-red-900">
                {stockTableData.filter(p => p.remainingStock <= 0).length}
              </p>
            </div>
            <AlertTriangleIcon className="text-red-600" size={24} />
          </div>
          <p className="text-sm text-red-700">Products that need immediate restocking</p>
          <div className="mt-2 text-xs text-red-800">
            {stockTableData.filter(p => p.remainingStock <= 0).slice(0, 3).map(p => p.name).join(', ')}
            {stockTableData.filter(p => p.remainingStock <= 0).length > 3 &&
              ` +${stockTableData.filter(p => p.remainingStock <= 0).length - 3} more`}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-yellow-900">Low Stock</h3>
              <p className="text-3xl font-bold text-yellow-900">
                {stockTableData.filter(p => p.remainingStock > 0 && p.remainingStock <= p.threshold).length}
              </p>
            </div>
            <AlertTriangleIcon className="text-yellow-600" size={24} />
          </div>
          <p className="text-sm text-yellow-700">Products below reorder threshold</p>
          <div className="mt-2 text-xs text-yellow-800">
            {stockTableData.filter(p => p.remainingStock > 0 && p.remainingStock <= p.threshold)
              .slice(0, 3).map(p => p.name).join(', ')}
            {stockTableData.filter(p => p.remainingStock > 0 && p.remainingStock <= p.threshold).length > 3 &&
              ` +${stockTableData.filter(p => p.remainingStock > 0 && p.remainingStock <= p.threshold).length - 3} more`}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-green-900">In Stock</h3>
              <p className="text-3xl font-bold text-green-900">
                {stockTableData.filter(p => p.remainingStock > p.threshold).length}
              </p>
            </div>
            <CheckCircleIcon className="text-green-600" size={24} />
          </div>
          <p className="text-sm text-green-700">Products with sufficient stock levels</p>
          <div className="mt-2 text-xs text-green-800">
            {stockTableData.length} total products in inventory
          </div>
        </div>
      </div>

      {/* Stock Tracking Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Real-time Stock Tracking</h3>
              <p className="text-sm text-gray-600">Inventory levels, sales performance, and profit analysis</p>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full md:w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="hidden md:inline">Showing {filteredStockData.length} products</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>{filteredStockData.filter(p => p.hasSales).length} sold items</span>
                </div>
              </div>
            </div>
          </div>

          {/* DataTable */}
          <div className="overflow-x-auto">
            {filteredStockData.length > 0 ? (
              <DataTable
                type="stock"
                clickable={true}
                color={primaryColor}
                data={filteredStockData}
                headers={stockTableHeaders}
                actions={['view']}
                selected={selectedRows}
                selectedAction={setSelectedRows}
                customRenderCell={customRenderCell}
                pagination={true}
                itemsPerPage={15}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <svg className="mx-auto mb-4 text-gray-400" width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Match Your Filters</h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or filters.
                </p>
              </div>
            )}
          </div>

          {/* Table Summary Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-600 font-medium">Initial Stock</p>
                <p className="text-lg font-bold text-blue-900">{totalMetrics.totalInitialStock.toLocaleString()} units</p>
                <p className="text-xs text-blue-700">{formatCurrency(totalMetrics.totalCostValue)} value</p>
              </div>

              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-green-600 font-medium">Sold Stock</p>
                <p className="text-lg font-bold text-green-900">{totalMetrics.totalSold.toLocaleString()} units</p>
                <p className="text-xs text-green-700">{formatCurrency(totalMetrics.totalRevenue)} revenue</p>
              </div>

              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-purple-600 font-medium">Remaining Stock</p>
                <p className="text-lg font-bold text-purple-900">{totalMetrics.totalRemaining.toLocaleString()} units</p>
                <p className="text-xs text-purple-700">{formatCurrency(totalMetrics.totalRemainingCostValue)} value</p>
              </div>

              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-orange-600 font-medium">Total Profit</p>
                <p className="text-lg font-bold text-orange-900">{formatCurrency(totalMetrics.totalProfit)}</p>
                <p className="text-xs text-orange-700">
                  {totalMetrics.totalRevenue > 0 ?
                    `${((totalMetrics.totalProfit / totalMetrics.totalRevenue) * 100).toFixed(1)}% margin` :
                    'No sales'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Missing BarChartIcon component
const BarChartIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="20" x2="12" y2="10"></line>
    <line x1="18" y1="20" x2="18" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="16"></line>
  </svg>
);

export default ProductsDashboard;