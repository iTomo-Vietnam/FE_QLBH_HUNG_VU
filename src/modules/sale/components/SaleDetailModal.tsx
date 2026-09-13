import React from "react";
import { Button, Modal, Space } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { formatDateTimeDDMMYYYY } from "@/shared/utils/date.util";
import { formatMoney, formatQuantity } from "@/shared/utils/number.util";
import { getLineProduct } from "@/modules/purchase/purchase.util";
import { SaleStatusTag } from "./Tag";
import { Sale, OrderStatus } from "../model";

interface Props {
  open: boolean;
  data?: Sale;
  isReturn?: boolean;
  onClose: () => void;
  onOpenUpdate?: (record: Sale) => void;
  onCopy?: (record: Sale) => void;
  onDelete?: (record: Sale) => void;
  onComplete?: (record: Sale) => void;
  onCancel?: (record: Sale) => void;
  onCreateReturn?: (record: Sale) => void;
  onPrint?: (record: Sale) => void;
}

const valueOrDash = (value?: string | null) => value || "—";

const SummaryRow: React.FC<{ label: string; value: React.ReactNode; strong?: boolean }> = ({
  label,
  value,
  strong,
}) => (
  <div className={`flex items-center justify-between gap-4 ${strong ? "font-semibold" : ""}`}>
    <span className="text-slate-600 w-1/2 text-end">{label}</span>
    <span className={strong ? "text-blue-600" : "text-slate-900"}>{value}</span>
  </div>
);

