import { Entity, Store, StoreSnapshot, User, UserSnapshot } from "@/shared/base/entity";
import { ApiRequestQuery } from "@/shared/interfaces/api";
import { Attribute } from "../attribute/attribute.model";
import { Product, ProductSnapshot } from "../product/product.model";
import { FilterKey, RangerItem, SortItem } from "@/shared/interfaces/common";

export interface StoreTransferQuery extends ApiRequestQuery {
  fromStoreId?: string;
  toStoreId?: string;
  fromStoreIds?: string[];
  toStoreIds?: string[];
  statuses?: StoreTransferStatus[];
}

export enum StoreTransferStatus {
  PLANNED = "planned",
  EXPORTED = "exported",
  IMPORTED = "imported",
  CANCELED = "canceled",
}

export const storeTransferStatusLabels: Record<StoreTransferStatus, string> = {
  [StoreTransferStatus.PLANNED]: "Lên kế hoạch",
  [StoreTransferStatus.EXPORTED]: "Đã xuất kho",
  [StoreTransferStatus.IMPORTED]: "Đã nhập kho",
  [StoreTransferStatus.CANCELED]: "Đã hủy",
};

export const isStoreTransferSource = (transfer: StoreTransfer, currentStoreId?: string | null) =>
  !currentStoreId || transfer.fromStoreId === currentStoreId;

export const isStoreTransferDestination = (
  transfer: StoreTransfer,
  currentStoreId?: string | null,
) => !currentStoreId || transfer.toStoreId === currentStoreId;

export const canEditStoreTransfer = (transfer: StoreTransfer, currentStoreId?: string | null) =>
  (transfer.status || StoreTransferStatus.PLANNED) === StoreTransferStatus.PLANNED &&
  isStoreTransferSource(transfer, currentStoreId);

export const canExportStoreTransfer = (transfer: StoreTransfer, currentStoreId?: string | null) =>
  (transfer.status || StoreTransferStatus.PLANNED) === StoreTransferStatus.PLANNED &&
  isStoreTransferSource(transfer, currentStoreId);

export const canImportStoreTransfer = (transfer: StoreTransfer, currentStoreId?: string | null) =>
  (transfer.status || StoreTransferStatus.PLANNED) === StoreTransferStatus.EXPORTED &&
  isStoreTransferDestination(transfer, currentStoreId);

export const canCancelStoreTransfer = (transfer: StoreTransfer, currentStoreId?: string | null) =>
  (transfer.status || StoreTransferStatus.PLANNED) !== StoreTransferStatus.CANCELED &&
  (isStoreTransferSource(transfer, currentStoreId) ||
    isStoreTransferDestination(transfer, currentStoreId));

export interface StoreTransferLine extends Entity {
  transferId: string;
  productId: string;
  productSnapshot: ProductSnapshot | null;
  product?: Product | null;
  unitId: string | null;
  unitSnapshot: { id: string; name: string } | null;
  unit?: Attribute | null;
  conversionRateAtTime: number;
  quantity: number;
  differenceCostPriceAmount?: number;
}

export interface StoreTransfer extends Entity {
  code: string;
  occurredAt: string;
  status: StoreTransferStatus;
  exportedAt: string | null;
  exporterId: string | null;
  exporterSnapshot: UserSnapshot | null;
  exporter?: User | null;

  importedAt: string | null;
  importerId: string | null;
  importerSnapshot: UserSnapshot | null;
  importer?: User | null;

  canceledAt: string | null;
  cancelerId: string | null;
  cancelerSnapshot: UserSnapshot | null;
  canceler?: User | null;

  fromStoreId: string;
  fromStoreSnapshot: StoreSnapshot | null;
  fromStore?: Store | null;

  toStoreId: string;
  toStoreSnapshot: StoreSnapshot | null;
  toStore?: Store | null;

  reason: string | null;
  lines: StoreTransferLine[];
}

export const filterUses: FilterKey[] = ["productIds", "creatorIds", "exporterIds", "importerIds"];
export const rangerItems: RangerItem[] = [
  { label: "Ngày lập kế hoạch", key: "occurredAt", type: "date" },
  { label: "Ngày xuất kho", key: "exportedAt", type: "date" },
  { label: "Ngày nhập kho", key: "importedAt", type: "date" },
];
export const sortItems: SortItem[] = [
  { label: "Ngày lập kế hoạch", value: "occurredAt", ascLabel: "Cũ nhất", descLabel: "Mới nhất" },
  { label: "Số phiếu", value: "code", ascLabel: "A → Z", descLabel: "Z → A" },
  { label: "Ngày xuất kho", value: "exportedAt", ascLabel: "Cũ nhất", descLabel: "Mới nhất" },
  { label: "Ngày nhập kho", value: "importedAt", ascLabel: "Cũ nhất", descLabel: "Mới nhất" },
];
