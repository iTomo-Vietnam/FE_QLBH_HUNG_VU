import React, { useState } from "react";
import { Button, Dropdown } from "antd";
import { useNavigate } from "react-router-dom";
import { AddButton, Panel, SearchInput } from "@/shared/components";
import { PanelFilter } from "@/shared/components/filters";
import { usePageState } from "@/shared/hooks/usePageState";
import { useGlobalData } from "@/shared/hooks/useGlobalData";
import { SortOrder } from "@/shared/constants/enum";
import { useNotificationDetailNavigation } from "@/shared/hooks/useNotificationDetailNavigation";
import { SaleReturn, OrderStatus, saleReturnStatusItems } from "./model";
import { useSaleReturnStore } from "./store";
import { privateRoutesName } from "@/shared/constants/routerName";
import { filterUses, rangerItems, sortItems } from "./filterItem";
import { useSaleReturnHandlers } from "./handlers";
import { SaleReturnTable, SaleReturnDetailModal } from "./components";
import {
  CheckCircleIcon,
  EllipsisHorizontalIcon,
  NoSymbolIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const SaleReturnPage: React.FC = () => {
  const { currentStore } = useGlobalData();
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [statusValues, setStatusValues] = useState<OrderStatus[]>([
    OrderStatus.DRAFT,
    OrderStatus.COMPLETED,
  ]);
  const state = usePageState<SaleReturn>({
    sortBy: "orderAt",
    sortOrder: SortOrder.DESC,
    filterUses,
  });
  const store = useSaleReturnStore({
    keyword: state.keyword,
    page: state.page,
    size: state.size,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    reload: state.reload,
    statuses: statusValues,
    ...state.filter,
    ...state.ranger,
  });
  const handlers = useSaleReturnHandlers({
    create: store.create,
    update: store.update,
    remove: store.remove,
    getById: store.getById,
    complete: store.complete,
    completeMany: store.completeMany,
    cancel: store.cancel,
    cancelMany: store.cancelMany,
    removeMany: store.removeMany,
    setOpenDetail: state.setOpenDetail,
    setRowData: state.setRowData,
    onOpenSourcePicker: () =>
      navigate(`${privateRoutesName.pos}?type=sale_return`, {
        state: { openSourcePicker: true },
      }),
  });
  useNotificationDetailNavigation<SaleReturn>(handlers.handleOpenDetail);

  const selectedRecords = store.data.filter((record) => selectedRowKeys.includes(record.id));
  const hasSelectedRecords = selectedRecords.length > 0;
  const selectedActionItems = [
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
    <div className="flex h-full w-full gap-3" aria-label="Phiếu trả hàng">
      <PanelFilter
        filterActive={
          state.isFilterActive ||
          statusValues.length !== 2 ||
          !statusValues.includes(OrderStatus.DRAFT) ||
          !statusValues.includes(OrderStatus.COMPLETED)
        }
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
            items: saleReturnStatusItems,
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
              placeholder="Theo mã phiếu hoặc tên khách hàng"
            />
            {hasSelectedRecords && (
              <div className="flex shrink-0 items-center gap-1 font-semibold">
                <span className="text-sm text-gray-500">{selectedRecords.length} đã chọn</span>
                <button
                  type="button"
                  aria-label="Bỏ chọn các phiếu trả hàng"
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
                  aria-label="Thao tác các phiếu trả hàng đã chọn"
                >
                  <EllipsisHorizontalIcon className="h-5 w-5" />
                </Button>
              </Dropdown>
            )}
            <AddButton
              title="Thêm phiếu trả hàng"
              onOpenAdd={handlers.handleOpenAdd}
              disabled={Boolean(handlers.handleOpenAdd) && !currentStore}
              tooltip={
                !currentStore && handlers.handleOpenAdd
                  ? "Hãy chuyển sang chi nhánh để thêm phiếu trả hàng"
                  : undefined
              }
            />
          </div>
        </div>
        <Panel className="min-w-0 flex-1">
          <SaleReturnTable
            dataSource={store.data}
            loading={store.loading}
            pagination={store.pagination}
            summaryData={store.summary}
            setPage={state.setPage}
            setSize={state.setSize}
            onViewDetail={handlers.handleOpenDetail}
            onEdit={handlers.handleOpenEdit}
            onDelete={handlers.handleDelete}
            onComplete={handlers.handleComplete}
            onCancel={handlers.handleCancel}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys),
              getCheckboxProps: (record) => ({ disabled: record.isSummary }),
            }}
          />
        </Panel>
      </div>
      <SaleReturnDetailModal
        open={state.openDetail}
        data={state.rowData}
        isReturn
        onClose={() => state.pageAction.handleClose()}
        onOpenUpdate={handlers.handleEditFromDetail}
        onDelete={handlers.handleDelete}
        onComplete={handlers.handleComplete}
        onCancel={handlers.handleCancel}
      />
    </div>
  );
};

export default SaleReturnPage;
