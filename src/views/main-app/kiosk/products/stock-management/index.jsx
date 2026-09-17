import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import StockSummaryCards from "./StockSummaryCards";
import ProductControls from "./ProductControls";
import ProductsTable from "./ProductsTable";
import RestockProductModal from "./RestockProductModal";
import DeleteConfirmationModal from "../../../../../components/modal/DeleteConfirmationModal";
import ContentLoader from "../../../../../components/Loader/ContentLoader";
import { useTheme } from "../../../../../components/theme/ThemeContext";
import { GET, PUT, DELETE } from "../../../../../services/DatabaseServiceImp";
import URLS from "../../../../../utilities/Endpoints";
import Toaster from "../../../../../components/Toaster";
import { Package } from "lucide-react";
import { useSelector } from "react-redux";

dayjs.extend(customParseFormat);

export default function StockManagementPage() {
  const { primaryColor } = useTheme();
  const currentUser = useSelector((state) => state.auth?.value);
  const navigate = useNavigate();
  const location = useLocation();

  // Business information from user data
  const [businessInfo, setBusinessInfo] = useState({
    businessId: null,
    businessUUID: null,
    businessName: null
  });

  // Data states
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedItems, setSelectedItems] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [errorMessage, setErrorMessage] = useState(null);

  // Modal states
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading products...");
  const [loadedText, setLoadedText] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Toaster state
  const [toaster, setToaster] = useState({
    open: false,
    state: 'true',
    title: '',
    message: '',
  });

  // Toaster functions
  const showToasterMessage = useCallback((state, title, message) => {
    setToaster({
      open: true,
      state: state ? 'true' : 'false',
      title,
      message,
    });
  }, []);

  const handleCloseToaster = useCallback(() => {
    setToaster((prev) => ({ ...prev, open: false }));
  }, []);

  useEffect(() => {
    if (location.state?.toast) {
      const { state, title, message } = location.state.toast;
      showToasterMessage(state, title, message);
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Extract business information from user
  useEffect(() => {
    if (currentUser) {
      const userBusinessId = currentUser.businessId || currentUser.businessID;
      const userBusinessUUID = currentUser.businessUUID;
      const userBusinessName = currentUser.businessName;

      if (userBusinessId) {
        setBusinessInfo({
          businessId: Number(userBusinessId),
          businessUUID: userBusinessUUID,
          businessName: userBusinessName
        });
      } else {
        setErrorMessage("No business assigned to your account. Please contact administrator.");
        setLoading(false);
      }
    }
  }, [currentUser]);

  // Load products
  const loadProducts = useCallback(async () => {
    if (!businessInfo.businessId) {
      return;
    }

    setLoading(true);
    setLoadingText("Loading products...");
    setLoadedText("");
    setErrorMessage(null);

    try {
      const endpoint = URLS.PRODUCTS.GET_PRODUCTS_BY_BUSINESS.replace(':businessId', businessInfo.businessId);

      const result = await GET(endpoint);

      if (!result) {
        throw new Error('No response from server');
      }

      if (result.success === false) {
        throw new Error(result.message || 'Failed to load products');
      }

      const productData = result.products || result.data || [];

      if (productData.length === 0) {
        setProducts([]);
        setLoadedText("No products found. Add your first product!");
        setLoading(false);
        return;
      }

      const fetchedProducts = productData.map(product => {
        const stock = Number(product.stock) || 0;
        const threshold = Number(product.threshold) || 0;
        let status = 'Out of Stock';

        if (stock > 0) {
          status = stock > threshold ? 'In Stock' : 'Low Stock';
        }

        return {
          id: product._id?.toString() || product.id,
          _id: product._id || product.id,
          name: product.name || '',
          sku: product.sku || '',
          category: product.category || '',
          stock: stock,
          unit: product.unit || 'units',
          buyingPrice: Number(product.buyingPrice) || 0,
          price: Number(product.price) || 0,
          threshold: threshold,
          status: product.status || status,
          description: product.description || '',
          businessId: product.businessId || businessInfo.businessId,
          businessUUID: product.businessUUID || businessInfo.businessUUID,
          createdAt: product.createdAt || new Date().toISOString(),
          updatedAt: product.updatedAt || new Date().toISOString(),
        };
      });

      setProducts(fetchedProducts);
      setLoadedText(`${fetchedProducts.length} products loaded successfully`);
      showToasterMessage(true, 'Success', 'Products loaded successfully');

      setTimeout(() => {
        setLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Error fetching products:', error);

      let userFriendlyMessage = 'Failed to load products';

      if (error.message.includes('500')) {
        userFriendlyMessage = 'Server error. Please check the backend logs.';
      } else if (error.message.includes('Network Error')) {
        userFriendlyMessage = 'Network error. Please check your connection.';
      } else {
        userFriendlyMessage = error.message || 'Failed to load products';
      }

      setErrorMessage(userFriendlyMessage);
      setProducts([]);
      setLoadedText("Failed to load products");
      showToasterMessage(false, 'Error', userFriendlyMessage);
      
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [businessInfo, showToasterMessage]);

  // Load products when businessId changes
  useEffect(() => {
    if (businessInfo.businessId) {
      loadProducts();
    }
  }, [businessInfo.businessId, loadProducts]);

  // Categories from products
  const categories = useMemo(() => {
    return [...new Set(products.map((product) => product.category).filter(Boolean))];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedItems.length > 0) {
      filtered = filtered.filter((product) => {
        return selectedItems.some(selected => {
          if (['In Stock', 'Low Stock', 'Out of Stock'].includes(selected)) {
            return product.status === selected;
          }
          if (categories.includes(selected)) {
            return product.category === selected;
          }
          return false;
        });
      });
    }

    if (dateRange.startDate && dateRange.endDate) {
      const start = dayjs(dateRange.startDate, 'DD-MM-YYYY').startOf('day');
      const end = dayjs(dateRange.endDate, 'DD-MM-YYYY').endOf('day');
      filtered = filtered.filter((product) => {
        const created = dayjs(product.createdAt);
        return created.isValid() && !created.isBefore(start) && !created.isAfter(end);
      });
    }

    return filtered.sort((a, b) => {
      if (
        sortField === "stock" ||
        sortField === "price" ||
        sortField === "threshold" ||
        sortField === "buyingPrice"
      ) {
        return sortDirection === "asc"
          ? (a[sortField] || 0) - (b[sortField] || 0)
          : (b[sortField] || 0) - (a[sortField] || 0);
      } else {
        const aValue = a[sortField] || '';
        const bValue = b[sortField] || '';
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    });
  }, [products, searchTerm, selectedItems, dateRange, sortField, sortDirection, categories]);

  // Modal handlers
  const handleEdit = (product) => {
    if (!product) return;
    navigate(`/products/stock-management/${product._id || product.id}/edit`);
  };

  const handleRestock = (product) => {
    setCurrentProduct(product || null);
    setShowRestockModal(true);
  };

  const handleAddProductClick = () => navigate('/products/stock-management/new');

  const handleDeleteProductClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const closeAllModals = () => {
    setShowRestockModal(false);
    setShowDeleteModal(false);
    setCurrentProduct(null);
    setProductToDelete(null);
    setErrorMessage(null);
  };

  const saveRestockedProduct = async (restockData) => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const productId = restockData._id || restockData.id;
      const updateData = { stock: restockData.stock };

      const restockEndpoint = URLS.PRODUCTS.UPDATE_STOCK.replace(':id', productId);
      const response = await PUT(restockEndpoint, updateData);

      if (response.success) {
        const updatedProductFromServer = response.product;

        setProducts(prevProducts =>
          prevProducts.map(p =>
            p._id === restockData._id ? {
              ...p,
              ...updatedProductFromServer,
              id: updatedProductFromServer._id,
              _id: updatedProductFromServer._id,
              stock: updatedProductFromServer.stock,
              status: updatedProductFromServer.status
            } : p
          )
        );

        showToasterMessage(true, 'Success', response.message || "Product restocked successfully");
        closeAllModals();
      } else {
        // Show error but keep the modal open for retry
        setErrorMessage(response.message || 'Failed to restock product');
        showToasterMessage(false, 'Restock Error', response.message || 'Failed to restock product');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to restock product';
      setErrorMessage(errorMsg);
      showToasterMessage(false, 'Restock Error', errorMsg);
      // Keep the modal open for retry
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const productId = productToDelete._id || productToDelete.id;
      const deleteEndpoint = URLS.PRODUCTS.DELETE_PRODUCT.replace(':id', productId);
      const response = await DELETE(deleteEndpoint);

      if (response.success) {
        setProducts(prevProducts =>
          prevProducts.filter(p => p._id !== productToDelete._id)
        );

        showToasterMessage(true, 'Success', response.message || "Product deleted successfully");
        closeAllModals();
      } else {
        // Show error but keep the modal open for retry
        setErrorMessage(response.message || 'Failed to delete product');
        showToasterMessage(false, 'Delete Error', response.message || 'Failed to delete product');
      }
    } catch (error) {
      // Show error but keep the modal open for retry
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete product';
      setErrorMessage(errorMsg);
      showToasterMessage(false, 'Delete Error', errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleRetry = () => {
    setLoading(true);
    loadProducts();
  };

  // Stats
  const lowStockCount = products.filter((p) => p.status === "Low Stock").length;
  const outOfStockCount = products.filter((p) => p.status === "Out of Stock").length;

  // No Business ID State
  if (!businessInfo.businessId && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-xl mb-4">Business Not Available</div>
          <div className="text-gray-600 mb-6">
            Unable to load products. Your account is not associated with any business.
            {errorMessage && <div className="mt-2 text-sm">{errorMessage}</div>}
          </div>
          <button
            onClick={handleRetry}
            className="text-white px-6 py-2 rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: primaryColor || '#3b82f6' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Initial Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ContentLoader
          state={true}
          loading={true}
          loadingText={loadingText}
          loadedText={loadedText}
          color={primaryColor}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster
        open={toaster.open}
        state={toaster.state}
        title={toaster.title}
        message={toaster.message}
        action={handleCloseToaster}
        position="right"
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7 md:py-8">
        <header className="flex items-center gap-3 mb-6 sm:mb-8">
          <div
            className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl text-white shadow-sm shrink-0"
            style={{ backgroundColor: primaryColor || '#3b82f6' }}
          >
            <Package size={22} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
              Stock Management
            </h1>
            {businessInfo.businessName && (
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{businessInfo.businessName}</p>
            )}
          </div>
        </header>

        {/* Empty state */}
        {products.length === 0 && !loading && !errorMessage ? (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <Package size={64} className="text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first product</p>
            <button
              onClick={handleAddProductClick}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-opacity hover:opacity-90 font-medium"
              style={{ backgroundColor: primaryColor || '#3b82f6' }}
            >
              Add Product
            </button>
          </div>
        ) : (
          <>
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-red-800">{errorMessage}</p>
              </div>
            )}

            <div className="mb-6 sm:mb-8">
              <StockSummaryCards
                totalProducts={products.length}
                lowStockCount={lowStockCount}
                outOfStockCount={outOfStockCount}
              />
            </div>

            <ProductControls
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              categories={categories}
              onAddProduct={handleAddProductClick}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />

            <ProductsTable
              products={filteredProducts}
              sortField={sortField}
              sortDirection={sortDirection}
              handleSort={handleSort}
              onEditProduct={handleEdit}
              onRestockProduct={handleRestock}
              onDeleteProduct={handleDeleteProductClick}
              onAddProduct={handleAddProductClick}
            />
          </>
        )}
      </div>

      {showRestockModal && (
        <RestockProductModal
          show={showRestockModal}
          product={currentProduct}
          onClose={closeAllModals}
          onSave={saveRestockedProduct}
          errorMessage={errorMessage}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmationModal
          open={showDeleteModal}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Confirm Product Deletion"
          message={`Are you sure you want to permanently delete "${productToDelete?.name || "this product"}"? This action cannot be undone.`}
          confirmText="Delete Permanently"
          cancelText="No, Keep Product"
          isLoading={submitting}
          itemName={productToDelete ? productToDelete.name : ""}
          errorMessage={errorMessage}
        />
      )}
    </div>
  );
}