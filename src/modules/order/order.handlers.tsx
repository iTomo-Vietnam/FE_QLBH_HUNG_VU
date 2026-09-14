import { App } from "antd";
import { Order } from "./order.model";
import { HandlersInput } from "@/shared/interfaces/common";
import { useGlobalData } from "@/shared/hooks/useGlobalData";

export function useOrderHandlers({
  create,
  update,
  remove,
  getById,
  setOpen,
  setOpenDetail,
  setRowData,
  complete,
  cancel,
}: HandlersInput<Order> & {
  complete?: (id: string) => Promise<any>;
  cancel?: (id: string) => Promise<any>;
}) {
  const { modal } = App.useApp();
  const { currentStore } = useGlobalData();

  const handleOpenDetail = (record: Order) => {
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
    ? (record: Order) => {
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
    ? (record: Order) => {
        modal.confirm({
          centered: true,
          title: "Xóa đơn hàng",
          content: "Bạn có chắc muốn xóa đơn hàng này?",
          okText: "Xóa",
          okButtonProps: { danger: true },
          cancelText: "Hủy",
          onOk: () => remove(record.id),
        });
      }
    : undefined;

  const handleComplete = complete
    ? (record: Order) => {
        modal.confirm({
          centered: true,
          title: "Hoàn thành đơn hàng",
          content: `Xác nhận hoàn thành đơn ${record.code}?`,
          okText: "Hoàn thành",
          okButtonProps: { type: "primary" },
          cancelText: "Hủy",
          onOk: () => complete(record.id),
        });
      }
    : undefined;

  const handleCancel = cancel
    ? (record: Order) => {
        modal.confirm({
          centered: true,
          title: "Hủy đơn hàng",
          content: `Bạn có chắc muốn hủy đơn ${record.code}?`,
          okText: "Hủy đơn",
          okButtonProps: { danger: true },
          cancelText: "Đóng",
          onOk: () => cancel(record.id),
        });
      }
    : undefined;

  const handleEditFromDetail = update
    ? () => {
        setOpenDetail?.(false);
        setOpen?.(true);
      }
    : undefined;

  return {
    handleOpenAdd,
    handleOpenEdit,
    handleOpenDetail,
    handleDelete,
    handleComplete,
    handleCancel,
    handleEditFromDetail,
  };
}
