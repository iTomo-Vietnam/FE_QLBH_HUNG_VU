import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { App, Button, Modal, Tag, Tooltip } from "antd";
import { formatDateTimeDDMMYYYY } from "@/shared/utils/date.util";
import { formatMoney } from "@/shared/utils/number.util";
import { FundType } from "@/modules/fund/fund.model";
import { TransferNote } from "@/modules/transferNote/transferNote.model";
import { useDailyReportStore } from "../dailyReport.store";
import {
  DailyIncomeExpenseSnapshot,
  DailyOrderSnapshot,
  DailyReport,
  DailyTransferNoteFundSummary,
} from "../dailyReport.model";
import { DailyTransferNote } from "@/modules/transferNote/partials/DailyTransferNote";
import { AppSelect } from "@/shared/components";

interface Props {
  open: boolean;
  onClose: () => void;
}

type HighlightTone = "valid" | "invalid" | "formula";
type OrderHighlightColumn = "total" | "paid" | "debt" | "paidCash" | "paidBank";
type CashFlowHighlightColumn = "cash" | "bank" | "amount";

type Highlight = {
  tone: HighlightTone;
  cardKey?: string;
  rowKeys?: string[];
  orderGroups?: string[];
  orderColumn?: OrderHighlightColumn;
  paymentType?: FundType;
  cashFlowKeys?: string[];
  cashFlowColumn?: CashFlowHighlightColumn;
};

type SortDirection = "asc" | "desc";
type OrderSortKey =
  | "occurredAt"
  | "code"
  | "paymentMethod"
  | "totalAmount"
  | "paidAmount"
  | "debtAmount";
type CashFlowSortKey = "occurredAt" | "code" | "fund" | "amount" | "description";

const orderSortOptions = [
  { value: "occurredAt", label: "Giờ" },
  { value: "code", label: "Mã chứng từ" },
  { value: "paymentMethod", label: "Hình thức TT" },
  { value: "totalAmount", label: "Tổng tiền hàng" },
  { value: "paidAmount", label: "Thực thu" },
  { value: "debtAmount", label: "Ghi nợ" },
];

const cashFlowSortOptions = [
  { value: "occurredAt", label: "Giờ" },
  { value: "code", label: "Mã chứng từ" },
  { value: "fund", label: "Quỹ nhận" },
  { value: "amount", label: "Số tiền" },
  { value: "description", label: "Nội dung" },
];

const shortTime = (value: string | Date) => {
  const parts = formatDateTimeDDMMYYYY(value).split(" ");
  return parts[parts.length - 1] || "—";
};

const paymentAmount = (row: DailyOrderSnapshot, type: FundType) =>
  row.payments
    .filter((item) => item.fundSnapshot?.type === type)
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

const hasPayment = (row: DailyOrderSnapshot, type: FundType) => paymentAmount(row, type) > 0.009;

const getPaymentDisplay = (row: DailyOrderSnapshot) => {
  const hasCash = hasPayment(row, FundType.CASH);
  const hasBank = hasPayment(row, FundType.BANK);
  const hasDebt = Number(row.debtAmount || 0) > 0.009;

  if (hasDebt) {
    if (hasCash && hasBank) return "TM/CK/Nợ";
    if (hasCash) return "TM/Nợ";
    if (hasBank) return "CK/Nợ";
    return "Nợ";
  }
  if (hasCash && hasBank) return "TM/CK";
  if (hasBank) return "CK";
  if (hasCash) return "TM";

  // Fallback for old snapshots that did not include payment rows.
  return (
    ({ DEBT: "Nợ", CASH: "TM", BANK: "CK", COMBINED: "TM/CK" } as Record<string, string>)[
      row.paymentMethod
    ] || row.paymentMethod
  );
};

const getPaymentRank = (row: DailyOrderSnapshot) => {
  const label = getPaymentDisplay(row);
  return (
    (
      {
        Nợ: 0,
        "TM/Nợ": 1,
        "CK/Nợ": 2,
        "TM/CK/Nợ": 3,
        TM: 4,
        CK: 5,
        "TM/CK": 6,
      } as Record<string, number>
    )[label] ?? 99
  );
};

const isCombinedOrder = (row: DailyOrderSnapshot) =>
  hasPayment(row, FundType.CASH) && hasPayment(row, FundType.BANK);

const incomeExpenseAmount = (row: DailyIncomeExpenseSnapshot, type: FundType) =>
  row.fundSnapshot?.type === type ? Number(row.amount || 0) : 0;

const moneyOrEmpty = (value: number) => (value ? formatMoney(value) : "");

const compareText = (left?: string | null, right?: string | null) =>
  (left || "").localeCompare(right || "", "vi", { numeric: true, sensitivity: "base" });

const compareDate = (left: string | Date, right: string | Date) =>
  new Date(left).getTime() - new Date(right).getTime();

const getCodeParts = (code: string): [number, number] => {
  const match = code.match(/(\d+)(?:\.(\d+))?$/);
  return [Number(match?.[1] || Number.MAX_SAFE_INTEGER), Number(match?.[2] || 0)];
};

const compareCode = (left: string, right: string) => {
  const leftParts = getCodeParts(left);
  const rightParts = getCodeParts(right);
  return leftParts[0] - rightParts[0] || leftParts[1] - rightParts[1] || compareText(left, right);
};

const compareOrderCode = (left: DailyOrderSnapshot, right: DailyOrderSnapshot) => {
  // HĐ (sale) đứng trước HĐT (sale return), sau đó mới so số chứng từ.
  const leftTypeRank = left.type === "sale" ? 0 : 1;
  const rightTypeRank = right.type === "sale" ? 0 : 1;
  return leftTypeRank - rightTypeRank || compareCode(left.code, right.code);
};

