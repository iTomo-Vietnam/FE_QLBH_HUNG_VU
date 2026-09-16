import React from "react";
import { DateRangeFilter } from "@/shared/components";
import { ProductCardLite } from "@/modules/product/components/Card";
import { Product } from "@/modules/product/product.model";
import { InventoryTransactionRefType } from "../inventory.model";
import { RefTypeFilter } from "../components/RefTypeFilter";

interface Props {
  product?: Product;
  refType?: InventoryTransactionRefType;
  setRefType?: (refType?: InventoryTransactionRefType) => void;
  startAt?: string;
  endAt?: string;
  onDateRangerChange?: (startAt?: string, endAt?: string) => void;
}

export const InventoryTransactionToolbar: React.FC<Props> = ({
  product,
  refType,
  setRefType,
  startAt,
  endAt,
  onDateRangerChange,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
    {product && (
      <div className="w-full sm:w-96">
        <ProductCardLite item={product} />
      </div>
    )}
    <div className="flex flex-col gap-1 flex-1">
      <span className="text-xs text-primary">LỌC THEO</span>
      <RefTypeFilter refType={refType} setRefType={setRefType} />
    </div>
    <div className="flex flex-col gap-1">
      <span className="text-xs text-primary">THỜI GIAN THỰC HIỆN</span>
      <DateRangeFilter
        startDate={startAt}
        endDate={endAt}
        onRangeChange={(nextStartAt, nextEndAt) => onDateRangerChange?.(nextStartAt, nextEndAt)}
      />
    </div>
  </div>
);