export const SaleDetailModal: React.FC<Props> = ({
  open,
  data,
  isReturn = false,
  onClose,
  onOpenUpdate,
  onCopy,
  onDelete,
  onComplete,
  onCancel,
  onCreateReturn,
  onPrint,
}) => {
  const lines = isReturn
    ? data?.returnLines?.length
      ? data.returnLines
      : data?.lines || []
    : data?.lines || [];
  const partner = data?.partner || data?.partnerSnapshot;
  const paidAmount = (data?.incomeExpenses || []).reduce(
    (total, item) => total + Math.max(0, Number(item.amount || 0)),
    0,
  );
  const totalQuantity = lines.reduce((sum, line) => sum + Number(line.quantity || 0), 0);
  if (!data) return null;

  const isCanceled = data.status === OrderStatus.CANCELED;
  const isDraft = data.status === OrderStatus.DRAFT;
  const canEdit = !isCanceled && !!onOpenUpdate && !(isReturn && !!(data as any).refOrderId);
  const canDelete = isDraft && !!onDelete;
  const canComplete = isDraft && !!onComplete;
  const canCancel = !isCanceled && !!onCancel;

  const amount = Number(isReturn ? data.returnTotalAmount : data.totalAmount) || 0;
  const taxAmount = Number(isReturn ? data.returnTaxAmount : data.taxAmount) || 0;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <div className="flex shrink-0 items-center gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="font-mono text-xl font-semibold">{valueOrDash(data.code)}</span>
            <SaleStatusTag value={data.status} isReturn={isReturn} />
          </div>
          <span className="text-sm text-slate-600">
            {data.store?.name
              ? `Chi nhánh ${data.store.name}`
              : isReturn
                ? "Phiếu trả hàng"
                : "Đơn bán hàng"}
          </span>
        </div>
      }
      width={1080}
      centered
      destroyOnClose
    >
      <div className="flex max-h-[calc(100vh-80px)] flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto py-4">
          <div className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-3 text-sm">
            <div>
              <span className="text-slate-500">Người tạo: </span>
              {valueOrDash(data.creatorSnapshot?.name)}
            </div>
            <div>
              <span className="text-slate-500">Người hoàn thành: </span>
              {valueOrDash(data.completer?.name || data.completerSnapshot?.name)}
            </div>
            <div>
              <span className="text-slate-500">Ngày bán: </span>
              {formatDateTimeDDMMYYYY(data.orderAt)}
            </div>
            <div className="md:col-span-2">
              <span className="text-slate-500">Khách hàng: </span>
              {valueOrDash(partner?.name) === "—" ? "Khách lẻ" : partner?.name}
            </div>
            <div>
              <span className="text-slate-500">Hoàn thành: </span>
              {formatDateTimeDDMMYYYY(data.occurredAt)}
            </div>
            <div>
              <span className="text-slate-500">Số điện thoại: </span>
              {valueOrDash(partner?.phone)}
            </div>
            {isReturn && (
              <div>
                <span className="text-slate-500">Đơn bán gốc: </span>
                {valueOrDash(data.refOrder?.code)}
              </div>
            )}
          </div>

          <div className="mt-5 overflow-x-auto rounded border border-slate-200">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left">Mã hàng</th>
                  <th className="px-3 py-2 text-left">Tên hàng</th>
                  <th className="px-3 py-2 text-right">Số lượng</th>
                  <th className="px-3 py-2 text-right">Đơn giá</th>
                  <th className="px-3 py-2 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => {
                  const product = getLineProduct(line);
                  const quantity = Number(line.quantity || 0);
                  const unitPrice = Number(line.unitPrice || 0);
                  return (
                    <tr
                      key={line.id || line.tempId || `${product.id}-${index}`}
                      className="border-b last:border-b-0 border-slate-200"
                    >
                      <td className="px-3 py-3 font-mono text-blue-600">
                        {valueOrDash(product.code)}
                      </td>
                      <td className="px-3 py-3">
                        <div>{valueOrDash(product.name)}</div>
                        {line.note && (
                          <div className="mt-1 text-xs italic text-slate-500">{line.note}</div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right">{quantity}</td>
                      <td className="px-3 py-3 text-right">{formatMoney(unitPrice)}</td>
                      <td className="px-3 py-3 text-right font-semibold">
                        {formatMoney(quantity * unitPrice)}
                      </td>
                    </tr>
                  );
                })}
                {!lines.length && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500">
                      Chưa có hàng hóa
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-h-28 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600">
              {data.note || "—"}
            </div>
            <div className="space-y-2 text-sm">
              <SummaryRow
                label={`Số lượng mặt hàng (${lines.length})`}
                value={formatQuantity(totalQuantity) || "0"}
              />
              <SummaryRow
                label="Tổng tiền hàng"
                value={formatMoney(isReturn ? data.returnGrossAmount : data.grossAmount) || "0"}
              />
              <SummaryRow
                label="Giảm giá"
                value={
                  formatMoney(isReturn ? data.returnDiscountAmount : data.discountAmount) || "0"
                }
              />
              {!!taxAmount && <SummaryRow label="VAT" value={formatMoney(taxAmount) || "0"} />}
              <SummaryRow
                label={isReturn ? "Khách được hoàn" : "Khách cần trả"}
                value={formatMoney(amount) || "0"}
                strong
              />
              <SummaryRow
                label={isReturn ? "Đã hoàn khách" : "Khách đã trả"}
                value={formatMoney(paidAmount) || "0"}
              />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3 pb-1">
          <Space wrap>
            {!isReturn && onCreateReturn && (
              <Button onClick={() => onCreateReturn(data)}>Tạo phiếu trả</Button>
            )}
            {canCancel && (
              <Button danger icon={<CloseCircleOutlined />} onClick={() => onCancel?.(data)}>
                Hủy
              </Button>
            )}
            {canComplete && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => onComplete?.(data)}
              >
                Hoàn thành
              </Button>
            )}
            {canDelete && (
              <Button
                danger
                type="primary"
                icon={<DeleteOutlined />}
                onClick={() => onDelete?.(data)}
              >
                Xóa
              </Button>
            )}
            {onCopy && (
              <Button
                icon={<CopyOutlined />}
                type="primary"
                className="bg-amber-500 hover:!bg-amber-400"
                onClick={() => onCopy(data)}
              >
                Sao chép
              </Button>
            )}
          </Space>
          <Space wrap>
            {canEdit && (
              <Button type="primary" icon={<EditOutlined />} onClick={() => onOpenUpdate?.(data)}>
                Mở phiếu
              </Button>
            )}
            {onPrint && (
              <Button
                type="primary"
                className="bg-sky-500 hover:!bg-sky-400"
                icon={<PrinterOutlined />}
                onClick={() => onPrint(data)}
              >
                In
              </Button>
            )}
          </Space>
        </div>
      </div>
    </Modal>
  );
};
