import { Entity, Store } from "@/shared/base/entity";
import { getOptionsByMap } from "@/shared/constants/enum";
import { ApiRequestQuery } from "@/shared/interfaces/api";

export enum FundType {
  CASH = "cash",
  BANK = "bank",
}

export const fundTypeMap: Record<FundType, string> = {
  [FundType.CASH]: "Tiền mặt",
  [FundType.BANK]: "Ngân hàng",
};

export const fundTypeOptions = getOptionsByMap(fundTypeMap);

export interface fundQuery extends ApiRequestQuery {
  type?: FundType;
  moreQuery?: any;
}

export interface FundSnapshot {
  id: string;
  code: string;
  name: string;
  type: FundType;
  storeId?: string | null;
  isPersonal?: boolean;
}

export interface Fund extends Entity {
  code: string;
  name: string;
  type: FundType;
  storeId: string | null;
  isPersonal: boolean;
  store?: Store | null;
  bank?: string | null;
  accountNumber?: string | null;
  accountHolderName?: string | null;
  branch?: string | null;
  isActive: boolean;
  /** Chỉ dùng khi tạo quỹ, không phải thuộc tính lưu trực tiếp trên funds. */
  initialBalance?: number;
  currentBalance?: number;
}
