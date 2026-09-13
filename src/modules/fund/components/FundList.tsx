import React from "react";
import { Empty, Spin } from "antd";
import { Fund } from "../fund.model";
import { FundCard } from "./FundCard";

interface FundListProps {
  dataSource: Fund[];
  loading?: boolean;
  onClick?: (item: Fund) => void;
  onEdit?: (item: Fund) => void;
  onDelete?: (item: Fund) => void;
  onChangeScope?: (item: Fund) => void;
  onSetActive?: (item: Fund, isActive: boolean) => void;
}

export const FundList: React.FC<FundListProps> = ({ dataSource, loading, ...actions }) => {
  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!dataSource.length) {
    return <Empty className="py-16" description="Chưa có quỹ" />;
  }

  const areasByStore = dataSource.reduce<Record<string, { store: Fund["store"]; items: Fund[] }>>(
    (groups, item) => {
      const key = item.store?.id || "global";
      if (!groups[key]) groups[key] = { store: item.store, items: [] };
      groups[key].items.push(item);
      return groups;
    },
    {},
  );

  const groups = Object.values(areasByStore).sort((first, second) => {
    if (!first.store) return -1;
    if (!second.store) return 1;
    return first.store.name.localeCompare(second.store.name, "vi");
  });

  return (
    <div className="max-w-6xl mx-auto w-full flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.store?.id || "global"}>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-slate-200">
            <span>{group.store ? `Cửa hàng ${group.store.name}` : "Toàn hệ thống"}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {group.items.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {group.items.map((item) => (
              <FundCard key={item.id} item={item} {...actions} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

