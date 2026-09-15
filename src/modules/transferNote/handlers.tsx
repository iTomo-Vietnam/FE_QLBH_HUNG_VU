import { App } from "antd";
import { HandlersInput } from "@/shared/interfaces/common";
import { TransferNote } from "./transferNote.model";

export function useTransferNoteHandlers({
  create,
  update,
  remove,
  getById,
  setOpen,
  setOpenDetail,
  setRowData,
}: HandlersInput<TransferNote>) {
  const { modal } = App.useApp();

  const handleOpenDetail = (record: TransferNote) => {
    if (getById) {
      getById(record.id, {
        onSuccess: (data) => {
          if (!data) return;
          setRowData(data);
          if (setOpenDetail) setOpenDetail(true);
          else setOpen?.(true);
        },
      });
    } else {
      setRowData(record);
      if (setOpenDetail) setOpenDetail(true);
      else setOpen?.(true);
    }
  };

  const handleOpenAdd = create
    ? () => {
        setRowData(undefined);
        setOpen?.(true);
      }
    : undefined;

  const handleOpenEdit = update
    ? (record: TransferNote) => {
        getById?.(record.id, {
          onSuccess: (data) => {
            if (!data) return;
            setRowData(data);
            setOpen?.(true);
          },
        });
      }
    : undefined;

  const handleDelete = remove
    ? (record: TransferNote) => {
        modal.confirm({
          centered: true,
          title: "Xóa ghi chú chuyển khoản",
          content: `Bạn có chắc muốn xóa ghi chú này"?`,
          okText: "Xóa",
          okButtonProps: { danger: true },
          cancelText: "Hủy",
          onOk: () => remove(record.id),
        });
      }
    : undefined;

  return { handleOpenAdd, handleOpenEdit, handleDelete, handleOpenDetail } as const;
}
