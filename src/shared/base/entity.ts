import { FileCategory, Gender } from "@/shared/constants";
import { Address } from "@/shared/interfaces";

export type ActionKey =
  | "update"
  | "delete"
  | "assign"
  | "unassign"
  | "confirm"
  | "cancelConfirm"
  | "cancel"
  | "approve"
  | "reject"
  | "submit"
  | "complete"
  | "archive"
  | "restore"
  | "start"
  | "pay"
  | "arrive"
  | "accept"
  | "remind"
  | "export"
  | "import"
  | "createPurchase"
  | "createShippingPlan"
  | "createStockDocument"
  | "createInvoice"
  | "createPayment"
  | "createQuotation"
  | "createOrder"
  | "customerApprove"
  | "customerReject"
  | "updateMode"
  | "sendMessage";

export type ActionValue = {
  can: boolean;
  reason?: string;
};

export type ActionMap = Partial<Record<ActionKey, ActionValue>>;

// Auto-derived file category keys (lowercased from FileCategory enum)
type FileCategoryKey = Lowercase<keyof typeof FileCategory>;

export type Entity = {
  id: string;
  tempId: string;
  note?: string | null;
  sortOrder?: number;
  isDefault?: boolean;

  createdAt?: string;
  updatedAt?: string | null;

  // BE audit fields
  creatorId?: string | null;
  creatorSnapshot?: UserSnapshot | null;
  updaterId?: string | null;
  updaterSnapshot?: UserSnapshot | null;
  deleterId?: string | null;
  deleterSnapshot?: UserSnapshot | null;

  // FE-only runtime fields
  _actions?: ActionMap;

  __trashFileIds?: string[];
  __unCloseAfterSucess?: boolean;

  isSummary?: boolean;
} & {
  [K in FileCategoryKey]?: any[];
};

export interface User extends Entity {
  code: string;
  name: string;

  username: string;
  password: string;

  email: string | null;
  phone: string | null;
  gender: Gender | null;
  dob: Date | null;
  address: Address | null;

  isActive: boolean;

  notifications?: Notification[];

  storeUsers?: StoreUser[];
}

// ── Snapshots (dữ liệu rút gọn để nhúng vào các entity khác) ──

export interface UserSnapshot {
  id: string;
  code: string;
  name: string;

  username: string;
  password: string;

  email: string | null;
  phone: string | null;
  gender: Gender | null;
  dob: Date | null;
}

export interface StoreSnapshot {
  id: string;
  code: string;
  name: string;
}

export interface Store extends Entity {
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  taxCode: string | null;
  address: Address | null;
  isActive: boolean;
  workEndTime?: string | null;

  userCount: number;
}

export interface StoreEntity extends Entity {
  storeId: string;
  store: Store;
}

export interface StoreUser extends StoreEntity {
  userId: string;
  roleId: string | null;
  role?: import("@/modules/role/role.model").Role | null;
}
