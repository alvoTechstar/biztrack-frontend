// src/utilities/Endpoints.js
const URLS = {
  // Base URL is prepended to all paths below
  // TAG_BASE_URL: "http://localhost:3000",
  //  TAG_BASE_URL: "https://dona-southmost-finn.ngrok-free.dev",
    //  TAG_BASE_URL: "https://plenty-rice-travel.loca.lt",
   TAG_BASE_URL: "https://biztrack-backend-ifjk.onrender.com",

  AUTH: {
    LOGIN: "/api/auth/login",
    VERIFY_OTP: "/api/auth/verify-otp",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    VERIFY_RESET_OTP: "/api/auth/verify-reset-otp",
    RESET_PASSWORD: "/api/auth/reset-password",
    RESEND_OTP: "/api/auth/resend-otp",
    RESEND_RESET_OTP: "/api/auth/resend-reset-otp",
    TEST_EMAIL: "/api/auth/test-email"
  },

  BUSINESS: {
    CREATE_BUSINESS: "/api/business/create-business", 
    GET_ALL_BUSINESSES: "/api/business",
    GET_BUSINESS_BY_ID: "/api/business/:id",
    UPDATE_BUSINESS: "/api/business/:id",
    DELETE_BUSINESS: "/api/business/:id",
    TOGGLE_BUSINESS_STATUS: "/api/business/:id/status",
  },

  USERS: {
    CREATE_USER: "/api/users/create-user",
    GET_ALL_USERS: "/api/users",
    GET_USER_BY_ID: "/api/users/:id",
    UPDATE_USER: "/api/users/update-user/:id",
    DELETE_USER: "/api/users/:id",
    TOGGLE_USER_STATUS: "/api/users/:id/status",
    RESET_PASSWORD: "/api/users/:id/reset-password",
    GET_USERS_BY_BUSINESS: "/api/users/business/:businessId",
    GET_USER_BY_EMAIL: "/api/users/email/:email",
    GET_USER_BY_USERNAME: "/api/users/username/:username",
  },

  PRODUCTS: {
    CREATE_PRODUCT: "/api/products",
    GET_PRODUCTS_BY_KIOSK: "/api/products/:kioskId",
    GET_PRODUCTS_BY_BUSINESS: "/api/products/business/:businessId",
    UPDATE_PRODUCT: "/api/products/:id",
    DELETE_PRODUCT: "/api/products/:id",
    GET_PRODUCT_BY_ID: "/api/products/single/:id",
    GET_PRODUCTS_BY_CATEGORY: "/api/products/category/:kioskId/:category",
    SEARCH_PRODUCTS: "/api/products/search/:kioskId",
    UPDATE_STOCK: "/api/products/:id/stock",
    BULK_UPDATE_PRODUCTS: "/api/products/bulk-update",
    GET_LOW_STOCK_PRODUCTS: "/api/products/:kioskId/low-stock",
    GET_OUT_OF_STOCK_PRODUCTS: "/api/products/:kioskId/out-of-stock",
  },

  TRANSACTIONS: {
    CREATE_TRANSACTION: '/api/transactions',
    GET_ALL_TRANSACTIONS: '/api/transactions',
    GET_TRANSACTIONS_BY_BUSINESS: '/api/transactions/business/:businessId',
    GET_DAILY_REPORT_BY_BUSINESS: '/api/transactions/report/business/:businessId/:date',
    UPDATE_TRANSACTION: '/api/transactions/:id'

  },
  MPESA: {
    STK_PUSH: "/api/mpesa/stk-push",
    CALLBACK: "/api/mpesa/callback",
    QUERY_STATUS: "/api/mpesa/query-status/:checkoutRequestId",
  },

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
  }
};

export default URLS;