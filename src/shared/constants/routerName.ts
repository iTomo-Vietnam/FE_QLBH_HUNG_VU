export const publicRoutesName = {
  login: "/login",
  errorNetwork: "/error-network",
  error404: "/error-404",
  forgotPassword: "/forgot-password",
  confirmOtp: "/confirm-otp",
  confirmPassword: "/confirm-password",
  confirmEmail: "/confirm-email",
  newPassword: "/new-password",
  blank: "/blank-page",

  // invite
  confirmInviteSuccess: "/accept-invitation-success",
  confirmInviteFailed: "/accept-invitation-failed",
  auth: "auth",
  refreshToken: "auth/refresh-token",
};

export const privateRoutesName = {
  // TODO: Dashboard
  dashboard: "/",

  pos: "/pos",

  // TODO: Bán hàng
  sale: "/sales",
  saleReturn: "/sales-returns",

  // TODO: Hàng hóa
  product: "/products",
  storeTransfer: "/store-transfer",
  inventoryAdjustment: "/inventory-adjustments",
  internalExport: "/internal-export",

  // TODO: Mua hàng
  supplier: "/suppliers",
  purchase: "/purchases",
  purchaseReturn: "/purchases-returns",

  // TODO: Khách hàng
  customer: "/customers",

  // TODO: Sổ quỹ
  incomeExpense: "/income-expenses",
  transferNote: "/transfer-notes",
  dailyReport: "/daily-reports",

  // TODO: Kế toán
  fund: "/funds",
  fundAdjustment: "/fund-adjustments",
  fundTransfer: "/fund-transfers",
  debtAdjustment: "/debt-adjustments",
  vatAdjustment: "/vat-adjustments",

  // TODO: Phân tích
  analysis: {
    base: "/analysis/:section",
    sale: "/analysis/sale",
    product: "/analysis/product",
    customer: "/analysis/customer",
    effectiveness: "/analysis/effectiveness",
  },

  // TODO: Báo cáo
  report: { base: "/reports" },

  // TODO: Thiết lập
  setup: {
    store: "/setup/stores",
    attribute: "/setup/attributes",
    shipper: "/setup/shippers",
    user: "/setup/users",
    role: "/setup/roles",
    log: "/setup/logs",
  },

  profile: "/profile",
  setting: "/setting",
};

export interface RouteTitleMap {
  [key: string]: {
    path: string;
    title: string;
    subtitle: string;
  };
}

