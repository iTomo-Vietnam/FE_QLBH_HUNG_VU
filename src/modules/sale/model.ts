import { ApiRequestQuery } from "@/shared/interfaces/api";
import { Order, OrderStatus, OrderType } from "@/modules/order/order.model";

export { OrderStatus, OrderType };

export interface Sale extends Order {}

export interface SaleQuery extends ApiRequestQuery {
  type?: string;
  statuses?: OrderStatus[];
  customerId?: string;
  customerIds?: string[];
  creatorIds?: string[];
  completerIds?: string[];
  shipperIds?: string[];
  productId?: string;
  productIds?: string[];
  fundIds?: string[];
  orderAtGte?: string;
  orderAtLte?: string;
  occurredAtGte?: string;
  occurredAtLte?: string;
  grossAmountGte?: number;
  grossAmountLte?: number;
  discountAmountGte?: number;
  discountAmountLte?: number;
  totalAmountGte?: number;
  totalAmountLte?: number;
}

export const saleStatusMap: Record<OrderStatus, string> = {
  [OrderStatus.DRAFT]: "Đơn tạm",
  [OrderStatus.COMPLETED]: "Đã HT",
  [OrderStatus.CANCELED]: "Đã hủy",
};

export const saleStatusItems = Object.values(OrderStatus).map((value) => ({
  key: value,
  label: saleStatusMap[value],
}));
