import { Entity } from "@/shared/base/entity";
import { ApiRequestQuery } from "@/shared/interfaces/api";
import { Fund, FundSnapshot } from "@/modules/fund/fund.model";
import { FilterKey, RangerItem, SortItem } from "@/shared/interfaces";

export enum TransferNoteStatus {
  VALID = "valid",
  INVALID = "invalid",
}

export const transferNoteStatusMap: Record<TransferNoteStatus, string> = {
  [TransferNoteStatus.VALID]: "Hợp lệ",
  [TransferNoteStatus.INVALID]: "Không hợp lệ",
};

export interface TransferNoteQuery extends ApiRequestQuery {
  status?: TransferNoteStatus;
  fundId?: string;
}

export interface TransferNote extends Entity {
  storeId: string;
  occurredAt: string | Date;
  referenceCode: string;
  note: string | null;
  fundId: string;
  fundSnapshot: FundSnapshot | null;
  fund: Fund | null;
  amount: number;
  status: TransferNoteStatus;
  invalidReason: string | null;
}

export const sortItems: SortItem[] = [
  { label: "Giờ", value: "occurredAt", ascLabel: "Mới nhất", descLabel: "Cũ nhất" },
  { label: "Số phiếu đối soát", value: "referenceCode", ascLabel: "A → Z", descLabel: "Z → A" },
  { label: "Thống kê", value: "amount", ascLabel: "Tăng dần", descLabel: "Giảm dần" },
];

export const rangerItems: RangerItem[] = [{ label: "Số tiền", key: "amount" }];

export const filterUses: FilterKey[] = ["fundIds", "creatorIds"];
