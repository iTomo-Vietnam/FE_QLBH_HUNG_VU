import { MultipleSelectProps, SelectProps } from "@/shared/interfaces/common";
import { Order, OrderQuery } from "../order.model";
import { useOrderStore } from "../order.store";
import { DropdownColumn } from "@/shared/components";
import { SmartMultipleSelect, SmartSelect } from "@/shared/components";
import { useRemoteSelect } from "@/shared/hooks/useRemoteSelect";

export const OrderSelect: React.FC<SelectProps<Order, OrderQuery>> = ({
  value,
  defaultData,
  query,
  onChange,
  onChangeData,
  onFocus,
  ...rest
}) => {
  const { list, loading, setKeywordTemp, unlock, handlePopupScroll } = useRemoteSelect<
    Order,
    OrderQuery
  >({
    defaultData,
    queryHook: useOrderStore,
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

  const columns: DropdownColumn<Order>[] = [
    { label: "Mã đơn hàng", dataIndex: "code", className: "w-24" },
    { label: "Ngày", dataIndex: "orderAt", className: "w-20", dataType: "date" },
    {
      label: "Khách hàng",
      dataIndex: ["partner", "name"],
      className: "w-36",
    },
  ];

  return (
    <SmartSelect<Order>
      dataSource={list}
      columns={columns}
      value={value}
      onChange={handleChange}
      onPopupScroll={handlePopupScroll}
      placeholder={"Chọn nhân viên"}
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

export const OrderMultipleSelect: React.FC<MultipleSelectProps<Order, OrderQuery>> = ({
  defaultData,
  query,
  onChange,
  onChangeData,
  onFocus,
  ...rest
}) => {
  const { list, loading, setKeywordTemp, unlock, handlePopupScroll } = useRemoteSelect<
    Order,
    OrderQuery
  >({
    defaultData,
    queryHook: useOrderStore,
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
    onChangeData?.(list.filter((item) => ids.includes(item.id)));
  };

  return (
    <SmartMultipleSelect<Order>
      dataSource={list}
      columns={[
        { label: "Mã đơn hàng", dataIndex: "code", className: "w-24" },
        { label: "Ngày", dataIndex: "orderAt", className: "w-24", dataType: "date" },
      ]}
      onChange={handleChange}
      onPopupScroll={handlePopupScroll}
      placeholder="Chọn đơn hàng"
      loading={loading}
      onSearch={setKeywordTemp}
      onFocus={(event) => {
        unlock();
        onFocus?.(event);
      }}
      {...rest}
    />
  );
};
