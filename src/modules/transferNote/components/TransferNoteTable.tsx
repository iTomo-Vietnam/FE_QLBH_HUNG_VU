import React, { useMemo } from "react";
import { Tag } from "antd";
import { ObjectTableProps, TableColumnConfig } from "@/shared/components/table";
import { formatDateTimeDDMMYYYY } from "@/shared/utils/date.util";
import { formatMoney } from "@/shared/utils/number.util";
import { TransferNote, TransferNoteStatus, transferNoteStatusMap } from "../transferNote.model";

interface Props extends ObjectTableProps {
  onViewDetail?: (record: TransferNote) => void;
}

export const TransferNoteTable: React.FC<Props> = ({ onViewDetail, ...rest }) => {
  const columns = useMemo(
    () => [
      {
        title: "Giờ",
        key: "occurredAt",
        width: 130,
        render: (_: unknown, record: TransferNote) => formatDateTimeDDMMYYYY(record.occurredAt),
      },
      {
        title: "Số phiếu đối soát",
        dataIndex: "referenceCode",
        key: "referenceCode",
        width: 170,
        render: (value: string, record: TransferNote) => (
          <button
            type="button"
            className="font-mono text-left text-primary hover:underline"
            onClick={() => onViewDetail?.(record)}
          >
            {value}
          </button>
        ),
      },
      {
        title: "STK nhận",
        key: "fund",
        width: 220,
        render: (_: unknown, record: TransferNote) =>
          record.fund?.name || record.fundSnapshot?.name || "—",
      },
      {
        title: "Ghi chú",
        dataIndex: "note",
        key: "note",
        width: 220,
        render: (value: string | null) => value || "—",
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 130,
        align: "center" as const,
        render: (value: TransferNoteStatus) => (
          <Tag color={value === TransferNoteStatus.VALID ? "success" : "error"}>
            {transferNoteStatusMap[value]}
          </Tag>
        ),
      },
      {
        title: "Thống kê",
        dataIndex: "amount",
        key: "amount",
        width: 150,
        align: "right" as const,
        render: (value: number) => formatMoney(value),
      },
      {
        title: "Người tạo",
        key: "creator",
        width: 150,
        render: (_: unknown, record: TransferNote) => record.creatorSnapshot?.name || "—",
      },
    ],
    [onViewDetail],
  );

  return (
    <TableColumnConfig
      columns={columns}
      itemName="ghi chú chuyển khoản"
      tableKey="transfer-note-table"
      showCreator={false}
      showUpdater={false}
      {...rest}
    />
  );
};
