export const HOST_URL = import.meta.env.VITE_BASE_HOST_URL;
export const BASE_URL = import.meta.env.VITE_BASE_HOST_URL + "v1";
export const FE_BASE_URL = import.meta.env.VITE_BASE_FRONTEND_URL;
export const TOOL_URL = import.meta.env.VITE_BASE_TOOL_URL || "https://tool.itomosoft.com/";
export const apiGetIpAddress = "https://api.ipify.org?format=json";
export const VAPID_PUBLIC_KEY =
  import.meta.env.VITE_VAPID_PUBLIC_KEY ||
  "BJIAa5ccQvr8S0XRPeNYt0uBGSlcF9vV3VsKH9Cq39PZXG0IQcDnFQyLAVaUsc9k7usxBwzuQMt6DV8MkUX7UOw";

export const apiEndpoint = {
  upload: "/uploads",
  code: "/code",

  files: { base: "/file", setMain: "/file/:id/set-main", deletePending: "/file/pending" },
  dashboard: {
    base: "/dashboard",
    metrics: "/dashboard/metrics",
    revenueReport: "/dashboard/revenue",
    topProducts: "/dashboard/top-products",
    topCustomers: "/dashboard/top-customers",
    today: "/dashboard/today",
    sales: "/dashboard/sales",
    production: "/dashboard/production",
    inventory: "/dashboard/inventory",
  },
  analysis: {
    saleOverviewMetrics: "/analysis/sale/overview/metrics",
    saleBusinessIndicator: "/analysis/sale/overview/business-indicator",
    saleTopProductGroups: "/analysis/sale/overview/top-product-groups",
    saleTopProducts: "/analysis/sale/overview/top-products",
    saleTopCustomerGroups: "/analysis/sale/overview/top-customer-groups",
    saleProfitMetrics: "/analysis/sale/profit/metrics",
    saleProfitCostStructure: "/analysis/sale/profit/cost-structure",
    saleProfitEffectiveness: "/analysis/sale/profit/effectiveness",
    productOverview: "/analysis/product/overview",
    productInventory: "/analysis/product/inventory",
    productClassification: "/analysis/product/classification",
    customerOverview: "/analysis/customer/overview",
    customerClassification: "/analysis/customer/classification",
    receivable: "/analysis/effectiveness/receivable",
  },
  organization: {
    base: "/organization",
    first: "/organization/first",
    updateSortOrder: "/organization/update-sort-order",
  },
  referralCode: { base: "/referral-code" },
  settings: { base: "/settings", format: "/settings/format" },
  excel: {
    export: "/excel/export",
    download: "/excel/download",
    import: "/excel/import",
    stream: "/excel/import/progress/:jobId/stream",
    template: "/excel/template/:entityType",
    importProgress: "/excel/job/:jobId",
    exportStream: "/excel/export/progress/:jobId/stream",
    exportProgress: "/excel/export/job/:jobId",
  },
  attribute: { base: "/attribute" },
  passportAuth: {
    google: "/passport-auth/google",
    facebook: "/passport-auth/facebook",
    yahoo: "/passport-auth/yahoo",
    twitter: "/passport-auth/twitter",
  },
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    info: "/auth/me",
    updateInfo: "/auth/update-info",
    forgotPassword: "/auth/forgot-password",
    changePassword: "/auth/change-password",
    verifyOtp: "/auth/verify-otp",
    resendOtp: "/auth/resend-otp",
    resetPassword: "/auth/reset-password",
    notification: { base: "/auth/notifications", all: "/auth/notifications/all" },
    setting: "/auth/settings",
  },
  role: { base: "/role" },
  jobPosition: { base: "/job-position" },
  user: { base: "/user" },
  employee: { base: "/employee" },
  partner: { base: "/partner", customer: "/customer", supplier: "/supplier", shipper: "/shipper" },
  partnerContact: { base: "/partner-contact" },
  product: {
    base: "/product",
    byCodes: "/product/by-codes",
    changeGroup: "/product/bulk/change-group",
    stopSelling: "/product/bulk/stop-selling",
    settingPrice: "/product/:productId/setting-price",
    priceHistory: "/product/price-history",
    public: "/public/product",
  },
  material: { base: "/material" },
  warehouse: { base: "/warehouse" },
  store: { base: "/store" },

  // ── Business ──
  quotation: {
    base: "/quotation",
    line: "/quotation/:quotationId/line",
    customerApprove: "/quotation/:id/customer-approve",
    requestOtp: "/quotation/:id/request-otp",
    customerApproveOtp: "/quotation/:id/customer-approve-otp",

    approve: "/quotation/:id/approve",
    reject: "/quotation/:id/reject",
  },
  quotationRequest: {
    base: "/quotation-request",
    line: "/quotation-request/:quotationRequestId/line",
    approve: "/quotation-request/:id/approve",
    reject: "/quotation-request/:id/reject",
    createPublic: "/public/quotation-request",
    getByCodePublic: "/public/quotation-request/code/:code",
  },
  quotationLine: { base: "/quotation-line" },
  purchaseQuotation: {
    base: "/purchase-quotation",
    line: "/purchase-quotation/:purchaseQuotationId/line",

    approve: "/purchase-quotation/:id/approve",
    reject: "/purchase-quotation/:id/reject",
    createPublic: "/public/purchase-quotation",
    getByCodePublic: "/public/purchase-quotation/code/:code",
  },
  purchaseRequisition: {
    base: "/purchase-requisition",
    line: "/purchase-requisition/:purchaseRequisitionId/line",
    // approve / reject
    approve: "/purchase-requisition/:id/approve",
    reject: "/purchase-requisition/:id/reject",
  },
  order: {
    base: "/sale",
    sale: "/sale",
    saleReturn: "/sale-return",
    purchase: "/purchase",
    purchaseReturn: "/purchase-return",
    history: "/order/history",
    cancel: "/sale/:id/cancel",
    complete: "/sale/:id/complete",
  },
  purchase: {
    base: "/purchase",
    line: "/purchase/:purchaseId/line",

    approve: "/purchase/:id/approve",
    reject: "/purchase/:id/reject",
    confirmComplete: "/purchase/:id/confirm-complete",
  },
  purchaseLine: { base: "/purchase-line" },

  // ── Production ──
  production: {
    base: "/production",
    line: "/production/:productionId/line",
    cancel: "/production/:id/cancel",
    export: "/production/:id/export",
    import: "/production/:id/import",
    confirm: "/production/:id/confirm",
    start: "/production/:id/start",
    complete: "/production/:id/complete",
  },
  productionLine: { base: "/production-line" },
  billOfMaterial: { base: "/bill-of-material" },

  // ── Inventory ──
  stockDocument: {
    base: "/stock-document",
    line: "/stock-document/:stockDocumentId/line",
    confirmImport: "/stock-document/:id/confirm-import",
    confirmExport: "/stock-document/:id/confirm-export",
    cancel: "/stock-document/:id/cancel",
  },
  stockDocumentLine: { base: "/stock-document-line" },

  warehouseTransfer: {
    base: "/warehouse-transfer",
    line: "/warehouse-transfer/:warehouseTransferId/line",
    confirm: "/warehouse-transfer/:id/confirm",
    export: "/warehouse-transfer/:id/export",
    import: "/warehouse-transfer/:id/import",
  },
  inventoryAdjustment: {
    base: "/inventory-adjustment",
    line: "/inventory-adjustment/:inventoryAdjustmentId/line",
    confirm: "/inventory-adjustment/:id/confirm",
  },
  storeTransfer: { base: "/store-transfer" },
  internalExport: { base: "/internal-export" },
  inventoryConversion: {
    base: "/inventory-conversion",
    line: "/inventory-conversion/:inventoryConversionId/line",
  },
  inventory: { base: "/inventory" },
  inventoryLot: { base: "/inventory-lot" },
  gateLog: { base: "/gate-log" },
  shippingPlan: {
    base: "/shipping-plan",
    line: "/shipping-plan/:shippingPlanId/line",
    approve: "/shipping-plan/:id/approve",
    reject: "/shipping-plan/:id/reject",
  },

  // ── Finance ──
  fund: {
    base: "/fund",
    incomeExpense: "/fund/:fundId/income-expense",
    transfer: "/fund/:fundId/fund-transfer",
    advance: "/fund/:fundId/advance",
  },
  fundAdjustment: { base: "/fund-adjustment" },
  fundTransfer: { base: "/fund-transfer" },
  fundBalanceReport: { base: "/fund-balance/report" },
  fundBalance: {
    report: "/fund-balance/report",
    transaction: "/fund-balance/transaction",
    adjustment: "/fund-balance/adjustment",
    transfer: "/fund-balance/transfer",
  },
  incomeExpense: { base: "/income-expense" },
  transferNote: { base: "/transfer-note" },
  dailyReport: {
    base: "/daily-report",
    current: "/daily-report/current",
    cancel: "/daily-report/:id/cancel",
  },
  invoice: { base: "/invoice", line: "/invoice/:invoiceId/line" },
  paymentRequest: {
    base: "/payment-request",
    line: "/payment-request/:paymentRequestId/line",

    approve: "/payment-request/:id/approve",
    reject: "/payment-request/:id/reject",
  },
  paymentTerm: { base: "/payment-term" },

  // ── Debt / Commission / VAT ──
  partnerDebtAdjustment: { base: "/partner-debt/adjustment" },
  debtAdjustment: { base: "/debt-adjustment" },
  debt: { balance: "/debt/balance/:partnerId" },
  partnerDebtOffset: { base: "/partner-debt/offset" },
  partnerDebt: {
    base: "/partner-debt",
    report: "/partner-debt/report",
    transaction: "/partner-debt/transaction",
    partners: "/partner-debt/partners",
    invoices: "/partner-debt/invoices",
    adjustment: "/partner-debt/adjustment",
    offset: "/partner-debt/offset",
  },
  commissionDebtAdjustment: { base: "/commission-debt/adjustment" },
  commissionDebt: {
    base: "/commission-debt",
    report: "/commission-debt/report",
    transaction: "/commission-debt/transaction",
    adjustment: "/commission-debt/adjustment",
  },
  vat: { transaction: "/vat-debt/report", adjustment: "/vat-adjustment" },
  vatTransaction: { base: "/vat-transaction", balance: "/vat-transaction/balance" },
  vatDebtAdjustment: { base: "/vat-adjustment" },
  vatDebtReport: { base: "/vat-debt/report" },

  // ── System ──
  notification: {
    base: "/notification",
    markRead: "/notification/:id/mark-read",
    markAllRead: "/notification/mark-all-read",
  },
  deviceWhitelist: {
    base: "/device-whitelist",
    approve: "/device-whitelist/:id/approve",
    reject: "/device-whitelist/:id/reject",
  },
  operationLog: { base: "/log" },
  service: { base: "/service" },
};
