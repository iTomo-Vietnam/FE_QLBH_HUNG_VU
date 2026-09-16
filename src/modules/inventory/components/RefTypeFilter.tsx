import React from "react";
import { InventoryTransactionRefType, inventoryTransactionRefTypeMap } from "../inventory.model";

interface Props {
  refType?: InventoryTransactionRefType | null;
  setRefType?: (value?: InventoryTransactionRefType) => void;
}

export const RefTypeFilter: React.FC<Props> = ({ refType, setRefType }) => {
  const refTypes = Object.values(InventoryTransactionRefType);

  const renderCard = (value: InventoryTransactionRefType) => {
    const isSelected = refType === value;
    return (
      <div
        key={value}
        onClick={() => setRefType?.(isSelected ? undefined : value)}
        className={`relative cursor-pointer rounded-lg px-1.5 border-2 transition-all ${
          isSelected
            ? "border-primary bg-primary/10 dark:bg-blue-950/30"
            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-primary/30"
        }`}
      >
        <div className="flex items-center gap-2.5 h-7">
          {/* Icon */}
          <div
            className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 bg-green-100 dark:bg-green-950/30`}
          >
            <svg
              className="w-3 h-3 text-green-600 dark:text-green-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm text-slate-800 dark:text-slate-100 truncate">
                {inventoryTransactionRefTypeMap[value]}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    // <div className="flex overflow-x-auto min-w-0">
    <div className="flex gap-2 flex-wrap">{refTypes.map((value) => renderCard(value))}</div>
    // </div>
  );
};
