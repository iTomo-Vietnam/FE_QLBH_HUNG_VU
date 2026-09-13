import { FunnelIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { RangerItemPanel } from "./RangerItemPanel";
import { SearchItemPanel } from "./SearchPanel";
import { SortSelect } from "./SortSelect";
import {
  FilterKey,
  Ranger,
  RangerItem,
  Search,
  SearchItem,
  SortItem,
  SortValue,
} from "@/shared/interfaces/common";
import type { StatusItem } from "./filter.types";
import React from "react";
import { FilterPanel } from "./FilterPanel";
import { ProvinceSelect, WardSelect } from "../select/AddressSelect";
import { useAddressSelector } from "@/shared/hooks/useAddressSelector";
import { GenericFilter } from "./FilterPanel/GenericFilter";
import { Store, StoreUncontrolledMultipleSelect } from "@/modules/store";
import { StoreImage } from "../image";
import { getMainFile } from "@/shared/utils";

export interface EnumFilterItem {
  key: string;
  label: string;
  count?: number;
}

export interface EnumFilterConfig {
  label: string;
  items: EnumFilterItem[];
  value: string[];
  onChange: (values: string[]) => void;
  multiple?: boolean;
}

export interface AddressFilterConfig {
  states: string[];
  wards: string[];
  onStatesChange: (values: string[]) => void;
  onWardsChange: (values: string[]) => void;
}

const AddressFilter: React.FC<AddressFilterConfig> = ({
  states,
  wards,
  onStatesChange,
  onWardsChange,
}) => {
  const selectedState = states[0];
  const { provinceOptions, wardOptions } = useAddressSelector(selectedState);

  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-500">Tỉnh/TP</span>
        <ProvinceSelect
          value={selectedState}
          options={provinceOptions}
          onChange={(value) => {
            onStatesChange(value ? [value] : []);
            onWardsChange([]);
          }}
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-500">Phường/Xã</span>
        <WardSelect
          value={wards[0]}
          options={wardOptions}
          disabled={!selectedState}
          onChange={(value) => onWardsChange(value ? [value] : [])}
        />
      </div>
    </div>
  );
};

export interface PanelFilterProps {
  filterActive?: boolean;

  storeIds?: string[];
  availableStores?: Store[];
  onStoreIdsChange?: (storeIds: string[]) => void;

  className?: string;
  style?: React.CSSProperties;
  status?: string;
  statusItems?: StatusItem[];
  onChangeStatus?: (status: string) => void;
  sortItems?: SortItem[];
  sortValue?: SortValue;
  onSortChange?: (value: SortValue) => void;
  rangerItems?: RangerItem[];
  rangerValue?: Ranger;
  onRangerChange?: (value: Ranger) => void;
  filterUses?: FilterKey[];
  filterLabels?: { [key in FilterKey]?: string };
  searchItems?: SearchItem[];
  searchValue?: Search;
  onSearchChange?: (value: Search) => void;
  filterContent?: React.ReactNode;
  enumFilters?: EnumFilterConfig[];
  addressFilter?: AddressFilterConfig;
  onClearFilter?: () => void;
}

