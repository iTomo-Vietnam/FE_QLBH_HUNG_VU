import axios from "axios";
import dayjs from "dayjs";
import { apiGetIpAddress, BASE_URL } from "@/shared/constants/apiEndpoint.ts";
import { TAG_COLORS } from "@/shared/constants/ui.ts";
import { publicRoutesName } from "@/shared/constants/routerName.ts";
import { Address } from "@/shared/interfaces/common.ts";
import { APP_NAME } from "../constants/enum";
import { SortData } from "../interfaces/api";
import { Entity } from "../base/entity";
import { MessageInstance } from "antd/es/message/interface";
import { deletePendingFiles } from "./file.util";

export const getIpAddress = () => axios.get(apiGetIpAddress);

export const setIpAddress = async () => {
  try {
    const response = await getIpAddress();
    const ipAddress = response?.data?.ip;
    if (ipAddress) {
      sessionStorage.setItem("ipAddress", ipAddress);
    }
  } catch (error) {
    console.error("Failed to fetch IP address:", error);
  }
};

export const getDelayStyle = (index?: number, rate?: number) => {
  return {
    "--delay": `${(index || 0) * (rate || 0.1)}s`,
  } as React.CSSProperties;
};

export const getPageTitle = (customTitle?: string | null, companyName?: string) => {
  return customTitle ? `${companyName || APP_NAME} | ${customTitle}` : companyName || APP_NAME;
};

export const formatPayload = (payload?: any) => {
  const {
    creatorIds,
    updaterIds,
    completerIds,
    exporterIds,
    importerIds,
    userIds,
    supplierIds,
    customerIds,
    shipperIds,
    partnerIds,
    customerGroupIds,
    supplierGroupIds,
    shipperGroupIds,
    fundIds,
    orderIds,
    storeIds,
    roleIds,
    productIds,
    productGroupIds,
    unitIds,
    brandIds,
    locationIds,
    ...rest
  } = (payload as any) || {};

  return {
    ...rest,
    creatorIds: normalizeIdsField(creatorIds),
    updaterIds: normalizeIdsField(updaterIds),
    completerIds: normalizeIdsField(completerIds),
    exporterIds: normalizeIdsField(exporterIds),
    importerIds: normalizeIdsField(importerIds),
    userIds: normalizeIdsField(userIds),
    supplierIds: normalizeIdsField(supplierIds),
    customerIds: normalizeIdsField(customerIds),
    shipperIds: normalizeIdsField(shipperIds),
    partnerIds: normalizeIdsField(partnerIds),
    customerGroupIds: normalizeIdsField(customerGroupIds),
    supplierGroupIds: normalizeIdsField(supplierGroupIds),
    shipperGroupIds: normalizeIdsField(shipperGroupIds),
    fundIds: normalizeIdsField(fundIds),
    orderIds: normalizeIdsField(orderIds),
    storeIds: normalizeIdsField(storeIds),
    roleIds: normalizeIdsField(roleIds),
    productIds: normalizeIdsField(productIds),
    productGroupIds: normalizeIdsField(productGroupIds),
    unitIds: normalizeIdsField(unitIds),
    brandIds: normalizeIdsField(brandIds),
    locationIds: normalizeIdsField(locationIds),
  };
};

