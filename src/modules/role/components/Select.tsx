import { MultipleSelectProps, SelectProps } from "@/shared/interfaces/common";
import { Role, RoleQuery } from "../role.model";
import { useRoleStore } from "../role.store";
import { useRemoteSelect } from "@/shared/hooks/useRemoteSelect";
import { useEffect, useState } from "react";
import { Select } from "antd";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { ManagerButton } from "@/shared/components/manager_select/ManagerButton";
import { AddRoleModal } from "./AddModal";

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
  const { errors, newItem, create } = useRoleStore();

  useEffect(() => {
    if (!newItem) return;
    onChange?.(newItem.id);
    onChangeData?.(newItem);
  }, [newItem, onChange, onChangeData]);

  return (
    <div className="flex w-full z-0">
      <Select<string>
        {...(rest as any)}
        className={`${create ? "w-[calc(100%-40px)] rounded-e-none" : "w-full"} z-10`}
        options={buildOptions(list)}
        value={value ?? undefined}
        loading={loading}
        placeholder="Chọn vai trò"
        showSearch
        filterOption={false}
        onSearch={setKeywordTemp}
        onPopupScroll={handlePopupScroll}
        onChange={(id) => {
          onChange?.(id || "");
          onChangeData?.(list.find((item) => item.id === id));
        }}
        suffixIcon={<ChevronDownIcon className="h-3.5" />}
        onFocus={(event) => {
          unlock();
          onFocus?.(event);
        }}
        disabled={disabled}
      />
      {create && (
        <>
          <ManagerButton onClick={() => setOpen(true)} disabled={disabled} />
          <AddRoleModal
            open={open}
            loading={loading}
            errors={errors}
            onClose={() => setOpen(false)}
            onAdd={create}
          />
        </>
      )}
    </div>
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
