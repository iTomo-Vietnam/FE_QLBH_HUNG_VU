import React, { useMemo, useState } from "react";
import { Button, Dropdown } from "antd";
import { useNavigate } from "react-router-dom";
import { AddButton, Panel, SearchInput } from "@/shared/components";
import { PanelFilter } from "@/shared/components/filters";
import { usePageState } from "@/shared/hooks/usePageState";
import { useGlobalData } from "@/shared/hooks/useGlobalData";
import { SortOrder } from "@/shared/constants/enum";
import { privateRoutesName } from "@/shared/constants/routerName";
import { Sale, OrderStatus, saleStatusItems } from "./model";
import { useSaleStore } from "./store";
import { filterUses, rangerItems, sortItems } from "./filterItem";
import { useSaleHandlers } from "./handlers";
import { SaleTable } from "./components/SaleTable";
import { SaleDetailModal } from "./components/SaleDetailModal";
import { SaleA4PrintDocument } from "./components/SaleA4Print";
import { usePrintHtml } from "@/shared/hooks/usePrintHtml";
import {
  CheckCircleIcon,
  EllipsisHorizontalIcon,
  NoSymbolIcon,
  PrinterIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const SalePage: React.FC = () => {
  const { getAvailableStores } = useGlobalData();
  const navigate = useNavigate();
  const [statusValues, setStatusValues] = useState<OrderStatus[]>([
    OrderStatus.DRAFT,
    OrderStatus.COMPLETED,
  ]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const { contentRef, printData, handlePrint: printSales } = usePrintHtml<Sale[]>();
  const state = usePageState<Sale>({ sortBy: "orderAt", sortOrder: SortOrder.DESC, filterUses });
  const store = useSaleStore({
    keyword: state.keyword,
    page: state.page,
    size: state.size,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    reload: state.reload,
    statuses: statusValues,
    storeIds: state.storeIds,
    ...state.filter,
    ...state.ranger,
  });
  const handlers = useSaleHandlers({
    create: store.create,
    update: store.update,
    remove: store.remove,
    removeMany: store.removeMany,
    getById: store.getById,
    getAll: store.getAll,
    complete: store.complete,
    completeMany: store.completeMany,
    cancel: store.cancel,
    cancelMany: store.cancelMany,
    print: printSales,
    setOpen: state.setOpen,
    setOpenDetail: state.setOpenDetail,
    setRowData: state.setRowData,
  });

  const selectedRecords = useMemo(
    () => store.data.filter((record) => selectedRowKeys.includes(record.id)),
    [selectedRowKeys, store.data],
  );
  const hasSelectedRecords = selectedRecords.length > 0;
  const selectedActionItems = [
    selectedRecords.some((record) => record._actions?.export?.can) && {
      key: "print",
      label: "In",
      icon: <PrinterIcon className="h-4 w-4" />,
      onClick: () => handlers.handlePrintMany(selectedRecords),
    },
    selectedRecords.every((record) => record._actions?.complete?.can) && {
      key: "complete",
      label: "Hoàn thành",
      icon: <CheckCircleIcon className="h-4 w-4" />,
      onClick: () => handlers.handleCompleteMany(selectedRecords),
    },
    selectedRecords.every((record) => record._actions?.cancel?.can) && {
      key: "cancel",
      label: "Hủy",
      danger: true,
      icon: <NoSymbolIcon className="h-4 w-4" />,
      onClick: () => handlers.handleCancelMany(selectedRecords),
    },
    selectedRecords.every((record) => record._actions?.delete?.can) && {
      key: "delete",
      label: "Xóa",
      danger: true,
      icon: <TrashIcon className="h-4 w-4" />,
      onClick: () => handlers.handleDeleteMany(selectedRecords),
    },
  ].filter(Boolean) as any[];

  return (
    <div className="flex h-full w-full gap-3" aria-label="Đơn bán hàng">
      <PanelFilter
        filterActive={
          state.isFilterActive ||
          statusValues.length !== 2 ||
          !statusValues.includes(OrderStatus.DRAFT) ||
          !statusValues.includes(OrderStatus.COMPLETED)
        }
        storeIds={state.storeIds}
        availableStores={getAvailableStores("sale")}
        onStoreIdsChange={state.pageAction.handleSetStoreIds}
        sortItems={sortItems}
        sortValue={{ sortBy: state.sortBy, sortOrder: state.sortOrder }}
        onSortChange={state.pageAction.handleSortChange}
        rangerItems={rangerItems}
        rangerValue={state.ranger}
        onRangerChange={state.pageAction.handleRangerChange}
        filterUses={filterUses}
        onClearFilter={() => {
          state.pageAction.resetFilter();
          setStatusValues([OrderStatus.DRAFT, OrderStatus.COMPLETED]);
        }}
        enumFilters={[
          {
            label: "Trạng thái",
            items: saleStatusItems,
            value: statusValues,
            onChange: (values) => {
              setStatusValues(values as OrderStatus[]);
              state.setPage(1);
            },
          },
        ]}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <SearchInput
              value={state.keyword}
              onSearch={state.pageAction.handleSearch}
              placeholder="Theo mã đơn hoặc tên khách hàng"
            />
            {hasSelectedRecords && (
              <div className="flex shrink-0 items-center gap-1 font-semibold">
                <span className="text-sm text-gray-500">{selectedRecords.length} đã chọn</span>
                <button
                  type="button"
                  aria-label="Bỏ chọn các đơn hàng"
                  onClick={() => setSelectedRowKeys([])}
                >
                  <XMarkIcon className="h-4 w-4 font-bold text-gray-400 transition-colors hover:text-red-500" />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasSelectedRecords && selectedActionItems.length > 0 && (
              <Dropdown
                trigger={["click"]}
                menu={{ items: selectedActionItems }}
                placement="bottomRight"
              >
                <Button
                  htmlType="button"
                  className="p-0 px-2"
                  aria-label="Thao tác các đơn hàng đã chọn"
                >
                  <EllipsisHorizontalIcon className="h-5 w-5" />
                </Button>
              </Dropdown>
            )}
            <AddButton title="Thêm đơn bán" onOpenAdd={handlers.handleOpenAdd} />
          </div>
        </div>
        <Panel className="min-w-0 flex-1">
          <SaleTable
            dataSource={store.data}
            loading={store.loading}
            pagination={store.pagination}
            summaryData={store.summary}
            setPage={state.setPage}
            setSize={state.setSize}
            onViewDetail={handlers.handleOpenDetail}
            onEdit={handlers.handleOpenEdit}
            onCopy={handlers.handleCopy}
            onDelete={handlers.handleDelete}
            onComplete={handlers.handleComplete}
            onCancel={handlers.handleCancel}
            onPrint={handlers.handlePrint}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys.filter((key) => key !== "summary")),
              renderCell: (_checked, record, _index, originNode) =>
                record.isSummary ? null : originNode,
            }}
          />
        </Panel>
      </div>
      <SaleDetailModal
        open={state.openDetail}
        data={state.rowData}
        onClose={() => state.pageAction.handleClose()}
        onOpenUpdate={handlers.handleEditFromDetail}
        onCopy={handlers.handleCopy}
        onDelete={handlers.handleDelete}
        onComplete={handlers.handleComplete}
        onCancel={handlers.handleCancel}
        onCreateReturn={() =>
          navigate(`${privateRoutesName.pos}?type=sale_return`, {
            state: { openSourcePicker: true },
          })
        }
        onPrint={handlers.handlePrint}
      />
      <div className="pointer-events-none fixed left-[-100000px] top-0" aria-hidden="true">
        <div ref={contentRef}>{printData && <SaleA4PrintDocument data={printData} />}</div>
      </div>
    </div>
  );
};

export default SalePage;
