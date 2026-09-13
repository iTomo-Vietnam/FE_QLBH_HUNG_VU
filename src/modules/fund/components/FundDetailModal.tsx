import React from "react";
import { Button, Descriptions, Modal, Tag } from "antd";
import { DetailModalProps } from "@/shared/interfaces/common";
import { formatMoney } from "@/shared/utils/number.util";
import { Fund, fundTypeMap } from "../fund.model";

export const FundDetailModal: React.FC<DetailModalProps<Fund>> = ({
  open,
  data,
  onClose,
  onOpenUpdate,
}) => {
  if (!data) return null;

  return (
    <Modal
      open={open}
      centered
      destroyOnClose
      footer={null}
      title={`Chi tiết quỹ ${data.code || ""}`}
      onCancel={onClose}
    >
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Tên quỹ">{data.name}</Descriptions.Item>
        <Descriptions.Item label="Loại quỹ">{fundTypeMap[data.type] || data.type}</Descriptions.Item>
        <Descriptions.Item label="Phạm vi sử dụng">
          {data.storeId ? data.store?.name || "Cửa hàng" : "Tài khoản dùng chung toàn hệ thống"}
        </Descriptions.Item>
        {data.type === "bank" && (
          <>
            <Descriptions.Item label="Ngân hàng">{data.bank || "—"}</Descriptions.Item>
            <Descriptions.Item label="Loại tài khoản">{data.isPersonal ? "Cá nhân" : "Công ty"}</Descriptions.Item>
            <Descriptions.Item label="Số tài khoản">
              {data.accountNumber || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Chủ tài khoản">
              {data.accountHolderName || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Chi nhánh">{data.branch || "—"}</Descriptions.Item>
          </>
        )}
        <Descriptions.Item label="Số dư hiện tại">
          {formatMoney(data.currentBalance) || "0"}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={data.isActive ? "success" : "default"}>
            {data.isActive ? "Đang hoạt động" : "Đã khóa"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Ghi chú">{data.note || "—"}</Descriptions.Item>
      </Descriptions>
      <div className="mt-4 flex justify-end gap-2">
        <Button onClick={onClose}>Đóng</Button>
        {onOpenUpdate && (
          <Button type="primary" onClick={() => onOpenUpdate(data)}>
            Chỉnh sửa
          </Button>
        )}
      </div>
    </Modal>
  );
};

