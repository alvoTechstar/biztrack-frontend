import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { ShoppingCart, DollarSign, Smartphone, FileText, RefreshCw, Package, ChevronUp } from "lucide-react";
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
    paymentConfig: null, // Add payment config
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

  // Lets the mobile "View Cart" bar jump straight to the cart panel, which sits
  // below the product grid in document order on small screens
  const cartSectionRef = useRef(null);
  const scrollToCart = useCallback(() => {
    cartSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

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

  // Get payment display info based on config
  const getPaymentDisplayInfo = useCallback(() => {
    const config = userData.paymentConfig || { paymentType: 'TILL' };

    switch (config.paymentType) {
      case 'PAYBILL':
        return {
          shortCode: config.paybillNumber,
          accountNumber: config.accountNumber,
          description: `Paybill: ${config.paybillNumber} - Account: ${config.accountNumber}`
        };
      case 'TILL':
        return {
          shortCode: config.tillNumber,
          description: `Till Number: ${config.tillNumber}`
        };
      case 'POCHI':
        return {
          shortCode: config.pochiNumber,
          description: `Pochi: ${config.pochiNumber}`
        };
      default:
        return {
          shortCode: null,
          description: 'M-PESA Payment'
        };
    }
  }, [userData.paymentConfig]);

  // Check authentication and extract user data
  useEffect(() => {
    const authTimeout = setTimeout(() => {
      if (loadingUser) {
        setLoadingUser(false);
      }
    }, 2000);

    if (!currentUser || !token) {
      showNotification("Please log in to access the sales system", "error");
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      clearTimeout(authTimeout);
      return;
    }

    const businessId = currentUser.businessId;
    const businessUUID = currentUser.businessUUID;

    if (!businessId || !businessUUID) {
      console.error("No business information found in user data");
      showNotification("No business assigned to your account. Please contact administrator.", "error");
      setErrorMessage("No business assigned to your account.");
      setLoadingUser(false);
      clearTimeout(authTimeout);
      return;
    }

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

    if (currentUser.role !== "Kiosk_Shopkeeper") {
      console.warn(`User role is ${currentUser.role}, expected Kiosk_Shopkeeper`);
      showNotification(`You don't have permission to access sales. Your role: ${currentUser.role}`, "error");
    }

    setUserData({
      user: currentUser,
      businessId,
      businessUUID,
      shopkeeperInfo,
      paymentConfig: currentUser.paymentConfig || {
        paymentType: 'TILL',
        tillNumber: null,
        paybillNumber: null,
        accountNumber: null,
        pochiNumber: null
      },
      initialized: true
    });

    setLoadingUser(false);
    clearTimeout(authTimeout);

  }, [currentUser, token, navigate, showNotification]);

  // Load products function (unchanged)
  const loadProducts = useCallback(async () => {
    if (!userData.businessId || !userData.initialized) {
      return;
    }

    setLoadingProducts(true);

    try {
      const endpoint = URLS.PRODUCTS.GET_PRODUCTS_BY_BUSINESS.replace(':businessId', userData.businessId);

      const result = await GET(endpoint);

      if (!result || result.success === false) {
        throw new Error(result?.message || 'Failed to load products');
      }

      const productData = result.products || result.data || [];

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

      const availableProducts = fetchedProducts.filter(p => p.availableStock > 0);

      setProductsInStock(availableProducts);

    } catch (error) {
      console.error('Error fetching products for sales:', error);
      setErrorMessage(error.message || 'Failed to load products');
      setProductsInStock([]);
      showNotification("Failed to load products. Please try again.", "error");
    } finally {
      setLoadingProducts(false);
    }
  }, [userData, showNotification]);

  // Load products when user data is available
  useEffect(() => {
    if (userData.businessId && userData.initialized) {
      loadProducts();
    }
  }, [userData.businessId, userData.initialized, loadProducts]);

  // Refresh products function
  const refreshProducts = useCallback(async () => {
    await loadProducts();
    showNotification("Products refreshed successfully", "success");
  }, [loadProducts, showNotification]);

  // Render refresh button function
  const renderRefreshButton = useCallback(() => (
    <button
      onClick={refreshProducts}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      title="Refresh products"
    >
      <RefreshCw className="h-4 w-4" />
      Refresh
    </button>
  ), [refreshProducts]);

  // Save transaction to backend (unchanged)
  const saveTransaction = useCallback(async (transactionData) => {
    try {
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
        shopkeeperRole: userData.shopkeeperInfo.shopkeeperRole,
      };

      if (!URLS.TRANSACTIONS?.CREATE_TRANSACTION) {
        console.warn('Transactions endpoint not configured. Saving to local state only.');

        const mockTransaction = {
          ...transactionWithShopkeeper,
          _id: `mock_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        return mockTransaction;
      }

      const response = await POST(URLS.TRANSACTIONS.CREATE_TRANSACTION, transactionWithShopkeeper);

      if (response.success) {
        return response.transaction;
      } else {
        const errorMsg = typeof response === 'string' ? response : (response?.message || 'Transaction save failed');
        console.warn('Transaction save failed:', errorMsg);
        return {
          saveError: true,
          errorMessage: errorMsg,
        };
      }
    } catch (error) {
      console.error('Error saving transaction:', error);

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

  // Find product in current products list by ID (unchanged)
  const findProductInList = useCallback((productId) => {
    return productsInStock.find(p => p.id === productId || p._id === productId);
  }, [productsInStock]);

  // Update product stock (unchanged)
  const updateProductStock = useCallback(async (cartItems, isMpesa = false) => {
    try {
      if (!URLS.PRODUCTS?.UPDATE_STOCK) {
        console.warn('Stock update endpoint not configured');
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

          const result = await PUT(updateEndpoint, updateData);

          if (!result.success) {
            console.error(`Stock update failed for ${item.name}:`, result.message);
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
          console.error(`Error updating stock for ${item.name}:`, itemError);
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

      if (failedUpdates.length > 0) {
        console.warn('Some stock updates failed:', failedUpdates);
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
      console.error('Error in updateProductStock:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }, [findProductInList]);

  // Generate transaction ID (unchanged)
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

  // Cart handlers (unchanged)
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
        console.error('Error adding to cart:', error);
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

  // Phone validation (unchanged)
  const validatePhone = useCallback((phone) => {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length < 9) {
      return { isValid: false, message: 'Phone number too short' };
    }

    // Accept: 07, 01, 2547, 2541, 7, 1 (Safaricom numbers)
    if (!/^(07|01|2547|2541|7|1)/.test(cleaned)) {
      return { isValid: false, message: 'Invalid Kenyan number format' };
    }

    // Check total length for valid Kenyan numbers
    const validLengths = [10, 12, 9]; // 07XXXXXXXX, 2547XXXXXXXX, 7XXXXXXXX

    if (!validLengths.includes(cleaned.length)) {
      return { isValid: false, message: 'Invalid phone number length' };
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
        throw new Error("Please enter a valid amount");
      }

      if (paidAmount < totalAmount) {
        throw new Error(`Amount paid (${formatCurrency(paidAmount)}) is less than total amount (${formatCurrency(totalAmount)})`);
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

      const savedTransaction = await saveTransaction(transactionData);

      if (savedTransaction.saveError) {
        throw new Error(savedTransaction.errorMessage || "Failed to save transaction");
      }

      const stockUpdateResult = await updateProductStock(cart);

      if (!stockUpdateResult.success) {
        console.warn("Stock update had issues:", stockUpdateResult);
      }

      // Return a success object that CashPaymentModal can use
      return {
        success: true,
        message: "Cash payment completed successfully!",
        change: change,
        totalAmount: totalAmount,
        transactionId: savedTransaction.transactionId
      };

    } catch (error) {
      console.error("Cash payment error:", error);
      // Return a failure object that CashPaymentModal can use
      return { success: false, message: error.message || "Failed to process cash payment" };
    } finally {
      setSubmitting(false);
    }
  }, [cart, totalAmount, amountPaid, submitting, saveTransaction, updateProductStock, formatCurrency, generateTransactionId, userData.paymentConfig]);

  // M-PESA Payment Handler - FIXED for backend
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

      // Updated regex to accept 01 and 2541 numbers
      const phoneRegex = /^(?:254|\+254|0)?(7\d{8}|1\d{8})$/;
      if (!phoneRegex.test(phone)) {
        showNotification(
          "Invalid Kenyan phone number format. Use format: 0712345678, 0112345678, 254712345678, or 254112345678",
          "error"
        );
        setSubmitting(false);
        setMpesaLoading(false);
        return;
      }

      // Format phone number for M-PESA
      let formattedPhone = phone;

      // Remove + if present
      if (phone.startsWith('+')) {
        formattedPhone = phone.substring(1);
      }

      // Format to 254XXXXXXXXX
      if (formattedPhone.startsWith('0')) {
        // Convert 07XXXXXXXX or 01XXXXXXXX to 2547XXXXXXXX or 2541XXXXXXXX
        formattedPhone = '254' + formattedPhone.substring(1);
      } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
        // Convert 7XXXXXXXX or 1XXXXXXXX to 2547XXXXXXXX or 2541XXXXXXXX
        formattedPhone = '254' + formattedPhone;
      } else if (formattedPhone.startsWith('2547') || formattedPhone.startsWith('2541')) {
        // Already in correct format
        formattedPhone = formattedPhone;
      } else {
        throw new Error("Invalid phone number format");
      }

      // Validate final format
      const finalPhoneRegex = /^254(7|1)\d{8}$/;
      if (!finalPhoneRegex.test(formattedPhone)) {
        throw new Error("Invalid final phone number format");
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
        notes: `MPESA payment initiated for phone: ${formattedPhone} (${userData.paymentConfig?.paymentType || 'TILL'})`,
        paymentDetails: {
          initiatedAt: new Date().toISOString(),
          phone: formattedPhone,
          amount: totalAmount,
          paymentType: userData.paymentConfig?.paymentType || 'TILL'
        }
      };

      const savedTransaction = await saveTransaction(transactionData);

      if (savedTransaction.saveError) {
        throw new Error(savedTransaction.errorMessage || "Failed to save transaction");
      }

      // Now send STK Push with business ID for dynamic shortcode
      if (URLS.MPESA?.STK_PUSH) {
        // The backend only expects these fields based on your controller
        const mpesaData = {
          phone: formattedPhone,
          amount: totalAmount,
          transactionId: transactionId,
          description: `Payment for ${cart.length} item(s) from ${userData.shopkeeperInfo?.businessName || 'Business'}`,
          isDebtPayment: false,
          businessId: userData.businessId // Send businessId for dynamic shortcode
        };

        const mpesaResponse = await POST(URLS.MPESA.STK_PUSH, mpesaData);

        if (mpesaResponse.success) {
          // Store transaction info for polling
          setCurrentTransaction({
            transactionId: transactionId,
            checkoutRequestId: mpesaResponse.data?.checkoutRequestId,
            phone: formattedPhone,
            amount: totalAmount,
            paymentType: userData.paymentConfig?.paymentType || 'TILL'
          });

          return {
            success: true,
            transactionId: transactionId,
            checkoutRequestId: mpesaResponse.data?.checkoutRequestId,
            phone: formattedPhone,
            amount: totalAmount,
            message: mpesaResponse.data?.customerMessage || "STK Push sent successfully",
            data: mpesaResponse.data
          };
        } else {
          console.error('MPESA STK Push failed with response:', mpesaResponse);
          throw new Error(mpesaResponse.message || mpesaResponse.error || "MPESA request failed");
        }
      } else {
        throw new Error("MPESA endpoint not configured");
      }

    } catch (error) {
      console.error("MPESA payment error:", error);
      showNotification(error.message || "Failed to process M-PESA payment", "error");
      throw error;
    } finally {
      setSubmitting(false);
      setMpesaLoading(false);
    }
  }, [cart, totalAmount, mpesaPhone, submitting, saveTransaction, userData, showNotification, generateTransactionId]);

  // M-PESA Payment Complete Handler
  const handleMpesaPaymentComplete = useCallback(async (paymentResult) => {
    try {
      // Update stock AFTER payment is confirmed
      const stockUpdateResult = await updateProductStock(cart, true);

      if (!stockUpdateResult.success) {
        console.warn("Stock update had issues:", stockUpdateResult);
      }

      // Show payment type specific message
      const paymentInfo = getPaymentDisplayInfo();
      showNotification(`M-PESA (${userData.paymentConfig?.paymentType}) payment completed!`, "success");

    } catch (error) {
      console.error('Error after M-PESA payment:', error);
      showNotification('Payment recorded but stock update failed', 'error');
    }
  }, [cart, updateProductStock, showNotification, userData.paymentConfig, getPaymentDisplayInfo]);

  // M-PESA Transaction Created Callback
  const handleMpesaTransactionCreated = useCallback((transactionInfo) => {
    // Store current transaction for reference
    setCurrentTransaction({
      transactionId: transactionInfo.transactionId,
      checkoutRequestId: transactionInfo.checkoutRequestId,
      phone: transactionInfo.phone,
      amount: transactionInfo.amount
    });
  }, []);

  // M-PESA Modal Close Handler
  const handleMpesaModalClose = useCallback((completed) => {
    // Always close the M-PESA modal
    setMpesaModal(false);

    if (completed === true) {
      // Clear the cart and all related state
      setCart([]);
      setQuantities({});
      setMpesaPhone("");
      setCurrentTransaction(null);

      // Refresh products to show updated stock
      setTimeout(() => {
        refreshProducts();
      }, 500);

      showNotification(`${userData.paymentConfig?.paymentType} M-PESA payment completed! Cart cleared.`, "success");

    } else {
      // Keep items in cart so user can retry with different payment method
      showNotification("M-PESA payment was not completed. Items remain in cart.", "info");
    }
  }, [refreshProducts, showNotification, userData.paymentConfig]);

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
      console.error("Debt payment error:", error);
      showNotification(error.message || "Failed to process credit sale", "error");
    } finally {
      setSubmitting(false);
    }
  }, [cart, totalAmount, debtCustomerName, debtPhone, debtNotes, submitting, saveTransaction, updateProductStock, refreshProducts, showNotification, generateTransactionId, userData.paymentConfig]);

  const handleCashModalClose = useCallback(async (completed) => {
    setCashModal(false);

    if (completed === true) {
      setCart([]);
      setQuantities({});
      setAmountPaid("");

      setLoadingProducts(true);
      await refreshProducts();
      setLoadingProducts(false);

      showNotification("Cash payment completed! Cart cleared. Ready for new sale.", "success");
    } else {
      showNotification("Cash payment was not completed. Items remain in cart.", "info");
    }
  }, [refreshProducts, showNotification]);

  // Combined loading state
  const isLoading = loadingUser || loadingProducts;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ContentLoader
          state={true}
          loading={true}
          loadingText={loadingProducts ? "Loading products..." : "Loading sales system..."}
          loadedText=""
          color={primaryColor}
        />
      </div>
    );
  }

  if (!userData.user || !userData.businessId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
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
              className="text-white px-6 py-2 rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: primaryColor || '#3b82f6' }}
            >
              Go to Login
            </button>
          )}
        </div>
      </div>
    );
  }

  if (errorMessage && productsInStock.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-xl mb-4">Unable to Load Products</div>
          <div className="text-gray-600 mb-6">{errorMessage}</div>
          <div className="flex justify-center gap-3">
            <button
              onClick={loadProducts}
              className="text-white px-6 py-2 rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: primaryColor || '#3b82f6' }}
            >
              Retry Loading
            </button>
            {renderRefreshButton()}
          </div>
        </div>
      </div>
    );
  }

  if (productsInStock.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Package size={48} className="text-gray-400 mx-auto mb-4" />
          <div className="text-gray-700 text-xl font-semibold mb-2">No Products Available for Sale</div>
          <div className="text-gray-500 mb-6">
            All products are currently out of stock. Add products in Stock Management and make sure they have stock greater than 0.
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate('/stock-management')}
              className="text-white px-6 py-2 rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: primaryColor || '#3b82f6' }}
            >
              Go to Stock Management
            </button>
            {renderRefreshButton()}
          </div>
        </div>
      </div>
    );
  }

  // Get payment display info for UI
  const paymentInfo = getPaymentDisplayInfo();

  // Main sales page
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 md:pt-8 pb-24 md:pb-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl text-white shadow-sm shrink-0"
              style={{ backgroundColor: primaryColor || '#3b82f6' }}
            >
              <ShoppingCart size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight truncate max-w-[60vw] sm:max-w-none">
                  {userData.shopkeeperInfo?.businessName || "Kiosk"} Sales
                </h1>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full shrink-0">
                  {userData.paymentConfig?.paymentType || 'TILL'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {productsInStock.length} products available · Cart: {cartSummary}
                {paymentInfo.description && ` · ${paymentInfo.description}`}
              </p>
            </div>
          </div>

          {renderRefreshButton()}
        </header>

        {errorMessage && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-yellow-800">{errorMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Product Selection Area */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
              <SearchInput
                input={searchTerm}
                handleInput={handleSearch}
                placeholder="Search products by name, SKU or category..."
                handleClear={() => setSearchTerm("")}
              />
            </div>

            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <Package size={48} className="text-gray-400 mb-3" />
                <h3 className="text-base font-semibold text-gray-700 mb-1">No products match your search</h3>
                <p className="text-sm text-gray-500">Try a different name, SKU or category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
            )}
          </div>

          {/* Cart Area */}
          <div className="md:col-span-1" ref={cartSectionRef}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 md:sticky md:top-4">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-bold text-gray-900">
                  Cart ({cart.length})
                </h2>
              </div>

              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <ShoppingCart size={36} className="text-gray-300 mb-2" />
                  <p className="text-sm font-medium text-gray-600">Your cart is empty</p>
                  <p className="text-xs text-gray-400 mt-1">Add products to get started</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
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

                  <div className="border-t border-gray-100 pt-4">
                    <div className="text-right mb-4">
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(totalAmount)}
                      </p>
                      {userData.shopkeeperInfo && (
                        <p className="text-xs text-gray-500 mt-1">
                          Selling as <span className="font-medium">{userData.shopkeeperInfo.shopkeeperName}</span>
                        </p>
                      )}
                    </div>

                    {/* Payment Options */}
                    <div className="space-y-2">
                      <button
                        onClick={() => setCashModal(true)}
                        className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={cart.length === 0}
                      >
                        <DollarSign className="h-5 w-5" />
                        Pay with Cash
                      </button>
                      <button
                        onClick={() => setMpesaModal(true)}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={cart.length === 0}
                      >
                        <Smartphone className="h-5 w-5" />
                        Pay with M-PESA
                      </button>
                      <button
                        onClick={() => setDebtModal(true)}
                        className="w-full bg-orange-600 text-white py-2.5 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>

      {/* Mobile/tablet-only floating cart bar - keeps checkout one tap away without
          having to scroll past the whole product catalog to reach the cart panel */}
      {cart.length > 0 && (
        <button
          onClick={scrollToCart}
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-lg text-white shrink-0"
              style={{ backgroundColor: primaryColor || '#3b82f6' }}
            >
              <ShoppingCart size={18} />
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs text-gray-500 truncate">{cart.length} item{cart.length > 1 ? 's' : ''} in cart</p>
              <p className="text-base font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
          <span
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-white text-sm font-medium shrink-0"
            style={{ backgroundColor: primaryColor || '#3b82f6' }}
          >
            View Cart
            <ChevronUp size={16} />
          </span>
        </button>
      )}

      {/* Modals */}
      <CashPaymentModal
        isOpen={cashModal}
        onClose={handleCashModalClose}
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
        paymentType={userData.paymentConfig?.paymentType} // Pass payment type to modal
        paymentInfo={paymentInfo} // Pass payment info to modal
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