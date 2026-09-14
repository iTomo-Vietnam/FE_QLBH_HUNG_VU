import { InventoryAdjustment } from "./inventoryAdjustment.model";
import { randomId } from "@/shared/utils/common.util";

type InventoryAdjustmentMutation = (
  data: Partial<InventoryAdjustment>,
  opts?: { onSuccess?: (data?: InventoryAdjustment) => void },
) => void;

interface InventoryAdjustmentHandlersInput {
  create?: InventoryAdjustmentMutation;
  update?: InventoryAdjustmentMutation;
  remove?: (id: string) => void;
  getById?: (
    id: string,
    opts?: { onSuccess?: (data: InventoryAdjustment | null) => void },
  ) => void;
  setOpen: (open: boolean) => void;
  setOpenDetail: (open: boolean) => void;
  setRowData: (data: InventoryAdjustment | undefined) => void;
  setDefaultData: (data: Partial<InventoryAdjustment> | undefined) => void;
}

export function useInventoryAdjustmentHandlers({
  create,
  update,
  remove,
  getById,
  setOpen,
  setOpenDetail,
  setRowData,
  setDefaultData,
}: InventoryAdjustmentHandlersInput) {
  const withDetails = (record: InventoryAdjustment, callback: (data: InventoryAdjustment) => void) => {
    if (getById) getById(record.id, { onSuccess: (data) => data && callback(data) });
    else callback(record);
  };

  const handleCopy = create
    ? (record: InventoryAdjustment) =>
        withDetails(record, (data) => {
          setOpenDetail(false);
          setRowData(undefined);
          setDefaultData({
            ...data,
            id: undefined,
            tempId: randomId(),
            code: "",
            status: undefined,
            storeId: undefined,
            lines: (data.lines || []).map((line) => ({
              ...line,
              id: undefined,
              tempId: randomId(),
              inventoryAdjustmentId: undefined,
            })),
          } as any);
          setOpen(true);
        })
    : undefined;

  const handleOpenAdd = create
    ? () => {
        setRowData(undefined);
        setDefaultData(undefined);
        setOpen(true);
      }
    : undefined;

  const openEdit = (record: InventoryAdjustment) =>
    withDetails(record, (data) => {
      setDefaultData(undefined);
      setRowData(data);
      setOpen(true);
    });
  const handleOpenEdit = update ? openEdit : undefined;

  const handleOpenDetail = (record: InventoryAdjustment) =>
    withDetails(record, (data) => {
      setRowData(data);
      setOpenDetail(true);
    });

  const handleOpenEditFromDetail = update
    ? (record: InventoryAdjustment) => {
        setOpenDetail(false);
        openEdit(record);
      }
    : undefined;

  const handleDelete = remove ? (record: InventoryAdjustment) => remove(record.id) : undefined;

  return {
    handleCopy,
    handleOpenAdd,
    handleOpenEdit,
    handleOpenDetail,
    handleOpenEditFromDetail,
    handleDelete,
  } as const;
}
