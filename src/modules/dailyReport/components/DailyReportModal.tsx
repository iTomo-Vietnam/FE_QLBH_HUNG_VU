import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { App, Button, Input, Modal, Select, Table, Tag } from "antd";
import { ArrowPathIcon, PlusIcon } from "@heroicons/react/24/outline";
import { formatDateTimeDDMMYYYY } from "@/shared/utils/date.util";
import { formatMoney } from "@/shared/utils/number.util";
import { FundType } from "@/modules/fund/fund.model";
import { useDailyReportStore } from "../dailyReport.store";
import {
  DailyIncomeExpenseSnapshot,
  DailyOrderSnapshot,
  DailyReport,
  DailyTransferNoteSnapshot,
} from "../dailyReport.model";
import { TransferNoteAddUpdateModal } from "@/modules/transferNote/components";
import { useTransferNoteStore } from "@/modules/transferNote/transferNote.store";
import { TransferNoteStatus } from "@/modules/transferNote/transferNote.model";

interface Props {
  open: boolean;
  onClose: () => void;
}

const shortTime = (value: string | Date) => {
  const parts = formatDateTimeDDMMYYYY(value).split(" ");
  return parts[parts.length - 1] || "—";
};

const paymentLabel: Record<string, string> = {
  DEBT: "Nợ",
  CASH: "TM",
  BANK: "CK",
  COMBINED: "TM/CK",
};

const fundAmount = (row: DailyIncomeExpenseSnapshot, type: "cash" | "bank") =>
  row.fundSnapshot?.type === type ? formatMoney(row.amount) : "";

type TransferDisplayRow = DailyTransferNoteSnapshot & {
  sourceItems?: DailyTransferNoteSnapshot[];
};

const buildTransferRows = (items: DailyTransferNoteSnapshot[]): TransferDisplayRow[] => {
  const personal = items.filter((item) => item.fundSnapshot?.isPersonal !== false);
  const company = items.filter((item) => item.fundSnapshot?.isPersonal === false);
  const rows: TransferDisplayRow[] = [...personal];

  if (company.length) {
    rows.push({
      id: "company-total",
      occurredAt: company[0].occurredAt,
      referenceCode: "CHUYỂN KHOẢN CÔNG TY",
      creatorId: null,
      creatorSnapshot: null,
      fundId: "",
      fundSnapshot: {
        id: "company-total",
        code: "COMPANY",
        name: "Chuyển khoản công ty",
        type: FundType.BANK,
        isPersonal: false,
      },
      amount: company.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      status: company.every((item) => item.status === TransferNoteStatus.VALID)
        ? TransferNoteStatus.VALID
        : TransferNoteStatus.INVALID,
      invalidReason: null,
      note: null,
      sourceItems: company,
    });
  }

  return rows;
};

