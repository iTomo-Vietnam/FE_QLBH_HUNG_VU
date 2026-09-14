import { ExportOutlined, PrinterOutlined } from "@ant-design/icons";
import { Button, Form, Modal, Segmented } from "antd";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { CustomerAddSelect } from "@/modules/partner/components/Select";
import { Partner } from "@/modules/partner/partner.model";
import { FundListSelect } from "@/modules/fund/components";
import { FundSelect } from "@/modules/fund/components/Select";
import { FundType } from "@/modules/fund/fund.model";
import { OrderValueInput, InputMoney } from "@/shared/components";
import { DiscountType } from "@/shared/constants/enum";
import { CachedOrder, PaymentMode } from "@/shared/stores/orderCache.slice";
import { bank_bin_map } from "@/shared/constants/option/bank";
import { formatMoney, getCashSuggestions, getCombinedCashSuggestions } from "@/shared/utils/number.util";
import { QrPay } from "@/shared/utils/qrcode";
import QRCode from "qrcode";
import { PosPayment, PosTotals } from "./PosInvoiceInfo";

interface Props {
  activeOrder: CachedOrder;
  returnTotals: PosTotals;
  exchangeTotals: PosTotals;
  payment?: PosPayment;
  customerSelectRef: React.RefObject<HTMLDivElement>;
  updateActive: (values: Partial<CachedOrder>) => void;
  updatePayment: (values: Record<string, unknown>, index?: number) => void;
  payments: PosPayment[];
  changePaymentMode: (mode: PaymentMode) => void;
  onSubmit: (print?: boolean) => void;
  loading?: boolean;
  readOnly?: boolean;
}

const getLineQuantity = (lines: CachedOrder["lines"] | CachedOrder["returnLines"]) =>
  (lines || []).reduce((sum, line) => sum + Number((line as any).quantity || 0), 0);

const SummaryRow: React.FC<{
  label: string;
  value: number;
  quantity?: number;
  strong?: boolean;
}> = ({ label, value, quantity, strong = false }) => (
  <div
    className={`flex items-center justify-between gap-3 py-2 text-sm ${strong ? "font-semibold" : ""}`}
  >
    <span>{label}</span>
    <span className="flex items-center gap-6">
      {quantity !== undefined && <span>{quantity}</span>}
      <b className={strong ? "text-base text-primary" : ""}>{formatMoney(value)}</b>
    </span>
  </div>
);

