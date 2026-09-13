import React, { useMemo } from "react";
import { Tag } from "antd";
import { ObjectTableProps, TableColumnConfig } from "@/shared/components";
import { debtSideMap } from "@/shared/constants/enum";
import { formatDateTimeDDMMYYYY } from "@/shared/utils/date.util";
import { formatMoney } from "@/shared/utils/number.util";
import { DebtAdjustment } from "../debtAdjustment.model";

interface Props extends ObjectTableProps {
  onViewDetail?: (record: DebtAdjustment) => void;
}

export const DebtAdjustmentTable: React.FC<Props> = ({ onViewDetail, ...rest }) => {
  const columns = useMemo(
    () => [
      {
        title: "Số phiếu",
        key: "code",
        width: 100,
        fixed: "left" as const,
        className: "font-mono",
        render: (record: DebtAdjustment) => (
          <button
            type="button"
            className="font-mono text-blue-600 hover:underline"
            onClick={(event) => {
              event.stopPropagation();
              onViewDetail?.(record);
            }}
          >
            {record.code || "—"}
          </button>
        ),
      },
      {
        title: "Thời gian",
        dataIndex: "occurredAt",
        key: "occurredAt",
        width: 120,
        render: (value: string) => formatDateTimeDDMMYYYY(value),
      },
      {
        title: "Loại công nợ",
        dataIndex: "side",
        key: "side",
        width: 100,
        render: (value: DebtAdjustment["side"]) => (
          <Tag color={value === "receivable" ? "blue" : "orange"}>{debtSideMap[value]}</Tag>
        ),
      },
      {
        title: "Đối tác",
        key: "partner",
        width: 160,
        render: (record: DebtAdjustment) =>
          record.partner?.name || record.partnerSnapshot?.name || "Không xác định",
      },
      {
        title: "Số dư hệ thống",
        dataIndex: "expectedAmount",
        key: "expectedAmount",
        width: 120,
        align: "right" as const,
        render: (value: number) => formatMoney(value),
      },
      {
        title: "Số dư thực tế",
        dataIndex: "countedAmount",
        key: "countedAmount",
        width: 120,
        align: "right" as const,
        render: (value: number) => formatMoney(value),
      },
      {
        title: "Chênh lệch",
        dataIndex: "deltaAmount",
        key: "deltaAmount",
        width: 100,
        align: "right" as const,
        render: (value: number) => (
          <span className={value < 0 ? "text-red-600" : "text-emerald-600"}>
            {formatMoney(value)}
          </span>
        ),
      },
      {
        title: "Lý do",
        dataIndex: "reason",
        key: "reason",
        width: 220,
        render: (value: string | null) => value || "—",
      },
    ],
    [onViewDetail],
  );

  return (
    <TableColumnConfig
      columns={columns}
      itemName="phiếu điều chỉnh công nợ"
      tableKey="debt-adjustment-table"
      showCreator={false}
      showUpdater={false}
      {...rest}
    />
  );
};
