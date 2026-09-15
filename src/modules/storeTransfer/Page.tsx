import React, { useState } from "react";
import { AddButton, Panel, PanelFilter, SearchInput } from "@/shared/components";
import { StoreMultipleSelect } from "@/modules/store/components/Select";
import { Store } from "@/shared/base/entity";
import { usePageState } from "@/shared/hooks/usePageState";
import { useGlobalData } from "@/shared/hooks/useGlobalData";
import { useNotificationDetailNavigation } from "@/shared/hooks/useNotificationDetailNavigation";
import { SortOrder } from "@/shared/constants/enum";
import { checkSelection } from "@/shared/utils/common.util";
import {
  StoreTransfer,
  StoreTransferStatus,
  storeTransferStatusLabels,
} from "./storeTransfer.model";
import { useStoreTransferStore } from "./storeTransfer.store";
import { useStoreTransferHandlers } from "./storeTransfer.handlers";
import { filterUses, rangerItems, sortItems } from "./filterItem";
import { StoreTransferDetailModal, StoreTransferModal, StoreTransferTable } from "./components";

export const StoreTransferPage: React.FC = () => {
  const { currentStore } = useGlobalData();
  const [statusValues, setStatusValues] = useState<StoreTransferStatus[]>([]);
  const [fromStores, setFromStores] = useState<Store[]>([]);
  const [toStores, setToStores] = useState<Store[]>([]);
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
    open,
    openDetail: isDetailOpen,
    rowData,
    setPage,
    setSize,
    setOpen,
    setOpenDetail,
    setRowData,
    defaultData,
    setDefaultData,
    pageAction,
  } = usePageState<StoreTransfer>({ sortBy: "occurredAt", sortOrder: SortOrder.DESC, filterUses });
  const store = useStoreTransferStore(
    {
      keyword,
      page,
      size,
      sortBy,
      sortOrder,
      reload,
      statuses: statusValues.length ? statusValues : undefined,
      fromStoreIds: fromStores.map((store) => store.id),
      toStoreIds: toStores.map((store) => store.id),
      ...filter,
      ...ranger,
    },
    pageAction.handleClose,
  );
  const {
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
  } = useStoreTransferHandlers({
    create: store.create,
    update: store.update,
    remove: store.remove,
    getById: store.getById,
    exportTransfer: store.exportTransfer,
    importTransfer: store.importTransfer,
    cancelTransfer: store.cancelTransfer,
    currentStoreId: currentStore?.id,
    setOpen,
    setOpenDetail,
    setRowData,
    setDefaultData,
    setStatusValues,
    setFromStores,
    setToStores,
    setPage,
    resetFilter: pageAction.resetFilter,
  });
  useNotificationDetailNavigation<StoreTransfer>(handleOpenDetail);
  const storeFilterContent = (
    <div className="space-y-3 px-4 pb-4">
      <div>
        <div className="mb-1 text-xs font-medium text-gray-500">Kho chuyển đi</div>
        <StoreMultipleSelect
          value={fromStores.map((store) => store.id)}
          defaultData={fromStores}
          className="w-full"
          placeholder="Chọn kho chuyển đi"
          onChangeData={handleFromStoresChange}
        />
      </div>
      <div>
        <div className="mb-1 text-xs font-medium text-gray-500">Kho nhận</div>
        <StoreMultipleSelect
          value={toStores.map((store) => store.id)}
          defaultData={toStores}
          className="w-full"
          placeholder="Chọn kho nhận"
          onChangeData={handleToStoresChange}
        />
      </div>
    </div>
  );
  return (
    <div className="flex h-full w-full flex-col gap-3">
      <div className="flex min-h-0 flex-1 gap-3">
        <PanelFilter
          filterActive={
            isFilterActive ||
            statusValues.length > 0 ||
            fromStores.length > 0 ||
            toStores.length > 0
          }
          sortItems={sortItems}
          sortValue={{ sortBy, sortOrder }}
          onSortChange={pageAction.handleSortChange}
          rangerItems={rangerItems}
          rangerValue={ranger}
          onRangerChange={pageAction.handleRangerChange}
          filterUses={filterUses}
          filterContent={storeFilterContent}
          enumFilters={[
            {
              label: "Trạng thái",
              items: Object.values(StoreTransferStatus).map((status) => ({
                key: status,
                label: storeTransferStatusLabels[status],
              })),
              value: statusValues,
              onChange: handleStatusChange,
            },
          ]}
          onClearFilter={handleClearFilter}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <SearchInput value={keyword} onSearch={pageAction.handleSearch} maxWidth={300} />
            <div className="flex items-center gap-2">
              <AddButton
                onOpenAdd={handleOpenAdd}
                disabled={Boolean(store.create) && !currentStore}
                tooltip={
                  !currentStore && store.create
                    ? "Hãy chuyển sang chi nhánh để thêm phiếu chuyển kho"
                    : undefined
                }
              />
            </div>
          </div>
          <Panel className="min-w-0 flex-1 p-1">
            <StoreTransferTable
              dataSource={store.data}
              loading={store.loading}
              pagination={store.pagination}
              setPage={setPage}
              setSize={setSize}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onExport={handleExport}
              onImport={handleImport}
              onCancel={handleCancel}
              onCopy={store.create ? handleCopy : undefined}
              onViewDetail={handleOpenDetail}
              onRow={(record: any) => ({
                onClick: () => {
                  if (!checkSelection()) handleOpenDetail(record);
                },
              })}
            />
          </Panel>
        </div>
      </div>
      <StoreTransferModal
        open={open}
        editData={rowData}
        defaultData={defaultData}
        errors={store.errors}
        loading={store.creating || store.updating}
        onAdd={store.create}
        onEdit={store.update}
        onAddAndExport={handleCreateAndExport}
        onEditAndExport={handleUpdateAndExport}
        onExportTransfer={store.exportTransfer}
        onImportTransfer={store.importTransfer}
        onCancelTransfer={store.cancelTransfer}
        onClose={() => pageAction.handleClose(false)}
      />
      <StoreTransferDetailModal
        open={isDetailOpen}
        data={rowData}
        onClose={() => pageAction.handleClose()}
        onOpenUpdate={handleOpenEdit}
        onCopy={store.create ? handleCopy : undefined}
      />
    </div>
  );
};

export default StoreTransferPage;
