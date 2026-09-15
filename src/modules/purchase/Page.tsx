import React, { useEffect, useMemo, useRef, useState } from "react";
import { DownloadOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { usePageState } from "@/shared/hooks/usePageState";
import { AddButton, Panel, SearchInput } from "@/shared/components";
import { PanelFilter } from "@/shared/components/filters";
import { usePurchaseStore } from "./purchase.store";
import { Purchase, OrderStatus, purchaseStatusItems, OrderType } from "./purchase.model";
import { PurchaseTable } from "./components/PurchaseTable";
import { AddUpdatePurchaseModal } from "./components/AddUpdatePurchaseModal";
import { PurchaseDetailModal } from "./components/PurchaseDetailModal";
import { filterUses, rangerItems, sortItems } from "./filterItem";
import { usePurchaseHandlers } from "./purchase.handlers";
import { PurchaseFile } from "./purchase.file";
import { ProductBarcodePrintModal } from "@/modules/product/components/ProductBarcodePrintModal";
import { getLineProduct } from "./purchase.util";
import { SortOrder } from "@/shared/constants/enum";
import { useGlobalData } from "@/shared/hooks/useGlobalData";
import { useNotificationDetailNavigation } from "@/shared/hooks/useNotificationDetailNavigation";

const PurchasePage: React.FC = () => {
  const location = useLocation();
  const { currentStore } = useGlobalData();
  const state = location.state as { defaultCreateData?: Partial<Purchase> } | null;
  const [statusValues, setStatusValues] = useState<OrderStatus[]>([
    OrderStatus.DRAFT,
    OrderStatus.COMPLETED,
  ]);
  const [barcodeData, setBarcodeData] = useState<Purchase>();
  const handledDefaultCreateState = useRef<unknown>();
  const {
    isFilterActive,
    keyword,
    page,
    size,
    sortBy,
    sortOrder,
    filter,
    ranger,
    reload,
    setPage,
    setSize,
    open,
    setOpen,
    openDetail,
    setOpenDetail,
    rowData,
    setRowData,
    defaultData,
    setDefaultData,
    pageAction,
  } = usePageState<Purchase>({ sortBy: "orderAt", sortOrder: SortOrder.DESC, filterUses });

  const store = usePurchaseStore(
    {
      keyword,
      page,
      size,
      sortBy,
      sortOrder,
      reload,
      statuses: statusValues,
      ...filter,
      ...ranger,
    },
    () => pageAction.handleClose(),
  );

  const handlers = usePurchaseHandlers({
    getById: store.getById,
    create: store.create,
    update: store.update,
    remove: store.remove,
    cancel: store.cancel,
    complete: store.complete,
    setOpen,
    setOpenDetail,
    setRowData,
    setDefaultData,
    setBarcodeData,
  });
  const handleOpenAdd = handlers.handleOpenAdd;
  useNotificationDetailNavigation<Purchase>(handlers.handleOpenDetail);

  useEffect(() => {
    if (
      !state?.defaultCreateData ||
      !handleOpenAdd ||
      !currentStore ||
      handledDefaultCreateState.current === state
    )
      return;
    handledDefaultCreateState.current = state;
    handleOpenAdd();
    setDefaultData(state.defaultCreateData);
    window.history.replaceState({}, "");
  }, [state, handleOpenAdd, currentStore, setDefaultData]);

  const barcodeProducts = useMemo(() => {
    const map = new Map<string, any>();
    (barcodeData?.lines || []).forEach((line: any) => {
      const product = getLineProduct(line);
      if (product?.id) map.set(product.id, product);
    });
    return Array.from(map.values());
  }, [barcodeData]);

  const barcodeItems = useMemo(() => {
    const items = (barcodeData?.lines || [])
      .map((line, index) => {
        const product = getLineProduct(line);
        const barcode = product?.barcode?.trim();
        if (!product?.id || !barcode) return null;
        return {
          id: `${product.id}-${line.id || line.tempId || index}`,
          barcode,
          code: product.code || "",
          name: product.name || "",
          price: product.salePrice,
          quantity: Math.max(1, Number(line.quantity || 1)),
        };
      })
      .filter(Boolean);
    return items as Array<{
      id: string;
      barcode: string;
      code: string;
      name: string;
      price?: number | null;
      quantity?: number;
    }>;
  }, [barcodeData]);

  return (
    <div className="flex h-full w-full gap-3" aria-label="Phiếu nhập hàng">
      <PanelFilter
        filterActive={
          isFilterActive ||
          statusValues.length !== 2 ||
          !statusValues.includes(OrderStatus.DRAFT) ||
          !statusValues.includes(OrderStatus.COMPLETED)
        }
        sortItems={sortItems}
        sortValue={{ sortBy, sortOrder }}
        onSortChange={pageAction.handleSortChange}
        rangerItems={rangerItems}
        rangerValue={ranger}
        onRangerChange={pageAction.handleRangerChange}
        filterUses={filterUses}
        onClearFilter={() => {
          pageAction.resetFilter();
          setStatusValues([OrderStatus.DRAFT, OrderStatus.COMPLETED]);
        }}
        enumFilters={[
          {
            label: "Trạng thái",
            items: purchaseStatusItems,
            value: statusValues,
            onChange: (values) => {
              setStatusValues(values as OrderStatus[]);
              setPage(1);
            },
          },
        ]}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <SearchInput value={keyword} onSearch={pageAction.handleSearch} />
          <AddButton
            title="Thêm phiếu nhập"
            onOpenAdd={handleOpenAdd}
            disabled={Boolean(handleOpenAdd) && !currentStore}
            tooltip={
              !currentStore && handleOpenAdd
                ? "Hãy chuyển sang chi nhánh để thêm phiếu nhập hàng"
                : undefined
            }
          />
        </div>
        <Panel className="min-w-0 flex-1">
          <PurchaseTable
            dataSource={store.data}
            loading={store.loading}
            pagination={store.pagination}
            setPage={setPage}
            setSize={setSize}
            onViewDetail={handlers.handleOpenDetail}
            onEdit={handlers.handleOpenEdit}
            onDelete={handlers.handleDelete}
            onCancel={handlers.handleCancel}
            onComplete={handlers.handleComplete}
            onCopy={handlers.handleCopy}
            onExportExcel={handlers.handleExportExcel}
            onPrint={handlers.handlePrint}
            onPrintBarcode={handlers.handlePrintBarcode}
          />
        </Panel>
      </div>
      <AddUpdatePurchaseModal
        open={open}
        editData={rowData}
        defaultData={defaultData}
        loading={store.creating || store.updating}
        errors={store.errors}
        onAdd={store.create}
        onEdit={store.update}
        onClose={() => pageAction.handleClose(false)}
      />
      <PurchaseDetailModal
        open={openDetail}
        data={rowData}
        onClose={() => pageAction.handleClose()}
        onOpenUpdate={handlers.handleEditFromDetail}
        onDelete={handlers.handleDelete}
        onCancel={handlers.handleCancel}
        onComplete={handlers.handleComplete}
        onCopy={handlers.handleCopy}
        onExportExcel={handlers.handleExportExcel}
        onPrint={handlers.handlePrint}
        onPrintBarcode={handlers.handlePrintBarcode}
      />
      <ProductBarcodePrintModal
        open={!!barcodeData}
        products={barcodeProducts}
        initialItems={barcodeItems}
        onClose={() => setBarcodeData(undefined)}
      />
    </div>
  );
};

export default PurchasePage;
