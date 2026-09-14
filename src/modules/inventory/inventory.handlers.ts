import { InventoryReport } from "./inventory.model";

export function useInventoryReportHandlers({
  setOpenDetail,
  setRowData,
}: {
  setOpenDetail: (open: boolean) => void;
  setRowData: (data: InventoryReport | undefined) => void;
}) {
  const handleOpenDetail = (record: InventoryReport) => {
    setRowData(record);
    setOpenDetail(true);
  };

  return { handleOpenDetail } as const;
}