export const randomId = (): string => {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback cho môi trường không hỗ trợ crypto.randomUUID
  return "xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const isPhoneNumber = (value?: unknown): boolean =>
  /^\d{8,12}$/.test(String(value ?? "").trim());

export function normalizeIdsField(
  field: any[] | any | undefined,
  mapKey: string = "id",
): string[] | undefined {
  if (!field) return undefined;

  // Nếu là array object → trả về array id
  if (Array.isArray(field)) {
    return field.map((item) => {
      if (typeof item === "object") {
        return item[mapKey];
      }
      return item;
    });
  }

  // Nếu là 1 object → trả về array 1 id
  if (typeof field === "object") {
    return [field[mapKey]];
  }

  // Nếu là string / number đơn → cho vào array
  return [field];
}

interface RefreshTokenParams {
  refreshToken: string;
}

export const refreshAuthToken = async ({ refreshToken }: RefreshTokenParams) => {
  try {
    const deviceId = localStorage.getItem("deviceId") || "1";
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const res = await fetch(`${BASE_URL}/${publicRoutesName.refreshToken}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId || "",
        "x-timezone": timeZone,
      },
      credentials: "include", // tương đương withCredentials: true
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      // đọc message backend nếu có
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Refresh token failed");
    }

    const data = await res.json();
    const loginData = data?.data;

    if (loginData) {
      localStorage.setItem("loginData", JSON.stringify(loginData));
      sessionStorage.setItem("loginData", JSON.stringify(loginData));
    }

    return loginData;
  } catch (error) {
    console.error("refreshAuthToken failed:", error);
    throw error;
  }
};

export const getFullAddress = (address?: Address | null): string => {
  if (!address) return "";

  return [address.detail, address.ward, address.state].filter(Boolean).join(", ");
};

export const hashStringToIndex = (str: string, modulo: number) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // convert to 32bit
  }
  return Math.abs(hash) % modulo;
};

export const getTagColorByName = (name?: string) => {
  if (!name) return "default";

  const index = hashStringToIndex(name, TAG_COLORS.length);
  return TAG_COLORS[index];
};

export function sortData<T extends { sortOrder?: number }>(data: T[]): T[] {
  return [...data].sort((a, b) => {
    const orderA = a.sortOrder ?? 0;
    const orderB = b.sortOrder ?? 0;
    return orderA - orderB;
  });
}

export const getDefaultVariant = () => {
  const variantTempId = randomId();

  return {
    variants: [
      {
        tempId: variantTempId,
      },
    ],
    units: [
      {
        isBaseUnit: true,
        conversionRate: 1,
        variantUnits: [
          {
            tempId: variantTempId,
          },
        ],
      },
    ],
  };
};

export const getPublic = async ({ refreshToken }: RefreshTokenParams) => {
  try {
    const deviceId = localStorage.getItem("deviceId") || "1";
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const res = await fetch(`${BASE_URL}/${publicRoutesName.refreshToken}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-id": deviceId || "",
        "x-timezone": timeZone,
      },
      credentials: "include", // tương đương withCredentials: true
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      // đọc message backend nếu có
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Refresh token failed");
    }

    const data = await res.json();
    const loginData = data?.data;

    if (loginData) {
      localStorage.setItem("loginData", JSON.stringify(loginData));
      sessionStorage.setItem("loginData", JSON.stringify(loginData));
    }

    return loginData;
  } catch (error) {
    console.error("refreshAuthToken failed:", error);
    throw error;
  }
};

// Tính toán giá từ lines
export const calculatePricesFromLines = (lines: any[] = []) => {
  const laborUnitPrice = lines
    .filter((l) => l.type === "LABOR")
    .reduce((sum, l) => sum + (l.normQuantity * (l?.unitPrice ?? 0) || 0), 0);

  const equipmentUnitPrice = lines
    .filter((l) => l.type === "EQUIPMENT")
    .reduce((sum, l) => sum + (l.normQuantity * (l?.unitPrice ?? 0) || 0), 0);
  const materialUnitPrice = lines
    .filter((l) => l.type === "MATERIAL")
    .reduce((sum, l) => sum + (l.normQuantity * (l?.unitPrice ?? 0) || 0), 0);

  return { laborUnitPrice, equipmentUnitPrice, materialUnitPrice };
};

// Cập nhật lại giá từ lines hiện tại trong form
export const updatePricesFromCurrentLines = (
  form: any,
  sectionIndex: number,
  taskIndex: number,
) => {
  const basePath = ["sections", sectionIndex, "tasks", taskIndex];
  const lines = form.getFieldValue([...basePath, "lines"]) || [];
  const { laborUnitPrice, equipmentUnitPrice, materialUnitPrice } = calculatePricesFromLines(lines);

  form.setFields([
    { name: [...basePath, "materialUnitPrice"], value: materialUnitPrice || 0 },
    { name: [...basePath, "laborUnitPrice"], value: laborUnitPrice },
    { name: [...basePath, "equipmentUnitPrice"], value: equipmentUnitPrice },
  ]);
};

// Tính thành tiền = khối lượng × đơn giá × hệ số điều chỉnh
export const calculateAmount = (
  quantity: number = 0,
  price: number = 0,
  factor: number = 1,
): number => {
  const q = Number(quantity) || 0;
  const p = Number(price) || 0;
  const f = Number(factor) || 1;
  return q * p * f;
};

// Biến một chuỗi thành viết tắt in hoa
export const stringToAcronym = (str: string): string => {
  if (!str) return "";
  const words = str.split(" ");
  const acronym = words.map((word) => word.charAt(0).toUpperCase()).join("");
  return acronym;
};

export const checkSelection = (): boolean => {
  const selection = window.getSelection();
  if (selection && selection.toString()) return true;
  return false;
};

export function pxToWidth(px: number) {
  return Math.round((px / 7) * 100) / 100;
}
export function pxToHeight(px: number) {
  return (px * 3) / 4;
}

