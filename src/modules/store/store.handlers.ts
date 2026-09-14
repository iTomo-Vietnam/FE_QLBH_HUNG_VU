import { App } from "antd";
import { Store } from "@/shared/base/entity";

interface StoreHandlersInput {
  update?: (data: Partial<Store>, opts?: any) => void;
  remove?: (id: string) => void;
  getById?: (id: string, opts?: { onSuccess?: (data: Store | null) => void }) => void;
  setOpen: (open: boolean) => void;
  setRowData: (data: Store | undefined) => void;
}

export function useStoreHandlers({
  update,
  remove,
  getById,
  setOpen,
  setRowData,
}: StoreHandlersInput) {
  const { modal } = App.useApp();

  const withDetails = (record: Store, callback: (data: Store) => void) => {
    if (getById) getById(record.id, { onSuccess: (data) => data && callback(data) });
    else callback(record);
  };

  const handleOpenAdd = () => {
    setOpen(true);
    setRowData(undefined);
  };

  const handleOpenUpdate = update
    ? (record: Store) =>
        withDetails(record, (data) => {
          setOpen(true);
          setRowData(data);
        })
    : undefined;

  const handleDelete = remove
    ? (record: Store) =>
        modal.confirm({
          centered: true,
          title: "Xóa cửa hàng",
          content: `Bạn có chắc chắn muốn xóa cửa hàng "${record.name}"?`,
          okText: "Xóa",
          cancelText: "Hủy",
          onOk: () => remove(record.id),
        })
    : undefined;

  return { handleOpenAdd, handleOpenUpdate, handleDelete } as const;
}
