// src/utilities/Endpoints.js
const URLS = {
  TAG_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",

  AUTH: {
    LOGIN: "/api/auth/login",
    VERIFY_OTP: "/api/auth/verify-otp",
    RESEND_OTP: "/api/auth/resend-otp",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    VERIFY_RESET_OTP: "/api/auth/verify-reset-otp",
    RESET_PASSWORD: "/api/auth/reset-password",
    RESEND_RESET_OTP: "/api/auth/resend-reset-otp",
    LOGOUT: "/api/auth/logout",
    TEST_EMAIL: "/api/auth/test-email",
  },

  BUSINESS: {
    CREATE_BUSINESS: "/api/business/create-business",
    GET_ALL_BUSINESSES: "/api/business/get-all-businesses",
    GET_BUSINESS_BY_ID: "/api/business/get-business/:id",
    UPDATE_BUSINESS: "/api/business/update-business/:id",
    DELETE_BUSINESS: "/api/business/delete-business/:id",
    TOGGLE_BUSINESS_STATUS: "/api/business/update-status/:id",
    GET_BUSINESS_STATUS: "/api/business/business-status/:id",
  },

  USERS: {
    CREATE_USER: "/api/users/create-user",
    GET_ALL_USERS: "/api/users/get-all-users",
    GET_USER_BY_ID: "/api/users/get-user/:id",
    UPDATE_USER: "/api/users/update-user/:id", // NOTE: backend expects PATCH, not PUT
    DELETE_USER: "/api/users/delete-user/:id",
    TOGGLE_USER_STATUS: "/api/users/update-status/:id",
    GET_USERS_BY_BUSINESS: "/api/users/by-business/:businessId",
    GET_USER_BY_EMAIL: "/api/users/by-email/:email",
    GET_USER_BY_USERNAME: "/api/users/by-username/:username",
    // Not in backend reference — remove if backend doesn't support:
    // RESET_PASSWORD: "/api/users/:id/reset-password",
  },

  PRODUCTS: {
    CREATE_PRODUCT: "/api/products/add-product",
    GET_PRODUCTS_BY_BUSINESS: "/api/products/get-products/:businessId",
    UPDATE_PRODUCT: "/api/products/update-product/:id",
    UPDATE_STOCK: "/api/products/update-stock/:id",
    DELETE_PRODUCT: "/api/products/delete-product/:id",

    // ⚠️ The endpoints below are NOT in the backend reference.
    // Remove them, or confirm with backend team if they exist:
    // GET_PRODUCTS_BY_KIOSK: "/api/products/:kioskId",
    // GET_PRODUCT_BY_ID: "/api/products/single/:id",
    // GET_PRODUCTS_BY_CATEGORY: "/api/products/category/:kioskId/:category",
    // SEARCH_PRODUCTS: "/api/products/search/:kioskId",
    // BULK_UPDATE_PRODUCTS: "/api/products/bulk-update",
    // GET_LOW_STOCK_PRODUCTS: "/api/products/:kioskId/low-stock",
    // GET_OUT_OF_STOCK_PRODUCTS: "/api/products/:kioskId/out-of-stock",
  },

  // Hotel menu management — separate from kiosk stock PRODUCTS
  MENU: {
    CREATE_ITEM: "/api/menu/add-item",
    GET_ITEMS_BY_BUSINESS: "/api/menu/get-items/:businessId",
    UPDATE_ITEM: "/api/menu/update-item/:id",
    DELETE_ITEM: "/api/menu/delete-item/:id",
  },

  TRANSACTIONS: {
    CREATE_TRANSACTION: "/api/transactions/create-transaction",
    GET_ALL_TRANSACTIONS: "/api/transactions/get-all-transactions",
    GET_TRANSACTIONS_BY_BUSINESS: "/api/transactions/get-transactions/:businessId",
    GET_DAILY_REPORT_BY_BUSINESS: "/api/transactions/daily-report/:businessId/:date",
    GET_TRANSACTION_BY_ID: "/api/transactions/get-transaction/:transactionId",
    GET_BY_ID: "/api/transactions/get-transaction/:transactionId",
    UPDATE_TRANSACTION: "/api/transactions/update-transaction/:id",
    // Debt-specific
    GET_DEBTS_BY_BUSINESS: "/api/transactions/get-debts/:businessId",
    REPAY_DEBT: "/api/transactions/repay-debt/:id",
  },

  MPESA: {
    STK_PUSH: "/api/mpesa/stk-push",
    CALLBACK: "/api/mpesa/callback",
    GET_TRANSACTION: "/api/mpesa/get-transaction/:transactionId",
    QUERY_STATUS: "/api/mpesa/payment-status/:checkoutRequestId",
    POLL_STATUS: "/api/mpesa/poll-status/:transactionId",
  },

  // ⚠️ The sections below are NOT in the backend reference document.
  // Confirm with backend team whether these routes exist before using.

  KIOSKS: {
    CREATE_KIOSK: "/api/kiosks",
    GET_ALL_KIOSKS: "/api/kiosks",
    GET_KIOSK_BY_ID: "/api/kiosks/:id",
    UPDATE_KIOSK: "/api/kiosks/:id",
    DELETE_KIOSK: "/api/kiosks/:id",
    TOGGLE_KIOSK_STATUS: "/api/kiosks/:id/status",
    GET_KIOSKS_BY_BUSINESS: "/api/kiosks/business/:businessId",
    GET_KIOSK_STATS: "/api/kiosks/:id/stats",
  },

  CATEGORIES: {
    CREATE_CATEGORY: "/api/categories",
    GET_ALL_CATEGORIES: "/api/categories",
    GET_CATEGORY_BY_ID: "/api/categories/:id",
    UPDATE_CATEGORY: "/api/categories/:id",
    DELETE_CATEGORY: "/api/categories/:id",
    GET_CATEGORIES_BY_KIOSK: "/api/categories/kiosk/:kioskId",
    GET_CATEGORIES_BY_BUSINESS: "/api/categories/business/:businessId",
  },

  INVENTORY: {
    GET_INVENTORY_OVERVIEW: "/api/inventory/overview/:kioskId",
    GET_STOCK_ALERTS: "/api/inventory/alerts/:kioskId",
    GET_STOCK_HISTORY: "/api/inventory/history/:productId",
    ADD_STOCK_ADJUSTMENT: "/api/inventory/adjustment",
    GET_INVENTORY_REPORT: "/api/inventory/report/:kioskId",
  },

  SALES: {
    CREATE_SALE: "/api/sales",
    GET_ALL_SALES: "/api/sales",
    GET_SALE_BY_ID: "/api/sales/:id",
    GET_SALES_BY_KIOSK: "/api/sales/kiosk/:kioskId",
    GET_SALES_BY_DATE_RANGE: "/api/sales/date-range",
    GET_SALES_STATS: "/api/sales/stats/:kioskId",
    REFUND_SALE: "/api/sales/:id/refund",
    GET_DAILY_SALES_REPORT: "/api/sales/report/daily/:kioskId",
  },

  REPORTS: {
    GET_SALES_REPORT: "/api/reports/sales",
    GET_INVENTORY_REPORT: "/api/reports/inventory",
    GET_PROFIT_LOSS_REPORT: "/api/reports/profit-loss",
    GET_STOCK_MOVEMENT_REPORT: "/api/reports/stock-movement",
    EXPORT_REPORT: "/api/reports/export",
  },
};

export default URLS;