import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { randomId } from "@/shared/utils/common.util";
import { Order } from "@/modules/order";

export type PosOrderType = "sale" | "sale_return";
export type PosCacheMode = "create" | "edit";
export type PaymentMode = "cash" | "bank" | "combined";

export interface CachedOrder {
  id: string;
  tempId: string;
  type: PosOrderType;
  label: string;
  mode: PosCacheMode;
  sourceId?: string;
  /** Snapshot used to detect unsaved changes while editing an existing order. */
  initialOrder?: Partial<CachedOrder>;
  code?: string;
  partnerId?: string | null;
  partner?: unknown;
  shipperId?: string | null;
  shipper?: unknown;
  shippingFee?: number | null;
  isFreeShipping?: boolean;
  refOrderId?: string | null;
  refOrder?: Order;
  lines?: Record<string, unknown>[];
  returnLines?: Record<string, unknown>[];
  incomeExpenses?: Array<{
    amount?: number;
    fundId?: string | null;
    fund?: unknown;
    [key: string]: unknown;
  }>;
  /** UI-only payment mode used before a bank fund is selected. */
  paymentMode?: PaymentMode;
  discountType?: "amount" | "percent";
  discountValue?: number;
  taxType?: "amount" | "percent";
  taxValue?: number;
  returnDiscountType?: "amount" | "percent";
  returnDiscountValue?: number;
  returnTaxType?: "amount" | "percent";
  returnTaxValue?: number;
  [key: string]: unknown;
}

interface OrderCacheState {
  cachedOrders: Record<string, CachedOrder>;
  currentCacheId: string | null;
}

const initialState: OrderCacheState = {
  cachedOrders: {},
  currentCacheId: null,
};

const getTypeLabel = (type: PosOrderType) => (type === "sale_return" ? "Trả hàng" : "Hóa đơn");

const makeLabel = (
  state: OrderCacheState,
  type: PosOrderType,
  mode: PosCacheMode,
  code?: string,
) => {
  if (mode === "edit" && code) return `Chỉnh sửa ${code}`;

  const usedLabels = new Set(
    Object.values(state.cachedOrders)
      .filter((item) => item.type === type)
      .map((item) => item.label),
  );

  let index = 1;
  let label = `${getTypeLabel(type)} ${index}`;
  while (usedLabels.has(label)) {
    index += 1;
    label = `${getTypeLabel(type)} ${index}`;
  }

  return label;
};

const createNewCache = (
  state: OrderCacheState,
  payload: {
    type: PosOrderType;
    order?: Partial<CachedOrder>;
    mode?: PosCacheMode;
    sourceId?: string;
  },
): CachedOrder => {
  const id = randomId();
  const mode = payload.mode || "create";
  const order = payload.order || {};
  const { initialOrder: _initialOrder, ...orderData } = order;
  const sourcePayments = order.incomeExpenses || [];
  const firstIsBank = (sourcePayments[0] as any)?.fund?.type === "bank";
  const cashPayment = firstIsBank ? sourcePayments[1] : sourcePayments[0];
  const bankPayment = firstIsBank ? sourcePayments[0] : sourcePayments[1];

  const cache: CachedOrder = {
    ...orderData,
    id,
    tempId: id,
    type: payload.type,
    mode,
    sourceId: payload.sourceId || order.id,
    initialOrder: undefined,
    label: makeLabel(state, payload.type, mode, order.code),
    lines: order.lines || [],
    returnLines: order.returnLines || [],
    incomeExpenses: [
      { ...(cashPayment || {}), amount: Number(cashPayment?.amount || 0) },
      { ...(bankPayment || {}), amount: Number(bankPayment?.amount || 0) },
    ],
    paymentMode: order.paymentMode || (firstIsBank ? "bank" : "cash"),
    discountType: order.discountType || "amount",
    discountValue: order.discountValue ?? 0,
    taxType: order.taxType || "percent",
    taxValue: order.taxValue ?? 0,
  };

  if (mode === "edit") {
    cache.initialOrder = cloneValue(_initialOrder || cache);
  }

  return cache;
};

const cloneValue = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const orderCacheSlice = createSlice({
  name: "orderCache",
  initialState,
  reducers: {
    addNewCache: {
      reducer: (state, action: PayloadAction<CachedOrder>) => {
        const cache = {
          ...action.payload,
          label: makeLabel(state, action.payload.type, action.payload.mode, action.payload.code),
        };
        state.cachedOrders[cache.id] = cache;
        state.currentCacheId = cache.id;
      },
      prepare: (payload: {
        type: PosOrderType;
        order?: Partial<CachedOrder>;
        mode?: PosCacheMode;
        sourceId?: string;
      }) => ({ payload: createNewCache(initialState, payload) }),
    },
    addOrderCache: (state, action: PayloadAction<CachedOrder>) => {
      state.cachedOrders[action.payload.id] = action.payload;
      state.currentCacheId = action.payload.id;
    },
    updateOrderCache: (
      state,
      action: PayloadAction<{ id: string; order: Partial<CachedOrder> }>,
    ) => {
      const current = state.cachedOrders[action.payload.id];
      if (!current) return;
      state.cachedOrders[action.payload.id] = {
        ...current,
        ...action.payload.order,
        id: current.id,
        tempId: current.tempId,
        type: current.type,
        mode: current.mode,
      };
    },
    removeOrderCache: (state, action: PayloadAction<string>) => {
      delete state.cachedOrders[action.payload];
      if (state.currentCacheId === action.payload) {
        const ids = Object.keys(state.cachedOrders);
        state.currentCacheId = ids.length ? ids[ids.length - 1] : null;
      }
    },
    setCurrentOrderCache: (state, action: PayloadAction<string | null>) => {
      state.currentCacheId = action.payload;
    },
    clearOrderCache: (state) => {
      state.cachedOrders = {};
      state.currentCacheId = null;
    },
  },
});

export const {
  addNewCache,
  addOrderCache,
  updateOrderCache,
  removeOrderCache,
  setCurrentOrderCache,
  clearOrderCache,
} = orderCacheSlice.actions;

export default orderCacheSlice.reducer;
