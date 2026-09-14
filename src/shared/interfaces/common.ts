import { FormInstance } from "antd";
import { DefaultOptionType } from "antd/es/select";
import { SelectProps as AntdSelectProps } from "antd";
import { ApiRequestQuery, BaseError, PaginationProps, PayloadWithSubId } from "./api";
import { IdentificationType, SortOrder } from "@/shared/constants/enum";
import { Entity } from "@/shared/base/entity";
import { AttributeType } from "@/modules/attribute/attribute.enum";

export type ThemeMode = "light" | "dark";
export type TagVariant = "default" | "outline" | "solid";
export type TagSize = "sm" | "md" | "lg";
export type TagStyleValue = {
  [key in TagVariant]: string;
};

export interface SelectProps<T, TQuery extends ApiRequestQuery = any> extends Omit<
  AntdSelectProps<string, DefaultOptionType>,
  "value" | "onChange" | "options"
> {
  value?: string;
  onChange?: (value: string) => void;
  defaultData?: T | null;
  hideOptions?: T[];
  onChangeData?: (value: T | undefined) => void;
  options?: T[];
  ref?: React.Ref<any>;
  offsetAt?: string;
  query?: TQuery;
}

export interface MultipleSelectProps<T, TQuery extends ApiRequestQuery = any> extends Omit<
  AntdSelectProps<string[], DefaultOptionType>,
  "value" | "onChange" | "options" | "status" | "mode"
> {
  value?: string[];
  onChange?: (value: string[]) => void;
  defaultData?: T[];
  hideOptions?: T[];
  onChangeData?: (value: T[]) => void;
  options?: T[];
  ref?: React.Ref<any>;
  query?: TQuery;
  offsetAt?: string;
}

export interface AddUpdateModalProps<T> {
  open: boolean;
  editData?: T;
  errors?: BaseError[] | null;
  loading?: boolean;
  type?: string;
  form?: FormInstance<T>;
  defaultData?: Partial<T>;
  onClose: () => void;
  onEdit?: (data: Partial<T>) => void;
  onAdd?: (data: Partial<T>) => void;
}

export interface DetailModalProps<T> {
  open: boolean;
  data?: T;
  loading?: boolean;
  type?: string;
  onEdit?: (data: Partial<T>) => void;
  onOpenUpdate?: (data: T) => void;
  onClose: () => void;
}

export interface AppCardProps<T> {
  item: T;
  className?: string;
  style?: React.CSSProperties;

  selected?: boolean;

  onClick?: (item: T, event?: React.MouseEvent) => void;

  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onSetDefault?: (item: T) => void;
  onSetActive?: (item: T, isActive: boolean) => void;
}

export interface Address {
  state?: string; // Tỉnh/Thành phố
  ward?: string; // Phường/Xã
  detail?: string; // Địa chỉ chi tiết
  lng?: number;
  lat?: number;
  isPermanent?: boolean; // Địa chỉ thường trú hay hiện tại
}

export interface InsuranceInfo {
  salary?: number; // Mức lương đóng bảo hiểm
  startDate?: string; // Ngày bắt đầu đóng bảo hiểm
  rate?: number; // Tỷ lệ đóng bảo hiểm
  insuranceNumber?: string; // Số sổ bảo hiểm
}

export interface Identification {
  type: IdentificationType; // Loại giấy tờ
  identityCode: string; // Số giấy tờ
  issuedDate: string; // Ngày cấp
  issuedPlace: string; // Nơi cấp
  expiredDate?: string; // Ngày hết hạn (nếu có)
}

export interface EducationInfo {
  educationLevel?: string; // Trình độ học vấn
  trainingLevel?: string; // Trình độ đào tạo
  institution?: string; // Nơi đào tạo
  faculty?: string; // Khoa đào tạo
  major?: string; // Chuyên ngành
  graduationYear?: number; // Năm tốt nghiệp
}

