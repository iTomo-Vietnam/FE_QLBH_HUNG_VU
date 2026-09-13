import React from "react";
import { Button, Descriptions, Modal, Tag } from "antd";
import { DetailModalProps } from "@/shared/interfaces/common";
import { debtSideMap } from "@/shared/constants/enum";
import { formatDateTimeDDMMYYYY } from "@/shared/utils/date.util";
import { formatMoney } from "@/shared/utils/number.util";
import { DebtAdjustment } from "../debtAdjustment.model";

export const DebtAdjustmentDetailModal: React.FC<DetailModalProps<DebtAdjustment>> = ({
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
      title={`Chi tiết phiếu điều chỉnh công nợ ${data.code || ""}`}
      onCancel={onClose}
    >
      <Descriptions bordered size="small" column={1}>
        <Descriptions.Item label="Thời gian">{formatDateTimeDDMMYYYY(data.occurredAt)}</Descriptions.Item>
        <Descriptions.Item label="Loại công nợ">{debtSideMap[data.side]}</Descriptions.Item>
        <Descriptions.Item label="Đối tác">
          {data.partner?.name || data.partnerSnapshot?.name || "Không xác định"}
        </Descriptions.Item>
        <Descriptions.Item label="Số dư hệ thống">{formatMoney(data.expectedAmount)}</Descriptions.Item>
        <Descriptions.Item label="Số dư thực tế">{formatMoney(data.countedAmount)}</Descriptions.Item>
        <Descriptions.Item label="Chênh lệch">
          <Tag color={data.deltaAmount < 0 ? "error" : "success"}>{formatMoney(data.deltaAmount)}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Lý do">{data.reason || "—"}</Descriptions.Item>
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
