import React, { useMemo } from "react";
import { Tag } from "antd";
import { ObjectTableProps, TableColumnConfig, ColumnsConfigType } from "@/shared/components";
import {
  StoreTransfer,
  StoreTransferStatus,
  storeTransferStatusLabels,
} from "../storeTransfer.model";
import { formatDateTimeDDMMYYYY } from "@/shared/utils/date.util";
import { formatQuantity } from "@/shared/utils/number.util";
import { useGlobalData } from "@/shared/hooks/useGlobalData";
import {
  canCancelStoreTransfer,
  canEditStoreTransfer,
  canExportStoreTransfer,
  canImportStoreTransfer,
} from "../storeTransfer.model";
import { resolveByPath } from "@/shared/utils";

const statusColors: Record<StoreTransferStatus, string> = {
  [StoreTransferStatus.PLANNED]: "gold",
  [StoreTransferStatus.EXPORTED]: "blue",
  [StoreTransferStatus.IMPORTED]: "green",
  [StoreTransferStatus.CANCELED]: "red",
};

export const StoreTransferTable: React.FC<ObjectTableProps> = (props) => {
  const { currentStore } = useGlobalData();
  const { onViewDetail } = props;
  const columns: ColumnsConfigType<StoreTransfer> = useMemo(
    () => [
      {
        title: "Số phiếu",
        key: "code",
        width: 100,
        fixed: "left",
        className: "font-mono",
        render: (_value: unknown, record: StoreTransfer) => (
          <button
            type="button"
            className="font-mono text-blue-600 hover:underline"
            onClick={(event) => {
              event.stopPropagation();
              onViewDetail?.(record);
            }}
          >
            {record.code || "--"}
          </button>
        ),
      },
      {
        title: "Ngày lập kế hoạch",
        key: "occurredAt",
        width: 155,
        render: (_value: unknown, record: StoreTransfer) =>
          formatDateTimeDDMMYYYY(record.occurredAt),
      },
      {
        title: "Kho chuyển đi",
        key: "fromStore",
        width: 180,
        render: (_value: unknown, record: StoreTransfer) =>
          record.fromStore?.name || record.fromStoreSnapshot?.name || "--",
      },
      {
        title: "Kho nhận",
        key: "toStore",
        width: 180,
        render: (_value: unknown, record: StoreTransfer) =>
          record.toStore?.name || record.toStoreSnapshot?.name || "--",
      },
      {
        title: "Tổng số lượng",
        key: "quantity",
        width: 130,
        align: "right",
        render: (_value: unknown, record: StoreTransfer) =>
          formatQuantity(
            (record.lines || []).reduce((total, line) => total + Number(line.quantity || 0), 0),
          ),
      },
      {
        title: "Xuất kho",
        key: "export",
        width: 180,
        render: (_value: unknown, record: StoreTransfer) =>
          (record.exporter || record.exporterSnapshot || record.exportedAt) && (
            <div className="flex flex-col">
              <span className="leading-4 font-semibold">
                {resolveByPath(record, ["exporter", "name"]) || "--"}
              </span>
              <span className="text-xs text-gray-500">
                {record.exportedAt ? formatDateTimeDDMMYYYY(record.exportedAt) : "--"}
              </span>
            </div>
          ),
      },
      {
        title: "Nhập kho",
        key: "importer",
        width: 180,
        render: (_value: unknown, record: StoreTransfer) =>
          (record.importer || record.importerSnapshot || record.importedAt) && (
            <div className="flex flex-col">
              <span className="leading-4 font-semibold">
                {resolveByPath(record, ["importer", "name"]) || "--"}
              </span>
              <span className="text-xs text-gray-500">
                {record.importedAt ? formatDateTimeDDMMYYYY(record.importedAt) : "--"}
              </span>
            </div>
          ),
      },
      {
        title: "Lý do",
        key: "reason",
        width: 240,
        render: (_value: unknown, record: StoreTransfer) => record.reason || "--",
      },
      {
        title: "Trạng thái",
        key: "status",
        width: 100,
        align: "center",
        fixed: "right",
        render: (_value: unknown, record: StoreTransfer) => {
          const status = record.status || StoreTransferStatus.PLANNED;
          return <Tag color={statusColors[status]}>{storeTransferStatusLabels[status]}</Tag>;
        },
      },
    ],
    [onViewDetail],
  );

  const dataSource = (props.dataSource || []).map((record: StoreTransfer) => ({
    ...record,
    _actions: {
      ...record._actions,
      update: {
        ...record._actions?.update,
        can:
          Boolean(record._actions?.update?.can) && canEditStoreTransfer(record, currentStore?.id),
      },
      delete: {
        ...record._actions?.delete,
        can:
          Boolean(record._actions?.delete?.can) && canEditStoreTransfer(record, currentStore?.id),
      },
      export: {
        ...record._actions?.export,
        can:
          Boolean(record._actions?.export?.can) && canExportStoreTransfer(record, currentStore?.id),
      },
      import: {
        ...record._actions?.import,
        can:
          Boolean(record._actions?.import?.can) && canImportStoreTransfer(record, currentStore?.id),
      },
      cancel: {
        ...record._actions?.cancel,
        can:
          Boolean(record._actions?.cancel?.can) && canCancelStoreTransfer(record, currentStore?.id),
      },
    },
  }));

  return (
    <TableColumnConfig
      {...props}
      dataSource={dataSource}
      columns={columns}
      itemName="phiếu chuyển kho"
      tableKey="store-transfer-table"
      showCreator={false}
      showUpdater={false}
    />
  );
};
