import { privateRoutesName } from "@/shared/constants/routerName";
import { NotificationType } from "@/shared/constants/enum";
import { Module, PermissionStructure } from "@/shared/constants/permission";
import { checkPermission } from "@/shared/utils/permission.util";
import { Notification } from "@/shared/interfaces/notification";

export interface NotificationNavigationState {
  notification?: {
    notificationId?: string;
    entityId?: string;
    entityType?: string | null;
    storeId?: string;
    openDetail?: boolean;
  };
}

export interface NotificationTarget {
  path: string;
  state?: NotificationNavigationState;
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const getString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const normalized = (value?: string | null) => value?.replace(/[_\s-]/g, "").toLowerCase();

const normalizeSearchText = (value?: string | null) =>
  value
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D")
    .toLowerCase();

const moduleRoutes: Partial<Record<Module, string>> = {
  sale: privateRoutesName.sale,
  saleReturn: privateRoutesName.saleReturn,
  purchase: privateRoutesName.purchase,
  purchaseReturn: privateRoutesName.purchaseReturn,
  storeTransfer: privateRoutesName.storeTransfer,
  incomeExpense: privateRoutesName.incomeExpense,
  transferNote: privateRoutesName.transferNote,
  dailyReport: privateRoutesName.dailyReport,
  fundAdjustment: privateRoutesName.fundAdjustment,
  fundTransfer: privateRoutesName.fundTransfer,
  debtAdjustment: privateRoutesName.debtAdjustment,
  vatAdjustment: privateRoutesName.vatAdjustment,
};

const canReadModule = (
  permissions: PermissionStructure | null | undefined,
  module: Module,
  isAdmin?: boolean,
) => Boolean(isAdmin || checkPermission(permissions || null, module, "read"));

const buildTarget = (
  item: Notification,
  module: Module,
  permissions: PermissionStructure | null | undefined,
  isAdmin?: boolean,
  entityId?: string,
  storeId?: string,
  storePermissions?: Record<string, PermissionStructure | null | undefined>,
): NotificationTarget | undefined => {
  const path = moduleRoutes[module];
  const scopedPermissions = storeId && storePermissions ? storePermissions[storeId] : permissions;
  const canRead = canReadModule(scopedPermissions, module, isAdmin);
  if (!path || !canRead) return undefined;

  return {
    path,
    state: entityId || storeId
      ? {
          notification: {
            notificationId: item.id,
            entityId,
            entityType: item.entityType,
            storeId,
            openDetail: Boolean(entityId),
          },
        }
      : undefined,
  };
};

const getOrderModule = (value?: string): Module | undefined => {
  switch (normalized(value)) {
    case "sale":
      return "sale";
    case "salereturn":
      return "saleReturn";
    case "purchase":
      return "purchase";
    case "purchasereturn":
      return "purchaseReturn";
    default:
      return undefined;
  }
};

/** Legacy notifications did not expose data.orderType in the list response. */
const getOrderModuleFromBody = (body?: string): Module | undefined => {
  const text = normalizeSearchText(body);
  if (!text) return undefined;
  if (text.includes("don tra hang nhap")) return "purchaseReturn";
  if (text.includes("don nhap")) return "purchase";
  if (text.includes("don tra")) return "saleReturn";
  if (text.includes("don ban")) return "sale";
  return undefined;
};

export const getNotificationTarget = (
  item: Notification,
  permissions: PermissionStructure | null | undefined,
  isAdmin?: boolean,
  storePermissions?: Record<string, PermissionStructure | null | undefined>,
): NotificationTarget | undefined => {
  const data = asRecord(item.data);
  const entityId = getString(item.entityId) || getString(data.id);
  const storeId = getString(data.storeId);
  const entityType = normalized(item.entityType || getString(data.entityType));
  const orderType = getString(data.orderType) || getString(data.type);

  const orderModule =
    getOrderModule(orderType) ||
    (item.type === NotificationType.PURCHASE ? "purchase" : undefined) ||
    (entityType ? getOrderModule(entityType) : undefined) ||
    (entityType === "order" ? getOrderModuleFromBody(item.body) : undefined);

  if (
    orderModule &&
    ([
      NotificationType.ORDER,
      NotificationType.ORDER_LINE,
      NotificationType.QUOTATION_REQUEST,
    ].includes(item.type) ||
      entityType === "order" ||
      entityType === "sale" ||
      entityType === "salereturn" ||
      entityType === "purchase" ||
      entityType === "purchasereturn")
  ) {
    return buildTarget(item, orderModule, permissions, isAdmin, entityId, storeId, storePermissions);
  }

  if (item.type === NotificationType.STORE_TRANSFER || entityType === "storetransfer") {
    return buildTarget(item, "storeTransfer", permissions, isAdmin, entityId, storeId, storePermissions);
  }

  if (item.type === NotificationType.STORE_WORKDAY) {
    return buildTarget(item, "dailyReport", permissions, isAdmin, undefined, storeId, storePermissions);
  }

  const entityModule: Partial<Record<string, Module>> = {
    incomeexpense: "incomeExpense",
    transfernote: "transferNote",
    fundadjustment: "fundAdjustment",
    fundtransfer: "fundTransfer",
    debtadjustment: "debtAdjustment",
    vatadjustment: "vatAdjustment",
  };
  const module = entityType ? entityModule[entityType] : undefined;
  return module
    ? buildTarget(item, module, permissions, isAdmin, entityId, storeId, storePermissions)
    : undefined;
};
