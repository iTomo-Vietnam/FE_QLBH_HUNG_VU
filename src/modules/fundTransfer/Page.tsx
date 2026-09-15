import React from "react";
import { AddButton, Panel, PanelFilter, SearchInput } from "@/shared/components";
import { usePageState } from "@/shared/hooks/usePageState";
import { checkSelection } from "@/shared/utils/common.util";
import { SortOrder } from "@/shared/constants/enum";
import { FundTransfer } from "./fundTransfer.model";
import { useFundTransferStore } from "./fundTransfer.store";
import { useFundTransferHandlers } from "./fundTransfer.handlers";
import { filterUses, rangerItems, sortItems } from "./filterItem";
import { FundTransferAddUpdateModal, FundTransferDetailModal, FundTransferTable } from "./components";
import { useNotificationDetailNavigation } from "@/shared/hooks/useNotificationDetailNavigation";

export const FundTransferPage: React.FC = () => {
  const {
    isFilterActive, keyword, page, size, sortBy, sortOrder, filter, ranger,
    reload, open, openDetail, rowData, setPage, setSize, setOpen, setOpenDetail, setRowData,
    pageAction,
  } = usePageState<FundTransfer>({ sortBy: "occurredAt", sortOrder: SortOrder.DESC, filterUses });
  const store = useFundTransferStore({ keyword, page, size, sortBy, sortOrder, reload, ...filter, ...ranger }, pageAction.handleClose);

  const { handleOpenAdd, handleDelete, handleEdit, handleDetail } = useFundTransferHandlers({
    update: store.update,
    remove: store.remove,
    getById: store.getById,
    setOpen,
    setOpenDetail,
    setRowData,
  });
  useNotificationDetailNavigation<FundTransfer>(handleDetail);

  return <div className="flex h-full w-full gap-3">
    <PanelFilter filterActive={isFilterActive} sortItems={sortItems} sortValue={{ sortBy, sortOrder }} onSortChange={pageAction.handleSortChange} rangerItems={rangerItems} rangerValue={ranger} onRangerChange={pageAction.handleRangerChange} filterUses={filterUses} onClearFilter={pageAction.resetFilter} />
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <SearchInput value={keyword} onSearch={pageAction.handleSearch} maxWidth={300} />
        <AddButton title="Thêm phiếu" onOpenAdd={store.create ? handleOpenAdd : undefined} />
      </div>
      <Panel className="min-w-0 flex-1 p-1">
        <FundTransferTable dataSource={store.data} loading={store.loading} pagination={store.pagination} setPage={setPage} setSize={setSize} onEdit={handleEdit} onDelete={handleDelete} onViewDetail={handleDetail} onRow={(record: any) => ({ onClick: () => { if (!checkSelection()) handleDetail(record); } })} />
      </Panel>
    </div>
    <FundTransferAddUpdateModal open={open} editData={rowData} errors={store.errors} loading={store.creating || store.updating} onAdd={store.create} onEdit={store.update} onClose={() => pageAction.handleClose(false)} />
    <FundTransferDetailModal open={openDetail} data={rowData} onClose={pageAction.handleClose} onOpenUpdate={handleEdit} />
  </div>;
};

export default FundTransferPage;