export const DailyReportModal: React.FC<Props> = ({ open, onClose }) => {
  const { message } = App.useApp();
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [transferNoteOpen, setTransferNoteOpen] = useState(false);
  const [transferKeyword, setTransferKeyword] = useState("");
  const [transferFundIds, setTransferFundIds] = useState<string[]>([]);
  const [transferCreatorIds, setTransferCreatorIds] = useState<string[]>([]);
  const dailyStore = useDailyReportStore({ page: 1, size: 1, isLocked: true });
  const transferStore = useTransferNoteStore({ page: 1, size: 1000, isLocked: true });
  const getCurrentRef = useRef(dailyStore.getCurrent);
  const canRead = Boolean(dailyStore.getCurrent);

  useEffect(() => {
    getCurrentRef.current = dailyStore.getCurrent;
  }, [dailyStore.getCurrent]);

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

  const orderColumns = useMemo(
    () => [
      {
        title: "Giờ",
        key: "time",
        width: 70,
        render: (_: unknown, row: DailyOrderSnapshot) => shortTime(row.occurredAt),
      },
      { title: "Mã chứng từ", dataIndex: "code", key: "code", width: 140 },
      { title: "Khách hàng", dataIndex: "partnerName", key: "partnerName", width: 190 },
      {
        title: "Hình thức",
        key: "paymentMethod",
        width: 85,
        align: "center" as const,
        render: (_: unknown, row: DailyOrderSnapshot) => paymentLabel[row.paymentMethod],
      },
      {
        title: "Tổng tiền hàng",
        dataIndex: "totalAmount",
        key: "totalAmount",
        width: 135,
        align: "right" as const,
        render: (value: number) => formatMoney(value),
      },
      {
        title: "Thực thu",
        dataIndex: "paidAmount",
        key: "paidAmount",
        width: 135,
        align: "right" as const,
        render: (value: number) => formatMoney(value),
      },
      {
        title: "Ghi nợ",
        dataIndex: "debtAmount",
        key: "debtAmount",
        width: 135,
        align: "right" as const,
        render: (value: number) => (value ? formatMoney(value) : ""),
      },
    ],
    [],
  );

  const expenseColumns = useMemo(
    () => [
      {
        title: "Giờ",
        key: "time",
        width: 65,
        render: (_: unknown, row: DailyIncomeExpenseSnapshot) => shortTime(row.occurredAt),
      },
      { title: "Mã chứng từ", dataIndex: "code", key: "code", width: 135 },
      {
        title: "Danh mục chi phí",
        key: "category",
        width: 190,
        render: (_: unknown, row: DailyIncomeExpenseSnapshot) =>
          row.categoryName || row.description || "—",
      },
      {
        title: "Tiền mặt",
        key: "cash",
        width: 120,
        align: "right" as const,
        render: (_: unknown, row: DailyIncomeExpenseSnapshot) => fundAmount(row, "cash"),
      },
      {
        title: "Chuyển khoản",
        key: "bank",
        width: 120,
        align: "right" as const,
        render: (_: unknown, row: DailyIncomeExpenseSnapshot) => fundAmount(row, "bank"),
      },
      {
        title: "Ghi chú",
        key: "note",
        width: 180,
        render: (_: unknown, row: DailyIncomeExpenseSnapshot) => row.note || row.description || "—",
      },
      {
        title: "Tài khoản nhận",
        key: "fund",
        width: 170,
        render: (_: unknown, row: DailyIncomeExpenseSnapshot) => row.fundSnapshot?.name || "—",
      },
    ],
    [],
  );

  const debtColumns = useMemo(
    () => [
      {
        title: "Giờ",
        key: "time",
        width: 65,
        render: (_: unknown, row: DailyIncomeExpenseSnapshot) => shortTime(row.occurredAt),
      },
      { title: "Mã chứng từ", dataIndex: "code", key: "code", width: 135 },
      { title: "Tên khách", dataIndex: "partnerName", key: "partnerName", width: 190 },
      {
        title: "Tiền mặt",
        key: "cash",
        width: 120,
        align: "right" as const,
        render: (_: unknown, row: DailyIncomeExpenseSnapshot) => fundAmount(row, "cash"),
      },
      {
        title: "Chuyển khoản",
        key: "bank",
        width: 120,
        align: "right" as const,
        render: (_: unknown, row: DailyIncomeExpenseSnapshot) => fundAmount(row, "bank"),
      },
      {
        title: "Ghi chú",
        key: "note",
        width: 180,
        render: (_: unknown, row: DailyIncomeExpenseSnapshot) =>
          row.note || row.description || "Thu nợ",
      },
      {
        title: "Tài khoản nhận",
        key: "fund",
        width: 170,
        render: (_: unknown, row: DailyIncomeExpenseSnapshot) => row.fundSnapshot?.name || "—",
      },
    ],
    [],
  );

  const transferItems = report?.transferNoteSnapshots || [];
  const transferFundOptions = useMemo(
    () => Array.from(new Map(
      transferItems
        .filter((item) => item.fundSnapshot)
        .map((item) => [item.fundId, { value: item.fundId, label: item.fundSnapshot?.name || item.fundId }]),
    ).values()),
    [transferItems],
  );
  const transferCreatorOptions = useMemo(
    () => Array.from(new Map(
      transferItems
        .filter((item) => item.creatorId)
        .map((item) => [item.creatorId, { value: item.creatorId as string, label: item.creatorSnapshot?.name || item.creatorId as string }]),
    ).values()),
    [transferItems],
  );
  const transferRows = useMemo(() => {
    const keyword = transferKeyword.trim().toLowerCase();
    const filtered = transferItems.filter((item) => {
      const matchesKeyword = !keyword || [
        item.referenceCode,
        item.note,
        item.fundSnapshot?.name,
        item.creatorSnapshot?.name,
      ].some((value) => String(value || "").toLowerCase().includes(keyword));
      const matchesFund = !transferFundIds.length || transferFundIds.includes(item.fundId);
      const matchesCreator = !transferCreatorIds.length || (!!item.creatorId && transferCreatorIds.includes(item.creatorId));
      return matchesKeyword && matchesFund && matchesCreator;
    });
    return buildTransferRows(filtered);
  }, [transferCreatorIds, transferFundIds, transferItems, transferKeyword]);

  const transferColumns = useMemo(
    () => [
      {
        title: "Giờ",
        key: "time",
        width: 70,
        render: (_: unknown, row: TransferDisplayRow) => row.id === "company-total" ? "" : shortTime(row.occurredAt),
      },
      { title: "Số phiếu đối soát", dataIndex: "referenceCode", key: "referenceCode", width: 155 },
      {
        title: "STK nhận",
        key: "fund",
        width: 180,
        render: (_: unknown, row: TransferDisplayRow) => row.fundSnapshot?.name || "—",
      },
      { title: "Ghi chú", dataIndex: "note", key: "note", width: 170 },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 105,
        render: (value: string) => (
          <Tag color={value === "valid" ? "success" : "error"}>
            {value === "valid" ? "Hợp lệ" : "Không hợp lệ"}
          </Tag>
        ),
      },
      {
        title: "Thống kê",
        dataIndex: "amount",
        key: "amount",
        width: 125,
        align: "right" as const,
        render: (value: number) => formatMoney(value),
      },
      {
        title: "Người tạo",
        key: "creator",
        width: 150,
        render: (_: unknown, row: TransferDisplayRow) => row.creatorSnapshot?.name || "—",
      },
    ],
    [],
  );

  const handleCreatedTransferNote = () => {
    setTransferNoteOpen(false);
    void loadReport();
  };

  const handleCapture = () => {
    dailyStore.create?.({}, { onSuccess: (data) => setReport(data || report) });
  };

  const summary = report?.summary;

  return (
    <>
      <Modal
        open={open}
        title="Báo cáo cuối ngày"
        onCancel={onClose}
        destroyOnClose
        maskClosable={false}
        centered
        width="100vw"
        className="fullscreen-modal"
        footer={null}
      >
        <div className="flex h-full min-h-0 gap-3">
          <section className="flex min-w-0 basis-[55%] flex-col overflow-hidden rounded border bg-white p-2">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">Thống kê hóa đơn</h3>
              <Tag color="blue">{summary?.orderCount || 0} hóa đơn</Tag>
            </div>
            <Table
              rowKey="id"
              size="small"
              loading={loading}
              dataSource={report?.orderSnapshots || []}
              columns={orderColumns}
              pagination={false}
              scroll={{ x: 900, y: "calc(100vh - 190px)" }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row className="font-semibold">
                    <Table.Summary.Cell index={0}>Tổng</Table.Summary.Cell>
                    <Table.Summary.Cell index={1} colSpan={3} />
                    <Table.Summary.Cell index={4} align="right">
                      {formatMoney(summary?.orderTotalAmount || 0)}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5} align="right">
                      {formatMoney(summary?.orderPaidAmount || 0)}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={6} align="right">
                      {formatMoney(summary?.orderDebtAmount || 0)}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </section>
          <section className="flex min-w-0 basis-[45%] flex-col gap-3 overflow-hidden">
            <div className="min-h-0 flex-[5] overflow-auto rounded border bg-white p-2">
              <h3 className="mb-2 font-semibold">Thống kê thu chi</h3>
              <h4 className="mb-1 text-sm font-medium">Chi khác</h4>
              <Table
                rowKey="id"
                size="small"
                dataSource={report?.expenseSnapshots || []}
                columns={expenseColumns}
                pagination={false}
                scroll={{ x: 980, y: 130 }}
                summary={() => (
                  <Table.Summary>
                    <Table.Summary.Row className="font-semibold">
                      <Table.Summary.Cell index={0}>Tổng</Table.Summary.Cell>
                      <Table.Summary.Cell index={1} colSpan={2} />
                      <Table.Summary.Cell index={3} align="right">
                        {formatMoney(summary?.expenseCashAmount || 0)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4} align="right">
                        {formatMoney(summary?.expenseBankAmount || 0)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5} colSpan={2} align="right">
                        {formatMoney(summary?.expenseTotalAmount || 0)}
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
              <h4 className="mb-1 mt-3 text-sm font-medium">Thu công nợ</h4>
              <Table
                rowKey="id"
                size="small"
                dataSource={report?.debtIncomeSnapshots || []}
                columns={debtColumns}
                pagination={false}
                scroll={{ x: 980, y: 130 }}
                summary={() => (
                  <Table.Summary>
                    <Table.Summary.Row className="font-semibold">
                      <Table.Summary.Cell index={0}>Tổng</Table.Summary.Cell>
                      <Table.Summary.Cell index={1} colSpan={2} />
                      <Table.Summary.Cell index={3} align="right">
                        {formatMoney(summary?.debtIncomeCashAmount || 0)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4} align="right">
                        {formatMoney(summary?.debtIncomeBankAmount || 0)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5} colSpan={2} align="right">
                        {formatMoney(summary?.debtIncomeTotalAmount || 0)}
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </div>
            <div className="min-h-0 flex-[5] overflow-hidden rounded border bg-white p-2">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">Thống kê chuyển khoản</h3>
                {transferStore.create && (
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusIcon className="h-4 w-4" />}
                    onClick={() => setTransferNoteOpen(true)}
                  >
                    Thêm mới
                  </Button>
                )}
              </div>
              <div className="mb-2 flex gap-2">
                <Input
                  allowClear
                  value={transferKeyword}
                  onChange={(event) => setTransferKeyword(event.target.value)}
                  placeholder="Tìm số phiếu, ghi chú..."
                />
                <Select
                  mode="multiple"
                  allowClear
                  value={transferFundIds}
                  onChange={setTransferFundIds}
                  options={transferFundOptions}
                  placeholder="Lọc STK"
                  className="min-w-40"
                />
                <Select
                  mode="multiple"
                  allowClear
                  value={transferCreatorIds}
                  onChange={setTransferCreatorIds}
                  options={transferCreatorOptions}
                  placeholder="Lọc người tạo"
                  className="min-w-40"
                />
              </div>
              <Table
                rowKey="id"
                size="small"
                dataSource={transferRows}
                loading={transferStore.loading}
                columns={transferColumns}
                pagination={false}
                scroll={{ x: 1050, y: 150 }}
              />
            </div>
          </section>
        </div>
      </Modal>
      <TransferNoteAddUpdateModal
        open={transferNoteOpen}
        errors={transferStore.errors}
        loading={transferStore.creating}
        onAdd={(data) => transferStore.create?.(data, { onSuccess: handleCreatedTransferNote })}
        onClose={() => setTransferNoteOpen(false)}
      />
    </>
  );
};
