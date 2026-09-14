import { Entity } from "@/shared/base/entity";
import { ApiRequestQuery } from "@/shared/interfaces/api";
import { Fund, FundSnapshot } from "@/modules/fund/fund.model";

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
  fundId: string;
  fundSnapshot: FundSnapshot | null;
  fund: Fund | null;
  amount: number;
  status: TransferNoteStatus;
  invalidReason: string | null;
}
