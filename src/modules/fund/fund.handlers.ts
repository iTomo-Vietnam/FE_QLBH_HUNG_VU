import { App } from "antd";
import { Fund, FundType } from "./fund.model";

type FundMutation = (data: Partial<Fund>, opts?: { onSuccess?: (data?: Fund) => void }) => void;

interface FundHandlersInput {
  create?: FundMutation;
  update?: FundMutation;
  remove?: (id: string) => void;
  getById?: (id: string, opts?: { onSuccess?: (data: Fund | null) => void }) => void;
  setOpen: (open: boolean) => void;
  setOpenDetail: (open: boolean) => void;
  setRowData: (data: Fund | undefined) => void;
  setFormType: (type: FundType) => void;
  scopeData?: Fund;
  setScopeData: (data: Fund | undefined) => void;
  setScopeOpen: (open: boolean) => void;
}

export function useFundHandlers({
  create,
  update,
  remove,
  getById,
  setOpen,
  setOpenDetail,
  setRowData,
  setFormType,
  scopeData,
  setScopeData,
  setScopeOpen,
}: FundHandlersInput) {
  const { modal } = App.useApp();

  const withDetails = (record: Fund, callback: (data: Fund) => void) => {
    if (getById) getById(record.id, { onSuccess: (data) => data && callback(data) });
    else callback(record);
  };

  const handleOpenAdd = create
    ? (type: FundType) => {
        setFormType(type);
        setRowData(undefined);
        setOpen(true);
      }
    : undefined;

  const handleOpenBankAdd = handleOpenAdd ? () => handleOpenAdd(FundType.BANK) : undefined;

  const handleEdit = update
    ? (record: Fund) => {
        if (record.isDefault) return;
        withDetails(record, (data) => {
          setOpenDetail(false);
          setFormType(data.type);
          setRowData(data);
          setOpen(true);
        });
      }
    : undefined;

  const handleDetail = (record: Fund) =>
    withDetails(record, (data) => {
      setRowData(data);
      setOpenDetail(true);
    });

  const handleDelete = remove
    ? (record: Fund) => {
        if (record.isDefault) return;
        modal.confirm({
          title: "Xóa quỹ",
          content: `Bạn có chắc chắn muốn xóa quỹ “${record.name}” không?`,
          okText: "Xóa",
          okButtonProps: { danger: true },
          cancelText: "Hủy",
          onOk: () => remove(record.id),
        });
      }
    : undefined;

  const handleSetActive = update
    ? (record: Fund, isActive: boolean) => {
        if (record.isDefault) return;
        update({ id: record.id, isActive });
      }
    : undefined;

  const handleChangeScope = (record: Fund) => {
    if (record.isDefault || record.type !== FundType.BANK) return;
    setScopeData(record);
    setScopeOpen(true);
  };

  const handleSubmitScope = (storeId: string | null) => {
    if (!scopeData || !update) return;
    update(
      { id: scopeData.id, storeId },
      {
        onSuccess: () => {
          setScopeOpen(false);
          setScopeData(undefined);
        },
      },
    );
  };

  return {
    handleOpenAdd,
    handleOpenBankAdd,
    handleEdit,
    handleDetail,
    handleDelete,
    handleSetActive,
    handleChangeScope,
    handleSubmitScope,
  } as const;
}
