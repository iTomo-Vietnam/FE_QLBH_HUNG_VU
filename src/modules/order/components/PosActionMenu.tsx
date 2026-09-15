import { App, Button, Drawer, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftStartOnRectangleIcon,
  ArrowUpTrayIcon,
  ArrowUturnLeftIcon,
  BanknotesIcon,
  Bars3Icon,
  ChartBarIcon,
  CommandLineIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";

import { IncomeExpenseAddUpdateModal } from "@/modules/incomeExpense/components/IncomeExpenseAddUpdateModal";
import { useIncomeExpenseStore } from "@/modules/incomeExpense/incomeExpense.store";
import { IncomeExpenseType } from "@/modules/incomeExpense/incomeExpense.model";
import { DailyReportModal } from "@/modules/dailyReport/components/DailyReportModal";
import { useDailyReportStore } from "@/modules/dailyReport/dailyReport.store";
import { TransferNoteAddUpdateModal } from "@/modules/transferNote/components";
import { useTransferNoteStore } from "@/modules/transferNote/transferNote.store";
import { FundType } from "@/modules/fund/fund.model";
import type { IncomeExpense } from "@/modules/incomeExpense/incomeExpense.model";
import { useAuth } from "@/shared/hooks/useAuth";
import { privateRoutesName, publicRoutesName } from "@/shared/constants/routerName";
import type { CachedOrder, PosOrderType } from "@/shared/stores/orderCache.slice";
import { OrderType } from "../order.model";

interface Props {
  type: PosOrderType;
  activeOrder?: CachedOrder;
  readOnlyReturn: boolean;
  onCreateReturn: () => void;
  onImportFile: (file: File) => void;
}

export const PosActionMenu = ({
  type,
  activeOrder,
  readOnlyReturn,
  onCreateReturn,
  onImportFile,
}: Props) => {
  const navigate = useNavigate();
  const { modal } = App.useApp();
  const { logout } = useAuth();
  const importFileRef = useRef<HTMLInputElement>(null);
  const [incomeExpenseOpen, setIncomeExpenseOpen] = useState(false);
  const [transferNoteOpen, setTransferNoteOpen] = useState(false);
  const [dailyReportOpen, setDailyReportOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const incomeStore = useIncomeExpenseStore(
    { isLocked: true, type: IncomeExpenseType.INCOME },
    () => setIncomeExpenseOpen(false),
  );
  const dailyReportStore = useDailyReportStore({ page: 1, size: 1, isLocked: true });
  const transferNoteStore = useTransferNoteStore(
    { isLocked: true },
    () => setTransferNoteOpen(false),
  );
  const isSaleReturn = type === OrderType.SALE_RETURN;

  const handleIncomeCreated = (created?: IncomeExpense) => {
    const isBank =
      created?.fund?.type === FundType.BANK || created?.fundSnapshot?.type === FundType.BANK;
    if (!isBank || !created?.code || !transferNoteStore.create) return;
    modal.success({
      centered: true,
      title: "Tạo phiếu thu thành công",
      content: (
        <span>
          Mã phiếu: <strong>{created.code}</strong>. Phiếu có thu chuyển khoản.
        </span>
      ),
      okText: "Ghi chú chuyển khoản",
      onOk: () => setTransferNoteOpen(true),
    });
  };

  const handleLogout = () => {
    modal.confirm({
      title: "Đăng xuất",
      content: "Xác nhận đăng xuất",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: () => {
        logout();
        localStorage.clear();
        sessionStorage.clear();
        window.setTimeout(() => navigate(publicRoutesName.login), 1000);
      },
    });
  };

  const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onImportFile(file);
  };

  const items: MenuProps["items"] = [
    {
      key: "end-of-day",
      label: "Báo cáo cuối ngày",
      disabled: !dailyReportStore.getCurrent,
      icon: <ChartBarIcon className="h-5 w-5" />,
      onClick: () => setDailyReportOpen(true),
    },
    {
      key: "return",
      label: "Trả hàng",
      icon: <ArrowUturnLeftIcon className="h-5 w-5" />,
      onClick: onCreateReturn,
    },
    ...(incomeStore.create
      ? [
          {
            key: "income",
            label: "Lập phiếu thu",
            icon: <BanknotesIcon className="h-5 w-5" />,
            onClick: () => setIncomeExpenseOpen(true),
          },
        ]
      : []),
    { type: "divider" as const },
    {
      key: "import",
      label: isSaleReturn ? "Nhập file hàng hoàn" : "Nhập file hàng bán",
      icon: <ArrowUpTrayIcon className="h-5 w-5" />,
      disabled: !activeOrder || readOnlyReturn,
      onClick: () => importFileRef.current?.click(),
    },
    {
      key: "shortcuts",
      label: "Phím tắt",
      icon: <CommandLineIcon className="h-5 w-5" />,
      onClick: () => setShortcutsOpen(true),
    },
    {
      key: "manage",
      label: "Quản lý",
      icon: <ComputerDesktopIcon className="h-5 w-5" />,
      onClick: () => navigate(privateRoutesName.sale),
    },
    {
      key: "logout",
      label: "Đăng xuất",
      danger: true,
      icon: <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />,
      onClick: handleLogout,
    },
  ];

  return (
    <>
      <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
        <Button
          type="text"
          className="!text-white hover:!bg-white/10 p-0 h-8 w-8 shrink-0"
          aria-label="Thao tác POS"
          title="Thao tác POS"
        >
          <Bars3Icon className="h-5 w-5" />
        </Button>
      </Dropdown>
      <input
        ref={importFileRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleImportFileChange}
      />
      <Drawer
        title="Phím tắt POS"
        placement="right"
        width={360}
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      >
        <div className="space-y-3">
          {[
            ["F3", isSaleReturn ? "Tìm hàng trả" : "Tìm hàng bán"],
            ...(isSaleReturn ? [["F7", "Tìm hàng đổi"]] : []),
            ["F4", "Tìm khách hàng"],
          ].map(([key, label]) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <span className="text-gray-600">{label}</span>
              <kbd className="rounded border border-gray-300 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-700">
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </Drawer>
      <IncomeExpenseAddUpdateModal
        open={incomeExpenseOpen}
        type={IncomeExpenseType.INCOME}
        errors={incomeStore.errors}
        loading={incomeStore.creating}
        onAdd={(data) => incomeStore.create?.(data, { onSuccess: handleIncomeCreated })}
        onClose={() => setIncomeExpenseOpen(false)}
      />
      <TransferNoteAddUpdateModal
        open={transferNoteOpen}
        errors={transferNoteStore.errors}
        loading={transferNoteStore.creating}
        onAdd={transferNoteStore.create}
        onClose={() => setTransferNoteOpen(false)}
      />
      <DailyReportModal open={dailyReportOpen} onClose={() => setDailyReportOpen(false)} />
    </>
  );
};
