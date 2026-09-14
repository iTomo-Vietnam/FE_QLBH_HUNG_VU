/** Permission modules — single source of truth matching BE permission.middleware.ts. */
export const MODULES = [
  "dashboard", // Tổng quan
  "analysis", // Phân tích
  "reports", // Báo cáo chi tiết
  "debtReport", // Báo cáo công nợ
  "inventoryReport", // Báo cáo tồn kho
  "fundReport", // Báo cáo số dư quỹ
  "vatReport", // Báo cáo thuế GTGT

  // Bán hàng
  "sale", // Bán hàng
  "saleReturn", // Đổi trả hàng

  // Nhập xuất tồn kho
  "purchase", // Nhập hàng
  "purchaseReturn", // Đổi trả hàng mua
  "storeTransfer", // Chuyển kho
  "inventoryAdjustment", // Điều chỉnh tồn kho
  "internalExport", // Xuất nội bộ

  // Tài chính & kế toán
  "incomeExpense", // Thu chi
  "transferNote", // Ghi chú chuyển khoản
  "dailyReport", // Báo cáo hằng ngày
  "fund", // Quỹ
  "fundAdjustment", // Điều chỉnh số dư quỹ
  "fundTransfer", // Chuyển quỹ
  "debtAdjustment", // Điều chỉnh công nợ
  "vatAdjustment", // Điều chỉnh thuế GTGT

  // Đối tác
  "customer", // Khách hàng
  "supplier", // Nhà cung cấp
  "shipper", // Đơn vị vận chuyển

  // Thiết lập
  "product", // Sản phẩm
  "store", // Kho hàng

  "user", // Người dùng
  "role", // Vai trò hệ thống
  "attribute", // Danh mục
  "log", // Nhật ký thao tác
] as const;
export type Module = (typeof MODULES)[number];

export const PERMISSIONS = ["create", "read", "update", "delete", "approve", "complete"] as const;
export type Permission = (typeof PERMISSIONS)[number];
export type PermissionStructure = { [key in Module]?: Permission[] };

export const ReadOnlyModules: Module[] = [
  "dashboard",
  "analysis",
  "reports",
  "debtReport",
  "inventoryReport",
  "fundReport",
  "vatReport",
  "log",
];
export const ApprovalModules: Module[] = [];
export const CompleteModules: Module[] = [
  "sale",
  "saleReturn",
  "purchase",
  "purchaseReturn",
  "storeTransfer",
  "incomeExpense",
];

export const readPermissionFallbackMap: Partial<Record<Module, Module[]>> = {
  product: [
    "sale",
    "saleReturn",
    "purchase",
    "purchaseReturn",
    "inventoryAdjustment",
    "storeTransfer",
    "internalExport",
  ],
  customer: ["sale"],
  fund: ["fundTransfer", "fundAdjustment"],
};

export const moduleMap: Record<Module, string> = {
  dashboard: "Tổng quan",
  analysis: "Phân tích",
  reports: "Báo cáo chi tiết",
  debtReport: "Báo cáo công nợ",
  inventoryReport: "Báo cáo tồn kho",
  fundReport: "Báo cáo quỹ",
  vatReport: "Báo cáo VAT",
  sale: "Bán hàng",
  saleReturn: "Đổi trả hàng",
  purchase: "Nhập hàng",
  purchaseReturn: "Đổi trả hàng nhập",
  storeTransfer: "Chuyển kho",
  inventoryAdjustment: "Điều chỉnh tồn kho",
  internalExport: "Xuất nội bộ",
  incomeExpense: "Thu chi",
  transferNote: "Ghi chú chuyển khoản",
  dailyReport: "Báo cáo hằng ngày",
  fund: "Quỹ",
  fundAdjustment: "Điều chỉnh quỹ",
  fundTransfer: "Chuyển quỹ",
  debtAdjustment: "Điều chỉnh công nợ",
  vatAdjustment: "Điều chỉnh VAT",
  customer: "Khách hàng",
  supplier: "Nhà cung cấp",
  shipper: "Đơn vị vận chuyển",
  product: "Sản phẩm",
  store: "Cửa hàng",
  user: "Người dùng",
  role: "Vai trò",
  attribute: "Danh mục",
  log: "Nhật ký thao tác",
};
export const permissionMap: Record<Permission, string> = {
  read: "Xem",
  create: "Thêm",
  update: "Sửa",
  delete: "Xóa",
  approve: "Duyệt",
  complete: "Hoàn tất",
};

export const role: { title: string; modules: Module[] }[] = [
  {
    title: "Báo cáo",
    modules: [
      "dashboard",
      "analysis",
      "reports",
      "debtReport",
      "inventoryReport",
      "fundReport",
      "vatReport",
      "dailyReport",
    ],
  },
  { title: "Kinh doanh", modules: ["customer", "sale", "saleReturn"] },
  {
    title: "Hàng hóa",
    modules: ["product", "storeTransfer", "inventoryAdjustment", "internalExport"],
  },
  { title: "Mua hàng", modules: ["supplier", "purchase", "purchaseReturn"] },
  {
    title: "Tài chính",
    modules: [
      "incomeExpense",
      "transferNote",
      "fund",
      "fundTransfer",
      "fundAdjustment",
      "debtAdjustment",
      "vatAdjustment",
    ],
  },
  { title: "Thiết lập", modules: ["store", "attribute", "shipper", "user", "role", "log"] },
];

export function getPermissionOptions(module: Module): { value: Permission; label: string }[] {
  const permissions: Permission[] = ReadOnlyModules.includes(module)
    ? ["read"]
    : ["read", "create", "update", "delete"];
  if (ApprovalModules.includes(module)) permissions.push("approve");
  if (CompleteModules.includes(module)) permissions.push("complete");
  return permissions.map((value) => ({ value, label: permissionMap[value] }));
}
