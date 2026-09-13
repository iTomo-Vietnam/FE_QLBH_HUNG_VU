import React from "react";
import { StoreUncontrolledMultipleSelect } from "@/modules/store/components";
import { Store } from "@/shared/base/entity";
import { AnalysisPeriod } from "../analysis.model";
import { AnalysisPeriodPicker } from "./AnalysisPeriodPicker";

export interface AnalysisFilterProps {
  period: AnalysisPeriod;
  onPeriodChange: (value: AnalysisPeriod) => void;
  systemWide: boolean;
  storeIds?: string[];
  availableStores?: Store[];
  onStoresChange?: (value: string[]) => void;
}

export const AnalysisToolbar: React.FC<AnalysisFilterProps> = ({
  period,
  onPeriodChange,
  systemWide,
  storeIds,
  availableStores = [],
  onStoresChange,
}) => (
  <div className="flex items-center justify-end gap-2">
    <AnalysisPeriodPicker value={period} onChange={onPeriodChange} />
    {systemWide && (
      <StoreUncontrolledMultipleSelect
        value={storeIds}
        options={availableStores}
        onChange={onStoresChange}
        placeholder="Tất cả chi nhánh"
        className="min-w-[220px]"
        maxTagCount="responsive"
      />
    )}
  </div>
);

export const AnalysisViewHeader: React.FC<AnalysisFilterProps & { title: string }> = ({
  title,
  ...filters
}) => (
  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
    <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
    <AnalysisToolbar {...filters} />
  </div>
);
