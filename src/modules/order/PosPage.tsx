import { App, Button, Layout, Spin } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useProductStore } from "@/modules/product/product.store";
import { useSaleStore } from "@/modules/sale/store";
import { useSaleReturnStore } from "@/modules/saleReturn/store";
import { Order, OrderType } from "./order.model";
import { PosContent } from "./components/PosContent";
import { PosLine } from "./components/OrderLineTable";
import { PosPayment } from "./components/PosInvoiceInfo";
import { PosActionMenu } from "./components/PosActionMenu";
import { PosHeader } from "./components/PosHeader";
import { SaleReturnSourceModal } from "@/modules/saleReturn/components/SaleReturnSourceModal";
import { importPosLines } from "./pos.import";
import {
  calculateTotals,
  emptyOrder,
  getAllocatedReturnValue,
  getLinesGrossAmount,
  hasCacheChanges,
  getPaymentIndex,
  getPaymentSlots,
} from "./pos.utils";
import { usePosLineActions } from "./hooks/usePosLineActions";
import { usePosProductActions } from "./hooks/usePosProductActions";
import { usePosSubmit } from "./hooks/usePosSubmit";
import { usePosReturnSource } from "./hooks/usePosReturnSource";
import {
  addNewCache,
  CachedOrder,
  PaymentMode,
  PosOrderType,
  removeOrderCache,
  setCurrentOrderCache,
  updateOrderCache,
} from "@/shared/stores/orderCache.slice";
import { RootState } from "@/shared/stores";
import { StoreCardLite } from "@/modules/store/components/Card";
import { icons } from "@/shared/assets/icons";
import { useGlobalData } from "@/shared/hooks/useGlobalData";
import { DiscountType } from "@/shared/constants/enum";
import { privateRoutesName } from "@/shared/constants/routerName";
import { FundType } from "@/modules/fund/fund.model";
import { Sale } from "../sale";
import { SaleA4PrintDocument } from "../sale/components/SaleA4Print";
import { usePrintHtml } from "@/shared/hooks/usePrintHtml";

type PosLocationState = { order?: Order; openSourcePicker?: boolean };

const POS_TYPE_PARAM = "type";
const POS_EDIT_PARAM = "editId";

