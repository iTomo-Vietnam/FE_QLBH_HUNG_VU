import React from "react";
import { AddButton, Panel, PanelFilter, SearchInput } from "@/shared/components";
import { usePageState } from "@/shared/hooks/usePageState";
import { checkSelection } from "@/shared/utils/common.util";
import { SortOrder } from "@/shared/constants/enum";
import { TransferNote } from "./transferNote.model";
import { useTransferNoteStore } from "./transferNote.store";
import { useTransferNoteHandlers } from "./handlers";
import {
  TransferNoteAddUpdateModal,
  TransferNoteDetailModal,
  TransferNoteTable,
} from "./components";
import { filterUses, rangerItems, sortItems } from "./filterItem";
import { useNotificationDetailNavigation } from "@/shared/hooks/useNotificationDetailNavigation";

export const TransferNotePage: React.FC = () => {
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
    openDetail,
    rowData,
    setPage,
    setSize,
    setOpen,
    setOpenDetail,
    setRowData,
    pageAction,
  } = usePageState<TransferNote>({ sortBy: "occurredAt", sortOrder: SortOrder.DESC, filterUses });
  const store = useTransferNoteStore(
    { keyword, page, size, sortBy, sortOrder, reload, ...filter, ...ranger },
    pageAction.handleClose,
  );
  const handlers = useTransferNoteHandlers({
    update: store.update,
    remove: store.remove,
    getById: store.getById,
    setOpen,
    setOpenDetail,
    setRowData,
  });

  return (
    <div className="flex h-full w-full gap-3">
      <PanelFilter
        filterActive={isFilterActive}
        sortItems={sortItems}
        sortValue={{ sortBy, sortOrder }}
        onSortChange={pageAction.handleSortChange}
        rangerItems={rangerItems}
        rangerValue={ranger}
        onRangerChange={pageAction.handleRangerChange}
        filterUses={filterUses}
        onClearFilter={pageAction.resetFilter}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <SearchInput value={keyword} onSearch={pageAction.handleSearch} maxWidth={300} />
          <AddButton
            title="Thêm ghi chú"
            onOpenAdd={store.create ? handlers.handleOpenAdd : undefined}
          />
        </div>
        <Panel className="min-w-0 flex-1 p-1">
          <TransferNoteTable
            dataSource={store.data}
            loading={store.loading}
            pagination={store.pagination}
            setPage={setPage}
            setSize={setSize}
            onEdit={handlers.handleOpenEdit}
            onDelete={handlers.handleDelete}
            onViewDetail={handlers.handleOpenDetail}
          />
        </Panel>
      </div>
      <TransferNoteAddUpdateModal
        open={open}
        editData={rowData}
        errors={store.errors}
        loading={store.creating || store.updating}
        onAdd={store.create}
        onEdit={store.update}
        onClose={() => pageAction.handleClose(false)}
      />
      <TransferNoteDetailModal
        open={openDetail}
        data={rowData}
        onClose={pageAction.handleClose}
        onOpenUpdate={handlers.handleOpenEdit}
      />
    </div>
  );
};

export default TransferNotePage;
