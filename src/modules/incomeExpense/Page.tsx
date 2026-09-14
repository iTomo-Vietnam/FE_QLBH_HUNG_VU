import React, { useState } from "react";
import { Button } from "antd";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { ButtonFilter } from "@/shared/components/filters";
import { DateRangeFilter, Panel, SearchInput } from "@/shared/components";
import { usePageState } from "@/shared/hooks/usePageState";
import { checkSelection } from "@/shared/utils/common.util";
import { SortOrder } from "@/shared/constants/enum";
import { IncomeExpense, IncomeExpenseType } from "./incomeExpense.model";
import { useIncomeExpenseStore } from "./incomeExpense.store";
import { useIncomeExpenseHandlers } from "./incomeExpense.handlers";
import { filterUses, rangerItems, sortItems } from "./filterItem";
import {
  Filter,
  IncomeExpenseAddUpdateModal,
  IncomeExpenseDetailModal,
  IncomeExpenseTable,
} from "./components";

export const IncomeExpensePage: React.FC = () => {
  const [filterType, setFilterType] = useState<IncomeExpenseType | undefined>();
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [openType, setOpenType] = useState<IncomeExpenseType>(IncomeExpenseType.INCOME);
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
  } = usePageState<IncomeExpense>({
    sortBy: "occurredAt",
    sortOrder: SortOrder.DESC,
    filterUses,
  });
  const store = useIncomeExpenseStore(
    {
      keyword,
      page,
      size,
      sortBy,
      sortOrder,
      startAt,
      endAt,
      reload,
      type: filterType,
      categoryId,
      ...filter,
      ...ranger,
    },
    pageAction.handleClose,
  );

  const {
    handleOpenAdd,
    handleOpenUpdate,
    handleOpenDetail,
    handleDelete,
    handleFilterTypeChange,
    handleCategoryChange,
    handleResetFilters,
  } =
    useIncomeExpenseHandlers({
      create: store.create,
      update: store.update,
      remove: store.remove,
      getById: store.getById,
      setOpen,
      setOpenDetail,
      setRowData,
      setOpenType,
      setFilterType,
      setCategoryId,
      setPage,
      resetFilter: pageAction.resetFilter,
    });

  const isFilterButtonActive = isFilterActive || Boolean(filterType || categoryId);

  return (
    <div className="flex h-full w-full gap-3">
      <div className="flex w-[336px] h-full flex-col">
        <Filter
          summary={store.summary}
          filterItems={store.filterItems}
          filterType={filterType}
          categoryId={categoryId}
          setCategoryId={handleCategoryChange}
          setFilterType={handleFilterTypeChange}
        />
      </div>
      <div className="flex h-full w-[calc(100%-348px)] flex-col gap-3">
        <div className="flex gap-3 justify-between items-center">
          <SearchInput value={keyword} onSearch={pageAction.handleSearch} maxWidth={300} />
          <div className="flex items-center gap-3">
            <DateRangeFilter
              startDate={startAt}
              endDate={endAt}
              onRangeChange={pageAction.handleDateRangerChange}
            />
            <ButtonFilter
              filterActive={isFilterButtonActive}
              sortItems={sortItems}
              sortValue={{ sortBy, sortOrder }}
              onSortChange={pageAction.handleSortChange}
              rangerItems={rangerItems}
              rangerValue={ranger}
              onRangerChange={pageAction.handleRangerChange}
              filterUses={filterUses}
              onClearFilter={handleResetFilters}
            />
            {handleOpenAdd && (
              <div className="flex items-center gap-2">
                <Button
                  type="primary"
                  className="!bg-emerald-600 hover:!bg-emerald-700"
                  onClick={() => handleOpenAdd(IncomeExpenseType.INCOME)}
                >
                  + Phiếu thu
                </Button>
                <Button
                  danger
                  type="primary"
                  onClick={() => handleOpenAdd(IncomeExpenseType.EXPENSE)}
                >
                  + Phiếu chi
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
          <Panel className="min-h-0 min-w-0 flex-1 p-1">
            <IncomeExpenseTable
              dataSource={store.data}
              loading={store.loading}
              pagination={store.pagination}
              setPage={setPage}
              setSize={setSize}
              onEdit={handleOpenUpdate}
              onDelete={handleDelete}
              onViewDetail={handleOpenDetail}
              onRow={(record: any) => ({
                onClick: () => {
                  if (!checkSelection()) handleOpenDetail(record);
                },
              })}
            />
          </Panel>
        </div>

        <IncomeExpenseAddUpdateModal
          open={open}
          editData={rowData}
          type={openType}
          errors={store.errors}
          loading={store.creating || store.updating}
          onAdd={store.create}
          onEdit={store.update}
          onClose={() => pageAction.handleClose(false)}
        />
        <IncomeExpenseDetailModal
          open={openDetail}
          data={rowData}
          onClose={pageAction.handleClose}
          onOpenUpdate={handleOpenUpdate}
        />
      </div>
    </div>
  );
};

export default IncomeExpensePage;
