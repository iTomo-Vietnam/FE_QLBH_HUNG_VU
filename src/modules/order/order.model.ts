import { Entity, Store, StoreEntity, User, UserSnapshot } from "@/shared/base/entity";
import { ApiRequestQuery } from "@/shared/interfaces/api";
import { Partner, PartnerSnapshot } from "../partner/partner.model";
import { ProductSnapshot } from "../product/product.model";
import { AttributeSnapshot } from "../attribute/attribute.model";
import { DiscountType } from "@/shared/constants/enum";
import type { IncomeExpense } from "@/modules/incomeExpense/incomeExpense.model";

export enum OrderType {
  PURCHASE = "purchase",
  SALE = "sale",
  PURCHASE_RETURN = "purchase_return",
  SALE_RETURN = "sale_return",
}
export enum OrderStatus {
  DRAFT = "draft",
  COMPLETED = "completed",
  CANCELED = "canceled",
}

export interface OrderQuery extends ApiRequestQuery {
  statuses?: OrderStatus[];
  partnerId?: string;
  customerId?: string;
  customerIds?: string[];
  supplierIds?: string[];
  shipperId?: string;
  storeId?: string;
  isCompleted?: boolean;
  approveStatus?: string;
}

export interface OrderHistoryQuery extends OrderQuery {
  shipperId?: string;
}
export interface OrderSnapshot {
  id: string;
  type: OrderType;
  code: string;
  orderAt: string;
  partnerId: string | null;
  partnerSnapshot: PartnerSnapshot | null;
}

/** OrderLine is an embedded child of Order; it has no standalone module/API. */
export interface OrderLine extends Entity {
  orderId: string | null;
  returnOrderId: string | null;
  refOrderLineId: string | null;
  productId: string | null;
  productSnapshot: ProductSnapshot;
  unitId: string | null;
  unitSnapshot: AttributeSnapshot | null;
  conversionRateAtTime: number;
  unitPrice: number;
  quantity: number;
  subTotal: number;
  totalCost: number;
  costPriceAtTime: number;
  product?: any;
  unit?: any;
  taxRate?: number;
  taxAmount?: number;
  grossAmount?: number;
  commissionAmount?: number;
  deliveredQuantity?: number;
  serviceId?: string | null;
  type?: string;
}

export interface Order extends StoreEntity {
  type: OrderType;
  status: OrderStatus;

  code: string;
  invoiceNumber: string | null; // số hóa đơn đầu vào
  orderAt: Date; // ngày thực hiện đơn hàng
  occurredAt: Date | null; // ngày thực hiện nhập/xuất kho, có thể khác orderAt
  canceledAt: Date | null; // ngày hủy đơn hàng, chỉ có khi status = CANCELED

  partnerId: string | null;
  partnerSnapshot: PartnerSnapshot | null;
  partner: Partner | null;

  // TODO ===== Người hoàn thành đơn hàng (có thể khác creator) =====
  completerId: string | null;
  completerSnapshot?: UserSnapshot | null;
  completer?: User | null;

  // TODO ===== Người hủy đơn hàng (có thể khác creator) =====
  cancelerId: string | null;
  cancelerSnapshot: UserSnapshot | null;
  canceler: User | null;

  // TODO ===== Discount (order-level) =====
  discountType: DiscountType;
  discountValue: number | null;

  // TODO ===== Tax =====
  taxType: DiscountType;
  taxValue: number | null;

  // TODO ===== Shipping Info =====
  shipperId: string | null;
  shipperSnapshot: PartnerSnapshot | null;
  shipper: Partner | null;

  shippingFee: number | null; // phí vận chuyển
  isFreeShipping: boolean; // mua: DN tự thanh toán; bán: miễn phí cho khách

  // TODO ===== Financial summary =====
  grossAmount: number;
  discountAmount: number | null;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;

  totalCost: number;

  // TODO ===== Return Order =====
  refOrderId: string | null;
  refOrder?: Order | null; // đơn hàng gốc bị trả

  returnDiscountType: DiscountType;
  returnDiscountValue: number | null;

  returnTaxType: DiscountType;
  returnTaxValue: number | null;

  returnGrossAmount: number;
  returnDiscountAmount: number | null;
  returnNetAmount: number;
  returnTaxAmount: number;
  returnTotalAmount: number;

  returnTotalCost: number;

  // TODO: Giá trị thực tế cần thanh toán (có thể âm hoặc dương)
  settlementAmount: number; // = totalAmount - returnTotalAmount

  incomeExpenses: IncomeExpense[];

  lines: OrderLine[];

  returnLines: OrderLine[];

  // TODO: Các trường khác (nếu có) sẽ được lưu trong metadata
  paidAmount?: number; // số tiền đã thanh toán (nếu có)
  customerPaidAmount?: number; // tổng phiếu thu của đơn hàng
  refundedAmount?: number; // tổng phiếu chi của đơn hàng
  amountToRefund?: number; // số tiền cần trả khách
  amountToCollect?: number; // số tiền cần thu thêm
  actualShippingFee?: number; // phí vận chuyển thực tế (nếu có)
}
