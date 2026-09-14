import React, { useState } from "react";
import { AddButton, Panel, PanelFilter, SearchInput } from "@/shared/components";
import { useGlobalData } from "@/shared/hooks/useGlobalData";
import { usePageState } from "@/shared/hooks/usePageState";
import { SortOrder } from "@/shared/constants/enum";
import { checkSelection } from "@/shared/utils/common.util";
import {
  InternalExport,
  InternalExportType,
  internalExportTypeOptions,
} from "./internalExport.model";
import { useInternalExportStore } from "./internalExport.store";
import { useInternalExportHandlers } from "./internalExport.handlers";
import { InternalExportDetailModal, InternalExportModal, InternalExportTable } from "./components";
import { filterUses, rangerItems, sortItems } from "./filterItem";

export const InternalExportPage: React.FC = () => {
  const { currentStore } = useGlobalData();
  const [typeValues, setTypeValues] = useState<InternalExportType[]>([]);
  const {
    keyword,
    page,
    size,
    sortBy,
    sortOrder,
    reload,
    open,
    openDetail,
    rowData,
    defaultData,
    setPage,
    setSize,
    setOpen,
    setOpenDetail,
    setRowData,
    setDefaultData,
    pageAction,
    isFilterActive,
    filter,
    ranger,
  } = usePageState<InternalExport>({
    sortBy: "occurredAt",
    sortOrder: SortOrder.DESC,
    filterUses,
  });
  const store = useInternalExportStore(
    {
      keyword,
      page,
      size,
      sortBy,
      sortOrder,
      reload,
      type: typeValues[0],
      ...filter,
      ...ranger,
    },
    pageAction.handleClose,
  );
  const { handleOpenAdd, handleOpenEdit, handleOpenDetail, handleDelete, handleCopy } =
    useInternalExportHandlers({
      create: store.create,
      update: store.update,
      remove: store.remove,
      getById: store.getById,
      setOpen,
      setOpenDetail,
      setRowData,
      setDefaultData,
    });

  return (
    <div className="flex h-full w-full flex-col gap-3">
      <div className="flex min-h-0 flex-1 gap-3">
        <PanelFilter
          filterActive={isFilterActive || typeValues.length > 0}
          sortItems={sortItems}
          sortValue={{ sortBy, sortOrder }}
          onSortChange={pageAction.handleSortChange}
          rangerItems={rangerItems}
          rangerValue={ranger}
          onRangerChange={pageAction.handleRangerChange}
          filterUses={filterUses}
          onClearFilter={() => {
            pageAction.resetFilter();
            setTypeValues([]);
          }}
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
                    ? "Hãy chuyển sang chi nhánh để thêm phiếu xuất nội bộ"
                    : undefined
                }
              />
            </div>
          </div>
          <Panel className="min-w-0 flex-1 p-1">
            <InternalExportTable
              dataSource={store.data}
              loading={store.loading}
              pagination={store.pagination}
              setPage={setPage}
              setSize={setSize}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
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
      <InternalExportModal
        open={open}
        editData={rowData}
        defaultData={defaultData}
        errors={store.errors}
        loading={store.creating || store.updating}
        onAdd={store.create}
        onEdit={store.update}
        onClose={() => pageAction.handleClose(false)}
      />
      <InternalExportDetailModal
        open={openDetail}
        data={rowData}
        onClose={() => pageAction.handleClose()}
        onOpenUpdate={handleOpenEdit}
        onCopy={store.create ? handleCopy : undefined}
      />
    </div>
  );
};

export default InternalExportPage;
