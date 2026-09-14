import { App } from "antd";
import { Product } from "./product.model";
import { HandlersInput } from "@/shared/interfaces/common";

type ProductBulkHandlersInput = {
  removeMany?: (ids: string[], opts?: { onSuccess?: () => void }) => void;
  changeGroup?: (
    ids: string[],
    groupId: string | null,
    opts?: { onSuccess?: () => void },
  ) => Promise<void>;
  stopSelling?: (
    ids: string[],
    storeId?: string,
    opts?: { onSuccess?: () => void },
  ) => Promise<void>;
  selectedProducts?: Product[];
  currentStoreId?: string;
  currentStoreName?: string;
  setSelectedProducts?: (products: Product[]) => void;
  setOpenChangeGroup?: (open: boolean) => void;
  setOpenPrintLabels?: (open: boolean) => void;
};

export function useProductHandlers({
  create,
  update,
  remove,
  getById,
  setOpen,
  setOpenDetail,
  setRowData,
  removeMany,
  changeGroup,
  stopSelling,
  selectedProducts = [],
  currentStoreId,
  currentStoreName,
  setSelectedProducts,
  setOpenChangeGroup,
  setOpenPrintLabels,
}: HandlersInput<Product> & ProductBulkHandlersInput) {
  const { modal } = App.useApp();

  const selectedProductIds = selectedProducts.map((product) => product.id);
  const clearSelectedProducts = () => setSelectedProducts?.([]);

  const handleOpenDetail = (record: Product) => {
    if (getById) {
      getById(record.id, {
        onSuccess: (data) => {
          if (!data) return;
          setRowData(data);
          setOpenDetail?.(true);
        },
      });
    } else {
      setRowData(record);
      setOpenDetail?.(true);
    }
  };

  const handleOpenAdd = create
    ? () => {
        setRowData(undefined);
        setOpen?.(true);
      }
    : undefined;

  const handleOpenEdit = update
    ? (record: Product) => {
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
    ? (record: Product) => {
        modal.confirm({
          centered: true,
          title: "Xóa hàng hóa",
          content: `Bạn có chắc muốn xóa hàng hóa "${record.code}"?`,
          okText: "Xóa",
          okButtonProps: { danger: true },
          cancelText: "Hủy",
          onOk: () => remove(record.id),
        });
      }
    : undefined;

  const handleEditFromDetail = update
    ? () => {
        setOpenDetail?.(false);
        setOpen?.(true);
      }
    : undefined;

  const handleChangeGroup = () => {
    if (changeGroup && selectedProducts.length) setOpenChangeGroup?.(true);
  };

  const handleSubmitChangeGroup = (groupId: string | null) => {
    if (!changeGroup) return;
    changeGroup(selectedProductIds, groupId, {
      onSuccess: () => {
        setOpenChangeGroup?.(false);
        clearSelectedProducts();
      },
    });
  };

  const handleStopSelling = () => {
    if (!stopSelling || !selectedProducts.length) return;
    modal.confirm({
      centered: true,
      title: "Ngừng kinh doanh",
      content: currentStoreName
        ? `Bạn có chắc muốn ngừng kinh doanh ${selectedProducts.length} sản phẩm tại cửa hàng "${currentStoreName}"?`
        : `Bạn có chắc muốn ngừng kinh doanh ${selectedProducts.length} sản phẩm tại tất cả cửa hàng?`,
      okText: "Ngừng kinh doanh",
      okButtonProps: { danger: true },
      cancelText: "Hủy",
      onOk: () => stopSelling(selectedProductIds, currentStoreId, { onSuccess: clearSelectedProducts }),
    });
  };

  const handleDeleteSelected = () => {
    if (!removeMany || !selectedProducts.length) return;
    modal.confirm({
      centered: true,
      title: "Xóa hàng hóa",
      content: `Bạn có chắc muốn xóa ${selectedProducts.length} hàng hóa đã chọn?`,
      okText: "Xóa",
      okButtonProps: { danger: true },
      cancelText: "Hủy",
      onOk: () => removeMany(selectedProductIds, { onSuccess: clearSelectedProducts }),
    });
  };

  const handlePrintSelected = () => {
    if (!selectedProducts.some((product) => product.barcode?.trim())) {
      modal.warning({
        title: "Không thể in tem",
        content: "Các sản phẩm đã chọn không có mã vạch.",
      });
      return;
    }
    setOpenPrintLabels?.(true);
  };

  return {
    handleOpenAdd,
    handleOpenEdit,
    handleOpenDetail,
    handleDelete,
    handleEditFromDetail,
    handleChangeGroup,
    handleSubmitChangeGroup,
    handleStopSelling,
    handleDeleteSelected,
    handlePrintSelected,
  };
}