export const PosPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { message, modal } = App.useApp();
  const { currentStore, info, handleSetCurrentStore } = useGlobalData();
  const initializedEdit = useRef<string | null>(null);
  const initializedLocationOrder = useRef<unknown>(null);
  const initializedReturnAdjustments = useRef<string | null>(null);
  const previousReturnGrossAmount = useRef<{ syncKey: string; amount: number }>();
  const customerSelectRef = useRef<HTMLDivElement>(null);
  const [sourcePickerOpen, setSourcePickerOpen] = useState(false);
  const {
    contentRef: printContentRef,
    printData,
    handlePrint: printSales,
  } = usePrintHtml<Sale[]>();

  const type: PosOrderType =
    searchParams.get(POS_TYPE_PARAM) === OrderType.SALE_RETURN
      ? OrderType.SALE_RETURN
      : OrderType.SALE;
  const editId = searchParams.get(POS_EDIT_PARAM);

  const locationState = location.state as PosLocationState | null;

  const saleStore = useSaleStore({ page: 1, size: 100, isLocked: true });
  const saleReturnStore = useSaleReturnStore({ page: 1, size: 100, isLocked: true });
  const orderStore = type === OrderType.SALE ? saleStore : saleReturnStore;
  const productStore = useProductStore({ page: 1, size: 16, isLocked: !currentStore });

  const { cachedOrders, currentCacheId } = useSelector((state: RootState) => state.OrderCache);
  const caches = useMemo(() => Object.values(cachedOrders), [cachedOrders]);
  const typeCaches = useMemo(() => caches.filter((item) => item.type === type), [caches, type]);
  const activeCache = cachedOrders[currentCacheId || ""];
  const activeOrder = activeCache?.type === type ? activeCache : undefined;
  const activeOrderId = activeOrder?.id;
  const isSaleReturn = type === OrderType.SALE_RETURN;
  // Phiếu trả theo đơn vẫn được chỉnh sửa; backend sẽ kiểm tra giới hạn hàng hoàn.
  const isReadOnlyReturn = false;
  const allStores = info?.allStores || [];

  useEffect(() => {
    if (!(location.state as PosLocationState | null)?.openSourcePicker) return;
    setSourcePickerOpen(true);
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
  }, [location.pathname, location.search, location.state, navigate]);

  useEffect(() => {
    if (!currentStore || editId) return;
    if (locationState?.order) {
      if (initializedLocationOrder.current === locationState.order) return;
      initializedLocationOrder.current = locationState.order;
      dispatch(
        addNewCache({
          type,
          mode: "create",
          order: locationState.order as unknown as Partial<CachedOrder>,
        }),
      );
      return;
    }
    if (typeCaches.some((item) => item.mode === "create")) return;
    dispatch(addNewCache({ type, order: emptyOrder(type) }));
  }, [currentStore, dispatch, editId, locationState?.order, type, typeCaches]);

  useEffect(() => {
    // Khi chỉnh sửa, currentStore có thể chưa được chọn nhưng order đã chứa store.
    // Không được return sớm ở đây, nếu không các nhánh khôi phục cửa hàng bên dưới
    // sẽ không bao giờ được thực thi.
    if (!editId || initializedEdit.current === editId) return;
    const existing = caches.find((item) => item.sourceId === editId);
    if (existing) {
      initializedEdit.current = editId;
      if (!currentStore && existing.store) {
        handleSetCurrentStore(existing.store as Order["store"], false);
      }
      dispatch(setCurrentOrderCache(existing.id));
      return;
    }

    if (locationState?.order) {
      initializedEdit.current = editId;
      if (!currentStore && locationState.order.store) {
        handleSetCurrentStore(locationState.order.store, false);
      }
      dispatch(
        addNewCache({
          type,
          mode: "edit",
          sourceId: editId,
          order: locationState.order as unknown as Partial<CachedOrder>,
        }),
      );
      return;
    }

    initializedEdit.current = editId;
    orderStore.getById?.(editId, {
      onSuccess: (order) => {
        if (!order) {
          message.error("Không tìm thấy phiếu cần chỉnh sửa");
          navigate(type === OrderType.SALE ? privateRoutesName.sale : privateRoutesName.saleReturn);
          return;
        }
        if (!currentStore && order.store) {
          handleSetCurrentStore(order.store, false);
        }
        dispatch(
          addNewCache({
            type,
            mode: "edit",
            sourceId: editId,
            order: order as unknown as Partial<CachedOrder>,
          }),
        );
      },
    });
  }, [
    caches,
    currentStore,
    dispatch,
    editId,
    handleSetCurrentStore,
    locationState?.order,
    message,
    navigate,
    orderStore,
    type,
  ]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key !== "F4") return;
      event.preventDefault();
      customerSelectRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const returnLines = useMemo<PosLine[]>(
    () => (activeOrder?.returnLines || []) as PosLine[],
    [activeOrder?.returnLines],
  );
  const exchangeLines = useMemo<PosLine[]>(
    () => (activeOrder?.lines || []) as PosLine[],
    [activeOrder?.lines],
  );
  const lines = type === OrderType.SALE ? exchangeLines : returnLines;

  const totals = useMemo(() => {
    const order = activeOrder || (emptyOrder(type) as CachedOrder);
    if (type !== OrderType.SALE) {
      const returned = calculateTotals(
        returnLines.filter((line) => Number(line.quantity || 0) > 0),
        {
          ...order,
          discountType: order.returnDiscountType,
          discountValue: order.returnDiscountValue,
          taxType: order.returnTaxType,
          taxValue: order.returnTaxValue,
        },
      );
      const exchanged = calculateTotals(exchangeLines, order);
      return {
        ...exchanged,
        totalAmount: exchanged.totalAmount - returned.totalAmount,
      };
    }
    return calculateTotals(lines, order);
  }, [activeOrder, exchangeLines, lines, returnLines, type]);

  const returnTotals = useMemo(
    () =>
      calculateTotals(
        returnLines.filter((line) => Number(line.quantity || 0) > 0),
        {
          ...(activeOrder || (emptyOrder(type) as CachedOrder)),
          discountType: activeOrder?.returnDiscountType,
          discountValue: activeOrder?.returnDiscountValue,
          taxType: activeOrder?.returnTaxType,
          taxValue: activeOrder?.returnTaxValue,
        },
      ),
    [activeOrder, returnLines, type],
  );
  const exchangeTotals = useMemo(
    () => calculateTotals(exchangeLines, activeOrder || (emptyOrder(type) as CachedOrder)),
    [activeOrder, exchangeLines, type],
  );

  const updateActive = useCallback(
    (values: Partial<CachedOrder>) => {
      if (!activeOrderId || isReadOnlyReturn) return;
      dispatch(updateOrderCache({ id: activeOrderId, order: values }));
    },
    [activeOrderId, dispatch, isReadOnlyReturn],
  );

  const updateLines = useCallback(
    (nextLines: PosLine[]) =>
      updateActive(type === OrderType.SALE ? { lines: nextLines } : { returnLines: nextLines }),
    [type, updateActive],
  );
  const updateExchangeLines = useCallback(
    (nextLines: PosLine[]) => updateActive({ lines: nextLines }),
    [updateActive],
  );

  const returnGrossAmount = useMemo(() => getLinesGrossAmount(returnLines), [returnLines]);

  useEffect(() => {
    if (
      type !== OrderType.SALE_RETURN ||
      !activeOrder ||
      activeOrder.mode !== "create" ||
      !activeOrder.refOrderId ||
      !activeOrder.refOrder
    ) {
      return;
    }

    const source = activeOrder.refOrder;
    const sourceGrossAmount = Number(source.grossAmount || 0) || getLinesGrossAmount(source.lines);
    const syncKey = `${activeOrder.id}:${source.id}`;
    const isFirstSync = initializedReturnAdjustments.current !== syncKey;
    const shouldSync =
      isFirstSync ||
      previousReturnGrossAmount.current?.syncKey !== syncKey ||
      previousReturnGrossAmount.current.amount !== returnGrossAmount;
    const sourceDiscountType = (source.discountType || DiscountType.AMOUNT) as DiscountType;
    const sourceTaxType = (source.taxType || DiscountType.PERCENT) as DiscountType;

    if (!shouldSync) return;

    if (isFirstSync) initializedReturnAdjustments.current = syncKey;
    previousReturnGrossAmount.current = { syncKey, amount: returnGrossAmount };

    const nextValues: Partial<CachedOrder> = {};
    if (isFirstSync || activeOrder.returnDiscountType === sourceDiscountType) {
      nextValues.returnDiscountType = sourceDiscountType;
      nextValues.returnDiscountValue = getAllocatedReturnValue(
        sourceDiscountType,
        source.discountValue,
        returnGrossAmount,
        sourceGrossAmount,
      );
    }
    if (isFirstSync || activeOrder.returnTaxType === sourceTaxType) {
      nextValues.returnTaxType = sourceTaxType;
      nextValues.returnTaxValue = getAllocatedReturnValue(
        sourceTaxType,
        source.taxValue,
        returnGrossAmount,
        sourceGrossAmount,
      );
    }

    if (
      Object.entries(nextValues).some(
        ([key, value]) => (activeOrder as Record<string, unknown>)[key] !== value,
      )
    ) {
      updateActive(nextValues);
    }
  }, [
    activeOrder,
    activeOrder?.id,
    activeOrder?.mode,
    activeOrder?.refOrder,
    activeOrder?.refOrderId,
    activeOrder?.returnDiscountType,
    activeOrder?.returnTaxType,
    returnGrossAmount,
    type,
    updateActive,
  ]);

  const { addProduct, addExchangeProduct } = usePosProductActions({
    type,
    activeOrder,
    isSaleReturn,
    isReadOnlyReturn,
    returnLines,
    exchangeLines,
    updateLines,
    updateExchangeLines,
    onError: (text) => message.error(text),
  });

  const handleImportFile = (file: File) => {
    if (!activeOrder || isReadOnlyReturn) return;
    void importPosLines({
      file,
      type,
      activeOrder,
      returnLines,
      exchangeLines,
      onReturnLines: updateLines,
      onExchangeLines: updateExchangeLines,
      onWarning: (text) => message.warning(text),
      onSuccess: (text) => message.success(text),
      onError: (text) => message.error(text),
    });
  };

  const {
    updateQuantity,
    updateUnitPrice,
    updateExchangeQuantity,
    updateExchangeUnitPrice,
    updateUnit,
    updateExchangeUnit,
  } = usePosLineActions({
    isSaleReturn,
    isReadOnlyReturn,
    lines,
    exchangeLines,
    updateLines,
    updateExchangeLines,
    onError: (text) => message.error(text),
  });

  const payments = getPaymentSlots(activeOrder) as PosPayment[];
  const paymentMode = (activeOrder?.paymentMode || "cash") as PaymentMode;
  const payment = payments[getPaymentIndex(paymentMode)] as PosPayment | undefined;

  const updatePayment = (values: Record<string, unknown>, index = getPaymentIndex(paymentMode)) => {
    const nextPayments = getPaymentSlots(activeOrder);
    updateActive({
      incomeExpenses: nextPayments.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...values } : item,
      ),
    });
  };

  const changePaymentMode = (mode: PaymentMode) => {
    updateActive({ paymentMode: mode });
  };

  const submit = usePosSubmit({
    type,
    activeOrder,
    currentStoreId: currentStore?.id,
    isReadOnlyReturn,
    returnLines,
    exchangeLines,
    totals,
    returnTotals,
    exchangeTotals,
    payment,
    payments,
    paymentMode,
    orderStore,
    printSales,
  });

  const { openReturnFromSale } = usePosReturnSource({
    saleStore,
    saleReturnStore,
    cachedOrders,
    onClosePicker: () => setSourcePickerOpen(false),
  });

  const handleRemoveCache = (cache: CachedOrder) => {
    const remove = () => {
      const wasActive = cache.id === currentCacheId;
      const remainingCaches = caches.filter((item) => item.id !== cache.id);
      const nextCache = remainingCaches[remainingCaches.length - 1];

      dispatch(removeOrderCache(cache.id));

      if (wasActive && nextCache && nextCache.type !== type) {
        navigate(`/pos?${POS_TYPE_PARAM}=${nextCache.type}`);
      }
    };

    if (!hasCacheChanges(cache)) {
      remove();
      return;
    }

    modal.confirm({
      centered: true,
      title: <span className="text-red-500">Đóng {cache.label}</span>,
      content: (
        <span>
          Thông tin của <strong>{cache.label}</strong> sẽ không được lưu lại. Bạn có chắc chắn muốn
          đóng không?
        </span>
      ),
      okText: "Đồng ý",
      okButtonProps: { danger: true },
      cancelText: "Bỏ qua",
      onOk: remove,
    });
  };

  if (!currentStore) {
    return (
      <div className="flex h-screen w-screen flex-col items-center overflow-auto p-3 pt-[10vh]">
        <img src={icons.pos} alt="Chưa chọn cửa hàng" className="w-60" />
        <div className="max-w-md text-center">
          <h3 className="text-lg font-semibold">Chưa chọn cửa hàng</h3>
          <p className="mt-2 text-sm text-gray-400">
            Thao tác chỉ có thể thực hiện trong một cửa hàng. Vui lòng chọn cửa hàng để tạo đơn
            hàng.
          </p>
        </div>
        {!!allStores.length && (
          <div className="mt-6 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {allStores.map((store) => (
              <StoreCardLite
                key={store.id}
                item={store}
                onClick={() => handleSetCurrentStore(store, false)}
              />
            ))}
          </div>
        )}

        <Button
          type="primary"
          className="mt-6"
          onClick={() => navigate(-1)} // Quay lại trang trước
        >
          Quay lại
        </Button>
      </div>
    );
  }

  const filteredProducts = productStore.data || [];

  return (
    <Layout className={`h-screen w-screen flex overflow-hidden`}>
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#f3f7f4] text-[#10251b]">
        <PosHeader
          type={type}
          caches={caches}
          activeOrder={activeOrder}
          currentStoreName={currentStore.name}
          userName={info?.name}
          showProductSearch={type === OrderType.SALE || (isSaleReturn && !isReadOnlyReturn)}
          productPlaceholder={isSaleReturn ? "Tìm hàng trả (F3)" : undefined}
          onProductSelect={addProduct}
          onAddCache={() => dispatch(addNewCache({ type, order: emptyOrder(type) }))}
          onSelectCache={(cache) => {
            dispatch(setCurrentOrderCache(cache.id));
            if (cache.type !== type) navigate(`/pos?${POS_TYPE_PARAM}=${cache.type}`);
          }}
          onRemoveCache={handleRemoveCache}
          actions={
            <PosActionMenu
              type={type}
              activeOrder={activeOrder}
              readOnlyReturn={isReadOnlyReturn}
              onCreateReturn={() => setSourcePickerOpen(true)}
              onImportFile={handleImportFile}
            />
          }
        />

        {!activeOrder ? (
          <div className="flex flex-1 items-center justify-center">
            <Spin />
          </div>
        ) : (
          <PosContent
            type={type}
            activeOrder={activeOrder}
            isSaleReturn={isSaleReturn}
            isReadOnlyReturn={isReadOnlyReturn}
            returnLines={returnLines}
            exchangeLines={exchangeLines}
            lines={lines}
            totals={totals}
            returnTotals={returnTotals}
            exchangeTotals={exchangeTotals}
            payment={payment}
            payments={payments}
            productLoading={productStore.loading}
            products={filteredProducts}
            customerSelectRef={customerSelectRef}
            onProductSelect={addProduct}
            onExchangeProduct={addExchangeProduct}
            onQuantityChange={updateQuantity}
            onUnitChange={updateUnit}
            onUnitPriceChange={updateUnitPrice}
            onExchangeQuantityChange={updateExchangeQuantity}
            onExchangeUnitChange={updateExchangeUnit}
            onExchangeUnitPriceChange={updateExchangeUnitPrice}
            updateActive={updateActive}
            updateLines={updateLines}
            updateExchangeLines={updateExchangeLines}
            updatePayment={updatePayment}
            changePaymentMode={changePaymentMode}
            onSubmit={submit}
            loading={orderStore.creating || orderStore.updating}
          />
        )}
      </div>
      <div className="pointer-events-none fixed left-[-100000px] top-0" aria-hidden="true">
        <div ref={printContentRef}>{printData && <SaleA4PrintDocument data={printData} />}</div>
      </div>
      <SaleReturnSourceModal
        open={sourcePickerOpen}
        onClose={() => setSourcePickerOpen(false)}
        onSelect={openReturnFromSale}
        onQuickReturn={() => {
          setSourcePickerOpen(false);
          navigate(`${privateRoutesName.pos}?type=${OrderType.SALE_RETURN}`);
        }}
      />
    </Layout>
  );
};
