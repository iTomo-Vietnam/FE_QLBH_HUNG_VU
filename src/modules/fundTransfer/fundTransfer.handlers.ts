import { App } from "antd";
import { FundTransfer } from "./fundTransfer.model";

interface FundTransferHandlersInput {
  update?: (data: Partial<FundTransfer>, opts?: any) => void;
  remove?: (id: string) => void;
  getById?: (id: string, opts?: { onSuccess?: (data: FundTransfer | null) => void }) => void;
  setOpen: (open: boolean) => void;
  setOpenDetail: (open: boolean) => void;
  setRowData: (data: FundTransfer | undefined) => void;
}

export function useFundTransferHandlers({
  update,
  remove,
  getById,
  setOpen,
  setOpenDetail,
  setRowData,
}: FundTransferHandlersInput) {
  const { modal } = App.useApp();

  const withDetails = (record: FundTransfer, callback: (data: FundTransfer) => void) => {
    if (getById) getById(record.id, { onSuccess: (data) => data && callback(data) });
    else callback(record);
  };

  const handleDelete = remove
    ? (record: FundTransfer) =>
        modal.confirm({
          title: "Xóa phiếu chuyển quỹ",
          content: `Bạn có chắc chắn muốn xóa phiếu “${record.code}”?`,
          okText: "Xóa",
          okButtonProps: { danger: true },
          cancelText: "Hủy",
          onOk: () => remove(record.id),
        })
    : undefined;

  const handleEdit = update
    ? (record: FundTransfer) =>
        withDetails(record, (data) => {
          setRowData(data);
          setOpen(true);
        })
    : undefined;

  const handleDetail = (record: FundTransfer) =>
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