const sortOrders = (rows: DailyOrderSnapshot[], sortBy: OrderSortKey, direction: SortDirection) => {
  const factor = direction === "asc" ? 1 : -1;
  return [...rows].sort((left, right) => {
    let result = 0;
    switch (sortBy) {
      case "code":
        result = compareOrderCode(left, right);
        break;
      case "paymentMethod":
        result = getPaymentRank(left) - getPaymentRank(right);
        break;
      case "totalAmount":
        result = left.totalAmount - right.totalAmount;
        break;
      case "paidAmount":
        result = left.paidAmount - right.paidAmount;
        break;
      case "debtAmount":
        result = left.debtAmount - right.debtAmount;
        break;
      case "occurredAt":
      default:
        result = compareDate(left.occurredAt, right.occurredAt);
        break;
    }

    if (result) return result * factor;
    if (sortBy !== "occurredAt") {
      const timeResult = compareDate(left.occurredAt, right.occurredAt);
      if (timeResult) return timeResult;
    }
    return compareText(left.id, right.id);
  });
};

const sortCashFlow = (
  rows: DailyIncomeExpenseSnapshot[],
  sortBy: CashFlowSortKey,
  direction: SortDirection,
) => {
  const factor = direction === "asc" ? 1 : -1;
  return [...rows].sort((left, right) => {
    let result = 0;
    switch (sortBy) {
      case "code":
        result = compareCode(left.code, right.code);
        break;
      case "fund":
        result = compareText(left.fundSnapshot?.name, right.fundSnapshot?.name);
        break;
      case "amount":
        result = Number(left.amount || 0) - Number(right.amount || 0);
        break;
      case "description":
        result = compareText(
          left.categoryName || left.partnerName || left.description,
          right.categoryName || right.partnerName || right.description,
        );
        break;
      case "occurredAt":
      default:
        result = compareDate(left.occurredAt, right.occurredAt);
        break;
    }

    if (result) return result * factor;
    if (sortBy !== "occurredAt") {
      const timeResult = compareDate(left.occurredAt, right.occurredAt);
      if (timeResult) return timeResult;
    }
    return compareText(left.id, right.id);
  });
};

const highlightClass = (tone: HighlightTone) => {
  if (tone === "formula") {
    return "bg-amber-100 text-amber-950 ring-1 ring-inset ring-amber-300";
  }
  return tone === "valid"
    ? "bg-sky-100 text-sky-950 ring-1 ring-inset ring-sky-400"
    : "bg-red-100 text-red-950 ring-1 ring-inset ring-red-400";
};

const rowHighlightClass = (highlight: Highlight | null, key: string) => {
  if (!highlight?.rowKeys?.includes(key)) return "hover:bg-slate-100";
  return `${highlightClass(highlight.tone)} transition-colors`;
};

const SortControl: React.FC<{
  value: string;
  direction: SortDirection;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  onDirectionChange: () => void;
}> = ({ value, direction, options, onChange, onDirectionChange }) => (
  <div data-highlight-control className="flex items-center gap-1.5 text-[11px] text-slate-500">
    <span className="flex-shrink-0">Sắp xếp theo:</span>
    <AppSelect
      size="small"
      value={value}
      options={options}
      onChange={onChange}
      popupMatchSelectWidth={false}
      className="min-w-[118px]"
    />
    <Button
      size="small"
      type="text"
      className="!px-1.5 !text-slate-600"
      title={direction === "asc" ? "Tăng dần" : "Giảm dần"}
      onClick={onDirectionChange}
    >
      {direction === "asc" ? "↑" : "↓"}
    </Button>
  </div>
);

const MetricCard: React.FC<{
  label: string;
  value: number;
  accent?: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ label, value, accent = "text-slate-800", active, onClick }) => (
  <button
    type="button"
    data-highlight-control
    className={`min-w-0 rounded-lg border bg-white px-2 py-1.5 text-left shadow-sm transition hover:border-primary/50 ${
      active ? "border-primary ring-2 ring-primary/30" : "border-slate-200"
    }`}
    onClick={onClick}
  >
    <div
      className="truncate text-[10px] font-medium uppercase tracking-wide text-slate-500"
      title={label}
    >
      {label}
    </div>
    <div className={`mt-0.5 text-sm font-bold ${accent}`}>{formatMoney(value)}</div>
  </button>
);

const ReconciliationCard: React.FC<{
  title: string;
  rows: Array<{ key: string; label: string; value: number }>;
  status: string;
  total: number;
  statusColor: string;
  totalKey: string;
  activeKey?: string;
  onRowClick?: (key: string) => void;
}> = ({ title, rows, status, total, statusColor, totalKey, activeKey, onRowClick }) => (
  <div className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
    <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-700">{title}</div>
    <div className="space-y-0.5">
      {rows.map((row) => (
        <button
          key={row.key}
          type="button"
          data-highlight-control
          className={`flex w-full items-center justify-between gap-2 rounded px-1 py-0.5 text-left text-[11px] transition hover:bg-slate-100 ${
            activeKey === row.key ? "bg-amber-100 text-amber-950 ring-1 ring-amber-300" : ""
          }`}
          onClick={() => onRowClick?.(row.key)}
        >
          <span className="truncate text-slate-500" title={row.label}>
            {row.label}
          </span>
          <span className="shrink-0 font-medium text-slate-700">{formatMoney(row.value)}</span>
        </button>
      ))}
    </div>
    <button
      type="button"
      data-highlight-control
      className={`mt-1 flex w-full items-center justify-between gap-2 border-t border-slate-100 px-1 pt-1 text-left text-[11px] font-bold transition hover:bg-slate-100 ${
        activeKey === totalKey ? "bg-amber-100 text-amber-950" : ""
      }`}
      onClick={() => onRowClick?.(totalKey)}
    >
      <Tag color={statusColor} className="m-0 !text-[10px]">
        {status}
      </Tag>
      <span className="text-slate-800">{formatMoney(total)}</span>
    </button>
  </div>
);

