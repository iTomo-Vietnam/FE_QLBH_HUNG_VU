import { PartnerDebtReport } from "./partnerDebtReport.model";
import { DebtSide } from "@/shared/constants/enum";

export function usePartnerDebtReportHandlers({
  setOpenDetail,
  setRowData,
  setSide,
  setPage,
  resetSearch,
}: {
  setOpenDetail: (open: boolean) => void;
  setRowData: (data: PartnerDebtReport | undefined) => void;
  setSide?: (side: DebtSide) => void;
  setPage?: (page: number) => void;
  resetSearch?: (value: string) => void;
}) {
  const handleOpenDetail = (record: PartnerDebtReport) => {
    setRowData(record);
    setOpenDetail(true);
  };

  const handleSideChange = (key: string) => {
    setSide?.(key as DebtSide);
    setPage?.(1);
    resetSearch?.("");
  };

  return { handleOpenDetail, handleSideChange } as const;
}
