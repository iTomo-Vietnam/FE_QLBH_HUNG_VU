import { usePageState } from "@/shared/hooks";
import React, { useState } from "react";
import { logActionMapping, OperationLog, targetEntityMapping } from "./operationLog.model";
import { SortOrder } from "@/shared/constants";
import { useOperationLogStore } from "./operationLog.store";
import { DateRangeFilter, Panel, SearchInput } from "@/shared/components";
import { OperationLogTable } from "./components";
import { useOperationLogHandlers } from "./operationLog.handlers";
import LogDetailDrawer from "./components/LogDetailDrawer";

export const OperationLogPage: React.FC = () => {
  const [targetEntity, setTargetEntity] = useState<string | undefined>();
  const [action, setAction] = useState<string | undefined>();
  const [creatorId, setCreatorId] = useState<string | undefined>();

  const {
    keyword,
    page,
    size,
    startAt,
    endAt,
    sortBy,
    sortOrder,
    filter,
    ranger,
    reload,
    setPage,
    setSize,

    openDetail,
    setOpenDetail,
    rowData,
    setRowData,

    pageAction,
  } = usePageState<OperationLog>({
    sortBy: "createdAt",
    sortOrder: SortOrder.DESC,
    // filterUses,
  });

  const { data, loading, pagination } = useOperationLogStore({
    keyword,
    page,
    size,
    startAt,
    endAt,
    reload,
    sortBy,
    sortOrder,
    targetEntity,
    action,
    creatorId,
    ...filter,
    ...ranger,
  });

  const moduleOptions = Object.entries(targetEntityMapping).map(([value, label]) => ({
    value,
    label,
  }));

  const actionOptions = Object.entries(logActionMapping).map(([value, label]) => ({
    value,
    label,
  }));

  const { handleViewDetail } = useOperationLogHandlers({ setOpenDetail, setRowData });

  return (
    <div className="flex flex-col h-full w-full max-w-6xl mx-auto gap-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-col xl:flex-row xl:items-center gap-3 flex-shrink-0">
          <DateRangeFilter
            startDate={startAt}
            endDate={endAt}
            onRangeChange={pageAction.handleDateRangerChange}
          />
          <SearchInput value={keyword} onSearch={pageAction.handleSearch} maxWidth={340} />
        </div>
      </div>

      {/* Bộ lọc nâng cao */}

      <Panel>
        <OperationLogTable
          dataSource={data}
          loading={loading}
          pagination={pagination}
          setPage={setPage}
          setSize={setSize}
          onViewDetail={handleViewDetail}
        />
      </Panel>
      <LogDetailDrawer open={openDetail} log={rowData} onClose={pageAction.handleClose} />
    </div>
  );
};