export const DailyReportModal: React.FC<Props> = ({ open, onClose }) => {
  const { message } = App.useApp();
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const [paymentDetailRow, setPaymentDetailRow] = useState<DailyOrderSnapshot | null>(null);
  const [orderSortBy, setOrderSortBy] = useState<OrderSortKey>("occurredAt");
  const [orderSortDirection, setOrderSortDirection] = useState<SortDirection>("asc");
  const [cashFlowSortBy, setCashFlowSortBy] = useState<CashFlowSortKey>("occurredAt");
  const [cashFlowSortDirection, setCashFlowSortDirection] = useState<SortDirection>("asc");
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const dailyStore = useDailyReportStore({ page: 1, size: 1, isLocked: true });
  const getCurrentRef = useRef(dailyStore.getCurrent);
  const canRead = Boolean(dailyStore.getCurrent);

  useEffect(() => {
    getCurrentRef.current = dailyStore.getCurrent;
  }, [dailyStore.getCurrent]);

  useEffect(() => {
    const clearHighlightOutsideControls = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-highlight-control]")) setHighlight(null);
    };
    document.addEventListener("mousedown", clearHighlightOutsideControls);
    return () => document.removeEventListener("mousedown", clearHighlightOutsideControls);
  }, []);

  const loadReport = useCallback(async () => {
    const getCurrent = getCurrentRef.current;
    if (!getCurrent) return;
    setLoading(true);
    try {
      setReport(await getCurrent());
    } catch (error) {
      message.error((error as any)?.message || "Không thể tải báo cáo cuối ngày");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    if (open) void loadReport();
  }, [canRead, open, loadReport]);

  const summary = report?.summary;
  const orders = report?.orderSnapshots || [];
  const expenses = report?.expenseSnapshots || [];
  const debtIncome = report?.debtIncomeSnapshots || [];

  const sortedOrders = useMemo(
    () => sortOrders(orders, orderSortBy, orderSortDirection),
    [orders, orderSortBy, orderSortDirection],
  );
  const sortedExpenses = useMemo(
    () => sortCashFlow(expenses, cashFlowSortBy, cashFlowSortDirection),
    [expenses, cashFlowSortBy, cashFlowSortDirection],
  );
  const sortedDebtIncome = useMemo(
    () => sortCashFlow(debtIncome, cashFlowSortBy, cashFlowSortDirection),
    [cashFlowSortBy, cashFlowSortDirection, debtIncome],
  );

  const orderTotals = useMemo(() => {
    const sales = orders.filter((item) => item.type === "sale");
    return {
      saleCash: sales.reduce((sum, item) => sum + paymentAmount(item, FundType.CASH), 0),
      saleBank: sales.reduce((sum, item) => sum + paymentAmount(item, FundType.BANK), 0),
    };
  }, [orders]);

  const transferAccountSummary = useMemo(() => {
    const saved = summary?.transferNotePersonalAmounts;
    if (saved?.length) return saved;

    const byFund = new Map<string, DailyTransferNoteFundSummary>();
    (report?.transferNoteSnapshots || [])
      .filter((item) => item.status === "valid" && item.fundSnapshot?.isPersonal)
      .forEach((item) => {
        const current = byFund.get(item.fundId);
        byFund.set(item.fundId, {
          fundId: item.fundId,
          fundSnapshot: item.fundSnapshot,
          amount: (current?.amount || 0) + Number(item.amount || 0),
        });
      });
    return Array.from(byFund.values());
  }, [report?.transferNoteSnapshots, summary?.transferNotePersonalAmounts]);

  const transferCompanyAmount = useMemo(() => {
    if (summary?.transferNoteCompanyAmount !== undefined) {
      return summary.transferNoteCompanyAmount;
    }
    return (report?.transferNoteSnapshots || [])
      .filter((item) => item.status === "valid" && !item.fundSnapshot?.isPersonal)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [report?.transferNoteSnapshots, summary?.transferNoteCompanyAmount]);

  const debtCash = summary?.debtIncomeCashAmount || 0;
  const debtBank = summary?.debtIncomeBankAmount || 0;
  const expenseCash = summary?.expenseCashAmount || 0;
  const receivedBank = orderTotals.saleBank + debtBank;
  const actualCash = orderTotals.saleCash + debtCash - expenseCash;
  const validTransferAmount = summary?.transferNoteValidAmount || 0;
  const bankMatched = Math.abs(receivedBank - validTransferAmount) <= 0.01;

  const orderGroupKey = (row: DailyOrderSnapshot) => `order:${row.id}`;
  const paymentRowKey = (row: DailyOrderSnapshot, type: FundType) =>
    `${orderGroupKey(row)}:${type}`;
  const cashFlowKey = (kind: "expense" | "debt", row: DailyIncomeExpenseSnapshot) =>
    `${kind}:${row.id}`;

  const orderGroupsForPayment = (type: FundType, rows: DailyOrderSnapshot[] = orders) =>
    rows.filter((row) => hasPayment(row, type)).map(orderGroupKey);
  const cashFlowKeysForPayment = (
    rows: DailyIncomeExpenseSnapshot[],
    type: FundType,
    kind: "expense" | "debt",
  ) =>
    rows
      .filter((row) => incomeExpenseAmount(row, type) > 0.009)
      .map((row) => cashFlowKey(kind, row));

  const setPaymentFormulaHighlight = (cardKey: string, type: FundType) => {
    setHighlight({
      tone: "formula",
      cardKey,
      orderGroups: orderGroupsForPayment(
        type,
        orders.filter((row) => row.type === "sale"),
      ),
      paymentType: type,
    });
  };

  const handleReconciliationClick = (key: string) => {
    const common = { tone: "formula" as const, cardKey: key };
    switch (key) {
      case "bank-sales":
        setHighlight({
          ...common,
          orderGroups: orderGroupsForPayment(
            FundType.BANK,
            orders.filter((row) => row.type === "sale"),
          ),
          paymentType: FundType.BANK,
        });
        break;
      case "bank-debt":
        setHighlight({
          ...common,
          cashFlowKeys: cashFlowKeysForPayment(debtIncome, FundType.BANK, "debt"),
          cashFlowColumn: "bank",
        });
        break;
      case "bank-total":
        setHighlight({
          ...common,
          orderGroups: orderGroupsForPayment(
            FundType.BANK,
            orders.filter((row) => row.type === "sale"),
          ),
          paymentType: FundType.BANK,
          cashFlowKeys: cashFlowKeysForPayment(debtIncome, FundType.BANK, "debt"),
          cashFlowColumn: "bank",
        });
        break;
      case "cash-sales":
        setPaymentFormulaHighlight(key, FundType.CASH);
        break;
      case "cash-debt":
        setHighlight({
          ...common,
          cashFlowKeys: cashFlowKeysForPayment(debtIncome, FundType.CASH, "debt"),
          cashFlowColumn: "cash",
        });
        break;
      case "cash-expense":
        setHighlight({
          ...common,
          cashFlowKeys: cashFlowKeysForPayment(expenses, FundType.CASH, "expense"),
          cashFlowColumn: "cash",
        });
        break;
      case "cash-total":
        setHighlight({
          ...common,
          orderGroups: orderGroupsForPayment(
            FundType.CASH,
            orders.filter((row) => row.type === "sale"),
          ),
          paymentType: FundType.CASH,
          cashFlowKeys: [
            ...cashFlowKeysForPayment(debtIncome, FundType.CASH, "debt"),
            ...cashFlowKeysForPayment(expenses, FundType.CASH, "expense"),
          ],
          cashFlowColumn: "cash",
        });
        break;
      default:
        setHighlight(null);
    }
  };

  const handleReferenceCodeClick = useCallback(
    (record: TransferNote) => {
      if (!report) return;
      const order = report.orderSnapshots.find((item) => item.code === record.referenceCode);
      const expense = report.expenseSnapshots.find((item) => item.code === record.referenceCode);
      const debt = report.debtIncomeSnapshots.find((item) => item.code === record.referenceCode);
      const target = order
        ? {
            scrollKey: orderGroupKey(order),
            rowKeys: isCombinedOrder(order)
              ? [paymentRowKey(order, FundType.CASH), paymentRowKey(order, FundType.BANK)]
              : [orderGroupKey(order)],
          }
        : expense
          ? {
              scrollKey: cashFlowKey("expense", expense),
              rowKeys: [cashFlowKey("expense", expense)],
            }
          : debt
            ? { scrollKey: cashFlowKey("debt", debt), rowKeys: [cashFlowKey("debt", debt)] }
            : null;

      const tone: HighlightTone = record.status === "valid" ? "valid" : "invalid";
      if (!target) {
        message.error(`Không tìm thấy phiếu tương ứng với mã ${record.referenceCode}`);
        if (record.invalidReason) message.warning(record.invalidReason);
        return;
      }
      if (record.status !== "valid" && record.invalidReason) {
        message.warning(record.invalidReason);
      }
      setHighlight({ tone, rowKeys: target.rowKeys });
      window.requestAnimationFrame(() => {
        rowRefs.current[target.scrollKey]?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    },
    [message, report],
  );

  const isOrderGroupHighlighted = (groupKey: string) =>
    Boolean(
      highlight?.orderGroups?.includes(groupKey) ||
      highlight?.rowKeys?.some((key) => key === groupKey || key.startsWith(`${groupKey}:`)),
    );

  const orderCellHighlightClass = (
    row: DailyOrderSnapshot,
    rowKey: string,
    column: OrderHighlightColumn | "common",
  ) => {
    const groupKey = orderGroupKey(row);
    const rowActive = highlight?.rowKeys?.includes(rowKey);
    const groupActive = isOrderGroupHighlighted(groupKey);
    const isPaymentColumn =
      highlight?.paymentType &&
      ((highlight.paymentType === FundType.CASH && (column === "paid" || column === "paidCash")) ||
        (highlight.paymentType === FundType.BANK && (column === "paid" || column === "paidBank")));
    const formulaActive =
      groupActive &&
      ((highlight?.orderColumn && highlight.orderColumn === column) ||
        (highlight?.paymentType && (column === "common" || isPaymentColumn)));

    return rowActive || formulaActive ? highlightClass(highlight?.tone || "formula") : "";
  };

  const cashFlowCellHighlightClass = (key: string, column: CashFlowHighlightColumn) => {
    const rowActive = highlight?.rowKeys?.includes(key);
    const formulaActive =
      highlight?.cashFlowKeys?.includes(key) &&
      (!highlight.cashFlowColumn || highlight.cashFlowColumn === column);
    return rowActive || formulaActive ? highlightClass(highlight?.tone || "formula") : "";
  };

  const paymentDetailContent = (row: DailyOrderSnapshot) => {
    const cash = paymentAmount(row, FundType.CASH);
    const bank = paymentAmount(row, FundType.BANK);
    const bankPayments = row.payments.filter(
      (item) => item.fundSnapshot?.type === FundType.BANK && Number(item.amount || 0) > 0.009,
    );
    return (
      <div className="space-y-0.5 text-xs">
        <div className="flex justify-between gap-4">
          <span>Tiền mặt</span>
          <b>{formatMoney(cash)}</b>
        </div>
        <div className="flex justify-between gap-4">
          <span>Chuyển khoản</span>
          <b>{formatMoney(bank)}</b>
        </div>
        {bankPayments.map((item) => (
          <div key={item.fundId || item.fundSnapshot?.id} className="text-slate-500">
            TK nhận: {item.fundSnapshot?.name || "Chưa xác định"}
          </div>
        ))}
        {Number(row.debtAmount || 0) > 0.009 && (
          <div className="flex justify-between gap-4 text-amber-700">
            <span>Ghi nợ</span>
            <b>{formatMoney(row.debtAmount)}</b>
          </div>
        )}
      </div>
    );
  };

  const renderPaymentMethod = (row: DailyOrderSnapshot) => {
    const label = getPaymentDisplay(row);
    if (!isCombinedOrder(row)) return label;
    return (
      <Tooltip title={paymentDetailContent(row)}>
        <button
          type="button"
          className="font-semibold text-primary underline decoration-dotted underline-offset-2"
          onClick={(event) => {
            event.stopPropagation();
            setPaymentDetailRow(row);
          }}
        >
          {label}
        </button>
      </Tooltip>
    );
  };

  const renderOrderRows = () =>
    sortedOrders.length ? (
      sortedOrders.map((row) => {
        const groupKey = orderGroupKey(row);
        const combined = isCombinedOrder(row);
        const cash = paymentAmount(row, FundType.CASH);
        const bank = paymentAmount(row, FundType.BANK);
        const cashKey = paymentRowKey(row, FundType.CASH);
        const bankKey = paymentRowKey(row, FundType.BANK);

        if (combined) {
          return (
            <React.Fragment key={row.id}>
              <tr
                ref={(node) => {
                  rowRefs.current[cashKey] = node;
                  rowRefs.current[groupKey] = node;
                }}
                className={`border-b border-slate-100 transition-colors ${rowHighlightClass(highlight, cashKey)}`}
              >
                <td
                  className={`whitespace-nowrap px-1 py-1 text-center ${orderCellHighlightClass(row, cashKey, "common")}`}
                  rowSpan={2}
                >
                  {shortTime(row.occurredAt)}
                </td>
                <td
                  className={`px-1 py-1 ${orderCellHighlightClass(row, cashKey, "common")}`}
                  rowSpan={2}
                >
                  {row.code}
                </td>
                <td
                  className={`max-w-[180px] truncate px-1 py-1 ${orderCellHighlightClass(row, cashKey, "common")}`}
                  title={row.partnerName || "Khách lẻ"}
                  rowSpan={2}
                >
                  {row.partnerName || "Khách lẻ"}
                </td>
                <td
                  className={`px-1 py-1 text-center ${orderCellHighlightClass(row, cashKey, "common")}`}
                  rowSpan={2}
                >
                  {renderPaymentMethod(row)}
                </td>
                <td
                  className={`px-1 py-1 text-right ${orderCellHighlightClass(row, cashKey, "total")}`}
                  rowSpan={2}
                >
                  {formatMoney(row.totalAmount)}
                </td>
                <td
                  className={`px-1 py-1 text-right ${orderCellHighlightClass(row, cashKey, "paidCash")}`}
                >
                  {formatMoney(cash)}
                </td>
                <td
                  className={`px-1 py-1 text-right ${orderCellHighlightClass(row, cashKey, "debt")}`}
                  rowSpan={2}
                >
                  {moneyOrEmpty(row.debtAmount)}
                </td>
              </tr>
              <tr
                ref={(node) => {
                  rowRefs.current[bankKey] = node;
                }}
                className={`border-b border-slate-100 transition-colors ${rowHighlightClass(highlight, bankKey)}`}
              >
                <td
                  className={`px-1 py-1 text-right ${orderCellHighlightClass(row, bankKey, "paidBank")}`}
                >
                  {formatMoney(bank)}
                </td>
              </tr>
            </React.Fragment>
          );
        }

        return (
          <tr
            key={row.id}
            ref={(node) => {
              rowRefs.current[groupKey] = node;
            }}
            className={`border-b border-slate-100 transition-colors ${rowHighlightClass(highlight, groupKey)}`}
          >
            <td
              className={`whitespace-nowrap px-1 py-1 text-center ${orderCellHighlightClass(row, groupKey, "common")}`}
            >
              {shortTime(row.occurredAt)}
            </td>
            <td className={`px-1 py-1 ${orderCellHighlightClass(row, groupKey, "common")}`}>
              {row.code}
            </td>
            <td
              className={`max-w-[180px] truncate px-1 py-1 ${orderCellHighlightClass(row, groupKey, "common")}`}
              title={row.partnerName || "Khách lẻ"}
            >
              {row.partnerName || "Khách lẻ"}
            </td>
            <td
              className={`px-1 py-1 text-center ${orderCellHighlightClass(row, groupKey, "common")}`}
            >
              {renderPaymentMethod(row)}
            </td>
            <td
              className={`px-1 py-1 text-right ${orderCellHighlightClass(row, groupKey, "total")}`}
            >
              {formatMoney(row.totalAmount)}
            </td>
            <td
              className={`px-1 py-1 text-right ${orderCellHighlightClass(row, groupKey, "paid")}`}
            >
              {formatMoney(row.paidAmount)}
            </td>
            <td
              className={`px-1 py-1 text-right ${orderCellHighlightClass(row, groupKey, "debt")}`}
            >
              {moneyOrEmpty(row.debtAmount)}
            </td>
          </tr>
        );
      })
    ) : (
      <tr>
        <td colSpan={7} className="px-1 py-8 text-center text-slate-400">
          Không có hóa đơn hoàn thành trong ngày
        </td>
      </tr>
    );

  const renderIncomeExpenseRow = (row: DailyIncomeExpenseSnapshot, kind: "expense" | "debt") => {
    const key = cashFlowKey(kind, row);
    return (
      <tr
        key={key}
        ref={(node) => {
          rowRefs.current[key] = node;
        }}
        className={`border-b border-slate-100 transition-colors ${rowHighlightClass(highlight, key)}`}
      >
        <td className={`whitespace-nowrap px-1 py-1 ${cashFlowCellHighlightClass(key, "amount")}`}>
          {shortTime(row.occurredAt)}
        </td>
        <td
          className={`px-1 py-1 font-mono font-medium ${cashFlowCellHighlightClass(key, "amount")}`}
        >
          {row.code}
        </td>
        <td
          className={`max-w-[190px] truncate px-1 py-1 ${cashFlowCellHighlightClass(key, "amount")}`}
          title={
            kind === "expense" ? row.categoryName || row.description || "" : row.partnerName || ""
          }
        >
          {kind === "expense"
            ? row.categoryName || row.description || "—"
            : row.partnerName || "Khách lẻ"}
        </td>
        <td className={`px-1 py-1 text-right ${cashFlowCellHighlightClass(key, "cash")}`}>
          {moneyOrEmpty(incomeExpenseAmount(row, FundType.CASH))}
        </td>
        <td className={`px-1 py-1 text-right ${cashFlowCellHighlightClass(key, "bank")}`}>
          {moneyOrEmpty(incomeExpenseAmount(row, FundType.BANK))}
        </td>
        <td
          className={`max-w-[180px] truncate px-1 py-1 ${cashFlowCellHighlightClass(key, "amount")}`}
          title={row.note || row.description || ""}
        >
          {row.note || row.description || (kind === "debt" ? "Thu công nợ" : "—")}
        </td>
        <td
          className={`max-w-[160px] truncate px-1 py-1 ${cashFlowCellHighlightClass(key, "amount")}`}
          title={row.fundSnapshot?.name || ""}
        >
          {row.fundSnapshot?.name || "—"}
        </td>
      </tr>
    );
  };

  return (
    <Modal
      open={open}
      title="Báo cáo cuối ngày"
      onCancel={onClose}
      destroyOnClose
      maskClosable={false}
      centered
      width="calc(100vw - 16px)"
      className="fullscreen-modal"
      footer={null}
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto pr-1 xl:grid-cols-2 2xl:overflow-hidden">
          <section className="flex min-h-[600px] min-w-0 flex-col">
            <div className="mb-2 flex shrink-0 items-center justify-between gap-2 px-1">
              <div>
                <h3 className="font-semibold text-slate-800">Theo dõi báo cáo</h3>
                <p className="text-xs text-slate-500">Hóa đơn và thu chi trong ngày</p>
              </div>
              <Tag color="blue">{summary?.orderCount || orders.length} hóa đơn</Tag>
            </div>

            <div className="min-h-0 flex-1 space-y-3 p-1 overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
                <MetricCard
                  label="Tổng ghi nợ (1)"
                  value={summary?.orderDebtAmount || 0}
                  accent="text-amber-700"
                  active={highlight?.cardKey === "order-debt"}
                  onClick={() =>
                    setHighlight({
                      tone: "formula",
                      cardKey: "order-debt",
                      orderGroups: orders.map(orderGroupKey),
                      orderColumn: "debt",
                    })
                  }
                />
                <MetricCard
                  label="Thanh toán chuyển khoản (2)"
                  value={orderTotals.saleBank}
                  accent="text-blue-700"
                  active={highlight?.cardKey === "sale-bank"}
                  onClick={() => setPaymentFormulaHighlight("sale-bank", FundType.BANK)}
                />
                <MetricCard
                  label="Thanh toán tiền mặt (4)"
                  value={orderTotals.saleCash}
                  accent="text-emerald-700"
                  active={highlight?.cardKey === "sale-cash"}
                  onClick={() => setPaymentFormulaHighlight("sale-cash", FundType.CASH)}
                />
                <MetricCard
                  label="Tổng doanh thu bán hàng"
                  value={
                    (summary?.orderDebtAmount || 0) + orderTotals.saleBank + orderTotals.saleCash
                  }
                  accent="text-primary"
                  active={highlight?.cardKey === "sale-total"}
                  onClick={() =>
                    setHighlight({
                      tone: "formula",
                      cardKey: "sale-total",
                      orderGroups: orders.map(orderGroupKey),
                      orderColumn: "total",
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                <ReconciliationCard
                  title="Tổng nhận chuyển khoản"
                  totalKey="bank-total"
                  rows={[
                    {
                      key: "bank-sales",
                      label: "Chuyển khoản bán hàng (2)",
                      value: orderTotals.saleBank,
                    },
                    {
                      key: "bank-debt",
                      label: "Chuyển khoản cọc hàng & thu nợ (7)",
                      value: debtBank,
                    },
                  ]}
                  status={bankMatched ? "Khớp số" : "Lệch số"}
                  total={receivedBank}
                  statusColor={bankMatched ? "success" : "error"}
                  activeKey={highlight?.cardKey}
                  onRowClick={handleReconciliationClick}
                />
                <ReconciliationCard
                  title="Tổng nhận tiền mặt"
                  totalKey="cash-total"
                  rows={[
                    {
                      key: "cash-sales",
                      label: "Tiền mặt bán hàng (4)",
                      value: orderTotals.saleCash,
                    },
                    {
                      key: "cash-debt",
                      label: "Tổng thu nợ & cọc hàng tiền mặt (5)",
                      value: debtCash,
                    },
                    { key: "cash-expense", label: "Tổng chi tiền mặt (6)", value: expenseCash },
                  ]}
                  status="Khớp số"
                  total={actualCash}
                  statusColor="success"
                  activeKey={highlight?.cardKey}
                  onRowClick={handleReconciliationClick}
                />
              </div>

              <div className="overflow-hidden border-y border-slate-200 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-1.5 py-2">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">Thống kê hóa đơn</h4>
                    <p className="text-[11px] text-slate-500">Đơn bán trước, đơn đổi trả sau</p>
                  </div>
                  <SortControl
                    value={orderSortBy}
                    direction={orderSortDirection}
                    options={orderSortOptions}
                    onChange={(value) => setOrderSortBy(value as OrderSortKey)}
                    onDirectionChange={() =>
                      setOrderSortDirection((value) => (value === "asc" ? "desc" : "asc"))
                    }
                  />
                </div>
                <div className="max-h-[min(42vh,480px)] overflow-auto">
                  <table className="min-w-[880px] w-full border-collapse text-xs">
                    <colgroup>
                      <col className="w-20" />
                      <col className="w-28" />
                      <col className="min-w-40 max-w-64" />
                      <col className="w-24" />
                      <col className="w-28" />
                      <col className="w-28" />
                      <col className="w-28" />
                    </colgroup>
                    <thead className="sticky top-0 z-10 bg-slate-100 text-left text-slate-600">
                      <tr className="text-xs">
                        <th className="border-b px-1 py-2 text-center uppercase font-semibold">
                          Giờ
                        </th>
                        <th className="border-b px-1 py-2 uppercase font-semibold">Mã chứng từ</th>
                        <th className="border-b px-1 py-2 uppercase font-semibold">Khách hàng</th>
                        <th className="border-b px-1 py-2 text-center uppercase font-semibold">
                          Hình thức TT
                        </th>
                        <th className="border-b px-1 py-2 text-right uppercase font-semibold">
                          Tổng tiền hàng
                        </th>
                        <th className="border-b px-1 py-2 text-right uppercase font-semibold">
                          Thực thu
                        </th>
                        <th className="border-b px-1 py-2 text-right uppercase font-semibold">
                          Ghi nợ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="px-1 py-8 text-center text-slate-400">
                            Đang tải...
                          </td>
                        </tr>
                      ) : (
                        renderOrderRows()
                      )}
                    </tbody>
                    <tfoot className="bg-slate-50 font-semibold text-slate-700">
                      <tr>
                        <td colSpan={4} className="border-t px-1 py-2">
                          TỔNG
                        </td>
                        <td className="border-t px-1 py-2 text-right">
                          {formatMoney(summary?.orderTotalAmount || 0)}
                        </td>
                        <td className="border-t px-1 py-2 text-right">
                          {formatMoney(summary?.orderPaidAmount || 0)}
                        </td>
                        <td className="border-t px-1 py-2 text-right">
                          {formatMoney(summary?.orderDebtAmount || 0)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="overflow-hidden border-y border-slate-200 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-1.5 py-2">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">Thống kê thu chi</h4>
                    <p className="text-[11px] text-slate-500">Chi khác và thu công nợ</p>
                  </div>
                  <SortControl
                    value={cashFlowSortBy}
                    direction={cashFlowSortDirection}
                    options={cashFlowSortOptions}
                    onChange={(value) => setCashFlowSortBy(value as CashFlowSortKey)}
                    onDirectionChange={() =>
                      setCashFlowSortDirection((value) => (value === "asc" ? "desc" : "asc"))
                    }
                  />
                </div>
                <div className="max-h-[min(42vh,480px)] overflow-auto">
                  <table className="min-w-[900px] w-full border-collapse text-xs">
                    <colgroup>
                      <col className="w-20" />
                      <col className="w-28" />
                      <col className="min-w-40 max-w-64" />
                      <col className="w-28" />
                      <col className="w-28" />
                      <col className="min-w-40 max-w-64" />
                      <col className="min-w-40 max-w-64" />
                    </colgroup>
                    <tbody>
                      <tr className="bg-blue-50 font-semibold text-blue-900">
                        <td colSpan={7} className="px-1 py-2">
                          Thống kê phiếu chi khác
                        </td>
                      </tr>
                      <tr className="bg-slate-100 text-left text-slate-600">
                        <td className="border-b px-1 py-2 text-xs uppercase font-semibold">Giờ</td>
                        <td className="border-b px-1 py-2 text-xs uppercase font-semibold">
                          Mã chứng từ
                        </td>
                        <td className="border-b px-1 py-2 text-xs uppercase font-semibold">
                          Danh mục chi phí
                        </td>
                        <td className="border-b px-1 py-2 text-right text-xs uppercase font-semibold">
                          Tiền mặt
                        </td>
                        <td className="border-b px-1 py-2 text-right text-xs uppercase font-semibold">
                          Chuyển khoản
                        </td>
                        <td className="border-b px-1 py-2 text-xs uppercase font-semibold">
                          Ghi chú
                        </td>
                        <td className="border-b px-1 py-2 text-xs uppercase font-semibold">
                          Tài khoản nhận
                        </td>
                      </tr>
                      {sortedExpenses.map((row) => renderIncomeExpenseRow(row, "expense"))}
                      {!sortedExpenses.length && (
                        <tr>
                          <td colSpan={7} className="px-1 py-2 text-center text-slate-400">
                            Không có phiếu chi khác
                          </td>
                        </tr>
                      )}
                      <tr className="bg-slate-50 font-semibold">
                        <td colSpan={3} className="border-t px-1 py-2">
                          Tổng chi khác
                        </td>
                        <td className="border-t px-1 py-2 text-right">
                          {formatMoney(summary?.expenseCashAmount || 0)}
                        </td>
                        <td className="border-t px-1 py-2 text-right">
                          {formatMoney(summary?.expenseBankAmount || 0)}
                        </td>
                        <td colSpan={2} className="border-t px-1 py-2 text-right">
                          {formatMoney(summary?.expenseTotalAmount || 0)}
                        </td>
                      </tr>
                      <tr className="bg-blue-50 font-semibold text-blue-900">
                        <td colSpan={7} className="px-1 py-2">
                          Thống kê phiếu thu công nợ
                        </td>
                      </tr>
                      <tr className="bg-slate-100 text-left text-slate-600">
                        <td className="border-b px-1 py-2 text-xs uppercase font-semibold">Giờ</td>
                        <td className="border-b px-1 py-2 text-xs uppercase font-semibold">
                          Mã chứng từ
                        </td>
                        <td className="border-b px-1 py-2 text-xs uppercase font-semibold">
                          Tên khách
                        </td>
                        <td className="border-b px-1 py-2 text-right text-xs uppercase font-semibold">
                          Tiền mặt
                        </td>
                        <td className="border-b px-1 py-2 text-right text-xs uppercase font-semibold">
                          Chuyển khoản
                        </td>
                        <td className="border-b px-1 py-2 text-xs uppercase font-semibold">
                          Ghi chú
                        </td>
                        <td className="border-b px-1 py-2 text-xs uppercase font-semibold">
                          Tài khoản nhận
                        </td>
                      </tr>
                      {sortedDebtIncome.map((row) => renderIncomeExpenseRow(row, "debt"))}
                      {!sortedDebtIncome.length && (
                        <tr>
                          <td colSpan={7} className="px-1 py-2 text-center text-slate-400">
                            Không có phiếu thu công nợ
                          </td>
                        </tr>
                      )}
                      <tr className="bg-slate-50 font-semibold">
                        <td colSpan={3} className="border-t px-1 py-2">
                          Tổng thu công nợ
                        </td>
                        <td className="border-t px-1 py-2 text-right">
                          {formatMoney(summary?.debtIncomeCashAmount || 0)}
                        </td>
                        <td className="border-t px-1 py-2 text-right">
                          {formatMoney(summary?.debtIncomeBankAmount || 0)}
                        </td>
                        <td colSpan={2} className="border-t px-1 py-2 text-right">
                          {formatMoney(summary?.debtIncomeTotalAmount || 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          <section className="flex min-h-[600px] min-w-0 flex-col overflow-hidden border-slate-200 2xl:min-h-0 2xl:border-l 2xl:pl-3">
            <div className="mb-2 flex shrink-0 items-center justify-between gap-2 px-1">
              <div>
                <h3 className="font-semibold text-slate-800">Quản lý ghi chú chuyển khoản</h3>
                <p className="text-xs text-slate-500">Theo dõi đối soát theo từng tài khoản nhận</p>
              </div>
              <Tag color="purple">{report?.transferNoteSnapshots?.length || 0} ghi chú</Tag>
            </div>

            <div className="mb-2 shrink-0 border-b border-slate-200 pb-2">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                Tổng chuyển khoản hợp lệ
              </div>
              <div className="max-h-28 overflow-auto">
                <table className="w-full border-collapse text-xs">
                  <tbody>
                    {transferAccountSummary.map((item) => (
                      <tr key={item.fundId} className="border-b border-slate-100">
                        <td className="px-1 py-1">Cá nhân · {item.fundSnapshot?.name || "—"}</td>
                        <td className="px-1 py-1 text-right font-medium">
                          {formatMoney(item.amount)}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-semibold">
                      <td className="px-1 py-1">Công ty</td>
                      <td className="px-1 py-1 text-right">{formatMoney(transferCompanyAmount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="min-h-0 flex-1">
              <DailyTransferNote
                onClickReferenceCode={handleReferenceCodeClick}
                onChanged={loadReport}
              />
            </div>
          </section>
        </div>
      </div>

      <Modal
        open={Boolean(paymentDetailRow)}
        title={
          paymentDetailRow ? `Chi tiết thanh toán ${paymentDetailRow.code}` : "Chi tiết thanh toán"
        }
        footer={null}
        onCancel={() => setPaymentDetailRow(null)}
        width={360}
      >
        {paymentDetailRow && paymentDetailContent(paymentDetailRow)}
      </Modal>
    </Modal>
  );
};