export interface Compensation {
  name?: string; // Tên phụ cấp hoặc khoản khấu trừ
  amount?: number; // Số tiền phụ cấp hoặc khấu trừ
  note?: string; // Ghi chú (nếu có)
}

export interface DocumentModel {
  name: string; // Tên tài liệu
  url: string; // Đường dẫn đến tài liệu
}

export interface Representative {
  name: string; // Tên người đại diện
  phone: string; // Số điện thoại người đại diện
  email?: string; // Email người đại diện (tùy chọn)
  relationship?: string; // Mối quan hệ với nhân viên (tùy chọn)
  identityCode?: string; // Số giấy tờ tùy thân của người đại diện (tùy chọn)
}

export interface AdditionalInfo {
  label?: string;
  value?: string | number | boolean | null;
  sortOrder?: number;
}

export interface BankAccount {
  bankName: string; // Tên ngân hàng
  accountNumber: string; // Số tài khoản
  accountHolder: string; // Chủ tài khoản
  branch?: string; // Chi nhánh ngân hàng (tùy chọn)
}

export interface TimeFrame {
  start?: string; // Thời gian bắt đầu (định dạng "HH:mm")
  end?: string; // Thời gian kết thúc (định dạng "HH:mm")
}

export interface FilterItemProps {
  key: string;
  value: number;
  text: string;
}

// * === Hook Interface ===
export interface UseDataParams extends ApiRequestQuery {
  id?: string;
  filter?: Filter;
  ranger?: Ranger;
  search?: Search;
  reload?: boolean;
  offsetAt?: string;
  onCloseModal?: (data?: { isAdded?: boolean; isUpdated?: boolean; isDeleted?: boolean }) => void;
}

// * === Filter Interface ===
export interface ListItemProps<T = any> {
  dataSource: T[];
  pagination?: PaginationProps | null;
  loading?: boolean;
  onClick?: (data: T) => void;
  setPage?: (page: number) => void;
}

// * === Manager Moadel Interface ===
export interface ManagerModalProps<T> {
  open: boolean;
  loading?: boolean;
  selectedValue?: string | null;
  dataSource: T[];
  label: string;
  dataType?: "string" | "number";
  validateFormat?: boolean;
  type?: AttributeType;
  onClose: () => void;
  onAdd?: (data: T) => void;
  onEdit?: (data: T) => void;
  onDelete?: (data: T) => void;
  onSelect: (data: T) => void;
}
export interface MultipleManagerModalProps<T> {
  open: boolean;
  loading?: boolean;
  selectedValues?: string[] | null;
  dataSource: T[];
  label: string;
  dataType?: "string" | "number";
  validateFormat?: boolean;
  type?: AttributeType;
  onClose: () => void;
  onAdd?: (data: T) => void;
  onEdit?: (data: T) => void;
  onDelete?: (data: T) => void;
  onSelect: (data: T[]) => void;
}

// * === Add Modal Interface ===
export interface AddModalProps<T> {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onAdd: (data: T) => void;
}

export interface HandlersInput<T extends Entity> {
  // TODO: Actions
  create?:
    | ((data: Partial<T>, opts?: { onSuccess?: () => void }) => void)
    | ((data: Partial<T>[], opts?: { onSuccess?: () => void }) => void);

  update?: (data: Partial<T>, opts?: { onSuccess?: () => void }) => void;
  remove?: (id: string | PayloadWithSubId, opts?: { onSuccess?: () => void }) => void;
  cancel?: (id: string, reason?: string) => Promise<void>;
  getById?: (
    id: string | PayloadWithSubId,
    opts?: { onSuccess?: (data: T | null) => void },
  ) => void;

  approve?: (id: string) => Promise<void>;
  reject?: (id: string, rejectReason: string, submitInfo?: boolean) => Promise<void>;

  // TODO: State
  setOpen?: (open: boolean) => void;
  setOpenDetail?: (open: boolean) => void;
  setRowData: (data: T | undefined) => void;
}

