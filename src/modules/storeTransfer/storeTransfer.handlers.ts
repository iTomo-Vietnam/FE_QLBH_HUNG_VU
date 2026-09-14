import { App } from "antd";
import { StoreTransfer } from "./storeTransfer.model";
import {
  canCancelStoreTransfer,
  canEditStoreTransfer,
  canExportStoreTransfer,
  canImportStoreTransfer,
} from "./storeTransfer.model";
import { randomId } from "@/shared/utils/common.util";
import { Store } from "@/shared/base/entity";

type StoreTransferMutation = (
  data: Partial<StoreTransfer>,
  opts?: { onSuccess?: (data?: StoreTransfer) => void },
) => void;

interface StoreTransferHandlersInput {
  create?: StoreTransferMutation;
  update?: StoreTransferMutation;
  remove?: (id: string) => void;
  getById?: (
    id: string,
    opts?: { onSuccess?: (data: StoreTransfer | null) => void },
  ) => void;
  exportTransfer?: (id: string) => Promise<void>;
  importTransfer?: (id: string) => Promise<void>;
  cancelTransfer?: (id: string) => Promise<void>;
  currentStoreId?: string | null;
  setOpen: (open: boolean) => void;
  setOpenDetail: (open: boolean) => void;
  setRowData: (data: StoreTransfer | undefined) => void;
  setDefaultData: (data: Partial<StoreTransfer> | undefined) => void;
  setStatusValues?: (values: StoreTransfer["status"][]) => void;
  setFromStores?: (stores: Store[]) => void;
  setToStores?: (stores: Store[]) => void;
  setPage?: (page: number) => void;
  resetFilter?: () => void;
}

export function useStoreTransferHandlers({
  create,
  update,
  remove,
  getById,
  exportTransfer,
  importTransfer,
  cancelTransfer,
  currentStoreId,
  setOpen,
  setOpenDetail,
  setRowData,
  setDefaultData,
  setStatusValues,
  setFromStores,
  setToStores,
  setPage,
  resetFilter,
}: StoreTransferHandlersInput) {
  const { modal } = App.useApp();

  const withDetails = (record: StoreTransfer, callback: (data: StoreTransfer) => void) => {
    if (getById) {
      getById(record.id, { onSuccess: (data) => data && callback(data) });
    } else callback(record);
  };

  const handleOpenDetail = (record: StoreTransfer) => {
    withDetails(record, (data) => {
      setRowData(data);
      setOpenDetail(true);
    });
  };

  const handleOpenAdd = create
    ? () => {
        setRowData(undefined);
        setDefaultData(undefined);
        setOpen(true);
      }
    : undefined;

  const handleOpenEdit = update
    ? (record: StoreTransfer) => {
        if (!canEditStoreTransfer(record, currentStoreId)) return;
        withDetails(record, (data) => {
          setRowData(data);
          setDefaultData(undefined);
          setOpen(true);
        });
      }
    : undefined;

  const handleDelete = remove ? (record: StoreTransfer) => remove(record.id) : undefined;

  const handleExport = exportTransfer
    ? (record: StoreTransfer) => {
        if (!canExportStoreTransfer(record, currentStoreId)) return;
        modal.confirm({
          title: "Xuất kho chuyển hàng",
          content: "Xác nhận đã xuất hàng khỏi kho chuyển?",
          okText: "Xác nhận",
          cancelText: "Đóng",
          onOk: () => exportTransfer(record.id),
        });
      }
    : undefined;

  const handleImport = importTransfer
    ? (record: StoreTransfer) => {
        if (!canImportStoreTransfer(record, currentStoreId)) return;
        modal.confirm({
          title: "Nhập kho chuyển hàng",
          content: "Xác nhận đã nhập hàng vào kho nhận?",
          okText: "Xác nhận",
          cancelText: "Đóng",
          onOk: () => importTransfer(record.id),
        });
      }
    : undefined;

  const handleCancel = cancelTransfer
    ? (record: StoreTransfer) => {
        if (!canCancelStoreTransfer(record, currentStoreId)) return;
        modal.confirm({
          title: "Hủy phiếu chuyển kho",
          content: "Phiếu sẽ tạo giao dịch đảo kho theo các mốc đã thực hiện. Tiếp tục?",
          okText: "Hủy phiếu",
          okButtonProps: { danger: true },
          cancelText: "Đóng",
          onOk: () => cancelTransfer(record.id),
        });
      }
    : undefined;

  const handleCopy = create
    ? (record: StoreTransfer) => {
        withDetails(record, (data) => {
          setOpenDetail(false);
          setRowData(undefined);
          setDefaultData({
            ...data,
            id: undefined,
            tempId: randomId(),
            code: "",
            status: undefined,
            exportedAt: null,
            exporterId: null,
            exporterSnapshot: null,
            importedAt: null,
            importerId: null,
            importerSnapshot: null,
            canceledAt: null,
            cancelerId: null,
            cancelerSnapshot: null,
            lines: (data.lines || []).map((line) => ({
              ...line,
              id: undefined,
              tempId: randomId(),
              transferId: undefined,
            })),
          } as any);
          setOpen(true);
        });
      }
    : undefined;

  const handleCreateAndExport = create
    ? (data: Partial<StoreTransfer>) => {
        create(data, {
          onSuccess: (created) => {
            if (created?.id && exportTransfer) void exportTransfer(created.id);
          },
        });
      }
    : undefined;

  const handleUpdateAndExport = update
    ? (data: Partial<StoreTransfer>) => {
        update(data, {
          onSuccess: (updated) => {
            if (updated?.id && exportTransfer) void exportTransfer(updated.id);
          },
        });
      }
    : undefined;

  const handleStatusChange = (values: string[]) => {
    setStatusValues?.(values as StoreTransfer["status"][]);
    setPage?.(1);
  };

  const handleFromStoresChange = setFromStores
    ? (stores: Store[]) => {
        setFromStores(stores);
        setPage?.(1);
      }
    : undefined;

  const handleToStoresChange = setToStores
    ? (stores: Store[]) => {
        setToStores(stores);
        setPage?.(1);
      }
    : undefined;

  const handleClearFilter = resetFilter
    ? () => {
        resetFilter();
        setStatusValues?.([]);
        setFromStores?.([]);
        setToStores?.([]);
      }
    : undefined;

  return {
    handleOpenAdd,
    handleOpenEdit,
    handleOpenDetail,
    handleDelete,
    handleExport,
    handleImport,
    handleCancel,
    handleCopy,
    handleCreateAndExport,
    handleUpdateAndExport,
    handleStatusChange,
    handleFromStoresChange,
    handleToStoresChange,
    handleClearFilter,
  } as const;
}
