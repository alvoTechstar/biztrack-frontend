import React, { useState, useEffect, useMemo, useCallback } from "react";
import StockSummaryCards from "./StockSummaryCards";
import ProductControls from "./ProductControls";
import ProductsTable from "./ProductsTable";
import ProductFormModal from "./ProductFormModal";
import RestockProductModal from "./RestockProductModal";
import DeleteConfirmationModal from "../../../../../components/modal/DeleteConfirmationModal";
import ContentLoader from "../../../../../components/Loader/ContentLoader";
import { useTheme } from "../../../../../components/theme/ThemeContext";
import { GET, POST, PUT, DELETE } from "../../../../../services/DatabaseServiceImp";
import URLS from "../../../../../utilities/Endpoints";
import Toaster from "../../../../../components/Toaster";
import { Package } from "lucide-react";
import { useSelector } from "react-redux";

export default function StockManagementPage() {
  const { primaryColor } = useTheme();
  const currentUser = useSelector((state) => state.auth?.value);

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
  const [errorMessage, setErrorMessage] = useState(null);

  // Modal states
  const [showProductFormModal, setShowProductFormModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [productFormMode, setProductFormMode] = useState("add");

  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading products...");
  const [loadedText, setLoadedText] = useState("");

  const [modalLoading, setModalLoading] = useState(false);
  const [modalLoadingText, setModalLoadingText] = useState("");

  const [operationLoading, setOperationLoading] = useState(false);
  const [operationLoadingText, setOperationLoadingText] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Toaster state
  const [toaster, setToaster] = useState({
    open: false,
    state: null,
    title: "",
    message: "",
    position: "right",
  });

  // Extract business information from user
  useEffect(() => {
    if (currentUser) {
      const userBusinessId = currentUser.businessId || currentUser.businessID;
      const userBusinessUUID = currentUser.businessUUID;
      const userBusinessName = currentUser.businessName;

      if (userBusinessId) {
        // IMPORTANT: Use the numeric businessId (2) for API calls
        // Your backend's getProductsByBusiness function queries by businessId, not businessUUID
        setBusinessInfo({
          businessId: userBusinessId, // This should be 2 (numeric)
          businessUUID: userBusinessUUID, // This is the UUID string
          businessName: userBusinessName
        });
        
        console.log('Business info set:', {
          businessId: userBusinessId,
          businessUUID: userBusinessUUID,
          typeOfBusinessId: typeof userBusinessId,
          isNumber: !isNaN(parseInt(userBusinessId))
        });
      } else {
        setErrorMessage("No business assigned to your account. Please contact administrator.");
        setLoading(false);
      }
    }
  }, [currentUser]);

  // Toaster functions
  const showToasterMessage = useCallback((state, title, message) => {
    setToaster({
      open: true,
      state: state,
      title,
      message,
      position: "right",
    });
  }, []);

  const handleCloseToaster = useCallback(() => {
    setToaster((prev) => ({ ...prev, open: false }));
  }, []);

  // Load products
  const loadProducts = useCallback(async () => {
    if (!businessInfo.businessId) {
      console.log('No businessId available');
      return;
    }

    setLoading(true);
    setLoadingText("Loading products...");
    setLoadedText("");
    setErrorMessage(null);

    try {
      // Use the numeric businessId (2) for the endpoint
      // Your backend expects: /api/products/business/2
      const endpoint = URLS.PRODUCTS.GET_PRODUCTS_BY_BUSINESS.replace(':businessId', businessInfo.businessId);
      console.log('Fetching from endpoint:', endpoint);
      
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

      console.log(`Loaded ${fetchedProducts.length} products`);
      setProducts(fetchedProducts);
      setLoadedText(`${fetchedProducts.length} products loaded successfully`);
      setTimeout(() => setLoading(false), 500);

    } catch (error) {
      console.error('Error fetching products:', error);
      
      let userFriendlyMessage = 'Failed to load products';
      
      if (error.message.includes('500')) {
        userFriendlyMessage = 'Server error. Please check the backend logs.';
        console.error('Server 500 error. This might be due to:');
        console.error('1. MongoDB connection issue');
        console.error('2. Populate error with createdBy field');
        console.error('3. Database query error');
      } else if (error.message.includes('Network Error')) {
        userFriendlyMessage = 'Network error. Please check your connection.';
      } else {
        userFriendlyMessage = error.message || 'Failed to load products';
      }
      
      setErrorMessage(userFriendlyMessage);
      setProducts([]);
      setLoadedText("Failed to load products");
      setLoading(false);
      showToasterMessage("error", "Load Error", userFriendlyMessage);
    }
  }, [businessInfo, showToasterMessage]);

  // Load products when businessId changes
  useEffect(() => {
    if (businessInfo.businessId) {
      console.log('BusinessId available, loading products...');
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
  }, [products, searchTerm, selectedItems, sortField, sortDirection, categories]);

  // Modal handlers
  const openModalWithLoader = async (modalType, product = null) => {
    setModalLoading(true);

    switch (modalType) {
      case 'edit':
        setModalLoadingText("Loading product details...");
        break;
      case 'restock':
        setModalLoadingText("Loading restock form...");
        break;
      case 'add':
        setModalLoadingText("Loading product form...");
        break;
      default:
        setModalLoadingText("Loading...");
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    if (product) {
      setCurrentProduct(product);
    } else {
      setCurrentProduct(null);
    }

    setModalLoading(false);

    switch (modalType) {
      case 'edit':
        setProductFormMode("edit");
        setShowProductFormModal(true);
        break;
      case 'restock':
        setShowRestockModal(true);
        break;
      case 'add':
        setProductFormMode("add");
        setShowProductFormModal(true);
        break;
    }
  };

  const openDeleteModalWithLoader = async (product) => {
    setModalLoading(true);
    setModalLoadingText("Preparing to delete product...");

    await new Promise(resolve => setTimeout(resolve, 300));

    setProductToDelete(product);
    setShowDeleteModal(true);
    setModalLoading(false);
  };

  // Open modal functions
  const handleEdit = (product) => {
    if (!product) return;

    const validProduct = {
      _id: product._id || product.id,
      id: product.id || product._id,
      name: product.name || '',
      sku: product.sku || '',
      category: product.category || '',
      stock: product.stock || 0,
      unit: product.unit || '',
      buyingPrice: product.buyingPrice || 0,
      price: product.price || 0,
      threshold: product.threshold || 0,
      businessId: product.businessId || businessInfo.businessId,
      businessUUID: product.businessUUID || businessInfo.businessUUID,
    };
    
    openModalWithLoader('edit', validProduct);
  };

  const handleRestock = (product) => openModalWithLoader('restock', product);
  const handleAddProductClick = () => openModalWithLoader('add');
  const handleDeleteProductClick = (product) => openDeleteModalWithLoader(product);

  const closeAllModals = () => {
    setShowProductFormModal(false);
    setShowRestockModal(false);
    setShowDeleteModal(false);
    setCurrentProduct(null);
    setProductToDelete(null);
    setErrorMessage(null);
  };

  // API Operations
  const saveEditedProduct = async (productData) => {
    setSubmitting(true);
    setOperationLoading(true);
    setOperationLoadingText("Updating product...");
    setErrorMessage(null);

    try {
      const productId = productData._id || productData.id;
      const updateEndpoint = URLS.PRODUCTS.UPDATE_PRODUCT.replace(':id', productId);
      
      // Include businessUUID in update data
      const updateData = {
        ...productData,
        businessUUID: businessInfo.businessUUID
      };
      
      const response = await PUT(updateEndpoint, updateData);

      if (response.success) {
        const updatedProductFromServer = response.product;

        setProducts(prevProducts =>
          prevProducts.map(p =>
            p._id === productData._id ? {
              ...updatedProductFromServer,
              id: updatedProductFromServer._id,
              _id: updatedProductFromServer._id
            } : p
          )
        );

        setOperationLoadingText("Product updated successfully!");
        await new Promise(resolve => setTimeout(resolve, 1500));

        closeAllModals();
        showToasterMessage("success", "Success", response.message || "Product updated successfully");
      } else {
        throw new Error(response.message || 'Failed to update product');
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update product');
      showToasterMessage("error", "Update Error", error.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
      setOperationLoading(false);
    }
  };

  const saveRestockedProduct = async (restockData) => {
    setSubmitting(true);
    setOperationLoading(true);
    setOperationLoadingText("Restocking product...");
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

        setOperationLoadingText("Product restocked successfully!");
        await new Promise(resolve => setTimeout(resolve, 1500));

        closeAllModals();
        showToasterMessage("success", "Success", response.message || "Product restocked successfully");
      } else {
        throw new Error(response.message || 'Failed to restock product');
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to restock product');
      showToasterMessage("error", "Restock Error", error.message || 'Failed to restock product');
    } finally {
      setSubmitting(false);
      setOperationLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setSubmitting(true);
    setOperationLoading(true);
    setOperationLoadingText("Deleting product...");
    setErrorMessage(null);

    try {
      const productId = productToDelete._id || productToDelete.id;
      const deleteEndpoint = URLS.PRODUCTS.DELETE_PRODUCT.replace(':id', productId);
      const response = await DELETE(deleteEndpoint);

      if (response.success) {
        setProducts(prevProducts =>
          prevProducts.filter(p => p._id !== productToDelete._id)
        );

        setOperationLoadingText("Product deleted successfully!");
        await new Promise(resolve => setTimeout(resolve, 1500));

        closeAllModals();
        showToasterMessage("success", "Success", response.message || "Product deleted successfully");
      } else {
        throw new Error(response.message || 'Failed to delete product');
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to delete product');
      showToasterMessage("error", "Delete Error", error.message || 'Failed to delete product');
    } finally {
      setSubmitting(false);
      setOperationLoading(false);
    }
  };

  const handleSaveNewProduct = async (newProductData) => {
    setSubmitting(true);
    setOperationLoading(true);
    setOperationLoadingText("Adding new product...");
    setErrorMessage(null);

    try {
      const productData = {
        name: String(newProductData.name || '').trim(),
        sku: String(newProductData.sku || '').trim().toUpperCase(),
        category: String(newProductData.category || '').trim(),
        stock: parseInt(newProductData.stock) || 0,
        unit: String(newProductData.unit || '').trim(),
        buyingPrice: parseFloat(newProductData.buyingPrice) || 0,
        price: parseFloat(newProductData.price) || 0,
        threshold: parseInt(newProductData.threshold) || 0,
        businessId: businessInfo.businessId, // Use numeric businessId (2)
        businessUUID: businessInfo.businessUUID // Also include businessUUID
      };

      const createEndpoint = URLS.PRODUCTS.CREATE_PRODUCT;
      const response = await POST(createEndpoint, productData);

      if (response.success) {
        const newProductFromServer = response.product;

        setProducts(prevProducts => [...prevProducts, {
          ...newProductFromServer,
          id: newProductFromServer._id,
          _id: newProductFromServer._id
        }]);

        setOperationLoadingText("Product added successfully!");
        await new Promise(resolve => setTimeout(resolve, 1500));

        closeAllModals();
        showToasterMessage("success", "Success", response.message || "Product added successfully");
      } else {
        throw new Error(response.message || 'Failed to add product');
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to add product');
      showToasterMessage("error", "Add Error", error.message || "Failed to add product");
    } finally {
      setSubmitting(false);
      setOperationLoading(false);
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

  // Loading states
  if (operationLoading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className='main-app-view'>
            <div className="main-app-content-container">
              <ContentLoader
                state={true}
                loading={true}
                loadingText={operationLoadingText}
                loadedText=""
                color={primaryColor}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (modalLoading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className='main-app-view'>
            <div className="main-app-content-container">
              <ContentLoader
                state={true}
                loading={true}
                loadingText={modalLoadingText}
                loadedText=""
                color={primaryColor}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!businessInfo.businessId && !loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-500 text-xl mb-4">Business Not Available</div>
            <div className="text-gray-600 mb-6">
              Unable to load products. Your account is not associated with any business.
              {errorMessage && <div className="mt-2 text-sm">{errorMessage}</div>}
            </div>
            <button
              onClick={handleRetry}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className='main-app-view'>
            <div className="main-app-content-container">
              <ContentLoader
                state={true}
                loading={true}
                loadingText={loadingText}
                loadedText={loadedText}
                color={primaryColor}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if any modal is open
  const isAnyModalOpen = showProductFormModal || showRestockModal || showDeleteModal;

  if (isAnyModalOpen) {
    return (
      <>
        {showProductFormModal && (
          <ProductFormModal
            show={showProductFormModal}
            mode={productFormMode}
            product={currentProduct}
            onClose={closeAllModals}
            onSave={productFormMode === "edit" ? saveEditedProduct : handleSaveNewProduct}
            categories={categories}
            businessId={businessInfo.businessId}
            businessUUID={businessInfo.businessUUID}
          />
        )}

        {showRestockModal && (
          <RestockProductModal
            show={showRestockModal}
            product={currentProduct}
            onClose={closeAllModals}
            onSave={saveRestockedProduct}
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
          />
        )}

        <Toaster
          open={toaster.open}
          state={toaster.state}
          title={toaster.title}
          message={toaster.message}
          position={toaster.position}
          action={handleCloseToaster}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white p-2">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 p-2">
        Stock Management
        {businessInfo.businessName && (
          <span className="text-lg font-normal text-gray-600 ml-2">
            - {businessInfo.businessName}
          </span>
        )}
      </h1>

      <div className="min-h-screen bg-white p-2">
        {/* Empty state */}
        {products.length === 0 && !loading && !errorMessage ? (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <Package size={64} className="text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first product</p>
            <button
              onClick={handleAddProductClick}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Add Product
            </button>
          </div>
        ) : (
          <>
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <p className="text-red-800">{errorMessage}</p>
              </div>
            )}

            <StockSummaryCards
              totalProducts={products.length}
              lowStockCount={lowStockCount}
              outOfStockCount={outOfStockCount}
            />

            <ProductControls
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              categories={categories}
              onAddProduct={handleAddProductClick}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
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

        <Toaster
          open={toaster.open}
          state={toaster.state}
          title={toaster.title}
          message={toaster.message}
          position={toaster.position}
          action={handleCloseToaster}
        />
      </div>
    </div>
  );
}