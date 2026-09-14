import { App } from "antd";
import { FundAdjustment } from "./fundAdjustment.model";

interface FundAdjustmentHandlersInput {
  update?: (data: Partial<FundAdjustment>, opts?: any) => void;
  remove?: (id: string) => void;
  getById?: (id: string, opts?: { onSuccess?: (data: FundAdjustment | null) => void }) => void;
  setOpen: (open: boolean) => void;
  setOpenDetail: (open: boolean) => void;
  setRowData: (data: FundAdjustment | undefined) => void;
}

export function useFundAdjustmentHandlers({
  update,
  remove,
  getById,
  setOpen,
  setOpenDetail,
  setRowData,
}: FundAdjustmentHandlersInput) {
  const { modal } = App.useApp();

  const withDetails = (record: FundAdjustment, callback: (data: FundAdjustment) => void) => {
    if (getById) getById(record.id, { onSuccess: (data) => data && callback(data) });
    else callback(record);
  };

  const handleDelete = remove
    ? (record: FundAdjustment) =>
        modal.confirm({
          title: "Xóa phiếu điều chỉnh quỹ",
          content: `Bạn có chắc chắn muốn xóa phiếu “${record.code}”?`,
          okText: "Xóa",
          okButtonProps: { danger: true },
          cancelText: "Hủy",
          onOk: () => remove(record.id),
        })
    : undefined;

  const handleEdit = update
    ? (record: FundAdjustment) =>
        withDetails(record, (data) => {
          setRowData(data);
          setOpen(true);
        })
    : undefined;

  const handleDetail = (record: FundAdjustment) =>
    withDetails(record, (data) => {
      setRowData(data);
      setOpenDetail(true);
    });

  const handleOpenAdd = () => {
    setRowData(undefined);
    setOpen(true);
  };

  return { handleOpenAdd, handleDelete, handleEdit, handleDetail } as const;
}