export const routeTitleMap: RouteTitleMap = {
  login: {
    path: publicRoutesName.login,
    title: "Đăng nhập",
    subtitle: "Vui lòng đăng nhập để tiếp tục",
  },
  errorNetwork: {
    path: publicRoutesName.errorNetwork,
    title: "Mất kết nối",
    subtitle: "Không thể kết nối đến máy chủ",
  },
  error404: {
    path: publicRoutesName.error404,
    title: "Không tìm thấy trang",
    subtitle: "Trang bạn yêu cầu không tồn tại hoặc đã được di chuyển",
  },
  forgotPassword: {
    path: publicRoutesName.forgotPassword,
    title: "Quên mật khẩu",
    subtitle: "Khôi phục quyền truy cập tài khoản",
  },
  confirmOtp: {
    path: publicRoutesName.confirmOtp,
    title: "Xác thực OTP",
    subtitle: "Nhập mã xác thực để tiếp tục",
  },
  confirmPassword: {
    path: publicRoutesName.confirmPassword,
    title: "Xác nhận mật khẩu",
    subtitle: "Thiết lập mật khẩu mới cho tài khoản",
  },
  confirmEmail: {
    path: publicRoutesName.confirmEmail,
    title: "Xác nhận email",
    subtitle: "Xác nhận địa chỉ email của bạn",
  },
  newPassword: {
    path: publicRoutesName.newPassword,
    title: "Mật khẩu mới",
    subtitle: "Cập nhật mật khẩu đăng nhập",
  },
  blank: {
    path: publicRoutesName.blank,
    title: "Trang trống",
    subtitle: "",
  },
  confirmInviteSuccess: {
    path: publicRoutesName.confirmInviteSuccess,
    title: "Chấp nhận lời mời thành công",
    subtitle: "Tài khoản của bạn đã được xác nhận",
  },
  confirmInviteFailed: {
    path: publicRoutesName.confirmInviteFailed,
    title: "Chấp nhận lời mời thất bại",
    subtitle: "Liên kết lời mời không hợp lệ hoặc đã hết hạn",
  },
  dashboard: {
    path: privateRoutesName.dashboard,
    title: "Tổng quan",
    subtitle: "Tổng quan về hoạt động kinh doanh",
  },
  pos: {
    path: privateRoutesName.pos,
    title: "Bán hàng POS",
    subtitle: "Tạo và quản lý đơn bán hàng",
  },
  sale: {
    path: privateRoutesName.sale,
    title: "Hóa đơn",
    subtitle: "Danh sách hóa đơn bán hàng",
  },
  saleReturn: {
    path: privateRoutesName.saleReturn,
    title: "Trả hàng",
    subtitle: "Danh sách phiếu trả hàng bán",
  },
  product: {
    path: privateRoutesName.product,
    title: "Hàng hóa",
    subtitle: "Quản lý danh sách hàng hóa",
  },
  storeTransfer: {
    path: privateRoutesName.storeTransfer,
    title: "Chuyển kho",
    subtitle: "Theo dõi hàng hóa chuyển giữa các kho",
  },
  inventoryAdjustment: {
    path: privateRoutesName.inventoryAdjustment,
    title: "Kiểm kho",
    subtitle: "Kiểm kê và điều chỉnh tồn kho",
  },
  internalExport: {
    path: privateRoutesName.internalExport,
    title: "Xuất nội bộ",
    subtitle: "Xuất hàng hóa sử dụng nội bộ",
  },
  supplier: {
    path: privateRoutesName.supplier,
    title: "Nhà cung cấp",
    subtitle: "Quản lý thông tin nhà cung cấp",
  },
  purchase: {
    path: privateRoutesName.purchase,
    title: "Nhập hàng",
    subtitle: "Danh sách phiếu nhập hàng",
  },
  purchaseReturn: {
    path: privateRoutesName.purchaseReturn,
    title: "Trả hàng nhập",
    subtitle: "Danh sách phiếu trả hàng nhập",
  },
  customer: {
    path: privateRoutesName.customer,
    title: "Khách hàng",
    subtitle: "Quản lý thông tin khách hàng",
  },
  incomeExpense: {
    path: privateRoutesName.incomeExpense,
    title: "Thu chi",
    subtitle: "Quản lý các khoản thu và chi",
  },
  transferNote: {
    path: privateRoutesName.transferNote,
    title: "Ghi chú chuyển khoản",
    subtitle: "Theo dõi các khoản chuyển khoản cần đối soát",
  },
  dailyReport: {
    path: privateRoutesName.dailyReport,
    title: "Báo cáo hằng ngày",
    subtitle: "Tổng hợp hoạt động và dòng tiền trong ngày",
  },
  fund: {
    path: privateRoutesName.fund,
    title: "Quỹ thanh toán",
    subtitle: "Quản lý các quỹ thanh toán và số dư",
  },
  fundAdjustment: {
    path: privateRoutesName.fundAdjustment,
    title: "Điều chỉnh số dư",
    subtitle: "Điều chỉnh số dư quỹ",
  },
  fundTransfer: {
    path: privateRoutesName.fundTransfer,
    title: "Chuyển quỹ",
    subtitle: "Chuyển tiền giữa các quỹ",
  },
  debtAdjustment: {
    path: privateRoutesName.debtAdjustment,
    title: "Điều chỉnh công nợ",
    subtitle: "Điều chỉnh số dư công nợ đối tác",
  },
  vatAdjustment: {
    path: privateRoutesName.vatAdjustment,
    title: "Điều chỉnh VAT",
    subtitle: "Điều chỉnh số dư VAT",
  },
  analysis: {
    path: privateRoutesName.analysis.base,
    title: "Phân tích",
    subtitle: "Phân tích dữ liệu hoạt động kinh doanh",
  },
  profile: {
    path: privateRoutesName.profile,
    title: "Thông tin cá nhân",
    subtitle: "Thông tin tài khoản",
  },
  setting: {
    path: privateRoutesName.setting,
    title: "Cài đặt hiển thị",
    subtitle: "Tùy chỉnh giao diện và hiển thị",
  },
  store: {
    path: privateRoutesName.setup.store,
    title: "Cửa hàng",
    subtitle: "Quản lý các cửa hàng trong hệ thống",
  },
  attribute: {
    path: privateRoutesName.setup.attribute,
    title: "Danh mục",
    subtitle: "Quản lý các danh mục dùng trong hệ thống",
  },
  shipper: {
    path: privateRoutesName.setup.shipper,
    title: "Đơn vị vận chuyển",
    subtitle: "Quản lý đơn vị vận chuyển",
  },
  user: {
    path: privateRoutesName.setup.user,
    title: "Người dùng",
    subtitle: "Quản lý tài khoản người dùng",
  },
  role: {
    path: privateRoutesName.setup.role,
    title: "Vai trò hệ thống",
    subtitle: "Quản lý vai trò và phân quyền",
  },
  log: {
    path: privateRoutesName.setup.log,
    title: "Nhật ký hoạt động",
    subtitle: "Theo dõi các hoạt động của người dùng trong hệ thống",
  },
};
