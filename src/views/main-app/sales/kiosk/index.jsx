import React, { useState, useMemo, useCallback, useEffect } from "react";
import { ShoppingCart, DollarSign, Smartphone, FileText, RefreshCw } from "lucide-react";
import { useSelector } from "react-redux";
import SearchInput from "../../../../components/Input/SearchInput";
import { useNavigate } from "react-router-dom";

// Import the new components
import ProductCard from "./ProductsCard";
import CartItem from "./CartItem";
import CashPaymentModal from "./CashPaymentModal";
import MpesaPaymentModal from "./MpesaPaymentModal";
import DebtPaymentModal from "./DebtPaymentModal";
import Toaster from "../../../../components/Toaster";
import ContentLoader from "../../../../components/Loader/ContentLoader";
import { useTheme } from "../../../../components/theme/ThemeContext";

// Import API services and endpoints
import { GET, POST, PUT } from "../../../../services/DatabaseServiceImp";
import URLS from "../../../../utilities/Endpoints";

const SalesPage = () => {
  const { primaryColor } = useTheme();
  const navigate = useNavigate();

  // Get current user from Redux store
  const currentUser = useSelector((state) => state.auth?.value);
  const token = localStorage.getItem('token');

  // Get businessId and shopkeeper info from current user
  const [userData, setUserData] = useState({
    user: null,
    businessId: null,
    businessUUID: null,
    shopkeeperInfo: null,
    initialized: false
  });

  // Separate loading states
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [quantities, setQuantities] = useState({});
  const [cart, setCart] = useState([]);

  const [productsInStock, setProductsInStock] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  // Modal states
  const [cashModal, setCashModal] = useState(false);
  const [mpesaModal, setMpesaModal] = useState(false);
  const [debtModal, setDebtModal] = useState(false);

  // Payment form states
  const [amountPaid, setAmountPaid] = useState("");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [mpesaLoading, setMpesaLoading] = useState(false);
  const [debtCustomerName, setDebtCustomerName] = useState("");
  const [debtPhone, setDebtPhone] = useState("");
  const [debtNotes, setDebtNotes] = useState("");

  // Add submitting state to prevent duplicate transactions
  const [submitting, setSubmitting] = useState(false);

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    title: "",
    message: "",
    type: "success",
  });

  // Track current transaction for M-PESA
  const [currentTransaction, setCurrentTransaction] = useState(null);

  // Utility functions
  const formatCurrency = useCallback((amount) => {
    return `KSh ${amount.toLocaleString()}`;
  }, []);

  const showNotification = useCallback((message, type = "success") => {
    let title = "";
    let stateValue = "";

    switch (type) {
      case "success":
        title = "Success!";
        stateValue = "true";
        break;
      case "error":
        title = "Error!";
        stateValue = "false";
        break;
      case "info":
        title = "Heads Up!";
        stateValue = "";
        break;
      default:
        title = "Notification";
        stateValue = "";
    }

    setNotification({ open: true, title, message, type: stateValue });
    setTimeout(
      () => setNotification((prev) => ({ ...prev, open: false })),
      3000
    );
  }, []);

  // Check authentication and extract user data
  useEffect(() => {
    console.log("🔍 Checking authentication status...");

    const authTimeout = setTimeout(() => {
      if (loadingUser) {
        console.log("⚠️ Authentication check taking too long, proceeding...");
        setLoadingUser(false);
      }
    }, 2000);

    if (!currentUser || !token) {
      console.log("❌ User not authenticated, redirecting to login");
      showNotification("Please log in to access the sales system", "error");
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      clearTimeout(authTimeout);
      return;
    }

    console.log("✅ User authenticated:", {
      id: currentUser.id,
      name: `${currentUser.firstName} ${currentUser.lastName}`,
      email: currentUser.email,
      role: currentUser.role
    });

    const businessId = currentUser.businessId;
    const businessUUID = currentUser.businessUUID;

    if (!businessId || !businessUUID) {
      console.error("❌ No business information found in user data");
      showNotification("No business assigned to your account. Please contact administrator.", "error");
      setErrorMessage("No business assigned to your account.");
      setLoadingUser(false);
      clearTimeout(authTimeout);
      return;
    }

    console.log("🏢 Business information:", {
      businessId,
      businessUUID,
      businessName: currentUser.businessName,
      businessType: currentUser.businessType
    });

    const shopkeeperInfo = {
      shopkeeperId: currentUser.id,
      shopkeeperName: `${currentUser.firstName} ${currentUser.lastName}`,
      shopkeeperEmail: currentUser.email || "",
      shopkeeperRole: currentUser.role || "Kiosk_Shopkeeper",
      businessId: businessId,
      businessUUID: businessUUID,
      businessName: currentUser.businessName,
      businessType: currentUser.businessType
    };

    console.log("👤 Derived user data:", shopkeeperInfo);

    if (currentUser.role !== "Kiosk_Shopkeeper") {
      console.warn(`⚠️ User role is ${currentUser.role}, expected Kiosk_Shopkeeper`);
      showNotification(`You don't have permission to access sales. Your role: ${currentUser.role}`, "error");
    }

    setUserData({
      user: currentUser,
      businessId,
      businessUUID,
      shopkeeperInfo,
      initialized: true
    });

    setLoadingUser(false);
    clearTimeout(authTimeout);

  }, [currentUser, token, navigate, showNotification]);

  // Load products function
  const loadProducts = useCallback(async () => {
    if (!userData.businessId || !userData.initialized) {
      console.log('⏳ Waiting for user data initialization...');
      return;
    }

    setLoadingProducts(true);
    console.log('📋 Fetching products for sales for business:', userData.businessId);

    try {
      const endpoint = URLS.PRODUCTS.GET_PRODUCTS_BY_BUSINESS.replace(':businessId', userData.businessId);
      console.log('🌐 API Endpoint:', endpoint);

      const result = await GET(endpoint);
      console.log('✅ Product API response:', result);

      if (!result || result.success === false) {
        throw new Error(result?.message || 'Failed to load products');
      }

      const productData = result.products || result.data || [];

      console.log('📦 Products data received:', productData.length, 'products');

      const fetchedProducts = productData.map(product => {
        const availableStock = product.stock || 0;

        return {
          id: product._id?.toString() || product.id,
          _id: product._id || product.id,
          name: product.name || '',
          price: product.price || 0,
          availableStock: availableStock,
          category: product.category || '',
          sku: product.sku || '',
          unit: product.unit || 'units',
          buyingPrice: product.buyingPrice || 0,
          threshold: product.threshold || 0,
          status: product.status || 'Out of Stock',
          businessId: product.businessId || userData.businessId,
          businessUUID: product.businessUUID || userData.businessUUID
        };
      });

      console.log('✅ Transformed products for sales:', fetchedProducts.length, 'products');

      const availableProducts = fetchedProducts.filter(p => p.availableStock > 0);
      console.log('🛒 Available products for sale:', availableProducts.length);

      setProductsInStock(availableProducts);

    } catch (error) {
      console.error('❌ Error fetching products for sales:', error);
      setErrorMessage(error.message || 'Failed to load products');
      setProductsInStock([]);
      showNotification("Failed to load products. Please try again.", "error");
    } finally {
      setLoadingProducts(false);
    }
  }, [userData, showNotification]);

  // Load products when user data is available
  useEffect(() => {
    console.log('🔄 useEffect for loading products triggered');
    console.log('User data state:', {
      businessId: userData.businessId,
      initialized: userData.initialized,
      loadingProducts
    });

    if (userData.businessId && userData.initialized) {
      console.log('✅ User data ready, loading products...');
      loadProducts();
    } else {
      console.log('⏳ Waiting for user data to be ready...');
    }
  }, [userData.businessId, userData.initialized, loadProducts]);

  // Refresh products function
  const refreshProducts = useCallback(async () => {
    console.log('🔄 Refreshing products...');
    await loadProducts();
    showNotification("Products refreshed successfully", "success");
  }, [loadProducts, showNotification]);

  // Render refresh button function
  const renderRefreshButton = useCallback(() => (
    <button
      onClick={refreshProducts}
      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
      title="Refresh products"
    >
      <RefreshCw className="h-4 w-4" />
      <span className="text-sm font-medium">Refresh</span>
    </button>
  ), [refreshProducts]);

  // Save transaction to backend
  const saveTransaction = useCallback(async (transactionData) => {
    try {
      console.log('💾 Saving transaction:', transactionData);

      if (!userData.shopkeeperInfo) {
        throw new Error('No shopkeeper information available. Please ensure you are logged in.');
      }

      if (!userData.businessId || !userData.businessUUID) {
        throw new Error('No business assigned to your account.');
      }

      const transactionWithShopkeeper = {
        ...transactionData,
        businessId: userData.businessId,
        businessUUID: userData.businessUUID,
        businessName: userData.shopkeeperInfo.businessName,
        businessType: userData.shopkeeperInfo.businessType,
        timestamp: new Date().toISOString(),
        shopkeeperId: userData.shopkeeperInfo.shopkeeperId,
        shopkeeperName: userData.shopkeeperInfo.shopkeeperName,
        shopkeeperEmail: userData.shopkeeperInfo.shopkeeperEmail,
        shopkeeperRole: userData.shopkeeperInfo.shopkeeperRole
      };

      console.log('👤 Transaction with shopkeeper:', transactionWithShopkeeper);

      if (!URLS.TRANSACTIONS?.CREATE_TRANSACTION) {
        console.warn('⚠️ Transactions endpoint not configured. Saving to local state only.');

        const mockTransaction = {
          ...transactionWithShopkeeper,
          _id: `mock_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        return mockTransaction;
      }

      const response = await POST(URLS.TRANSACTIONS.CREATE_TRANSACTION, transactionWithShopkeeper);

      console.log('✅ Transaction save response:', response);

      if (response.success) {
        console.log('✅ Transaction saved successfully:', response.transaction);
        return response.transaction;
      } else {
        console.warn('⚠️ Transaction save returned success:false', response);
        return {
          ...transactionWithShopkeeper,
          _id: response.transaction?._id || `temp_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('❌ Error saving transaction:', error);

      return {
        ...transactionData,
        _id: `error_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        saveError: true,
        errorMessage: error.message
      };
    }
  }, [userData]);

  // Find product in current products list by ID
  const findProductInList = useCallback((productId) => {
    return productsInStock.find(p => p.id === productId || p._id === productId);
  }, [productsInStock]);

  // Update product stock
  const updateProductStock = useCallback(async (cartItems, isMpesa = false) => {
    try {
      console.log(`📦 Updating stock for ${cartItems.length} products, M-PESA: ${isMpesa}`);

      if (!URLS.PRODUCTS?.UPDATE_STOCK) {
        console.warn('⚠️ Stock update endpoint not configured');
        return { success: true, message: 'Local update only' };
      }

      const updatePromises = cartItems.map(async (item) => {
        try {
          const currentProduct = findProductInList(item.id);

          if (!currentProduct) {
            throw new Error(`Product ${item.name} not found in local inventory`);
          }

          const currentStock = currentProduct.availableStock || 0;
          const newStock = currentStock - item.quantity;

          if (newStock < 0) {
            throw new Error(`Insufficient stock for ${item.name}. Current: ${currentStock}, Requested: ${item.quantity}`);
          }

          const productId = currentProduct._id || currentProduct.id;
          if (!productId) {
            throw new Error(`Product ${item.name} has no ID`);
          }

          const updateEndpoint = URLS.PRODUCTS.UPDATE_STOCK.replace(':id', productId);

          const updateData = {
            stock: newStock
          };

          console.log(`📊 Updating ${item.name}: stock ${currentStock} -> ${newStock} (sold ${item.quantity} ${item.unit || 'units'})`);

          const result = await PUT(updateEndpoint, updateData);

          if (!result.success) {
            console.error(`❌ Stock update failed for ${item.name}:`, result.message);
            return {
              success: false,
              product: item.name,
              message: result.message
            };
          }

          const newStatus = result.product?.status ||
            (newStock <= 0 ? 'Out of Stock' :
              newStock <= (currentProduct.threshold || 10) ? 'Low Stock' : 'In Stock');

          setProductsInStock(prev =>
            prev.map(p =>
              p.id === item.id
                ? {
                  ...p,
                  availableStock: newStock,
                  status: newStatus
                }
                : p
            )
          );

          return {
            success: true,
            product: item.name,
            oldStock: currentStock,
            newStock: newStock
          };

        } catch (itemError) {
          console.error(`❌ Error updating stock for ${item.name}:`, itemError);
          return {
            success: false,
            product: item.name,
            message: itemError.message
          };
        }
      });

      const results = await Promise.all(updatePromises);

      const successfulUpdates = results.filter(r => r.success);
      const failedUpdates = results.filter(r => !r.success);

      console.log(`✅ ${successfulUpdates.length}/${results.length} stock updates successful`);

      if (failedUpdates.length > 0) {
        console.warn('⚠️ Some stock updates failed:', failedUpdates);
        return {
          success: false,
          message: `${failedUpdates.length} products failed to update`,
          details: failedUpdates
        };
      }

      return {
        success: true,
        message: `Stock updated for ${successfulUpdates.length} products`
      };

    } catch (error) {
      console.error('❌ Error in updateProductStock:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }, [findProductInList]);

  // Generate transaction ID
  const generateTransactionId = useCallback(() => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TXN${timestamp.slice(-6)}${random}`;
  }, []);

  // Filter products based on search term and current stock
  const filteredProducts = useMemo(() => {
    return productsInStock.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, productsInStock]);

  // Calculate total amount in cart
  const totalAmount = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  // Calculate total items in cart (with units)
  const cartSummary = useMemo(() => {
    if (cart.length === 0) return "Empty cart";

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Group by unit for better display
    const unitGroups = cart.reduce((groups, item) => {
      const unit = item.unit || "units";
      if (!groups[unit]) {
        groups[unit] = 0;
      }
      groups[unit] += item.quantity;
      return groups;
    }, {});

    const parts = Object.entries(unitGroups).map(([unit, qty]) => {
      return `${qty} ${unit}`;
    });

    return parts.join(", ");
  }, [cart]);

  // Cart handlers
  const handleQuantityChange = useCallback(
    (productId, value) => {
      if (value === "") {
        setQuantities((prev) => ({
          ...prev,
          [productId]: "",
        }));
        return;
      }

      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > 0) {
        const productInStock = productsInStock.find((p) => p.id === productId);

        if (productInStock && numValue > productInStock.availableStock) {
          showNotification(
            `Only ${productInStock.availableStock} ${productInStock.unit} of ${productInStock.name} available.`,
            "error"
          );
          setQuantities((prev) => ({
            ...prev,
            [productId]: productInStock.availableStock,
          }));
          return;
        }

        setQuantities((prev) => ({
          ...prev,
          [productId]: numValue,
        }));
      }
    },
    [productsInStock, showNotification]
  );

  const addToCart = useCallback(
    async (product) => {
      try {
        const quantityToAdd = quantities[product.id] || 1;

        console.log(`🛒 Adding to cart: ${quantityToAdd} ${product.unit || 'units'} of ${product.name}, Current stock: ${product.availableStock}`);

        if (quantityToAdd <= 0) {
          showNotification("Please enter a valid quantity", "error");
          return;
        }

        const productInInventory = findProductInList(product.id);

        if (!productInInventory) {
          showNotification(`${product.name} is no longer available!`, "error");
          return;
        }

        if (productInInventory.availableStock <= 0) {
          showNotification(`${product.name} is out of stock!`, "error");
          return;
        }

        if (quantityToAdd > productInInventory.availableStock) {
          showNotification(
            `Only ${productInInventory.availableStock} ${productInInventory.unit || 'units'} of ${productInInventory.name} available.`,
            "error"
          );

          setQuantities((prev) => ({
            ...prev,
            [product.id]: productInInventory.availableStock,
          }));
          return;
        }

        const currentCartItem = cart.find((item) => item.id === product.id);
        const currentQuantityInCart = currentCartItem ? currentCartItem.quantity : 0;
        const totalQuantityInCartAfterAdd = currentQuantityInCart + quantityToAdd;

        if (totalQuantityInCartAfterAdd > productInInventory.availableStock) {
          const availableToAdd = productInInventory.availableStock - currentQuantityInCart;
          showNotification(
            `Cannot add ${quantityToAdd} ${product.unit || 'units'}. Only ${availableToAdd} more available.`,
            "error"
          );
          return;
        }

        setCart((prev) => {
          if (currentCartItem) {
            return prev.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantityToAdd }
                : item
            );
          } else {
            return [...prev, {
              ...product,
              quantity: quantityToAdd,
              availableStock: productInInventory.availableStock
            }];
          }
        });

        setQuantities((prev) => ({ ...prev, [product.id]: 1 }));

        showNotification(
          `${quantityToAdd} ${product.unit || 'units'} of ${product.name} added to cart`,
          "success"
        );

      } catch (error) {
        console.error('❌ Error adding to cart:', error);
        showNotification("Failed to add item to cart", "error");
      }
    },
    [cart, quantities, productsInStock, showNotification, findProductInList]
  );

  const updateCartQuantity = useCallback(
    (productId, newQuantity) => {
      const currentCartItem = cart.find((item) => item.id === productId);
      if (!currentCartItem) return;

      if (newQuantity <= 0) {
        setCart((prev) => prev.filter((item) => item.id !== productId));
        showNotification("Item removed from cart", "info");
        return;
      }

      const productInInventory = findProductInList(productId);
      if (productInInventory && newQuantity > productInInventory.availableStock) {
        showNotification(
          `Cannot set quantity to ${newQuantity} ${productInInventory.unit || 'units'}. Only ${productInInventory.availableStock} available.`,
          "error"
        );
        return;
      }

      setCart((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    },
    [cart, showNotification, findProductInList]
  );

  const removeFromCart = useCallback(
    (productId) => {
      setCart((prev) => prev.filter((item) => item.id !== productId));
      showNotification("Item removed from cart", "info");
    },
    [showNotification]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setQuantities({});
    showNotification("Cart cleared", "info");
  }, [showNotification]);

  const handleSearch = useCallback((searchValue) => {
    setSearchTerm(searchValue);
  }, []);

  // Phone validation
  const validatePhone = useCallback((phone) => {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length < 9) {
      return { isValid: false, message: 'Phone number too short' };
    }

    if (!/^(07|01|2547|2541|7|1)/.test(cleaned)) {
      return { isValid: false, message: 'Invalid Kenyan number format' };
    }

    return { isValid: true, message: 'Valid phone number' };
  }, []);

  // Payment handlers
  const handleCashPayment = useCallback(async () => {
    if (submitting || cart.length === 0) return;

    setSubmitting(true);

    try {
      const paidAmount = parseFloat(amountPaid);
      if (isNaN(paidAmount) || paidAmount <= 0) {
        showNotification("Please enter a valid amount", "error");
        setSubmitting(false);
        return;
      }

      if (paidAmount < totalAmount) {
        showNotification(`Amount paid (${formatCurrency(paidAmount)}) is less than total amount (${formatCurrency(totalAmount)})`, "error");
        setSubmitting(false);
        return;
      }

      const change = paidAmount - totalAmount;

      const transactionData = {
        transactionId: generateTransactionId(),
        type: "sale",
        status: "completed",
        paymentStatus: "paid",
        totalAmount: totalAmount,
        amountPaid: paidAmount,
        change: change,
        paymentMethod: "cash",
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unit: item.unit || 'units',
          unitPrice: item.price,
          totalPrice: item.price * item.quantity
        })),
        customerName: "Walk-in Customer",
        customerPhone: "",
        notes: `Cash payment. Paid: ${formatCurrency(paidAmount)}, Change: ${formatCurrency(change)}`
      };

      console.log("💵 Processing cash payment:", transactionData);

      const savedTransaction = await saveTransaction(transactionData);

      if (savedTransaction.saveError) {
        throw new Error(savedTransaction.errorMessage || "Failed to save transaction");
      }

      const stockUpdateResult = await updateProductStock(cart);

      if (!stockUpdateResult.success) {
        console.warn("Stock update had issues:", stockUpdateResult);
      }

      setCart([]);
      setQuantities({});
      setAmountPaid("");
      setCashModal(false);

      showNotification(`Cash payment completed successfully! Change: ${formatCurrency(change)}`, "success");

      setTimeout(() => {
        refreshProducts();
      }, 500);

    } catch (error) {
      console.error("❌ Cash payment error:", error);
      showNotification(error.message || "Failed to process cash payment", "error");
    } finally {
      setSubmitting(false);
    }
  }, [cart, totalAmount, amountPaid, submitting, saveTransaction, updateProductStock, refreshProducts, formatCurrency, showNotification, generateTransactionId]);

  // M-PESA Payment Handler
  const handleMpesaPayment = useCallback(async () => {
    if (submitting || cart.length === 0) return;

    setSubmitting(true);
    setMpesaLoading(true);

    try {
      const phone = mpesaPhone.trim();

      if (!phone || phone.length < 10) {
        showNotification("Please enter a valid phone number", "error");
        setSubmitting(false);
        setMpesaLoading(false);
        return;
      }

      const phoneRegex = /^(?:254|\+254|0)?(7\d{8})$/;
      if (!phoneRegex.test(phone)) {
        showNotification(
          "Invalid Kenyan phone number format. Use format: 0712345678 or 254712345678",
          "error"
        );
        setSubmitting(false);
        setMpesaLoading(false);
        return;
      }

      // Format phone number
      let formattedPhone = phone;
      if (phone.startsWith('0')) {
        formattedPhone = '254' + phone.substring(1);
      } else if (phone.startsWith('+254')) {
        formattedPhone = phone.substring(1);
      } else if (phone.startsWith('7')) {
        formattedPhone = '254' + phone;
      }

      // Generate transaction ID
      const transactionId = generateTransactionId();

      // First, save the transaction as pending
      const transactionData = {
        transactionId: transactionId,
        type: "sale",
        status: "pending",
        paymentStatus: "pending",
        totalAmount: totalAmount,
        amountPaid: 0,
        change: 0,
        paymentMethod: "mpesa",
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unit: item.unit || 'units',
          unitPrice: item.price,
          totalPrice: item.price * item.quantity
        })),
        customerName: "MPESA Customer",
        customerPhone: formattedPhone,
        notes: `MPESA payment initiated for phone: ${formattedPhone}`,
        paymentDetails: {
          initiatedAt: new Date().toISOString(),
          phone: formattedPhone,
          amount: totalAmount
        }
      };

      console.log("📱 Saving MPESA transaction:", transactionData);

      const savedTransaction = await saveTransaction(transactionData);

      if (savedTransaction.saveError) {
        throw new Error(savedTransaction.errorMessage || "Failed to save transaction");
      }

      // Now send STK Push
      if (URLS.MPESA?.STK_PUSH) {
        const mpesaData = {
          phone: formattedPhone,
          amount: totalAmount,
          businessId: userData.businessId,
          transactionId: transactionId,
          description: `Payment for ${cart.length} item(s) from ${userData.shopkeeperInfo?.businessName || 'Business'}`
        };

        console.log('📱 Sending MPESA STK Push request:', mpesaData);

        const mpesaResponse = await POST(URLS.MPESA.STK_PUSH, mpesaData);

        console.log('📱 MPESA STK Push response:', mpesaResponse);

        if (mpesaResponse.success) {
          // Store transaction info for polling
          setCurrentTransaction({
            transactionId: transactionId,
            checkoutRequestId: mpesaResponse.data?.checkoutRequestId,
            phone: formattedPhone,
            amount: totalAmount
          });

          return {
            success: true,
            transactionId: transactionId,
            checkoutRequestId: mpesaResponse.data?.checkoutRequestId,
            phone: formattedPhone,
            amount: totalAmount,
            message: mpesaResponse.data?.customerMessage || "STK Push sent successfully"
          };
        } else {
          throw new Error(mpesaResponse.message || "MPESA request failed");
        }
      } else {
        throw new Error("MPESA endpoint not configured");
      }

    } catch (error) {
      console.error("❌ MPESA payment error:", error);
      throw error;
    } finally {
      setSubmitting(false);
      setMpesaLoading(false);
    }
  }, [cart, totalAmount, mpesaPhone, submitting, saveTransaction, userData, showNotification, generateTransactionId]);

  // M-PESA Payment Complete Callback
  const handleMpesaPaymentComplete = useCallback(async (paymentResult) => {
    console.log('✅ M-PESA payment completed callback received:', paymentResult);

    try {
      // Update stock AFTER payment is confirmed
      const stockUpdateResult = await updateProductStock(cart, true);

      if (!stockUpdateResult.success) {
        console.warn("Stock update had issues:", stockUpdateResult);
      }

      // Clear cart
      setCart([]);
      setQuantities({});
      setMpesaPhone("");
      // Don't setMpesaModal(false) here - the MpesaPaymentModal handles its own close

      // Show notification
      showNotification(`M-PESA payment successful! Receipt: ${paymentResult.receipt || 'N/A'}`, "success");

      // Refresh products
      setTimeout(() => {
        refreshProducts();
      }, 500);

    } catch (error) {
      console.error('❌ Error after M-PESA payment:', error);
      showNotification('Payment recorded but stock update failed', 'error');
    }
  }, [cart, updateProductStock, refreshProducts, showNotification]);

  // M-PESA Transaction Created Callback
  const handleMpesaTransactionCreated = useCallback((transactionInfo) => {
    console.log('📝 M-PESA transaction created:', transactionInfo);
    // Store current transaction for reference
    setCurrentTransaction({
      transactionId: transactionInfo.transactionId,
      checkoutRequestId: transactionInfo.checkoutRequestId,
      phone: transactionInfo.phone,
      amount: transactionInfo.amount
    });
  }, []);

  // Handle M-PESA modal close
  const handleMpesaModalClose = useCallback((completed) => {
    setMpesaModal(false);
    
    if (completed) {
      // If payment was successful, refresh products
      refreshProducts();
      showNotification("M-PESA payment completed successfully!", "success");
    } else {
      // If payment failed or was cancelled, keep cart items for retry
      showNotification("M-PESA payment was not completed. You can try again.", "info");
    }
  }, [refreshProducts, showNotification]);

  const handleDebtPayment = useCallback(async () => {
    if (submitting || cart.length === 0) return;

    setSubmitting(true);

    try {
      if (!debtCustomerName || debtCustomerName.trim().length < 2) {
        showNotification("Please enter a valid customer name", "error");
        setSubmitting(false);
        return;
      }

      const transactionData = {
        transactionId: generateTransactionId(),
        type: "debt",
        status: "pending",
        paymentStatus: "pending",
        totalAmount: totalAmount,
        amountPaid: 0,
        change: 0,
        paymentMethod: "debt",
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unit: item.unit || 'units',
          unitPrice: item.price,
          totalPrice: item.price * item.quantity
        })),
        customerName: debtCustomerName.trim(),
        customerPhone: debtPhone.trim() || "",
        notes: debtNotes.trim() || `Credit sale for ${debtCustomerName.trim()}`,
        debtPaid: false,
        originalPaymentMethod: "debt"
      };

      console.log("📝 Processing debt payment:", transactionData);

      const savedTransaction = await saveTransaction(transactionData);

      if (savedTransaction.saveError) {
        throw new Error(savedTransaction.errorMessage || "Failed to save transaction");
      }

      const stockUpdateResult = await updateProductStock(cart);

      if (!stockUpdateResult.success) {
        console.warn("Stock update had issues:", stockUpdateResult);
      }

      setCart([]);
      setQuantities({});
      setDebtCustomerName("");
      setDebtPhone("");
      setDebtNotes("");
      setDebtModal(false);

      showNotification(`Credit sale recorded for ${debtCustomerName.trim()}`, "success");

      setTimeout(() => {
        refreshProducts();
      }, 500);

    } catch (error) {
      console.error("❌ Debt payment error:", error);
      showNotification(error.message || "Failed to process credit sale", "error");
    } finally {
      setSubmitting(false);
    }
  }, [cart, totalAmount, debtCustomerName, debtPhone, debtNotes, submitting, saveTransaction, updateProductStock, refreshProducts, showNotification, generateTransactionId]);

  // Combined loading state
  const isLoading = loadingUser || loadingProducts;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className='main-app-view'>
            <div className="main-app-content-container">
              <ContentLoader
                state={true}
                loading={true}
                loadingText={loadingProducts ? "Loading products..." : "Loading sales system..."}
                loadedText=""
                color={primaryColor}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData.user || !userData.businessId) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-500 text-xl mb-4">
              {!userData.user ? "User Not Logged In" : "No Business Assigned"}
            </div>
            <div className="text-gray-600 mb-6">
              {!userData.user
                ? "Please log in to access the sales system."
                : "Your account is not assigned to any business. Please contact your administrator."}
            </div>
            {!userData.user && (
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
              >
                Go to Login
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage && productsInStock.length === 0) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-500 text-xl mb-4">Unable to Load Products</div>
            <div className="text-gray-600 mb-6">
              {errorMessage}
              <div className="mt-4">
                <button
                  onClick={loadProducts}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg mr-2"
                >
                  Retry Loading
                </button>
                {renderRefreshButton()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (productsInStock.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-gray-600 text-xl mb-4">No Products Available for Sale</div>
            <div className="text-gray-500 mb-6">
              All products are currently out of stock.
              <div className="mt-2">
                1. Add products in the Stock Management section
              </div>
              <div className="mt-1">
                2. Make sure products have stock greater than 0
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate('/stock-management')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
              >
                Go to Stock Management
              </button>
              {renderRefreshButton()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main sales page
  return (
    <div className="min-h-screen bg-white p-2 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {userData.shopkeeperInfo?.businessName || "Kiosk"} Sales System
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Available products: {productsInStock.length} | Cart: {cartSummary}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {renderRefreshButton()}
        </div>
      </div>

      {errorMessage && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <p className="text-yellow-800">{errorMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <SearchInput
              input={searchTerm}
              handleInput={handleSearch}
              placeholder="Search products by name, SKU or category..."
              handleClear={() => setSearchTerm("")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={quantities[product.id]}
                onQuantityChange={handleQuantityChange}
                onAddToCart={addToCart}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        </div>

        {/* Cart Area */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-800">
                Shopping Cart ({cart.length} items)
              </h2>
            </div>

            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Your cart is empty
              </p>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateCartQuantity}
                      onRemoveFromCart={removeFromCart}
                      formatCurrency={formatCurrency}
                    />
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="text-right mb-4">
                    <p className="text-2xl font-bold text-green-600">
                      Total: {formatCurrency(totalAmount)}
                    </p>
                    {userData.shopkeeperInfo && (
                      <p className="text-sm text-gray-500 mt-1">
                        Selling as: <span className="font-medium">{userData.shopkeeperInfo.shopkeeperName}</span>
                      </p>
                    )}
                  </div>

                  {/* Payment Options */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setCashModal(true)}
                      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={cart.length === 0}
                    >
                      <DollarSign className="h-5 w-5" />
                      Pay with Cash
                    </button>
                    <button
                      onClick={() => setMpesaModal(true)}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={cart.length === 0}
                    >
                      <Smartphone className="h-5 w-5" />
                      Pay with M-PESA
                    </button>
                    <button
                      onClick={() => setDebtModal(true)}
                      className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={cart.length === 0}
                    >
                      <FileText className="h-5 w-5" />
                      Buy on Debt
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CashPaymentModal
        isOpen={cashModal}
        onClose={() => setCashModal(false)}
        totalAmount={totalAmount}
        amountPaid={amountPaid}
        onAmountPaidChange={setAmountPaid}
        onConfirmPayment={handleCashPayment}
        formatCurrency={formatCurrency}
        submitting={submitting}
        shopkeeperName={userData.shopkeeperInfo?.shopkeeperName}
      />

      <MpesaPaymentModal
        isOpen={mpesaModal}
        onClose={handleMpesaModalClose}
        totalAmount={totalAmount}
        mpesaPhone={mpesaPhone}
        onMpesaPhoneChange={setMpesaPhone}
        onConfirmPayment={handleMpesaPayment}
        formatCurrency={formatCurrency}
        shopkeeperName={userData.shopkeeperInfo?.shopkeeperName}
        validatePhone={validatePhone}
        onPaymentComplete={handleMpesaPaymentComplete}
        onTransactionCreated={handleMpesaTransactionCreated}
        transactionId={currentTransaction?.transactionId}
      />

      <DebtPaymentModal
        isOpen={debtModal}
        onClose={() => setDebtModal(false)}
        totalAmount={totalAmount}
        debtCustomerName={debtCustomerName}
        onDebtCustomerNameChange={setDebtCustomerName}
        debtPhone={debtPhone}
        onDebtPhoneChange={setDebtPhone}
        debtNotes={debtNotes}
        onDebtNotesChange={setDebtNotes}
        onConfirmPayment={handleDebtPayment}
        formatCurrency={formatCurrency}
        submitting={submitting}
        shopkeeperName={userData.shopkeeperInfo?.shopkeeperName}
      />

      {/* Toaster Notification */}
      <Toaster
        open={notification.open}
        state={notification.type}
        title={notification.title}
        message={notification.message}
        action={() => setNotification((prev) => ({ ...prev, open: false }))}
        position="right"
      />
    </div>
  );
};

export default SalesPage;