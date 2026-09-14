import React from "react";
import { Button, Card, Switch, Tooltip } from "antd";
import {
  BanknotesIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { DropdownAction } from "@/shared/components";
import { formatMoney } from "@/shared/utils/number.util";
import { Fund, FundType } from "../fund.model";

interface FundCardProps {
  showBalance?: boolean;
  item: Fund;
  selected?: boolean;
  onClick?: (item: Fund) => void;
  onEdit?: (item: Fund) => void;
  onDelete?: (item: Fund) => void;
  onChangeScope?: (item: Fund) => void;
  onSetActive?: (item: Fund, isActive: boolean) => void;
}

export const FundCard: React.FC<FundCardProps> = ({
  item,
  selected,
  onClick,
  onEdit,
  onDelete,
  onChangeScope,
  onSetActive,
}) => {
  const isBank = item.type === FundType.BANK;
  const isLocked = Boolean(item.isDefault);
  const Icon = isBank ? CreditCardIcon : BanknotesIcon;
  const scopeLabel = item.storeId ? item.store?.name || "Cửa hàng" : "Tài khoản dùng chung";
  const accountLabel = item.isPersonal ? "Cá nhân" : "Công ty";
  const activeLabel = item.isActive ? "Đang hoạt động" : "Đã khóa";

  return (
    <Card
      size="small"
      onClick={() => onClick?.(item)}
      className={`group h-full cursor-pointer rounded-lg border transition-all hover:border-primary hover:shadow-md ${
        selected ? "border-primary bg-primary/5" : "bg-white dark:bg-neutral-900"
      }`}
      styles={{ body: { padding: 12 } }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white ${
              isBank ? "bg-blue-600" : "bg-emerald-600"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2 font-medium text-gray-800 dark:text-gray-200">
              <span className="shrink-0 font-mono">{item.code}</span>
              {isBank && (
                <span className="min-w-0 border-l border-slate-300 px-2 text-gray-700 dark:border-neutral-600 dark:text-gray-200">
                  {item.bank || "Chưa cập nhật"}
                </span>
              )}
              {item.isDefault && (
                <Tooltip title="Quỹ mặc định">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400">
                    <StarIcon className="h-3.5 w-3.5 text-white" />
                  </span>
                </Tooltip>
              )}
            </div>
            <h3 className="mt-1 truncate text-base font-semibold text-gray-900 dark:text-gray-100">
              {item.name}
            </h3>
            <div className="mt-1 flex flex-wrap gap-1 text-xs">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {scopeLabel}
              </span>
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                {accountLabel}
              </span>
            </div>
          </div>
        </div>

        <div
          className="flex shrink-0 items-center gap-1"
          onClick={(event) => event.stopPropagation()}
        >
          <Tooltip title={activeLabel}>
            <Switch
              size="small"
              checked={item.isActive}
              disabled={!onSetActive || isLocked}
              onChange={(checked) => onSetActive?.(item, checked)}
            />
          </Tooltip>
          {isBank && onChangeScope && !isLocked && (
            <Tooltip title="Thay đổi phạm vi sử dụng">
              <Button
                type="text"
                size="small"
                aria-label="Thay đổi phạm vi sử dụng"
                icon={<BuildingStorefrontIcon className="h-4 w-4" />}
                onClick={() => onChangeScope(item)}
              />
            </Tooltip>
          )}
          <DropdownAction
            type="horizontal"
            size="small"
            onEdit={onEdit && !isLocked ? () => onEdit(item) : undefined}
            onDelete={onDelete && !isLocked ? () => onDelete(item) : undefined}
          />
        </div>
      </div>

      <div className="mt-3 space-y-2 rounded-lg bg-gray-50 p-3 dark:bg-neutral-800/70">
        {isBank && (
          <div className="flex items-center flex-wrap overflow-hidden border-b border-gray-200 pb-2 dark:border-neutral-700">
            <span className="min-w-0 pr-2 text-gray-700 dark:text-gray-200">
              {item.accountHolderName || "Chưa cập nhật"}
            </span>
            <span className="min-w-0 border-l border-slate-300 px-2 font-mono text-gray-700 dark:border-neutral-600 dark:text-gray-200">
              {item.accountNumber || "Chưa cập nhật"}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Số dư hiện tại</span>
          <span className="font-semibold text-gray-900 dark:border-neutral-600 dark:text-gray-100">
            {formatMoney(item.currentBalance) || "0"}
          </span>
        </div>
      </div>
    </Card>
  );
};

export const FundCardLite: React.FC<FundCardProps> = ({ showBalance, item, selected, onClick }) => {
  const isBank = item.type === FundType.BANK;

  const bankInfo = isBank
    ? [item.accountNumber, item.bank, item.accountHolderName, item.branch]
        .filter(Boolean)
        .join(" · ")
    : item.code;

  return (
    <Card
      size="small"
      onClick={() => onClick?.(item)}
      className={`min-w-[120px] shrink-0 snap-start cursor-pointer rounded-lg border transition-all hover:border-primary hover:shadow-sm ${
        selected ? "border-primary bg-primary/5" : "bg-white dark:bg-neutral-900"
      }`}
      styles={{ body: { padding: 9 } }}
    >
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
            {/* <span className="shrink-0 font-mono text-primary">{item.code}</span> */}
            <span>{item.name}</span>
          </div>
          <div className="mt-1 truncate text-xs text-slate-500 max-w-40" title={bankInfo}>
            {bankInfo}
          </div>
        </div>
        {!!showBalance && (
          <div className="shrink-0 text-right text-xs">
            <div className="text-slate-500">Số dư</div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {formatMoney(item.currentBalance) || "0"}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
