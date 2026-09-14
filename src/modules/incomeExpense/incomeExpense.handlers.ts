import { App } from "antd";
import { IncomeExpense, IncomeExpenseType } from "./incomeExpense.model";

type IncomeExpenseMutation = (
  data: Partial<IncomeExpense>,
  opts?: { onSuccess?: (data?: IncomeExpense) => void },
) => void;

interface IncomeExpenseHandlersInput {
  create?: IncomeExpenseMutation;
  update?: IncomeExpenseMutation;
  remove?: (id: string) => void;
  getById?: (
    id: string,
    opts?: { onSuccess?: (data: IncomeExpense | null) => void },
  ) => void;
  setOpen: (open: boolean) => void;
  setOpenDetail: (open: boolean) => void;
  setRowData: (data: IncomeExpense | undefined) => void;
  setOpenType: (type: IncomeExpenseType) => void;
  setFilterType?: (type: IncomeExpenseType | undefined) => void;
  setCategoryId?: (categoryId: string | undefined) => void;
  setPage?: (page: number) => void;
  resetFilter?: () => void;
}

export function useIncomeExpenseHandlers({
  create,
  update,
  remove,
  getById,
  setOpen,
  setOpenDetail,
  setRowData,
  setOpenType,
  setFilterType,
  setCategoryId,
  setPage,
  resetFilter,
}: IncomeExpenseHandlersInput) {
  const { modal } = App.useApp();

  const withDetails = (record: IncomeExpense, callback: (data: IncomeExpense) => void) => {
    if (getById) getById(record.id, { onSuccess: (data) => data && callback(data) });
    else callback(record);
  };

  const handleOpenAdd = create
    ? (type: IncomeExpenseType) => {
        setRowData(undefined);
        setOpenType(type);
        setOpen(true);
      }
    : undefined;

  const handleOpenUpdate = update
    ? (record: IncomeExpense) =>
        withDetails(record, (data) => {
          setRowData(data);
          setOpenType(data.type);
          setOpen(true);
        })
    : undefined;

  const handleOpenDetail = (record: IncomeExpense) =>
    withDetails(record, (data) => {
      setRowData(data);
      setOpenDetail(true);
    });

  const handleDelete = remove
    ? (record: IncomeExpense) => {
        modal.confirm({
          title: "Xóa phiếu thu chi",
          content: `Bạn có chắc chắn muốn xóa phiếu “${record.code}”?`,
          okText: "Xóa",
          okButtonProps: { danger: true },
          cancelText: "Hủy",
          onOk: () => remove(record.id),
        });
      }
    : undefined;

  const handleFilterTypeChange = setFilterType
    ? (value?: string) => {
        setFilterType(value as IncomeExpenseType | undefined);
        setCategoryId?.(undefined);
        setPage?.(1);
      }
    : undefined;

  const handleCategoryChange = setCategoryId
    ? (value?: string) => {
        setCategoryId(value);
        setFilterType?.(undefined);
        setPage?.(1);
      }
    : undefined;

  const handleResetFilters = resetFilter
    ? () => {
        setFilterType?.(undefined);
        setCategoryId?.(undefined);
        resetFilter();
      }
    : undefined;

  return {
    handleOpenAdd,
    handleOpenUpdate,
    handleOpenDetail,
    handleDelete,
    handleFilterTypeChange,
    handleCategoryChange,
    handleResetFilters,
  } as const;
}
