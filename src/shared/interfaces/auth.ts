import { Attribute as AttributeModel } from "@/modules/attribute/attribute.model";
import { User, Store } from "@/shared/base/entity";
import { Module, PermissionStructure } from "@/shared/constants/permission";
import { FormatData } from "@/shared/interfaces/format";

// TODO: Đăng nhập
export interface LoginRequest {
  username: string;
  password: string;
}

// TODO: Đăng ký
export interface RegisterRequest {
  email: string;
}

// TODO: Quên mật khẩu
export interface ForgotPasswordRequest {
  email: string;
}

// TODO: Xác thực OTP
export interface VerifyOtpRequest {
  otp: string;
}

// TODO: Xác nhận mật khẩu mới / Xác thực đăng ký
export interface ConfirmPasswordRequest {
  password: string;
  isLogout?: boolean; // TODO: Nếu là xác nhận mật khẩu mới thì có thể đăng xuất tất cả phiên đăng nhập
  storeCode?: string;
  storeName?: string;
}

// TODO: Đặt lại mật khẩu
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  isLogout?: boolean;
}

// TODO: Dữ liệu đăng nhập thành công
export interface LoginData {
  id: string; // ID của nhân sự
  username: string; // Tên đăng nhập
  name: string; // Họ và tên đầy đủ
  email: string; // Email của nhân sự
  phone: string | null; // Số điện thoại (nullable)
  departmentId: string | null; // ID phòng ban (nullable)
  avatar: string | null; // Ảnh đại diện (nullable)
  role: string; // Vai trò của nhân sự (VD: ADMIN, USER, v.v.)
  accessToken: string; // Token xác thực
  refreshToken: string; // Token refresh
}
export interface LogoutRequest {
  username: string;
  password: string;
}

// TODO: Dữ liệu cài đặt nhân sự
export interface SettingData {}

// TODO: Thông tin nhân sự khi getInfo
export interface UserInfo extends User {
  format: FormatData;

  isAdmin?: boolean;

  permissions: PermissionStructure | null;

  allStores: Store[];
  currentStore: Store | null;

  defaultWeightUnit?: AttributeModel;
  defaultMeshUnit?: AttributeModel;
  defaultAreaUnit?: AttributeModel;

  importExcel?: Module[];
  exportExcel?: Module[];
}