// * === Filter Interface ===
export type FilterKey =
  | "creatorIds"
  | "completerIds"
  | "updaterIds"
  | "userIds"
  | "supplierIds"
  | "customerIds"
  | "shipperIds"
  | "partnerIds"
  | "customerGroupIds"
  | "supplierGroupIds"
  | "shipperGroupIds"
  | "fundIds"
  | "orderIds"
  | "storeIds"
  | "roleIds"
  | "productIds"
  | "productGroupIds"
  | "unitIds"
  | "brandIds"
  | "locationIds";

export type Filter = {
  [key in FilterKey]?: any[];
};

export type RangeOperator = "Gte" | "Gt" | "Eq" | "Lte" | "Lt";

export type RangerKey =
  | "taxRate"
  | "costPrice"
  | "price"
  | "stockQuantity"
  | "totalStockValue"
  | "weight"
  | "volume"

  // TODO: ORDER
  | "subtotal"
  | "discountAmount"
  | "netAmount"
  | "taxAmount"
  | "totalAmount"
  | "amount"
  | "totalStockQuantity"
  | "totalStockValue"
  | "customerCount"
  | "totalPaidAmount"
  | "totalOutstandingAmount"

  // TODO: Inventory Transaction
  | "quantity"
  | "quantityInBaseUnit"
  | "totalCost"
  | "openingQuantity"
  | "openingAmount"
  | "closingQuantity"
  | "closingAmount"
  | "inQuantity"
  | "inAmount"
  | "outQuantity"
  | "outAmount"
  | "totalQuantity"
  | "totalValue"

  // TODO: Transfer & Adjustment
  | "totalAdjustmentQuantity"
  | "totalAdjustmentAmount"
  | "totalAdjustmentValue"
  | "totalTransferQuantity"
  | "totalTransferAmount"
  | "countedAmount"
  | "expectedAmount"
  | "deltaAmount"

  // TODO: Partner
  | "loyaltyPoints"
  | "totalRevenue"

  // TODO: Production
  | "importedQuantity"

  // TODO: Modifier Group
  | "optionCount"
  | "itemModifierGroupCount"

  // TODO: Ingredient
  | "defaultCostPerBaseUnit"
  | "totalMinStock"
  | "totalStockQuantity"
  | "totalStockValue"

  // TODO: Shift
  | "totalOrders"
  | "totalSuccessOrders"
  | "totalInProgressOrders"
  | "totalCanceledOrders"
  | "revenue"
  | "paidAmount"
  | "difference"
  | "netCashFlow"
  | "currentBalance"
  | "remainingQuantity"

  // TODO: Common
  | "createdAt"
  | "updatedAt"
  | "orderAt"
  | "occurredAt"
  | "canceledAt"
  | "approvedAt"
  | "completedAt"
  | "orderedAt"
  | "timeAt"
  // Cho phép module khai báo thêm field date/number riêng mà không cần sửa base type.
  | (string & {});

export type RangerValue = number | string;

export type Ranger = {
  [key in `${RangerKey}${RangeOperator}`]?: RangerValue;
};

export type RangerItem = {
  key: RangerKey;
  label: string;
  /** Mặc định là number; date chỉ hỗ trợ Gte/Lte. */
  type?: "number" | "date";
};

export type SearchItem = {
  key: string;
  label: string;
};

export type Search = {
  [key: string]: string | undefined;
};

export interface SortValue {
  sortBy?: string;
  sortOrder?: SortOrder;
}
export interface SortItem {
  label: string;
  value: string;
  ascLabel: string;
  descLabel: string;
}

export type PartialFilterProps<T extends Entity = any> = {
  showStore?: boolean;
  data: T[];
  setData: (data: T[]) => void;
};

export function checkIsSameArray<T extends Entity>(arr1: T[], arr2: T[]) {
  const newIds = new Set(arr2.map((i) => i.id));
  return arr1.length === arr2.length && arr1.every((p) => newIds.has(p.id));
}
