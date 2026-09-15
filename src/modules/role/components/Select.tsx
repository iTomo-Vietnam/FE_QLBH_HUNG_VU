import { MultipleSelectProps, SelectProps } from "@/shared/interfaces/common";
import { Role, RoleQuery } from "../role.model";
import { useRoleStore } from "../role.store";
import { useRemoteSelect } from "@/shared/hooks/useRemoteSelect";
import { useEffect, useState } from "react";
import { Select } from "antd";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { ManagerButton } from "@/shared/components/manager_select/ManagerButton";
import { AddRoleModal } from "./AddModal";
import { SmartSelect } from "@/shared/components";

const buildOptions = (list: Role[]) =>
  list.map((role) => ({
    label: role.name,
    value: role.id,
  }));

export const RoleSelect: React.FC<SelectProps<Role, RoleQuery>> = ({
  value,
  defaultData,
  query,
  disabled,
  onChange,
  onChangeData,
  onFocus,
  ...rest
}) => {
  const [open, setOpen] = useState(false);
  const { list, loading, setKeywordTemp, unlock, handlePopupScroll } = useRemoteSelect<
    Role,
    RoleQuery
  >({
    defaultData,
    queryHook: useRoleStore,
    buildParams: ({ keyword, page, isLocked }) => ({
      ...query,
      keyword,
      page,
      size: 999,
      isLocked,
    }),
  });

  const handleChange = (id: string) => {
    onChange?.(id);
    const data = list.find((item) => item.id === id);
    onChangeData?.(data);
  };

  return (
    <SmartSelect<Role>
      dataSource={list}
      columns={[
        {
          label: "Tên vai trò",
          dataIndex: "name",
          className: "w-full",
          dataType: "string",
        },
      ]}
      value={value}
      onChange={handleChange}
      onPopupScroll={handlePopupScroll}
      placeholder={"Chọn hàng hóa"}
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

export const RoleMultipleSelect: React.FC<MultipleSelectProps<Role, RoleQuery>> = ({
  value,
  defaultData,
  query,
  disabled,
  onChange,
  onChangeData,
  onFocus,
  ...rest
}) => {
  const { list, loading, setKeywordTemp, unlock, handlePopupScroll } = useRemoteSelect<
    Role,
    RoleQuery
  >({
    defaultData,
    queryHook: useRoleStore,
    buildParams: ({ keyword, page, isLocked }) => ({
      ...query,
      keyword,
      page,
      size: 999,
      isLocked,
    }),
  });

  return (
    <Select<string[]>
      {...(rest as any)}
      mode="multiple"
      className="w-full z-10"
      options={buildOptions(list)}
      value={value ?? undefined}
      loading={loading}
      placeholder="Chọn vai trò"
      showSearch
      filterOption={false}
      onSearch={setKeywordTemp}
      onPopupScroll={handlePopupScroll}
      onChange={(ids) => {
        onChange?.(ids);
        onChangeData?.(list.filter((item) => ids.includes(item.id)));
      }}
      suffixIcon={<ChevronDownIcon className="h-3.5" />}
      onFocus={(event) => {
        unlock();
        onFocus?.(event);
      }}
      disabled={disabled}
    />
  );
};