export function isSameEntityIdOrder<T extends Entity>(current: T[], next: T[]): boolean {
  return current.length === next.length && current.every((item, idx) => item.id === next[idx]?.id);
}

export function mergePaginatedEntities<T extends Entity>(
  current: T[],
  incoming: T[],
  currentPage?: number,
): T[] {
  if (currentPage === 1) {
    return incoming;
  }

  if (!incoming.length) return current;

  const incomingIds = new Set(incoming.map((item) => item.id));
  const filteredCurrent = current.filter((item) => !incomingIds.has(item.id));
  const merged = [...filteredCurrent, ...incoming];

  return isSameEntityIdOrder(current, merged) ? current : merged;
}

export const handleSort = <T extends Entity>(
  oldList: T[],
  newList: T[],
  setList: (list: T[]) => void,
  onSortItem?: (sortedItem: SortData) => void,
) => {
  if (!newList.length) return;
  if (oldList.length !== newList.length) return;

  const firstMismatchIndex = newList.findIndex((item, index) => item.id !== oldList[index]?.id);
  if (firstMismatchIndex === -1) return;

  let lastMismatchIndex = newList.length - 1;
  while (
    lastMismatchIndex >= 0 &&
    newList[lastMismatchIndex]?.id === oldList[lastMismatchIndex]?.id
  ) {
    lastMismatchIndex -= 1;
  }

  let movedItem: T | undefined;

  // Xử lý case drag 1 item: 1 item được kéo, các item còn lại chỉ bị dồn vị trí.
  if (lastMismatchIndex >= firstMismatchIndex) {
    const movedDownCandidateId = oldList[firstMismatchIndex]?.id;
    const movedUpCandidateId = oldList[lastMismatchIndex]?.id;

    if (newList[lastMismatchIndex]?.id === movedDownCandidateId) {
      movedItem = newList[lastMismatchIndex];
    } else if (newList[firstMismatchIndex]?.id === movedUpCandidateId) {
      movedItem = newList[firstMismatchIndex];
    }
  }

  // Fallback nếu dữ liệu reorder không đúng pattern drag 1 item.
  if (!movedItem) {
    const oldIndexById = new Map(oldList.map((item, index) => [item.id, index]));
    let maxDelta = 0;

    for (let newIndex = 0; newIndex < newList.length; newIndex += 1) {
      const item = newList[newIndex];
      const oldIndex = oldIndexById.get(item.id);

      if (oldIndex === undefined) continue;

      const delta = Math.abs(newIndex - oldIndex);
      if (delta > maxDelta) {
        maxDelta = delta;
        movedItem = item;
      }
    }
  }

  if (!movedItem) return;

  const index = newList.findIndex((i) => i.id === movedItem.id);

  const prev = newList[index - 1];
  const next = newList[index + 1];

  let newSortOrder = 0;

  // 👉 đầu
  if (!prev && next) {
    newSortOrder = (next.sortOrder || 0) / 2;
  }
  // 👉 cuối
  else if (prev && !next) {
    newSortOrder = (prev.sortOrder || 0) + 10;
  }
  // 👉 giữa
  else if (prev && next) {
    newSortOrder = ((prev.sortOrder || 0) + (next.sortOrder || 0)) / 2;
  }
  // 👉 only one
  else {
    newSortOrder = 10;
  }

  setList(
    newList.map((item) => (item.id === movedItem.id ? { ...item, sortOrder: newSortOrder } : item)),
  );

  onSortItem?.({
    id: movedItem.id,
    sortOrder: newSortOrder,
  });
};

/**
 * Viết tắt text nếu dài hơn maxLength
 */
export function abbreviateText(text: string, maxLength: number = 20): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * Lấy trạng thái hết hạn dựa vào ngày
 */
export function getExpiredStatus(expiredAt?: string | null): "expired" | "expiring" | "valid" {
  if (!expiredAt) return "valid";
  const now = dayjs();
  const expired = dayjs(expiredAt);
  if (expired.isBefore(now)) return "expired";
  if (expired.diff(now, "day") <= 30) return "expiring";
  return "valid";
}

/**
 * Ẩn một phần text, chỉ hiển thị N ký tự cuối cùng.
 * Ví dụ: maskText("0200783936", 3) → "xxxxxxx936"
 */
export function maskText(text: string, showLast: number = 3): string {
  if (!text) return "";
  if (text.length <= showLast) return text;
  return "x".repeat(text.length - showLast) + text.slice(-showLast);
}

