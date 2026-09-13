import { MultipleSelectProps, SelectProps } from "@/shared/interfaces/common";
import { Store } from "@/shared/base/entity";
import { StoreQuery } from "../store.model";
import { useStoreStore } from "../store.store";
import { DropdownColumn } from "@/shared/components/core/CustomSelectLayout";
import { SmartSelect } from "@/shared/components/core/SmartSelect";
import { useRemoteSelect } from "@/shared/hooks/useRemoteSelect";
import { SmartMultipleSelect } from "@/shared/components";

interface Props extends SelectProps<Store, StoreQuery> {
  showPayableDebt?: boolean;
  showReceivableDebt?: boolean;
}

const columns: DropdownColumn<Store>[] = [
  { label: "Tên cửa hàng", dataIndex: "name", className: "w-64" },
  { label: "Mã cửa hàng", dataIndex: "code", className: "w-32" },
];

export const StoreSelect: React.FC<Props> = ({
  value,
  defaultData,
  query,
  showPayableDebt,
  showReceivableDebt,
  onChange,
  onChangeData,
  onFocus,
  ...rest
}) => {
  const { list, loading, setKeywordTemp, unlock, handlePopupScroll } = useRemoteSelect<
    Store,
    StoreQuery
  >({
    defaultData,
    queryHook: useStoreStore,
    buildParams: ({ keyword, page, isLocked }) => ({
      ...(query || {}),
      keyword,
      page,
      size: 10,
      isLocked,
    }),
  });

  const handleChange = (id: string) => {
    onChange?.(id);
    const data = list.find((item) => item.id === id);
    onChangeData?.(data);
  };

  return (
    <SmartSelect<Store>
      dataSource={list}
      columns={columns}
      value={value}
      onChange={handleChange}
      onPopupScroll={handlePopupScroll}
      placeholder="Chọn cửa hàng"
      loading={loading}
      onSearch={setKeywordTemp}
      onFocus={(e) => {
        unlock();
        onFocus?.(e);
      }}
      {...rest}
    />
  );
};

export const StoreMultipleSelect: React.FC<MultipleSelectProps<Store, StoreQuery>> = ({
  defaultData,
  query,
  onChange,
  onChangeData,
  onFocus,
  ...rest
}) => {
  const { list, loading, setKeywordTemp, unlock, handlePopupScroll } = useRemoteSelect<
    Store,
    StoreQuery
  >({
    defaultData,
    queryHook: useStoreStore,
    buildParams: ({ keyword, page, isLocked }) => ({
      ...(query || {}),
      keyword,
      page,
      size: 10,
      isLocked,
    }),
    resetPageDeps: [query],
  });

  const handleChange = (ids: string[]) => {
    onChange?.(ids);
    const selectedData = list.filter((item) => ids.includes(item.id));
    onChangeData?.(selectedData);
  };

  return (
    <SmartMultipleSelect<Store>
      dataSource={list}
      columns={columns}
      onChange={handleChange}
      onPopupScroll={handlePopupScroll}
      placeholder="Chọn cửa hàng"
      loading={loading}
      onSearch={setKeywordTemp}
      onFocus={(e) => {
        unlock();
        onFocus?.(e);
      }}
      {...rest}
    />
  );
};

export const StoreUncontrolledMultipleSelect: React.FC<MultipleSelectProps<Store, StoreQuery>> = ({
  defaultData,
  query,
  options = [],
  onChange,
  onChangeData,
  ...rest
}) => {
  const handleChange = (ids: string[]) => {
    onChange?.(ids);
    const selectedData = options.filter((item) => ids.includes(item.id));
    onChangeData?.(selectedData);
  };

  return (
    <SmartMultipleSelect<Store>
      dataSource={options}
      columns={columns}
      onChange={handleChange}
      placeholder="Chọn cửa hàng"
      {...rest}
    />
  );
};
