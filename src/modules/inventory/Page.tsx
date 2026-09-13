import { usePageState } from "@/shared/hooks/usePageState";
import { useNavigate } from "react-router-dom";
import { InventoryReport, InventoryTransactionRefType } from "./inventory.model";
import { useInventoryReportStore } from "./inventory.store";
import { SearchInput } from "@/shared/components";
import { DateRangeFilter } from "@/shared/components";
import { Panel } from "@/shared/components";
import { DetailInventoryReportModal, ReportTable } from "./components";
import { checkSelection } from "@/shared/utils/common.util";
import { PanelFilter } from "@/shared/components/filters";
import { filterUses, rangerItems, sortItems } from "./filterItem";
import { useState } from "react";
import { SortOrder } from "@/shared/constants/enum";
import { Tabs } from "antd";
import { useGlobalData } from "@/shared/hooks/useGlobalData";
import { StoreUncontrolledMultipleSelect } from "@/modules/store/components";

export const InventoryPage: React.FC = () => {
  const { getAvailableStores } = useGlobalData();
  const availableStores = getAvailableStores("inventoryReport");
  const [storeIds, setStoreIds] = useState<string[]>([]);
  const navigate = useNavigate();
  const {
    isFilterActive,
    keyword,
    page: pageReport,
    size: sizeReport,
    startAt,
    endAt,
    filter,
    reload,
    sortBy,
    sortOrder,
    ranger,
    setPage: setPageReport,
    setSize: setSizeReport,

    openDetail,
    setOpenDetail,
    rowData,
    setRowData,

    pageAction,
  } = usePageState<InventoryReport>({
    sortBy: "name",
    sortOrder: SortOrder.DESC,
    filterUses,
    size: 20,
  });
  const [refType, setRefType] = useState<InventoryTransactionRefType | undefined>();

  // TODO For Detail
  const {
    page: pageDetail,
    size: sizeDetail,
    setPage: setPageDetail,
    setSize: setSizeDetail,
  } = usePageState<InventoryReport>();

  const {
    reports,
    loading,
    pagination,
    summary,
    transactions,
    transactionSummary,
    transactionPagination,
  } = useInventoryReportStore({
    keyword,
    page: rowData ? pageDetail : pageReport,
    size: rowData ? sizeDetail : sizeReport,
    reload,
    startAt,
    endAt,
    sortBy,
    sortOrder,
    isLockedReport: !!rowData,
    isLockedTransaction: !rowData,
    productId: rowData?.id,
    refType,
    ...(storeIds.length ? { storeIds } : {}),
    ...filter,
    ...ranger,
  });

  const handleOpenDetailModal = (record: InventoryReport) => {
    setRowData(record);
    setOpenDetail(true);
  };

  return (
    <div className="flex gap-3 w-full h-full">
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
      <div className="flex flex-col h-full min-w-0 flex-1 gap-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-3 flex-shrink-0">
            <SearchInput value={keyword} onSearch={pageAction.handleSearch} maxWidth={480} />
            <DateRangeFilter
              startDate={startAt}
              endDate={endAt}
              onRangeChange={pageAction.handleDateRangerChange}
            />
            <StoreUncontrolledMultipleSelect
              value={storeIds}
              options={availableStores}
              onChange={setStoreIds}
              placeholder="Tất cả chi nhánh"
              className="min-w-[220px]"
              maxTagCount="responsive"
            />
          </div>
        </div>
        <Panel>
          <ReportTable
            dataSource={reports}
            loading={loading}
            pagination={pagination}
            summaryData={summary}
            setPage={setPageReport}
            setSize={setSizeReport}
            onRow={(record: any) => {
              return {
                onClick: () => {
                  if (record.isSummary || checkSelection()) return;
                  handleOpenDetailModal(record);
                },
                className: rowData?.id === record.id ? "selected-row" : "",
              };
            }}
          />
        </Panel>

        <DetailInventoryReportModal
          open={openDetail}
          product={rowData}
          summaryData={transactionSummary}
          dataSource={transactions}
          pagination={transactionPagination}
          setPage={setPageDetail}
          setSize={setSizeDetail}
          startAt={startAt}
          endAt={endAt}
          refType={refType}
          setRefType={setRefType}
          onDateRangerChange={pageAction.handleDateRangerChange}
          onClose={() => {
            pageAction.handleClose();
            setRefType(undefined);
            setPageDetail(1);
            setSizeDetail(50);
          }}
        />
      </div>
    </div>
  );
};
