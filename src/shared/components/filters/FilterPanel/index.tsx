import { CaretRightOutlined } from "@ant-design/icons";
import { Collapse, CollapseProps } from "antd";
import { useState } from "react";

import { useGlobalData } from "@/shared/hooks";
import { Filter, FilterKey } from "@/shared/interfaces";
import { AllPartnerFilter, CustomerFilter, ShipperFilter, SupplierFilter } from "./PartnerFilter";
import {
  ProductGroupFilter,
  CustomerGroupFilter,
  ShipperGroupFilter,
  SupplierGroupFilter,
  UnitFilter,
  BrandFilter,
  LocationFilter,
} from "./AttributeFilter";
import { FundFilter } from "./FundFilter";
import { OrderFilter } from "./OrderFilter";
import { ProductFilter } from "./ProductFilter";
import { RoleFilter } from "./RoleFilter";
import { StoreFilter } from "./StoreFilter";
import { UserFilter } from "./UserFilter";

export interface FilterPanelProps {
  filterUses: FilterKey[];
  filterLabels?: { [key in FilterKey]?: string };
  defaultOpenAll?: boolean;
}

type FilterDefinition = {
  defaultLabel: string;
  component: React.FC<any>;
};

const filterMap: Partial<Record<FilterKey, FilterDefinition>> = {
  creatorIds: { defaultLabel: "Người tạo", component: UserFilter },
  updaterIds: { defaultLabel: "Người cập nhật", component: UserFilter },
  completerIds: { defaultLabel: "Người hoàn thành", component: UserFilter },
  exporterIds: { defaultLabel: "Người xuất kho", component: UserFilter },
  importerIds: { defaultLabel: "Người nhập kho", component: UserFilter },
  userIds: { defaultLabel: "Người dùng", component: UserFilter },
  supplierIds: { defaultLabel: "Nhà cung cấp", component: SupplierFilter },
  customerIds: { defaultLabel: "Khách hàng", component: CustomerFilter },
  shipperIds: { defaultLabel: "Đơn vị vận chuyển", component: ShipperFilter },
  partnerIds: { defaultLabel: "Đối tác", component: AllPartnerFilter },
  customerGroupIds: { defaultLabel: "Nhóm khách hàng", component: CustomerGroupFilter },
  supplierGroupIds: { defaultLabel: "Nhóm nhà cung cấp", component: SupplierGroupFilter },
  shipperGroupIds: { defaultLabel: "Nhóm đơn vị vận chuyển", component: ShipperGroupFilter },
  fundIds: { defaultLabel: "Quỹ", component: FundFilter },
  unitIds: { defaultLabel: "Đơn vị tính", component: UnitFilter },
  orderIds: { defaultLabel: "Đơn hàng", component: OrderFilter },
  storeIds: { defaultLabel: "Cửa hàng", component: StoreFilter },
  roleIds: { defaultLabel: "Vai trò", component: RoleFilter },
  productIds: { defaultLabel: "Hàng hóa", component: ProductFilter },
  productGroupIds: { defaultLabel: "Nhóm hàng hóa", component: ProductGroupFilter },
  brandIds: { defaultLabel: "Thương hiệu", component: BrandFilter },
  locationIds: { defaultLabel: "Vị trí kho/kệ", component: LocationFilter },
};

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filterUses,
  filterLabels,
  defaultOpenAll,
}) => {
  const { currentStore, filter, handleSetFilter } = useGlobalData();
  const [activeKeys, setActiveKeys] = useState<FilterKey[]>(() =>
    defaultOpenAll ? filterUses : filterUses.filter((key) => (filter?.[key]?.length ?? 0) > 0),
  );

  const handleToggle = (keys: string[]) => {
    const nextActiveKeys = keys as FilterKey[];
    const closedKeys = filterUses.filter((key) => !nextActiveKeys.includes(key));

    if (closedKeys.length > 0) {
      const nextFilter: Filter = { ...filter };
      closedKeys.forEach((key) => delete nextFilter[key]);
      handleSetFilter(nextFilter);
    }

    setActiveKeys(nextActiveKeys);
  };

  const items: CollapseProps["items"] = filterUses.flatMap((key) => {
    const filterInfo = filterMap[key];
    const Component = filterInfo?.component;
    if (!filterInfo || !Component) return [];

    return [
      {
        key,
        label: (
          <div className="flex justify-between items-center" onClick={(e) => e.stopPropagation()}>
            <span
              onClick={() => {
                if (!activeKeys.includes(key)) {
                  setActiveKeys([...activeKeys, key]);
                } else {
                  handleToggle(activeKeys.filter((k) => k !== key));
                }
              }}
            >
              {filterLabels?.[key] || filterInfo.defaultLabel}
            </span>

            {!!filter?.[key]?.length && (
              <button
                className="font-light"
                onClick={() => handleSetFilter({ ...filter, [key]: [] })}
              >
                Bỏ lọc
              </button>
            )}
          </div>
        ),
        className: "custom-filter-panel",
        children: (
          <div className="pt-2 min-h-16">
            <Component
              showStore={!currentStore}
              data={filter?.[key] || []}
              setData={(data: any) => handleSetFilter({ ...filter, [key]: data })}
            />
          </div>
        ),
      },
    ];
  });

  return (
    <Collapse
      bordered={false}
      items={items}
      expandIcon={({ isActive }) => (
        <CaretRightOutlined
          rotate={isActive ? 90 : 0}
          className="transition-transform text-gray-600"
        />
      )}
      className="!bg-transparent custom-filter-collapse"
      activeKey={activeKeys}
      onChange={(keys) => handleToggle(keys as string[])}
    />
  );
};
