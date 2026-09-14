import { Entity, UserSnapshot } from "@/shared/base/entity";
import { FundSnapshot, FundType } from "@/modules/fund/fund.model";
import { TransferNoteStatus } from "@/modules/transferNote/transferNote.model";

export type DailyPaymentMethod = "DEBT" | "CASH" | "BANK" | "COMBINED";

export interface DailyPaymentSnapshot {
  amount: number;
  fundId: string | null;
  fundSnapshot: FundSnapshot | null;
}

export interface DailyOrderSnapshot {
  id: string;
  type: string;
  code: string;
  occurredAt: string | Date;
  partnerId: string | null;
  partnerName: string | null;
  paymentMethod: DailyPaymentMethod;
  totalAmount: number;
  paidAmount: number;
  debtAmount: number;
  payments: DailyPaymentSnapshot[];
}

export interface DailyIncomeExpenseSnapshot {
  id: string;
  type: "INCOME" | "EXPENSE";
  code: string;
  occurredAt: string | Date;
  categoryId: string | null;
  categoryName: string | null;
  description: string | null;
  note: string | null;
  partnerId: string | null;
  partnerName: string | null;
  fundId: string | null;
  fundSnapshot: FundSnapshot | null;
  amount: number;
}

export interface DailyTransferNoteSnapshot {
  id: string;
  occurredAt: string | Date;
  referenceCode: string;
  creatorId: string | null;
  creatorSnapshot: UserSnapshot | null;
  fundId: string;
  fundSnapshot: FundSnapshot | null;
  amount: number;
  status: TransferNoteStatus;
  invalidReason: string | null;
  note: string | null;
}

export interface DailyReportSummary {
  orderCount: number;
  orderTotalAmount: number;
  orderPaidAmount: number;
  orderDebtAmount: number;
  expenseCashAmount: number;
  expenseBankAmount: number;
  expenseTotalAmount: number;
  debtIncomeCashAmount: number;
  debtIncomeBankAmount: number;
  debtIncomeTotalAmount: number;
  transferNoteValidAmount: number;
  transferNoteInvalidAmount: number;
}

export enum DailyReportStatus {
  ACTIVE = "active",
  CANCELED = "canceled",
}

export interface DailyReport extends Entity {
  storeId: string;
  reportDate: string;
  status: DailyReportStatus;
  orderSnapshots: DailyOrderSnapshot[];
  expenseSnapshots: DailyIncomeExpenseSnapshot[];
  debtIncomeSnapshots: DailyIncomeExpenseSnapshot[];
  transferNoteSnapshots: DailyTransferNoteSnapshot[];
  summary: DailyReportSummary;
  capturedAt: string | Date;
  canceledAt: string | Date | null;
}

export const fundTypeLabel: Record<FundType, string> = {
  [FundType.CASH]: "Tiền mặt",
  [FundType.BANK]: "Chuyển khoản",
};
