import { ExportOutlined, PrinterOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Modal, Segmented } from "antd";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { FundListSelect } from "@/modules/fund/components";
import { FundSelect } from "@/modules/fund/components/Select";
import { Fund, FundType } from "@/modules/fund/fund.model";
import { Partner, PartnerType } from "@/modules/partner/partner.model";
import { CustomerAddSelect, ShipperAddSelect } from "@/modules/partner/components/Select";
import { OrderSelect } from "@/modules/order/components/Select";
import { OrderType } from "@/modules/order/order.model";
import { bank_bin_map } from "@/shared/constants/option/bank";
import { DiscountType } from "@/shared/constants/enum";
import { InputMoney, Label, OrderValueInput } from "@/shared/components";
import { CachedOrder, PaymentMode, PosOrderType } from "@/shared/stores/orderCache.slice";
import { formatMoney, getCashSuggestions } from "@/shared/utils/number.util";
import { QrPay } from "@/shared/utils/qrcode";
import QRCode from "qrcode";

export interface PosTotals {
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export type PosPayment = Record<string, any> & {
  amount?: number;
  fundId?: string | null;
  fund?: Fund;
};

interface Props {
  type: PosOrderType;
  activeOrder: CachedOrder;
  totals: PosTotals;
  returnTotals?: PosTotals;
  exchangeTotals?: PosTotals;
  payment?: PosPayment;
  customerSelectRef: React.RefObject<HTMLDivElement>;
  updateActive: (values: Partial<CachedOrder>) => void;
  updatePayment: (values: Record<string, unknown>, index?: number) => void;
  payments: PosPayment[];
  changePaymentMode: (mode: PaymentMode) => void;
  onSubmit: (print?: boolean) => void;
  loading?: boolean;
}

export const PosInvoiceInfo: React.FC<Props> = ({
  type,
  activeOrder,
  totals,
  returnTotals,
  exchangeTotals,
  payment,
  payments,
  customerSelectRef,
  updateActive,
  updatePayment,
  changePaymentMode,
  onSubmit,
  loading,
}) => {
  const [qrImage, setQrImage] = useState<string>();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const paymentMode = (activeOrder.paymentMode ||
    (payment?.fund?.type === FundType.BANK ? FundType.BANK : FundType.CASH)) as PaymentMode;
  const cashPayment = payments[0] || {};
  const bankPayment = payments[1] || {};
  const bankFund = bankPayment.fund;
  const paymentDue =
    type === OrderType.SALE_RETURN ? Math.abs(totals.totalAmount) : Math.max(0, totals.totalAmount);
  const paidAmount =
    paymentMode === "combined"
      ? payments.reduce((sum, item) => sum + Number(item.amount || 0), 0)
      : Number(payment?.amount ?? activeOrder.paidAmount ?? 0);
  const previousPaymentDue = useRef<{ orderId: string; amount: number }>();

  useEffect(() => {
    const previous = previousPaymentDue.current;
    const isDifferentOrder = previous?.orderId !== activeOrder.id;
    const isPaymentDueChanged = previous?.amount !== paymentDue;

    previousPaymentDue.current = { orderId: activeOrder.id, amount: paymentDue };

    // Keep the payment amount loaded from an existing order. For subsequent
    // changes to the order total, reset it to the new amount while leaving the
    // input editable afterwards.
    if (isDifferentOrder || !previous || !isPaymentDueChanged) return;

    updatePayment({ amount: paymentDue });
  }, [activeOrder.id, paymentDue, updatePayment]);

  // const cashAmountOptions = useMemo(() => {
  //   if (!paymentDue || paymentDue <= 0) return [];

  //   const rounded = Math.ceil(paymentDue / 10_000) * 10_000;
  //   const nextStep = rounded < 100_000 ? 10_000 : rounded < 500_000 ? 50_000 : 100_000;
  //   const nextHundred = Math.ceil((rounded + nextStep) / 100_000) * 100_000;

  //   return [...new Set([paymentDue, rounded, rounded + nextStep, nextHundred, 500_000])].filter(
  //     (amount) => amount >= paymentDue,
  //   );
  // }, [paymentDue]);
  const cashAmountOptions = useMemo(() => getCashSuggestions(paymentDue), [paymentDue]);

  useEffect(() => {
    const bin = bank_bin_map[bankFund?.bank || ""];
    if (
      type !== OrderType.SALE ||
      (paymentMode !== FundType.BANK && paymentMode !== "combined") ||
      !bankFund?.accountNumber ||
      !paymentDue ||
      !bin
    ) {
      setQrImage(undefined);
      return;
    }

    const qrPayData = QrPay.vietQR({
      bin,
      bankNumber: bankFund.accountNumber,
      amount: String(Number(bankPayment.amount || paymentDue)),
      purpose: activeOrder.code ? `Thanh toan don hang ${activeOrder.code}` : "Thanh toan don hang",
    }).build();

    let disposed = false;
    QRCode.toDataURL(qrPayData, { width: 260, margin: 1 })
      .then((image) => {
        if (!disposed) setQrImage(image);
      })
      .catch(() => {
        if (!disposed) setQrImage(undefined);
      });

    return () => {
      disposed = true;
    };
  }, [activeOrder.code, bankFund, bankPayment.amount, paymentDue, paymentMode, type]);

  const paymentDifference = paidAmount - paymentDue;

  return (
    <aside className="flex w-[clamp(420px,32vw,520px)] shrink-0 flex-col overflow-y-auto border-l border-gray-200 bg-white">
      <section className="border-b border-gray-200 px-4 py-2">
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">
          Khách hàng
        </div>
        <div ref={customerSelectRef}>
          <CustomerAddSelect
            value={activeOrder.partnerId || undefined}
            defaultData={activeOrder.partner as Partner | undefined}
            onChangeData={(partner) => updateActive({ partnerId: partner?.id || null, partner })}
            placeholder="Tìm khách hàng (F4) — bỏ trống là Khách lẻ"
          />
        </div>
      </section>

      <section className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Vận chuyển
          </h3>
          <Checkbox
            checked={!!activeOrder.isFreeShipping}
            onChange={(event) => updateActive({ isFreeShipping: event.target.checked })}
          >
            Miễn phí vận chuyển
          </Checkbox>
        </div>

        <div className="flex items-center justify-between gap-3 py-2 text-sm">
          <Label title="Phí vận chuyển" />
          <div className="w-56">
            <InputMoney
              min={0}
              value={Number(activeOrder.shippingFee || 0)}
              onChange={(shippingFee) => updateActive({ shippingFee: Number(shippingFee || 0) })}
            />
          </div>
        </div>
        <ShipperAddSelect
          value={activeOrder.shipperId || undefined}
          defaultData={activeOrder.shipper as Partner | undefined}
          query={{ type: PartnerType.SHIPPER }}
          onChangeData={(shipper) => updateActive({ shipperId: shipper?.id || null, shipper })}
        />
        <div className="mt-2 text-xs text-gray-500">
          {activeOrder.isFreeShipping !== false
            ? "Không cộng phí vào số tiền khách thanh toán."
            : "Cộng phí vận chuyển vào số tiền khách thanh toán."}
          {activeOrder.shipperId && " Phí sẽ ghi nhận là nợ phải trả ĐVVC."}
        </div>
      </section>

      <section className="border-b border-gray-200 p-4">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Tổng kết đơn
          {activeOrder.refOrder && (
            <span className="ml-2 text-xs font-normal text-gray-400">
              (Hóa đơn: {activeOrder.refOrder.code})
            </span>
          )}
        </h3>

        {type === OrderType.SALE ? (
          <SummaryRow label="Tổng tiền hàng" value={totals.grossAmount} />
        ) : (
          <>
            <SummaryRow label="Tổng tiền hàng trả" value={returnTotals?.grossAmount || 0} />
            <SummaryRow label="Tổng tiền hàng đổi" value={exchangeTotals?.grossAmount || 0} />
          </>
        )}
        <div className="flex items-center justify-between gap-3 py-2 text-sm">
          <span>Giảm giá</span>
          <div className="w-56">
            <OrderValueInput
              type="discount"
              discountValue={Number(activeOrder.discountValue || 0)}
              discountType={activeOrder.discountType as DiscountType}
              onChange={(discountValue, discountType) =>
                updateActive({ discountValue, discountType })
              }
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 py-2 text-sm">
          <span>VAT</span>
          <div className="w-56">
            <OrderValueInput
              type="tax"
              discountValue={Number(activeOrder.taxValue || 0)}
              discountType={activeOrder.taxType as DiscountType}
              onChange={(taxValue, taxType) => updateActive({ taxValue, taxType })}
            />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-dashed border-gray-200 pt-4 font-semibold">
          <span>{type === OrderType.SALE_RETURN ? "Khách cần trả" : "Khách cần thanh toán"}</span>
          <span className="text-xl text-green-700">{formatMoney(totals.totalAmount)}</span>
        </div>
      </section>

      <section className={`p-4`}>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Thanh toán</h3>
        <Segmented
          block
          className="mb-3"
          value={paymentMode}
          options={[
            { label: "Tiền mặt", value: FundType.CASH },
            { label: "Chuyển khoản", value: FundType.BANK },
            { label: "Kết hợp", value: "combined" },
          ]}
          onChange={(value) => changePaymentMode(value as PaymentMode)}
        />
        {(paymentMode === FundType.CASH || paymentMode === "combined") && (
          <div className="flex items-center justify-between gap-3 py-2 text-sm">
            <span>{type === OrderType.SALE_RETURN ? "Tiền mặt hoàn khách" : "Tiền mặt"}</span>
            <div className="w-56">
              <InputMoney
                min={0}
                value={Number(cashPayment.amount || 0)}
                onChange={(amount) => updatePayment({ amount: Number(amount || 0) }, 0)}
                placeholder="Nhập số tiền tiền mặt"
              />
            </div>
          </div>
        )}
        {(paymentMode === FundType.BANK || paymentMode === "combined") && (
          <div className="flex items-center justify-between gap-3 py-2 text-sm">
            <span>{bankFund?.name || "Chuyển khoản"}</span>
            <div className="w-56">
              <InputMoney
                min={0}
                max={paymentDue}
                value={Number(bankPayment.amount || 0)}
                onChange={(amount) => updatePayment({ amount: Number(amount || 0) }, 1)}
                placeholder="Nhập số tiền chuyển khoản"
              />
            </div>
          </div>
        )}

        <div className="hidden">
          <FundListSelect
            query={{ type: FundType.CASH }}
            value={cashPayment.fundId || undefined}
            defaultData={cashPayment.fund}
            onChangeData={(fund) => updatePayment({ fundId: fund?.id || null, fund }, 0)}
          />
        </div>

        {(paymentMode === FundType.CASH || paymentMode === "combined") && (
          <div className="min-h-[84px] rounded-md bg-[#f5f5f5] px-3 py-2">
            <div className="flex flex-wrap gap-1.5">
              {cashAmountOptions.map((amount) => (
                <Button
                  key={amount}
                  className="rounded-full"
                  type={Number(cashPayment.amount || 0) === amount ? "primary" : "default"}
                  onClick={() => updatePayment({ amount }, 0)}
                >
                  {formatMoney(amount)}
                </Button>
              ))}
            </div>
          </div>
        )}
        {(paymentMode === FundType.BANK || paymentMode === "combined") && (
          <div className="mt-2 flex gap-3 rounded-md bg-[#f5f5f5] p-2">
            {qrImage && (
              <img
                src={qrImage}
                alt="VietQR thanh toán"
                className="h-[68px] w-[68px] rounded bg-white object-contain"
              />
            )}
            <div className="flex flex-1 flex-col gap-3">
              <Form.Item label="Tài khoản" className="mb-0">
                <FundSelect
                  query={{ type: FundType.BANK }}
                  value={bankPayment.fundId || undefined}
                  defaultData={bankPayment.fund}
                  onChangeData={(fund) => updatePayment({ fundId: fund?.id || null, fund }, 1)}
                />
              </Form.Item>
              <div className="flex items-center justify-between">
                <Button
                  size="small"
                  className="w-fit"
                  icon={<ExportOutlined />}
                  disabled={!qrImage}
                  onClick={() => setQrModalOpen(true)}
                >
                  Hiện mã QR
                </Button>
                <button
                  type="button"
                  className="w-fit font-semibold text-slate-500 transition-all ease-in-out hover:text-primary"
                  onClick={() => updatePayment({ amount: paymentDue }, 1)}
                >
                  Thanh toán toàn bộ
                </button>
              </div>
            </div>
          </div>
        )}

        {type === OrderType.SALE && paymentDifference > 0 && (
          <SummaryRow label="Tiền thừa trả khách" value={paymentDifference} />
        )}
        {type === OrderType.SALE && paymentDifference < 0 && (
          <SummaryRow label="Khách còn nợ" value={Math.abs(paymentDifference)} />
        )}

        <Modal
          open={qrModalOpen}
          centered
          title="Mã QR thanh toán"
          footer={null}
          onCancel={() => setQrModalOpen(false)}
        >
          {qrImage && (
            <div className="flex justify-center py-2">
              <img
                src={qrImage}
                alt="VietQR thanh toán"
                className="h-[196px] w-[196px] object-contain"
              />
            </div>
          )}
        </Modal>
      </section>

      <div className="sticky bottom-0 mt-auto flex gap-2 border-t border-gray-200 bg-white p-4 pt-1.5">
        <Button
          className="flex h-12 w-14 items-center justify-center p-0 text-lg"
          disabled={!activeOrder.lines?.length && !activeOrder.returnLines?.length}
          onClick={() => onSubmit(true)}
        >
          <PrinterOutlined />
        </Button>
        <Button
          type="primary"
          block
          className="h-12"
          disabled={!activeOrder.lines?.length && !activeOrder.returnLines?.length}
          loading={loading}
          onClick={() => onSubmit(false)}
        >
          <span className="text-lg font-semibold">
            {activeOrder.mode === "edit" ? "CẬP NHẬT" : "THANH TOÁN"}
          </span>
        </Button>
      </div>
    </aside>
  );
};

const SummaryRow = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between py-2 text-sm">
    <span>{label}</span>
    <b>{formatMoney(value)}</b>
  </div>
);
