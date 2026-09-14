import { App } from "antd";
import { TransferNote } from "./transferNote.model";

interface Input {
  update?: (data: Partial<TransferNote>, opts?: any) => void;
  remove?: (id: string) => void;
  getById?: (id: string, opts?: { onSuccess?: (data: TransferNote | null) => void }) => void;
  setOpen: (open: boolean) => void;
  setOpenDetail: (open: boolean) => void;
  setRowData: (data: TransferNote | undefined) => void;
}

export function useTransferNoteHandlers({
  update,
  remove,
  getById,
  setOpen,
  setOpenDetail,
  setRowData,
}: Input) {
  const { modal } = App.useApp();

  const withDetails = (record: TransferNote, callback: (data: TransferNote) => void) => {
    if (getById) getById(record.id, { onSuccess: (data) => data && callback(data) });
    else callback(record);
  };

  const handleOpenAdd = () => {
    setRowData(undefined);
    setOpen(true);
  };
  const handleEdit = update
    ? (record: TransferNote) => withDetails(record, (data) => {
        setRowData(data);
        setOpen(true);
      })
    : undefined;
  const handleDetail = (record: TransferNote) => withDetails(record, (data) => {
    setRowData(data);
    setOpenDetail(true);
  });
  const handleDelete = remove
    ? (record: TransferNote) => modal.confirm({
        title: "Xóa ghi chú chuyển khoản",
        content: `Bạn có chắc muốn xóa phiếu ${record.referenceCode}?`,
        okText: "Xóa",
        okButtonProps: { danger: true },
        cancelText: "Đóng",
        onOk: () => remove(record.id),
      })
    : undefined;

  return { handleOpenAdd, handleEdit, handleDetail, handleDelete } as const;
}
