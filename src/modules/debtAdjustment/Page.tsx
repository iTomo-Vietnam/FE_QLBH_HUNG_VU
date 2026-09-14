import React from "react";
import { Button } from "antd";
import { DateRangeFilter, Panel, SearchInput } from "@/shared/components";
import { ButtonFilter } from "@/shared/components/filters";
import { usePageState } from "@/shared/hooks/usePageState";
import { checkSelection } from "@/shared/utils/common.util";
import { DebtSide, SortOrder } from "@/shared/constants/enum";
import { DebtAdjustment } from "./debtAdjustment.model";
import { useDebtAdjustmentStore } from "./debtAdjustment.store";
import { useDebtAdjustmentHandlers } from "./debtAdjustment.handlers";
import { filterUses, rangerItems, sortItems } from "./filterItem";
import {
  DebtAdjustmentAddUpdateModal,
  DebtAdjustmentDetailModal,
  DebtAdjustmentTable,
  Filter as DebtAdjustmentFilter,
  DebtAdjustmentFilterItem,
} from "./components";

export const DebtAdjustmentPage: React.FC = () => {
  const [filterSide, setFilterSide] = React.useState<DebtSide | undefined>();
  const [partnerGroupId, setPartnerGroupId] = React.useState<string | undefined>();
  const [openSide, setOpenSide] = React.useState<DebtSide>(DebtSide.RECEIVABLE);
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
    startAt,
    endAt,
    open,
    openDetail,
    rowData,
    setPage,
    setSize,
    setOpen,
    setOpenDetail,
    setRowData,
    pageAction,
  } = usePageState<DebtAdjustment>({
    sortBy: "occurredAt",
    sortOrder: SortOrder.DESC,
    filterUses,
  });
  const store = useDebtAdjustmentStore(
    {
      keyword,
      page,
      size,
      sortBy,
      sortOrder,
      startAt,
      endAt,
      side: filterSide,
      partnerGroupId,
      reload,
      ...filter,
      ...ranger,
    },
    pageAction.handleClose,
  );
  const {
    handleOpenAdd,
    handleEdit,
    handleDetail,
    handleDelete,
    handleSelectSide,
    handleSelectGroup,
    handleResetFilters,
  } = useDebtAdjustmentHandlers({
    update: store.update,
    remove: store.remove,
    getById: store.getById,
    setOpen,
    setOpenDetail,
    setRowData,
    setOpenSide,
    setFilterSide,
    setPartnerGroupId,
    setPage,
  });

  return (
    <div className="flex h-full w-full gap-3">
      <div className="flex h-full w-[336px] shrink-0 flex-col">
        <DebtAdjustmentFilter
          summary={store.summary}
          filterItems={store.filterItems as DebtAdjustmentFilterItem[]}
          side={filterSide}
          partnerGroupId={partnerGroupId}
          onSelectSide={handleSelectSide}
          onSelectGroup={handleSelectGroup}
          onClear={handleResetFilters}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SearchInput value={keyword} onSearch={pageAction.handleSearch} maxWidth={300} />
          <div className="flex flex-wrap items-center gap-2">
            <DateRangeFilter
              startDate={startAt}
              endDate={endAt}
              onRangeChange={pageAction.handleDateRangerChange}
            />
            <ButtonFilter
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
            {store.create && (
              <div className="flex items-center gap-2">
                <Button
                  type="primary"
                  className="!bg-blue-600 hover:!bg-blue-700"
                  onClick={() => handleOpenAdd(DebtSide.RECEIVABLE)}
                >
                  ĐC nợ phải thu
                </Button>
                <Button
                  type="primary"
                  className="!bg-orange-500 hover:!bg-orange-600"
                  onClick={() => handleOpenAdd(DebtSide.PAYABLE)}
                >
                  ĐC nợ phải trả
                </Button>
              </div>
            )}
          </div>
        </div>
        <Panel className="min-h-0 min-w-0 flex-1 p-1">
          <DebtAdjustmentTable
            dataSource={store.data}
            loading={store.loading}
            pagination={store.pagination}
            setPage={setPage}
            setSize={setSize}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetail={handleDetail}
            onRow={(record: any) => ({
              onClick: () => {
                if (!checkSelection()) handleDetail(record);
              },
            })}
          />
        </Panel>
      </div>
      <DebtAdjustmentAddUpdateModal
        open={open}
        editData={rowData}
        side={openSide}
        errors={store.errors}
        loading={store.creating || store.updating}
        onAdd={store.create}
        onEdit={store.update}
        onClose={() => pageAction.handleClose(false)}
      />
      <DebtAdjustmentDetailModal
        open={openDetail}
        data={rowData}
        onClose={pageAction.handleClose}
        onOpenUpdate={handleEdit}
      />
    </div>
  );
};

export default DebtAdjustmentPage;
