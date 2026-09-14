import { App, Form } from "antd";
import { Partner } from "./partner.model";
import { HandlersInput } from "@/shared/interfaces/common";

export function usePartnerHandlers({
  create,
  update,
  remove,
  getById,
  setOpen,
  setOpenDetail,
  setRowData,
}: HandlersInput<Partner>) {
  const { modal } = App.useApp();
  const [form] = Form.useForm<any>();

  const handleOpenDetail = (record: Partner) => {
    const open = (data?: Partner | null) => {
      if (!data) return;
      setRowData(data);
      setOpenDetail ? setOpenDetail(true) : setOpen?.(true);
    };

    if (!!getById) {
      getById(record.id, { onSuccess: open });
    } else open(record);
  };

  const handleOpenAdd = create
    ? () => {
        setRowData(undefined);
        setOpen?.(true);
      }
    : undefined;

  const handleOpenEdit = update
    ? (record: Partner) => {
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
    ? (record: Partner) => {
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
