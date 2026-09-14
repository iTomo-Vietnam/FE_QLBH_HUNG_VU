import { App } from "antd";
import { DebtSide } from "@/shared/constants/enum";
import { DebtAdjustment } from "./debtAdjustment.model";

interface DebtAdjustmentHandlersInput {
  create?: (...args: any[]) => void;
  update?: (data: Partial<DebtAdjustment>, opts?: any) => void;
  remove?: (id: string) => void;
  getById?: (id: string, opts?: { onSuccess?: (data: DebtAdjustment | null) => void }) => void;
  setOpen: (open: boolean) => void;
  setOpenDetail: (open: boolean) => void;
  setRowData: (data: DebtAdjustment | undefined) => void;
  setOpenSide: (side: DebtSide) => void;
  setFilterSide?: (side: DebtSide | undefined) => void;
  setPartnerGroupId?: (groupId: string | undefined) => void;
  setPage?: (page: number) => void;
}

export function useDebtAdjustmentHandlers({
  update,
  remove,
  getById,
  setOpen,
  setOpenDetail,
  setRowData,
  setOpenSide,
  setFilterSide,
  setPartnerGroupId,
  setPage,
}: DebtAdjustmentHandlersInput) {
  const { modal } = App.useApp();

  const withDetails = (record: DebtAdjustment, callback: (data: DebtAdjustment) => void) => {
    if (getById) getById(record.id, { onSuccess: (data) => data && callback(data) });
    else callback(record);
  };

  const handleOpenAdd = (side: DebtSide) => {
    setRowData(undefined);
    setOpenSide(side);
    setOpen(true);
  };

  const handleEdit = update
    ? (record: DebtAdjustment) =>
        withDetails(record, (data) => {
          setRowData(data);
          setOpenSide(data.side);
          setOpen(true);
        })
    : undefined;

  const handleDetail = (record: DebtAdjustment) =>
    withDetails(record, (data) => {
      setRowData(data);
      setOpenDetail(true);
    });

  const handleDelete = remove
    ? (record: DebtAdjustment) =>
        modal.confirm({
          title: "Xóa phiếu điều chỉnh công nợ",
          content: `Bạn có chắc chắn muốn xóa phiếu “${record.code}”?`,
          okText: "Xóa",
          okButtonProps: { danger: true },
          cancelText: "Hủy",
          onOk: () => remove(record.id),
        })
    : undefined;

  const handleSelectSide = setFilterSide
    ? (side: DebtSide) => {
        setFilterSide(side);
        setPartnerGroupId?.(undefined);
        setPage?.(1);
      }
    : undefined;

  const handleSelectGroup = setFilterSide
    ? (side: DebtSide, groupId: string) => {
        setFilterSide(side);
        setPartnerGroupId?.(groupId);
        setPage?.(1);
      }
    : undefined;

  const handleResetFilters = setFilterSide
    ? () => {
        setFilterSide(undefined);
        setPartnerGroupId?.(undefined);
      }
    : undefined;

  return {
    handleOpenAdd,
    handleEdit,
    handleDetail,
    handleDelete,
    handleSelectSide,
    handleSelectGroup,
    handleResetFilters,
  } as const;
}
