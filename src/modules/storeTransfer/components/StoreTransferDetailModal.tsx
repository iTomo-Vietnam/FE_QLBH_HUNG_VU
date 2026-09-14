import React from "react";
import { Button, Descriptions, Modal, Table, Tag } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { DetailModalProps } from "@/shared/interfaces/common";
import { formatDateTimeDDMMYYYY } from "@/shared/utils/date.util";
import { formatQuantity } from "@/shared/utils/number.util";
import { useGlobalData } from "@/shared/hooks/useGlobalData";
import {
  canEditStoreTransfer,
  StoreTransfer,
  StoreTransferStatus,
  storeTransferStatusLabels,
} from "../storeTransfer.model";

const statusColors: Record<StoreTransferStatus, string> = {
  [StoreTransferStatus.PLANNED]: "gold",
  [StoreTransferStatus.EXPORTED]: "blue",
  [StoreTransferStatus.IMPORTED]: "green",
  [StoreTransferStatus.CANCELED]: "red",
};

const actorName = (snapshot: StoreTransfer["exporterSnapshot"]): string =>
  snapshot?.name || snapshot?.username || "--";

interface Props extends DetailModalProps<StoreTransfer> {
  onCopy?: (record: StoreTransfer) => void;
}

export const StoreTransferDetailModal: React.FC<Props> = ({
  open,
  data,
  onClose,
  onOpenUpdate,
  onCopy,
}) => {
  const { currentStore } = useGlobalData();
  if (!data) return null;
  const status = data.status || StoreTransferStatus.PLANNED;

  return (
    <Modal
      open={open}
      centered
      destroyOnClose
      width={900}
      footer={null}
      title={`Chi tiết phiếu chuyển kho ${data.code || ""}`}
      onCancel={onClose}
    >
      <Descriptions bordered size="small" column={2}>
        <Descriptions.Item label="Trạng thái">
          <Tag color={statusColors[status]}>{storeTransferStatusLabels[status]}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Lý do">{data.reason || "--"}</Descriptions.Item>
        <Descriptions.Item label="Ngày lập kế hoạch">
          {formatDateTimeDDMMYYYY(data.occurredAt)}
        </Descriptions.Item>
        <Descriptions.Item label="Người lập">
          {actorName(data.creatorSnapshot as StoreTransfer["exporterSnapshot"])}
        </Descriptions.Item>
        <Descriptions.Item label="Kho chuyển đi">
          {data.fromStore?.name || data.fromStoreSnapshot?.name || "--"}
        </Descriptions.Item>
        <Descriptions.Item label="Kho nhận">
          {data.toStore?.name || data.toStoreSnapshot?.name || "--"}
        </Descriptions.Item>
        <Descriptions.Item label="Đã xuất kho">
          {data.exportedAt
            ? `${formatDateTimeDDMMYYYY(data.exportedAt)} · ${actorName(data.exporterSnapshot)}`
            : "--"}
        </Descriptions.Item>
        <Descriptions.Item label="Đã nhập kho">
          {data.importedAt
            ? `${formatDateTimeDDMMYYYY(data.importedAt)} · ${actorName(data.importerSnapshot)}`
            : "--"}
        </Descriptions.Item>
        {data.status === StoreTransferStatus.CANCELED && (
          <Descriptions.Item label="Đã hủy" span={2}>
            {data.canceledAt
              ? `${formatDateTimeDDMMYYYY(data.canceledAt)} · ${actorName(data.cancelerSnapshot)}`
              : "--"}
          </Descriptions.Item>
        )}
      </Descriptions>
      <Table
        rowKey="id"
        className="mt-4"
        size="small"
        pagination={false}
        dataSource={data.lines || []}
        columns={[
          {
            title: "Hàng hóa",
            render: (_: unknown, line: any) =>
              line.product?.name || line.productSnapshot?.name || "--",
          },
          {
            title: "Mã hàng",
            render: (_: unknown, line: any) =>
              line.product?.code || line.productSnapshot?.code || "--",
          },
          {
            title: "ĐVT",
            render: (_: unknown, line: any) => line.unit?.name || line.unitSnapshot?.name || "--",
          },
          {
            title: "Số lượng",
            align: "right" as const,
            render: (_: unknown, line: any) => formatQuantity(line.quantity),
          },
        ]}
      />
      <div className="mt-4 flex justify-end gap-2">
        <Button onClick={onClose}>Đóng</Button>
        {onCopy && (
          <Button icon={<CopyOutlined />} onClick={() => onCopy(data)}>
            Sao chép
          </Button>
        )}
        {onOpenUpdate &&
          data._actions?.update?.can &&
          canEditStoreTransfer(data, currentStore?.id) && (
            <Button type="primary" onClick={() => onOpenUpdate(data)}>
              Chỉnh sửa
            </Button>
          )}
      </div>
    </Modal>
  );
};
