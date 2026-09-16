import React from "react";
import { Button, Descriptions, Modal, Space, Table, Tag } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  ExportOutlined,
  EditOutlined,
  ImportOutlined,
} from "@ant-design/icons";
import { DetailModalProps } from "@/shared/interfaces/common";
import { formatDateTimeDDMMYYYY } from "@/shared/utils/date.util";
import { formatQuantity } from "@/shared/utils/number.util";
import { useGlobalData } from "@/shared/hooks/useGlobalData";
import {
  canEditStoreTransfer,
  canCancelStoreTransfer,
  canExportStoreTransfer,
  canImportStoreTransfer,
  StoreTransfer,
  StoreTransferStatus,
  storeTransferStatusLabels,
  StoreTransferLine,
} from "../storeTransfer.model";
import { resolveByPath } from "@/shared/utils";

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
  onDelete?: (record: StoreTransfer) => void;
  onExport?: (record: StoreTransfer) => void;
  onImport?: (record: StoreTransfer) => void;
  onCancel?: (record: StoreTransfer) => void;
}

export const StoreTransferDetailModal: React.FC<Props> = ({
  open,
  data,
  onClose,
  onOpenUpdate,
  onCopy,
  onDelete,
  onExport,
  onImport,
  onCancel,
}) => {
  const { currentStore } = useGlobalData();
  if (!data) return null;
  const status = data.status || StoreTransferStatus.PLANNED;
  const canEdit =
    !!onOpenUpdate &&
    Boolean(data._actions?.update?.can) &&
    canEditStoreTransfer(data, currentStore?.id);
  const canDelete =
    !!onDelete &&
    Boolean(data._actions?.delete?.can) &&
    canEditStoreTransfer(data, currentStore?.id);
  const canExport =
    !!onExport &&
    Boolean(data._actions?.export?.can) &&
    canExportStoreTransfer(data, currentStore?.id);
  const canImport =
    !!onImport &&
    Boolean(data._actions?.import?.can) &&
    canImportStoreTransfer(data, currentStore?.id);
  const canCancel =
    !!onCancel &&
    Boolean(data._actions?.cancel?.can) &&
    canCancelStoreTransfer(data, currentStore?.id);

  return (
    <Modal
      open={open}
      centered
      destroyOnClose
      width={900}
      footer={null}
      title={`Chi tiết phiếu chuyển hàng ${data.code || ""}`}
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
      <Table<StoreTransferLine>
        rowKey="id"
        className="mt-4"
        size="small"
        pagination={false}
        dataSource={data.lines || []}
        columns={[
          {
            title: "Mã hàng",
            key: "productCode",
            render: (_, line) => resolveByPath(line, ["product", "code"]),
          },
          {
            title: "Tên hàng",
            key: "productName",
            render: (_, line) => resolveByPath(line, ["product", "name"]),
          },
          {
            title: "ĐVT",
            key: "unitName",
            render: (_, line) => resolveByPath(line, ["unit", "name"]),
          },
          {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            align: "right" as const,
            render: (value) => formatQuantity(value),
          },
        ]}
      />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <Space wrap>
          {canCancel && (
            <Button danger icon={<CloseCircleOutlined />} onClick={() => onCancel?.(data)}>
              Hủy
            </Button>
          )}
          {canDelete && (
            <Button danger icon={<DeleteOutlined />} onClick={() => onDelete?.(data)}>
              Xóa
            </Button>
          )}
          {onCopy && (
            <Button icon={<CopyOutlined />} onClick={() => onCopy(data)}>
              Sao chép
            </Button>
          )}
        </Space>
        <Space wrap>
          {canExport && (
            <Button type="primary" icon={<ExportOutlined />} onClick={() => onExport?.(data)}>
              Xuất kho
            </Button>
          )}
          {canImport && (
            <Button type="primary" icon={<ImportOutlined />} onClick={() => onImport?.(data)}>
              Nhập kho
            </Button>
          )}
          {canEdit && (
            <Button type="primary" icon={<EditOutlined />} onClick={() => onOpenUpdate?.(data)}>
              Chỉnh sửa
            </Button>
          )}
          <Button icon={<CheckCircleOutlined />} onClick={onClose}>
            Đóng
          </Button>
        </Space>
      </div>
    </Modal>
  );
};
