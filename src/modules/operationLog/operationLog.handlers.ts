import { OperationLog } from "./operationLog.model";

export function useOperationLogHandlers({
  setOpenDetail,
  setRowData,
}: {
  setOpenDetail: (open: boolean) => void;
  setRowData: (data: OperationLog | undefined) => void;
}) {
  const handleViewDetail = (log: OperationLog) => {
    setRowData(log);
    setOpenDetail(true);
  };

  return { handleViewDetail } as const;
}
