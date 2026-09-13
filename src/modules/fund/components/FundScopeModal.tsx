import React, { useEffect, useState } from "react";
import { Button, Modal, Tag } from "antd";
import { BuildingStorefrontIcon, CheckIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { Store } from "@/shared/base/entity";
import { Fund } from "../fund.model";

const GLOBAL_SCOPE = "__all_stores__";

interface FundScopeModalProps {
  open: boolean;
  data?: Fund;
  stores: Store[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (storeId: string | null) => void;
}

export const FundScopeModal: React.FC<FundScopeModalProps> = ({
  open,
  data,
  stores,
  loading,
  onClose,
  onSubmit,
}) => {
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedStoreId(open ? data?.storeId || null : null);
  }, [data, open]);

  const handleSubmit = () => {
    onSubmit(selectedStoreId);
  };

  const scopeStores = stores.filter(
    (store, index, all) => all.findIndex((item) => item.id === store.id) === index,
  );

  const renderScopeCard = ({
    id,
    title,
    description,
    code,
    global = false,
  }: {
    id: string | null;
    title: string;
    description: string;
    code?: string;
    global?: boolean;
  }) => {
    const selected = selectedStoreId === id;

    return (
      <button
        key={id || GLOBAL_SCOPE}
        type="button"
        onClick={() => setSelectedStoreId(id)}
        className={`relative flex min-h-[116px] w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
          selected
            ? "border-primary bg-primary/5 shadow-sm"
            : "border-slate-200 bg-white hover:border-primary/50 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900"
        }`}
      >
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            global
              ? "bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300"
              : "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"
          }`}
        >
          {global ? (
            <GlobeAltIcon className="h-6 w-6" />
          ) : (
            <BuildingStorefrontIcon className="h-6 w-6" />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 pr-5">
            <span className="truncate font-semibold text-slate-800 dark:text-slate-100">
              {title}
            </span>
            {global && (
              <Tag color="purple" className="m-0 shrink-0">
                Chung
              </Tag>
            )}
          </span>
          <span className="mt-1 block truncate text-xs text-slate-500 dark:text-slate-400">
            {description}
          </span>
          {code && (
            <span className="mt-2 block font-mono text-xs text-slate-400 dark:text-slate-500">
              {code}
            </span>
          )}
        </span>

        {selected && (
          <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
            <CheckIcon className="h-3.5 w-3.5" />
          </span>
        )}
      </button>
    );
  };

  return (
    <Modal
      open={open}
      centered
      destroyOnClose
      maskClosable={false}
      title="Thay đổi phạm vi sử dụng"
      footer={null}
      onCancel={onClose}
      width={860}
    >
      <div className="mt-4">
        <div className="mb-3">
          <div className="font-medium text-slate-800 dark:text-slate-100">Cửa hàng hiệu lực</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Chọn nơi được phép sử dụng tài khoản ngân hàng này.
          </div>
        </div>

        <div className="grid max-h-[440px] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
          {renderScopeCard({
            id: null,
            title: "Toàn hệ thống",
            description: "Dùng chung cho tất cả cửa hàng",
            global: true,
          })}
          {scopeStores.map((store) =>
            renderScopeCard({
              id: store.id,
              title: store.name,
              description: "Chỉ dùng tại cửa hàng này",
              code: store.code,
            }),
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" loading={loading} onClick={handleSubmit}>
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </Modal>
  );
};