export const handleCopy = async (content: string, message?: MessageInstance) => {
  try {
    await navigator.clipboard.writeText(content);
    message?.success("Đã copy!");
  } catch (err) {
    message?.error("Copy thất bại!");
  }
};

// ── Type helpers cho resolveByPath ──

type Primitive = string | number | boolean | null | undefined | Date | bigint | symbol;

type Prev = [never, 0, 1, 2, 3, 4];

/**
 * Deep path within T that supports recursive snapshot resolution.
 * At each level, if T has both K and `${K}Snapshot`, the path can continue
 * through either the relation type or the snapshot type.
 *
 * Ví dụ: T = { product: Product; productSnapshot: ProductSnapshot }
 *   → ResolveDeepPath<T> allows ["product", "code"] to resolve through
 *     either Product.code or ProductSnapshot.code at each level.
 */
type ResolveDeepPath<T, Depth extends number = 4> = [Depth] extends [never]
  ? never
  : T extends Primitive
    ? never
    : T extends readonly (infer U)[]
      ? ResolveDeepPath<U, Prev[Depth]>
      : {
          [K in keyof T & string]:
            | [K]
            // Continue through relation type
            | (ResolveDeepPath<NonNullable<T[K]>, Prev[Depth]> extends infer P
                ? P extends readonly PropertyKey[]
                  ? [K, ...P]
                  : never
                : never)
            // If K has a snapshot, also allow paths through the snapshot type
            | (T extends Record<`${K}Snapshot`, infer S>
                ? S extends Record<string, any>
                  ? ResolveDeepPath<S, Prev[Depth]> extends infer P
                    ? P extends readonly PropertyKey[]
                      ? [K, ...P]
                      : never
                    : never
                  : never
                : never);
        }[keyof T & string];

/** Path that starts with a SnapshotKey, continues with ResolveDeepPath into the snapshot type */
type SnapshotEntry<T, K extends keyof T & string> = K extends `${infer Base}Snapshot`
  ? [Base] | [Base, ...ResolveDeepPath<NonNullable<T[K]>>]
  : never;

type SnapshotPath<T> = {
  [K in keyof T & string]: SnapshotEntry<T, K>;
}[keyof T & string];

/**
 * Infer the value type at the end of a path, supporting snapshot resolution.
 *
 * Ví dụ:
 *   ResolvePathValue<PurchaseQuotation, ["supplier", "code"]> → string
 *   ResolvePathValue<PurchaseQuotation, ["supplier", "address"]> → Address | null
 */
type ResolvePathValue<T, P extends readonly string[]> = P extends readonly [infer K, ...infer Rest]
  ? K extends string
    ? Rest extends readonly string[]
      ? K extends keyof T
        ? Rest extends []
          ? T[K]
          : ResolvePathValue<NonNullable<T[K]>, Rest>
        : `${K}Snapshot` extends keyof T
          ? Rest extends []
            ? T[`${K}Snapshot` & keyof T]
            : ResolvePathValue<NonNullable<T[`${K}Snapshot` & keyof T]>, Rest>
          : never
      : never
    : never
  : T;

/**
 * Resolve giá trị từ object theo path, ưu tiên relation hiện tại → snapshot.
 *
 * Type-safe: key đầu tiên phải có `${key}Snapshot` trên T,
 * các key tiếp theo phải là path hợp lệ trên kiểu đã resolve.
 *
 * Ví dụ: resolveByPath(line, ["product", "code"])
 *   → line.product?.code || line.productSnapshot?.code || ""
 *
 * @param obj   Object gốc
 * @param path  Mảng path (key đầu phải là SnapshotKey của T)
 * @param fallback Giá trị fallback (mặc định "")
 */
export function resolveByPath<T extends Record<string, any>>(
  obj: T | null | undefined,
  path: readonly string[],
  fallback?: any,
): any {
  return resolveByPathImpl(obj, path, fallback);
}

function resolveByPathImpl(
  obj: Record<string, any> | null | undefined,
  path: readonly string[],
  fallback: any = "",
): string {
  if (!obj || path.length === 0) return fallback;

  const [first, ...rest] = path;

  // Ưu tiên relation hiện tại → snapshot
  const relation = obj[first];
  const snapshot = obj[`${first}Snapshot`];

  const objToTraverse = relation ?? snapshot;

  let value: any = objToTraverse;

  for (const key of rest) {
    if (value == null) {
      return fallback;
    }
    value = value[key];
  }
  return value ?? fallback;
}

export const handleCloseWithPendingFiles = (id: string, onClose?: () => void) => {
  deletePendingFiles(id);
  onClose?.();
};
