import { App, Form } from "antd";
import { PartnerContact } from "./partnerContact.model";
import { HandlersInput } from "@/shared/interfaces/common";

export function usePartnerContactHandlers({
  create,
  update,
  remove,
  getById,
  setOpen,
  setOpenDetail,
  setRowData,
}: HandlersInput<PartnerContact>) {
  const { modal } = App.useApp();
  const [form] = Form.useForm<any>();

  const handleOpenDetail = (record: PartnerContact) => {
    if (getById) {
      getById(record.id, {
        onSuccess: (data) => {
          if (!data) return;
          setRowData(data);
          if (setOpenDetail) {
            setOpenDetail(true);
          } else {
            setOpen?.(true);
          }
        },
      });
    } else {
      setRowData(record);
      if (setOpenDetail) {
        setOpenDetail(true);
      } else {
        setOpen?.(true);
      }
    }
  };

  const handleOpenAdd = create
    ? () => {
        setRowData(undefined);
        setOpen?.(true);
      }
    : undefined;

  const handleOpenEdit = update
    ? (record: PartnerContact) => {
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
    ? (record: PartnerContact) => {
        modal.confirm({
          centered: true,
          title: "Xóa đối tác",
          content: "Bạn có chắc muốn xóa đối tác này?",
          okText: "Xóa",
          okButtonProps: { danger: true },
          cancelText: "Hủy",
          onOk: () => remove(record.id),
        });
      }
    : undefined;

  return {
    handleOpenAdd,
    handleOpenEdit,
    handleOpenDetail,
    handleDelete,
  } as const;
}
