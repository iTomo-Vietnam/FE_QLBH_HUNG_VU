import { App } from "antd";
import { useCallback } from "react";
import { useDispatch } from "react-redux";

import type { Sale } from "@/modules/sale";
import type { CachedOrder, PosOrderType } from "@/shared/stores/orderCache.slice";
import { addNewCache, removeOrderCache } from "@/shared/stores/orderCache.slice";
import type { PosPayment, PosTotals } from "../components/PosInvoiceInfo";
import { emptyOrder } from "../pos.utils";
import { Order, OrderType } from "../order.model";

type SaveOrder = (data: Partial<Order>, options?: { onSuccess?: (data?: Sale) => void }) => void;

interface Options {
  type: PosOrderType;
  activeOrder?: CachedOrder;
  currentStoreId?: string;
  isReadOnlyReturn: boolean;
  returnLines: Record<string, any>[];
  exchangeLines: Record<string, any>[];
  totals: PosTotals;
  returnTotals: PosTotals;
  exchangeTotals: PosTotals;
  payment?: PosPayment;
  orderStore: {
    create?: SaveOrder;
    update?: SaveOrder;
  };
  printSales: (sales: Sale[]) => void;
}

export const usePosSubmit = ({
  type,
  activeOrder,
  currentStoreId,
  isReadOnlyReturn,
  returnLines,
  exchangeLines,
  totals,
  returnTotals,
  exchangeTotals,
  payment,
  orderStore,
  printSales,
}: Options) => {
  const dispatch = useDispatch();
  const { message } = App.useApp();

  return useCallback(
    (print = false) => {
      if (isReadOnlyReturn) return;
      const linesWithQuantity = (lines: Record<string, any>[]) =>
        lines.filter((line) => {
          const quantity = Number(line.quantity || 0);
          return Number.isFinite(quantity) && quantity > 0;
        });
      const payloadReturnLines = linesWithQuantity(returnLines);
      const payloadExchangeLines = linesWithQuantity(exchangeLines);
      const hasReturnLines = payloadReturnLines.length > 0;
      const hasExchangeLines = payloadExchangeLines.length > 0;

      if (!activeOrder || !currentStoreId) return;
      if (type === OrderType.SALE_RETURN && !hasReturnLines) {
        message.error("Vui lòng chọn ít nhất 1 hàng hóa để hoàn trả");
        return;
      }
      if (type === OrderType.SALE && !hasExchangeLines) return;

      const {
        id: cacheId,
        tempId: _tempId,
        label: _label,
        mode,
        sourceId,
        initialOrder: _initialOrder,
        paymentMethod: _paymentMethod,
        paidAmount: _paidAmount,
        paymentMode: _paymentMode,
        ...data
      } = activeOrder;
      const paymentAmount = Math.max(
        0,
        Number(payment?.amount ?? Math.abs(totals.totalAmount) ?? 0),
      );
      const payload: Partial<Order> = {
        ...(data as Partial<Order>),
        ...(mode === "edit" && sourceId ? { id: sourceId } : { tempId: cacheId }),
        storeId: currentStoreId,
        type: type as Order["type"],
        orderAt: new Date(String(activeOrder.orderAt || new Date().toISOString())),
        ...(type === OrderType.SALE_RETURN
          ? {
              returnDiscountType: (activeOrder.returnDiscountType ||
                activeOrder.discountType) as any,
              returnDiscountValue: activeOrder.returnDiscountValue ?? 0,
              returnTaxType: (activeOrder.returnTaxType || activeOrder.taxType) as any,
              returnTaxValue: activeOrder.returnTaxValue ?? 0,
            }
          : {}),
        grossAmount: type === OrderType.SALE ? totals.grossAmount : exchangeTotals.grossAmount,
        discountAmount:
          type === OrderType.SALE ? totals.discountAmount : exchangeTotals.discountAmount,
        netAmount: type === OrderType.SALE ? totals.netAmount : exchangeTotals.netAmount,
        taxAmount: type === OrderType.SALE ? totals.taxAmount : exchangeTotals.taxAmount,
        totalAmount: type === OrderType.SALE ? totals.totalAmount : exchangeTotals.totalAmount,
        returnGrossAmount: type === OrderType.SALE_RETURN ? returnTotals.grossAmount : 0,
        returnDiscountAmount: type === OrderType.SALE_RETURN ? returnTotals.discountAmount : 0,
        returnNetAmount: type === OrderType.SALE_RETURN ? returnTotals.netAmount : 0,
        returnTaxAmount: type === OrderType.SALE_RETURN ? returnTotals.taxAmount : 0,
        returnTotalAmount: type === OrderType.SALE_RETURN ? returnTotals.totalAmount : 0,
        settlementAmount:
          type === OrderType.SALE
            ? totals.totalAmount
            : exchangeTotals.totalAmount - returnTotals.totalAmount,
        incomeExpenses: [
          {
            ...(payment || {}),
            amount: paymentAmount,
            fundId: payment?.fundId || null,
            partnerId: activeOrder.partnerId || null,
            occurredAt: activeOrder.orderAt,
            description: activeOrder.code
              ? `Thanh toán hóa đơn ${activeOrder.code}`
              : "Thanh toán hóa đơn",
          },
        ] as any,
        lines: payloadExchangeLines as any,
        returnLines: (type === OrderType.SALE_RETURN ? payloadReturnLines : []) as any,
      };

      const onSuccess = (savedOrder?: Sale) => {
        dispatch(removeOrderCache(activeOrder.id));
        dispatch(addNewCache({ type, order: emptyOrder(type) }));
        message.success(mode === "edit" ? "Đã cập nhật phiếu" : "Đã tạo phiếu");
        if (print && savedOrder && type === OrderType.SALE) printSales([savedOrder]);
      };

      if (mode === "edit" && sourceId) orderStore.update?.(payload, { onSuccess });
      else orderStore.create?.(payload, { onSuccess });
    },
    [
      activeOrder,
      currentStoreId,
      dispatch,
      exchangeLines,
      exchangeTotals,
      isReadOnlyReturn,
      message,
      orderStore,
      payment,
      printSales,
      returnLines,
      returnTotals,
      totals,
      type,
    ],
  );
};