export const PanelFilter: React.FC<PanelFilterProps> = ({
  filterActive,

  storeIds,
  availableStores,
  onStoreIdsChange,

  className = "",
  style,
  status,
  statusItems = [],
  onChangeStatus,
  sortItems = [],
  sortValue,
  onSortChange,
  rangerItems = [],
  rangerValue,
  onRangerChange,
  searchItems = [],
  searchValue,
  onSearchChange,

  filterLabels,
  filterUses = [],

  filterContent,
  enumFilters = [],
  addressFilter,
  onClearFilter,
}) => {
  const filterStore = availableStores?.filter((store) => storeIds?.includes(store.id)) || [];
  return (
    <aside
      className={`flex h-full w-64 shrink-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white ${className}`}
      style={style}
      aria-label="Bộ lọc"
    >
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-gray-200 px-4">
        <div className="flex items-center gap-2 font-semibold text-gray-800">
          <FunnelIcon className="h-4 w-4" />
          Bộ lọc
        </div>
        {filterActive && onClearFilter && (
          <button type="button" className="text-xs text-green-700" onClick={onClearFilter}>
            Đặt lại
          </button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {!!onStoreIdsChange && (
          <div className="flex flex-col w-full h-fit gap-4 border-b border-gray-100">
            <div className="flex flex-col w-full gap-2 p-4 pt-2">
              <span className="font-semibold text-xs uppercase tracking-wide text-gray-500">
                Cửa hàng
              </span>
              <GenericFilter<Store>
                data={filterStore}
                selectComponent={
                  <StoreUncontrolledMultipleSelect
                    value={storeIds}
                    options={availableStores}
                    prefix={<MagnifyingGlassIcon className="h-4" />}
                    suffixIcon={null}
                    placeholder="Tìm kiếm cửa hàng..."
                    onChange={onStoreIdsChange}
                  />
                }
                renderItem={(item) => (
                  <div className="flex items-center gap-1 w-[calc(100%-36px)] py-1">
                    <StoreImage image={getMainFile(item.logo)} size={28} />
                    <div className="flex min-w-0 flex-col w-[calc(100%-36px)]">
                      <span className="truncate leading-4">{item.name}</span>
                      <span className="truncate text-xs text-[#909090]">{item.code}</span>
                    </div>
                  </div>
                )}
                onRemove={(id) =>
                  onStoreIdsChange(
                    filterStore.filter((item) => item.id !== id).map((item) => item.id),
                  )
                }
              />
            </div>
          </div>
        )}
        {searchItems.length > 0 && (
          <section>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Tìm kiếm
            </div>
            <SearchItemPanel
              searchItems={searchItems}
              value={searchValue}
              onChange={onSearchChange}
            />
          </section>
        )}
        {statusItems.length > 0 && (
          <section className="border-b border-gray-100 pt-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Trạng thái
            </div>
            <div className="space-y-1">
              {statusItems.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onChangeStatus?.(item.value)}
                  className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm ${
                    status === item.value
                      ? "bg-green-50 font-medium text-green-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </span>
                  {item.total !== undefined && <span>{item.total}</span>}
                </button>
              ))}
            </div>
          </section>
        )}

        {sortItems.length > 0 && (
          <div className="flex flex-col w-full h-fit gap-4 border-b border-gray-100">
            <SortSelect
              size="small"
              sortItems={sortItems}
              value={sortValue}
              onChange={onSortChange}
            />
          </div>
        )}
        {rangerItems.length > 0 && (
          <div className="flex flex-col w-full h-fit gap-4 p-4 pt-2 border-b border-gray-100">
            <div className="flex flex-col w-full !justify-between gap-2">
              <span className="font-semibold text-xs uppercase tracking-wide text-gray-500">
                Lọc trong khoảng
              </span>

              <RangerItemPanel
                rangerItems={rangerItems}
                value={rangerValue}
                onChange={onRangerChange}
                defaultOpenAll
              />
            </div>
          </div>
        )}

        {enumFilters.map((config) => {
          const hasSelection = config.value.length > 0;
          return (
            <section key={config.label} className="border-b border-gray-100 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {config.label}
                </span>
                {hasSelection && (
                  <button
                    type="button"
                    className="text-xs text-primary hover:text-primary/80"
                    onClick={() => config.onChange([])}
                  >
                    Bỏ lọc
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {config.items.map((item) => {
                  const isSelected = config.value.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        if (config.multiple === false) {
                          config.onChange(isSelected ? [] : [item.key]);
                          return;
                        }

                        config.onChange(
                          isSelected
                            ? config.value.filter((key) => key !== item.key)
                            : [...config.value, item.key],
                        );
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 text-gray-600 hover:border-blue-400 hover:text-primary"
                      }`}
                    >
                      {item.label}
                      {item.count !== undefined && ` (${item.count})`}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        {filterContent && (
          <section className="border-b border-gray-100 pt-3">{filterContent}</section>
        )}

        {(filterUses.length > 0 || addressFilter) && (
          <div className="flex flex-col w-full h-fit gap-4 p-4 pt-2 border-b border-gray-100">
            <div className="flex flex-col w-full !justify-between gap-2">
              <span className="font-semibold text-xs uppercase tracking-wide text-gray-500">
                Lọc theo
              </span>

              {addressFilter && <AddressFilter {...addressFilter} />}

              {filterUses.length > 0 && (
                <FilterPanel filterUses={filterUses} filterLabels={filterLabels} />
              )}
            </div>
          </div>
        )}
      </div>
      {filterActive && onClearFilter && (
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-3 py-2 text-xs text-gray-500">
          <span>Đang áp dụng bộ lọc</span>
          <button type="button" onClick={onClearFilter} className="text-red-600">
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </aside>
  );
};
