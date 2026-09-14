import React from "react";
import { Button, Descriptions, Modal, Tag } from "antd";
import { DetailModalProps } from "@/shared/interfaces/common";
import { formatDateTimeDDMMYYYY } from "@/shared/utils/date.util";
import { formatMoney } from "@/shared/utils/number.util";
import { TransferNote, TransferNoteStatus, transferNoteStatusMap } from "../transferNote.model";

export const TransferNoteDetailModal: React.FC<DetailModalProps<TransferNote>> = ({ open, data, onClose, onOpenUpdate }) => {
  if (!data) return null;
  return <Modal open={open} centered footer={null} title={`Chi tiết ghi chú chuyển khoản ${data.referenceCode}`} onCancel={onClose}>
    <Descriptions bordered size="small" column={1}>
      <Descriptions.Item label="Thời gian">{formatDateTimeDDMMYYYY(data.occurredAt)}</Descriptions.Item>
      <Descriptions.Item label="Số phiếu đối soát">{data.referenceCode}</Descriptions.Item>
      <Descriptions.Item label="Tài khoản nhận">{data.fund?.name || data.fundSnapshot?.name || "—"}</Descriptions.Item>
      <Descriptions.Item label="Số tiền">{formatMoney(data.amount)}</Descriptions.Item>
      <Descriptions.Item label="Trạng thái"><Tag color={data.status === TransferNoteStatus.VALID ? "success" : "error"}>{transferNoteStatusMap[data.status]}</Tag></Descriptions.Item>
      <Descriptions.Item label="Lý do không hợp lệ">{data.invalidReason || "—"}</Descriptions.Item>
      <Descriptions.Item label="Ghi chú">{data.note || "—"}</Descriptions.Item>
    </Descriptions>
    <div className="mt-4 flex justify-end gap-2"><Button onClick={onClose}>Đóng</Button>{onOpenUpdate && <Button type="primary" onClick={() => onOpenUpdate(data)}>Chỉnh sửa</Button>}</div>
  </Modal>;
};
