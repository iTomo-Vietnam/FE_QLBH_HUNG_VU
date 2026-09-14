import { App } from "antd";
import { Attribute } from "./attribute.model";
import { HandlersInput } from "@/shared/interfaces/common";
import { AttributeType } from "./attribute.enum";

export function useAttributeHandlers({
  create,
  update,
  remove,
  getById,
  setOpen,
  setOpenDetail,
  setRowData,
  setType,
  setPage,
}: HandlersInput<Attribute> & {
  setType?: (type: AttributeType) => void;
  setPage?: (page: number) => void;
}) {
  const { modal } = App.useApp();
  const handleTypeChange = (nextType: AttributeType) => {
    setType?.(nextType);
    setPage?.(1);
  };

  return {
    handleOpenDetail: (r: Attribute) => {
      if (getById)
        getById(r.id, {
          onSuccess: (d) => {
            if (d) {
              setRowData(d);
              setOpenDetail?.(true);
            }
          },
        });
      else {
        setRowData(r);
        setOpenDetail?.(true);
      }
    },
    handleOpenAdd: create
      ? () => {
          setRowData(undefined);
          setOpen?.(true);
        }
      : undefined,
    handleOpenEdit: update
      ? (r: Attribute) => {
          getById?.(r.id, {
            onSuccess: (d) => {
              if (d) {
                setRowData(d);
                setOpen?.(true);
              }
            },
          });
        }
      : undefined,
    handleDelete: remove
      ? (r: Attribute) => {
          modal.confirm({
            centered: true,
            title: "Xóa",
            content: `Xóa "${r.name}"?`,
            okText: "Xóa",
            okButtonProps: { danger: true },
            cancelText: "Hủy",
            onOk: () => remove(r.id),
          });
        }
      : undefined,
    handleCancel: undefined,
    handleEditFromDetail: update
      ? () => {
          setOpenDetail?.(false);
          setOpen?.(true);
        }
      : undefined,
    handleTypeChange,
  };
}
