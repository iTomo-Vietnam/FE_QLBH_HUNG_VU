import React, { useState } from "react";
import { useGlobalData } from "@/shared/hooks/useGlobalData";
import { usePageState } from "@/shared/hooks/usePageState";
import { AddButton, Panel, SearchInput } from "@/shared/components";
import { PanelFilter } from "@/shared/components/filters";
import { SortOrder } from "@/shared/constants/enum";
import { usePurchaseReturnStore } from "./order.store";
import {
  OrderStatus,
  OrderType,
  Purchase,
  purchaseReturnStatusItems,
} from "@/modules/purchase/purchase.model";
import { PurchaseReturnTable } from "@/modules/purchase/components/PurchaseReturnTable";
import { PurchaseReturnAddUpdateModal } from "@/modules/purchase/components/PurchaseReturnAddUpdateModal";
import { PurchaseReturnDetailModal } from "@/modules/purchase/components/PurchaseReturnDetailModal";
import { filterUses, rangerItems, sortItems } from "@/modules/purchase/filterItem";
import { usePurchaseHandlers } from "@/modules/purchase/purchase.handlers";
import { useNotificationDetailNavigation } from "@/shared/hooks/useNotificationDetailNavigation";

const PurchaseReturnPage: React.FC = () => {
  const { currentStore } = useGlobalData();
  const [statusValues, setStatusValues] = useState<OrderStatus[]>([
    OrderStatus.DRAFT,
    OrderStatus.COMPLETED,
  ]);
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
  } = usePageState<Purchase>({
    sortBy: "orderAt",
    sortOrder: SortOrder.DESC,
    filterUses,
  });

  const store = usePurchaseReturnStore({
    keyword,
    page,
    size,
    sortBy,
    sortOrder,
    reload,
    statuses: statusValues,
    type: OrderType.PURCHASE_RETURN,
    ...filter,
    ...ranger,
  });

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
    documentType: OrderType.PURCHASE_RETURN,
  });

  const handleOpenAdd = handlers.handleOpenAdd;
  useNotificationDetailNavigation<Purchase>(handlers.handleOpenDetail);
  const handleClearFilter = () => {
    pageAction.resetFilter();
    setStatusValues([OrderStatus.DRAFT, OrderStatus.COMPLETED]);
  };
  const handleStatusChange = (values: unknown[]) => {
    setStatusValues(values as OrderStatus[]);
    setPage(1);
  };

  return (
    <div className="flex h-full w-full gap-3" aria-label="Phiếu trả hàng nhập">
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
        onClearFilter={handleClearFilter}
        enumFilters={[
          {
            label: "Trạng thái",
            items: purchaseReturnStatusItems,
            value: statusValues,
            onChange: handleStatusChange,
          },
        ]}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <SearchInput value={keyword} onSearch={pageAction.handleSearch} />
          <AddButton
            title="Thêm phiếu trả hàng"
            onOpenAdd={handleOpenAdd}
            disabled={Boolean(handleOpenAdd) && !currentStore}
            tooltip={
              !currentStore && handleOpenAdd
                ? "Hãy chuyển sang chi nhánh để thêm phiếu trả hàng nhập"
                : undefined
            }
          />
        </div>
        <Panel className="min-w-0 flex-1">
          <PurchaseReturnTable
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
          />
        </Panel>
      </div>
      <PurchaseReturnAddUpdateModal
        open={open}
        editData={rowData}
        defaultData={defaultData}
        loading={store.creating || store.updating}
        errors={store.errors}
        onAdd={store.create}
        onEdit={store.update}
        onClose={() => pageAction.handleClose(false)}
      />
      <PurchaseReturnDetailModal
        open={openDetail}
        data={rowData}
        onClose={pageAction.handleClose}
        onOpenUpdate={handlers.handleEditFromDetail}
        onDelete={handlers.handleDelete}
        onCancel={handlers.handleCancel}
        onComplete={handlers.handleComplete}
        onCopy={handlers.handleCopy}
      />
    </div>
  );
};

export default PurchaseReturnPage;
