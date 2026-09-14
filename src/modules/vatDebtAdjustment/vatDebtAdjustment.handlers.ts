import { App } from "antd";
import { VatDebtAdjustment } from "./vatDebtAdjustment.model";

interface VatDebtAdjustmentHandlersInput {
  update?: (data: Partial<VatDebtAdjustment>, opts?: any) => void;
  remove?: (id: string) => void;
  getById?: (id: string, opts?: { onSuccess?: (data: VatDebtAdjustment | null) => void }) => void;
  setOpen: (open: boolean) => void;
  setOpenDetail: (open: boolean) => void;
  setRowData: (data: VatDebtAdjustment | undefined) => void;
}

export function useVatDebtAdjustmentHandlers({
  update,
  remove,
  getById,
  setOpen,
  setOpenDetail,
  setRowData,
}: VatDebtAdjustmentHandlersInput) {
  const { modal } = App.useApp();

  const withDetails = (record: VatDebtAdjustment, callback: (data: VatDebtAdjustment) => void) => {
    if (getById) getById(record.id, { onSuccess: (data) => data && callback(data) });
    else callback(record);
  };

  const handleOpenAdd = () => {
    setRowData(undefined);
    setOpen(true);
  };

  const handleEdit = update
    ? (record: VatDebtAdjustment) =>
        withDetails(record, (data) => {
          setRowData(data);
          setOpen(true);
        })
    : undefined;

  const handleDetail = (record: VatDebtAdjustment) =>
    withDetails(record, (data) => {
      setRowData(data);
      setOpenDetail(true);
    });

  const handleDelete = remove
    ? (record: VatDebtAdjustment) =>
        modal.confirm({
          title: "Xóa phiếu điều chỉnh VAT",
          content: `Bạn có chắc chắn muốn xóa phiếu “${record.code}”?`,
          okText: "Xóa",
          okButtonProps: { danger: true },
          cancelText: "Hủy",
          onOk: () => remove(record.id),
        })
    : undefined;

  return { handleOpenAdd, handleEdit, handleDetail, handleDelete } as const;
}
