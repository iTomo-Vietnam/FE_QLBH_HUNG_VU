import { usePageState } from "@/shared/hooks/usePageState";
import { PartnerDebtReport, PartnerDebtRefType } from "./partnerDebtReport.model";
import { usePartnerDebtReportStore } from "./partnerDebtReport.store";
import { usePartnerDebtReportHandlers } from "./partnerDebtReport.handlers";
import { SearchInput } from "@/shared/components";
import { DateRangeFilter } from "@/shared/components";
import { Panel } from "@/shared/components";
import { DetailPartnerDebtReportModal, ReportTable } from "./components";
import { checkSelection } from "@/shared/utils/common.util";
import { PanelFilter } from "@/shared/components";
import { filterUses, rangerItems, sortItems } from "./filterItem";
import { useState } from "react";
import { DebtSide, debtSideOptions, SortOrder } from "@/shared/constants/enum";
import { Radio } from "antd";
import { StoreUncontrolledMultipleSelect } from "@/modules/store/components";
import { useGlobalData } from "@/shared/hooks/useGlobalData";

export const PartnerDebtReportPage: React.FC = () => {
  const { getAvailableStores } = useGlobalData();
  const [storeIds, setStoreIds] = useState<string[]>([]);
  const availableStores = getAvailableStores("debtReport");
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
  } = usePageState<PartnerDebtReport>({
    sortBy: "name",
    sortOrder: SortOrder.DESC,
    filterUses,
    size: 20,
  });
  const [side, setSide] = useState<DebtSide>(DebtSide.RECEIVABLE);
  const [refType, setRefType] = useState<PartnerDebtRefType | undefined>();

  // TODO For Detail
  const {
    page: pageDetail,
    size: sizeDetail,
    setPage: setPageDetail,
    setSize: setSizeDetail,
  } = usePageState<PartnerDebtReport>();

  const {
    reports,
    loading,
    pagination,
    summary,
    transactions,
    transactionSummary,
    transactionPagination,
  } = usePartnerDebtReportStore({
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
    partnerId: rowData?.id,
    refType,
    side,
    ...filter,
    ...ranger,
    ...(storeIds.length ? { storeIds } : {}),
  });

  const { handleOpenDetail, handleSideChange } = usePartnerDebtReportHandlers({
    setOpenDetail,
    setRowData,
    setSide,
    setPage: setPageReport,
    resetSearch: pageAction.handleSearch,
  });

  return (
    <div className="flex flex-col h-full w-full gap-1">
      <div className="flex justify-between items-start gap-3">
        <Radio.Group
          value={side}
          onChange={(e) => handleSideChange(e.target.value)}
          options={debtSideOptions}
          optionType="button"
          buttonStyle="solid"
        />
        <div className="flex items-center gap-3 flex-shrink-0">
          <StoreUncontrolledMultipleSelect
            value={storeIds}
            options={availableStores}
            onChange={setStoreIds}
            className="w-56"
            placeholder="Chọn chi nhánh"
          />
          <SearchInput value={keyword} onSearch={pageAction.handleSearch} maxWidth={480} />
          <DateRangeFilter
            startDate={startAt}
            endDate={endAt}
            onRangeChange={pageAction.handleDateRangerChange}
          />
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
                handleOpenDetail(record);
              },
              className: rowData?.id === record.id ? "selected-row" : "",
            };
          }}
        />
      </Panel>

      <DetailPartnerDebtReportModal
        side={side}
        open={openDetail}
        partner={rowData}
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
  );
};