export const SaleReturnInvoiceInfo: React.FC<Props> = ({
  activeOrder,
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
  readOnly = false,
}) => {
  const settlementAmount = exchangeTotals.totalAmount - returnTotals.totalAmount;
  const paymentDue = Math.abs(settlementAmount);
  const paymentMode = (activeOrder.paymentMode ||
    (payment?.fund?.type === FundType.BANK ? FundType.BANK : FundType.CASH)) as PaymentMode;
  const cashPayment = payments[0] || {};
  const bankPayment = payments[1] || {};
  const paidAmount =
    paymentMode === "combined"
      ? payments.reduce((sum, item) => sum + Number(item.amount || 0), 0)
      : Number(payment?.amount || 0);
  const returnLines = useMemo(() => activeOrder.returnLines || [], [activeOrder.returnLines]);
  const exchangeLines = activeOrder.lines || [];
  const hasExchange = exchangeLines.some((line) => Number((line as any).quantity || 0) > 0);
  const returnQuantity = getLineQuantity(returnLines);
  const exchangeQuantity = getLineQuantity(exchangeLines);
  const originalReturnGrossAmount = useMemo(
    () =>
      returnLines.reduce((sum, line) => {
        const sourceLine = activeOrder.refOrder?.lines?.find(
          (item) => item.id === (line as any).refOrderLineId,
        );
        return (
          sum +
          Number((line as any).quantity || 0) *
            Number(sourceLine?.unitPrice ?? (line as any).originalUnitPrice ?? 0)
        );
      }, 0),
    [activeOrder.refOrder?.lines, returnLines],
  );
  const previousPaymentDue = useRef<{ orderId: string; amount: number }>();
  const [qrImage, setQrImage] = useState<string>();
  const [qrModalOpen, setQrModalOpen] = useState(false);

  useEffect(() => {
    const previous = previousPaymentDue.current;
    previousPaymentDue.current = { orderId: activeOrder.id, amount: paymentDue };
    if (
      readOnly ||
      (previous && previous.orderId === activeOrder.id && previous.amount === paymentDue)
    ) {
      return;
    }
    if (!previous && activeOrder.mode !== "create" && payment) return;
    if (Number(payment?.amount || 0) !== paymentDue) updatePayment({ amount: paymentDue });
  }, [activeOrder.id, activeOrder.mode, payment, paymentDue, readOnly, updatePayment]);

  const cashAmountOptions = useMemo(
    () => paymentMode === "combined"
      ? getCombinedCashSuggestions(paymentDue)
      : getCashSuggestions(paymentDue),
    [paymentDue, paymentMode],
  );
  const customer = activeOrder.partner as Partner | undefined;
  const sourceCode = activeOrder.refOrder?.code || activeOrder.code || "Trả nhanh";
  const isCustomerPaying = settlementAmount > 0;
  const bankFund = bankPayment.fund;

  useEffect(() => {
    const bin = bank_bin_map[bankFund?.bank || ""];
    if (
      !bankFund?.accountNumber ||
      !paymentDue ||
      !bin ||
      (paymentMode !== FundType.BANK && paymentMode !== "combined")
    ) {
      setQrImage(undefined);
      return;
    }

    const qrPayData = QrPay.vietQR({
      bin,
      bankNumber: bankFund.accountNumber,
      amount: String(paymentDue),
      purpose: isCustomerPaying
        ? `Thanh toan don hang ${sourceCode}`
        : `Hoan tien don hang ${sourceCode}`,
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
  }, [bankFund, isCustomerPaying, paymentDue, paymentMode, sourceCode]);

  return (
    <aside className="flex w-[520px] shrink-0 flex-col overflow-y-auto border-l border-gray-200 bg-white">
      <section className="border-b border-gray-200 px-4 py-2">
        <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
          <span className="font-semibold uppercase tracking-wide">Cửa hàng</span>
          <span>
            {activeOrder.orderAt
              ? new Date(String(activeOrder.orderAt)).toLocaleString("vi-VN")
              : ""}
          </span>
        </div>
        <div ref={customerSelectRef}>
          {readOnly ? (
            <div className="rounded-md bg-gray-100 px-3 py-2 font-semibold text-primary">
              {customer?.name || activeOrder.refOrder?.partnerSnapshot?.name || "Khách lẻ"}
            </div>
          ) : (
            <CustomerAddSelect
              value={activeOrder.partnerId || undefined}
              defaultData={customer}
              onChangeData={(partner) => updateActive({ partnerId: partner?.id || null, partner })}
              placeholder="Tìm khách hàng (F4) — bỏ trống là Khách lẻ"
            />
          )}
        </div>
      </section>

      <section className="border-b border-gray-200 px-4 py-3">
        <div className="mb-3 text-base font-semibold text-primary">
          <span className="text-green-600">Trả hàng</span>
          <span className="mx-1 text-gray-400">/</span>
          <span>{sourceCode}</span>
        </div>
        <SummaryRow
          label="Tổng giá gốc hàng mua"
          value={originalReturnGrossAmount}
          quantity={returnQuantity}
        />
        <SummaryRow
          label="Tổng tiền hàng trả"
          value={returnTotals.grossAmount}
          quantity={returnQuantity}
        />
        {readOnly ? (
          <SummaryRow label="Giảm giá" value={returnTotals.discountAmount} />
        ) : (
          <div className="flex items-center justify-between gap-3 py-2 text-sm">
            <span>Giảm giá</span>
            <div className="w-56">
              <OrderValueInput
                type="discount"
                discountValue={Number(activeOrder.returnDiscountValue || 0)}
                discountType={
                  (activeOrder.returnDiscountType || DiscountType.AMOUNT) as DiscountType
                }
                onChange={(value, discountType) =>
                  updateActive({ returnDiscountValue: value, returnDiscountType: discountType })
                }
              />
            </div>
          </div>
        )}

        {readOnly ? (
          <SummaryRow label="VAT" value={returnTotals.taxAmount} />
        ) : (
          <div className="flex items-center justify-between gap-3 py-2 text-sm">
            <span>VAT</span>
            <div className="w-56">
              <OrderValueInput
                type="tax"
                discountValue={Number(activeOrder.returnTaxValue || 0)}
                discountType={(activeOrder.returnTaxType || DiscountType.PERCENT) as DiscountType}
                onChange={(value, taxType) =>
                  updateActive({ returnTaxValue: value, returnTaxType: taxType })
                }
              />
            </div>
          </div>
        )}

        <SummaryRow label="Tổng tiền trả" value={returnTotals.totalAmount} strong />
      </section>

      {hasExchange && (
        <section className="border-b border-dashed border-gray-300 px-4 py-3">
          <div className="mb-2 text-base font-semibold text-green-600">Mua hàng</div>
          <SummaryRow
            label="Tổng tiền hàng"
            value={exchangeTotals.grossAmount}
            quantity={exchangeQuantity}
          />
          {readOnly ? (
            <>
              <SummaryRow label="Giảm giá" value={exchangeTotals.discountAmount} />
              <SummaryRow label="VAT" value={exchangeTotals.taxAmount} />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 py-2 text-sm">
                <span>Giảm giá</span>
                <div className="w-56">
                  <OrderValueInput
                    type="discount"
                    discountValue={Number(activeOrder.discountValue || 0)}
                    discountType={(activeOrder.discountType || DiscountType.AMOUNT) as DiscountType}
                    onChange={(value, discountType) =>
                      updateActive({ discountValue: value, discountType })
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
                    discountType={(activeOrder.taxType || DiscountType.PERCENT) as DiscountType}
                    onChange={(value, taxType) => updateActive({ taxValue: value, taxType })}
                  />
                </div>
              </div>
            </>
          )}
          <SummaryRow label="Tổng tiền mua" value={exchangeTotals.totalAmount} strong />
        </section>
      )}

      <section className="px-4 py-3">
        <SummaryRow
          label={isCustomerPaying ? "Khách cần trả" : "Cần trả khách"}
          value={paymentDue}
          strong
        />
        {paymentDue > 0 && (
          <>
            {paymentMode !== "combined" ? (
              <div className="flex items-center justify-between gap-3 py-2 text-sm">
                <span>{isCustomerPaying ? "Khách thanh toán" : "Hoàn tiền khách"}</span>
                <div className="w-56">
                  <InputMoney
                    min={0}
                    value={paidAmount}
                    disabled={readOnly}
                    onChange={(amount) => updatePayment({ amount: Number(amount || 0) })}
                    className="w-56"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span>Tiền mặt</span>
                  <InputMoney
                    min={0}
                    value={Number(cashPayment.amount || 0)}
                    disabled={readOnly}
                    onChange={(amount) => updatePayment({ amount: Number(amount || 0) }, 0)}
                    className="w-56"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span>{bankFund?.name || "Chuyển khoản"}</span>
                  <InputMoney
                    min={0}
                    value={Number(bankPayment.amount || 0)}
                    disabled={readOnly}
                    onChange={(amount) => updatePayment({ amount: Number(amount || 0) }, 1)}
                    className="w-56"
                  />
                </div>
              </>
            )}
            {!readOnly && (
              <>
                <Segmented
                  block
                  value={paymentMode}
                  options={[
                    { label: "Tiền mặt", value: FundType.CASH },
                    { label: "Chuyển khoản", value: FundType.BANK },
                    { label: "Kết hợp", value: "combined" },
                  ]}
                  onChange={(value) => changePaymentMode(value as PaymentMode)}
                />
                <div className="hidden">
                  <FundListSelect
                    query={{ type: FundType.CASH }}
                    value={cashPayment.fundId || undefined}
                    defaultData={cashPayment.fund}
                    onChangeData={(fund) => updatePayment({ fundId: fund?.id || null, fund }, 0)}
                  />
                </div>
                {(paymentMode === FundType.CASH || paymentMode === "combined") && (
                  <div className="mt-3 flex flex-wrap gap-1.5 rounded-md bg-gray-100 p-3">
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
                )}
                {(paymentMode === FundType.BANK || paymentMode === "combined") && (
                  <div className="mt-2 flex gap-3 rounded-md bg-gray-100 p-2">
                    {qrImage && (
                      <img
                        src={qrImage}
                        alt="VietQR hoàn tiền"
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
                          onClick={() => updatePayment({ amount: Math.max(0, paymentDue - Number(cashPayment.amount || 0)) }, 1)}
                        >
                          {isCustomerPaying ? "Thanh toán toàn bộ" : "Hoàn tiền toàn bộ"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>

      <Modal
        open={qrModalOpen}
        centered
        title="Mã QR chuyển khoản"
        footer={null}
        onCancel={() => setQrModalOpen(false)}
      >
        {qrImage && (
          <div className="flex justify-center py-2">
            <img
              src={qrImage}
              alt="VietQR hoàn tiền"
              className="h-[196px] w-[196px] object-contain"
            />
          </div>
        )}
      </Modal>

      {!readOnly && (
        <div className="sticky bottom-0 mt-auto flex gap-2 border-t border-gray-200 bg-white p-4 pt-1.5">
          <Button
            className="flex h-12 w-14 items-center justify-center p-0 text-lg"
            onClick={() => onSubmit(true)}
          >
            <PrinterOutlined />
          </Button>
          <Button
            type="primary"
            block
            className="h-12"
            loading={loading}
            onClick={() => onSubmit(false)}
          >
            <span className="text-lg font-semibold">
              {activeOrder.mode === "edit" ? "CẬP NHẬT" : "TRẢ HÀNG"}
            </span>
          </Button>
        </div>
      )}
    </aside>
  );
};
