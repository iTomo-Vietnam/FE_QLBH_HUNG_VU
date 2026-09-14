import { Input, Spin } from "antd";
import type { RefObject } from "react";

import type { Product } from "@/modules/product/product.model";
import { ProductGrid } from "@/modules/product/components";
import type { CachedOrder, PaymentMode, PosOrderType } from "@/shared/stores/orderCache.slice";
import { OrderType } from "../order.model";
import { OrderProductSelect } from "./OrderProductSelect";
import { OrderLineTable, PosLine } from "./OrderLineTable";
import { PosInvoiceInfo, PosPayment, PosTotals } from "./PosInvoiceInfo";
import { SaleReturnInvoiceInfo } from "./SaleReturnInvoiceInfo";

interface Props {
  type: PosOrderType;
  activeOrder: CachedOrder;
  isSaleReturn: boolean;
  isReadOnlyReturn: boolean;
  returnLines: PosLine[];
  exchangeLines: PosLine[];
  lines: PosLine[];
  totals: PosTotals;
  returnTotals: PosTotals;
  exchangeTotals: PosTotals;
  payment?: PosPayment;
  productLoading: boolean;
  products: Product[];
  customerSelectRef: RefObject<HTMLDivElement>;
  onProductSelect: (product: Product) => void;
  onExchangeProduct: (product: Product) => void;
  onQuantityChange: (id: string, quantity: number | null) => void;
  onUnitChange: (id: string, unitId: string) => void;
  onUnitPriceChange: (id: string, unitPrice: number | null) => void;
  onExchangeQuantityChange: (id: string, quantity: number | null) => void;
  onExchangeUnitChange: (id: string, unitId: string) => void;
  onExchangeUnitPriceChange: (id: string, unitPrice: number | null) => void;
  updateActive: (values: Partial<CachedOrder>) => void;
  updateLines: (lines: PosLine[]) => void;
  updateExchangeLines: (lines: PosLine[]) => void;
  updatePayment: (values: Record<string, unknown>, index?: number) => void;
  payments: PosPayment[];
  changePaymentMode: (mode: PaymentMode) => void;
  onSubmit: (print?: boolean) => void;
  loading: boolean;
}

export const PosContent = ({
  type,
  activeOrder,
  isSaleReturn,
  isReadOnlyReturn,
  returnLines,
  exchangeLines,
  lines,
  totals,
  returnTotals,
  exchangeTotals,
  payment,
  payments,
  productLoading,
  products,
  customerSelectRef,
  onProductSelect,
  onExchangeProduct,
  onQuantityChange,
  onUnitChange,
  onUnitPriceChange,
  onExchangeQuantityChange,
  onExchangeUnitChange,
  onExchangeUnitPriceChange,
  updateActive,
  updateLines,
  updateExchangeLines,
  updatePayment,
  changePaymentMode,
  onSubmit,
  loading,
}: Props) => (
  <div className="flex min-h-0 flex-1">
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f5f5f5]">
      {isSaleReturn ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <section className="flex min-h-0 flex-1 flex-col bg-[#f5f5f5]">
            <OrderLineTable
              lines={returnLines}
              minQuantity={0}
              maxQuantity={(line) =>
                line.maxReturnQuantity === undefined ? undefined : Number(line.maxReturnQuantity)
              }
              readOnly={isReadOnlyReturn}
              onQuantityChange={onQuantityChange}
              onUnitChange={onUnitChange}
              onUnitPriceChange={onUnitPriceChange}
              onNoteChange={(id, note) =>
                updateLines(returnLines.map((line) => (line.id === id ? { ...line, note } : line)))
              }
              onRemove={(id) => onQuantityChange(id, 0)}
            />
          </section>
          <section className="flex min-h-0 flex-1 flex-col bg-[#f5f5f5]">
            {!isReadOnlyReturn && (
              <div className="flex shrink-0 items-center gap-2 bg-[#062d1d] p-2">
                <OrderProductSelect
                  type={OrderType.SALE}
                  placeholder="Tìm hàng đổi (F7)"
                  shortcutKey="F7"
                  onSelect={onExchangeProduct}
                  className="w-[480px]"
                />
              </div>
            )}
            {isReadOnlyReturn && (
              <div className="shrink-0 bg-white px-4 py-2 font-semibold text-green-600">
                Hàng đổi
              </div>
            )}
            <OrderLineTable
              lines={exchangeLines}
              readOnly={isReadOnlyReturn}
              onQuantityChange={onExchangeQuantityChange}
              onUnitChange={onExchangeUnitChange}
              onUnitPriceChange={onExchangeUnitPriceChange}
              onNoteChange={(id, note) =>
                updateExchangeLines(
                  exchangeLines.map((line) => (line.id === id ? { ...line, note } : line)),
                )
              }
              onRemove={(id) => onExchangeQuantityChange(id, 0)}
            />
          </section>
        </div>
      ) : lines.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-auto p-5">
          <div className="mb-4 text-center">
            <h2 className="font-semibold">Hóa đơn chưa có hàng hóa</h2>
            <p className="text-sm text-gray-500">Tìm hàng hóa hoặc chọn nhanh bên dưới</p>
          </div>
          {productLoading ? (
            <div className="flex justify-center p-10">
              <Spin />
            </div>
          ) : (
            <ProductGrid products={products} onSelect={onProductSelect} />
          )}
        </div>
      ) : (
        <OrderLineTable
          lines={lines}
          onQuantityChange={onQuantityChange}
          onUnitChange={onUnitChange}
          onUnitPriceChange={onUnitPriceChange}
          onNoteChange={(id, note) =>
            updateLines(lines.map((line) => (line.id === id ? { ...line, note } : line)))
          }
          onRemove={(id) => onQuantityChange(id, 0)}
        />
      )}
      <div className="flex shrink-0 items-center gap-2 border-t border-dashed border-gray-300 bg-[#f3f7f4] p-2 text-xs text-gray-500">
        <span>✎</span>
        <Input.TextArea
          autoSize={{ minRows: 2, maxRows: 3 }}
          value={String(activeOrder.note || "")}
          onChange={(event) => updateActive({ note: event.target.value })}
          disabled={isReadOnlyReturn}
          placeholder="Ghi chú đơn hàng..."
        />
        <span className="h-full w-20 whitespace-nowrap py-2 font-semibold uppercase">
          Tổng SL: {lines.reduce((sum, line) => sum + Number(line.quantity || 0), 0)}
        </span>
      </div>
    </main>

    {isSaleReturn ? (
      <SaleReturnInvoiceInfo
        activeOrder={activeOrder}
        returnTotals={returnTotals}
        exchangeTotals={exchangeTotals}
        payment={payment}
        customerSelectRef={customerSelectRef}
        updateActive={updateActive}
        updatePayment={updatePayment}
        payments={payments}
        changePaymentMode={changePaymentMode}
        onSubmit={onSubmit}
        loading={loading}
        readOnly={isReadOnlyReturn}
      />
    ) : (
      <PosInvoiceInfo
        type={type}
        activeOrder={activeOrder}
        totals={totals}
        payment={payment}
        customerSelectRef={customerSelectRef}
        updateActive={updateActive}
        updatePayment={updatePayment}
        payments={payments}
        changePaymentMode={changePaymentMode}
        onSubmit={onSubmit}
        loading={loading}
      />
    )}
  </div>
);
