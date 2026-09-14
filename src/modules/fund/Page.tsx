import React, { useState } from "react";
import { App } from "antd";
import { BanknotesIcon, BuildingOffice2Icon, CreditCardIcon } from "@heroicons/react/24/outline";
import { AddButton, Panel, SearchInput } from "@/shared/components";
import { useGlobalData } from "@/shared/hooks/useGlobalData";
import { usePageState } from "@/shared/hooks/usePageState";
import { SortOrder } from "@/shared/constants/enum";
import { Fund, FundType } from "./fund.model";
import { useFundStore } from "./fund.store";
import { FundAddUpdateModal, FundDetailModal, FundList, FundScopeModal } from "./components";

const FundPage: React.FC = () => {
  const { modal } = App.useApp();
  const { currentStore, info } = useGlobalData();
  const {
    keyword,
    filter,
    reload,
    open,
    setOpen,
    openDetail,
    setOpenDetail,
    rowData,
    setRowData,
    pageAction,
  } = usePageState<Fund>();
  const [formType, setFormType] = useState<FundType>(FundType.BANK);
  const [scopeData, setScopeData] = useState<Fund | undefined>();
  const [scopeOpen, setScopeOpen] = useState(false);

  const store = useFundStore(
    {
      page: 1,
      size: 999,
      reload,
      sortBy: "createdAt",
      sortOrder: SortOrder.ASC,
      ...filter,
    },
    pageAction.handleClose,
  );

  const allStores = info?.allStores || [];

  const handleOpenAdd = (type: FundType) => {
    setFormType(type);
    setRowData(undefined);
    setOpen(true);
  };

  const handleEdit = store.update
    ? (record: Fund) => {
        if (record.isDefault) return;
        setOpenDetail(false);
        setFormType(record.type);
        setRowData(record);
        setOpen(true);
      }
    : undefined;

  const handleDetail = (record: Fund) => {
    setRowData(record);
    setOpenDetail(true);
  };

  const handleDelete = store.remove
    ? (record: Fund) => {
        if (record.isDefault) return;
        modal.confirm({
          title: "Xóa quỹ",
          content: `Bạn có chắc chắn muốn xóa quỹ “${record.name}” không?`,
          okText: "Xóa",
          okButtonProps: { danger: true },
          cancelText: "Hủy",
          onOk: () => store.remove?.(record.id),
        });
      }
    : undefined;

  const handleSetActive = store.update
    ? (record: Fund, isActive: boolean) => {
        if (record.isDefault) return;
        store.update?.({ id: record.id, isActive });
      }
    : undefined;

  const handleChangeScope = (record: Fund) => {
    if (record.isDefault || record.type !== FundType.BANK) return;
    setScopeData(record);
    setScopeOpen(true);
  };

  const handleSubmitScope = (storeId: string | null) => {
    if (!scopeData || !store.update) return;
    store.update(
      { id: scopeData.id, storeId },
      {
        onSuccess: () => {
          setScopeOpen(false);
          setScopeData(undefined);
        },
      },
    );
  };

  const closeForm = () => {
    pageAction.handleClose(false);
    setRowData(undefined);
  };

  return (
    <div className="flex h-fit min-h-full w-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <SearchInput value={keyword} onSearch={pageAction.handleSearch} />
        {/* {currentStore && (
          <AddButton
            title="Thêm quỹ tiền mặt"
            icon={<BanknotesIcon className="h-4 w-4" />}
            onOpenAdd={store.create ? () => handleOpenAdd(FundType.CASH) : undefined}
          />
        )} */}
        <AddButton
          title="Thêm tài khoản ngân hàng"
          icon={<CreditCardIcon className="h-4 w-4" />}
          onOpenAdd={store.create ? () => handleOpenAdd(FundType.BANK) : undefined}
        />
      </div>

      <FundList
        dataSource={store.data}
        loading={store.loading}
        onClick={handleDetail}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onChangeScope={store.update ? handleChangeScope : undefined}
        onSetActive={handleSetActive}
      />

      <FundAddUpdateModal
        open={open}
        type={formType}
        defaultStoreId={currentStore?.id ?? null}
        editData={rowData}
        errors={store.errors}
        loading={store.creating || store.updating}
        onAdd={store.create}
        onEdit={store.update}
        onClose={closeForm}
      />

      <FundDetailModal
        open={openDetail}
        data={rowData}
        onClose={() => pageAction.handleClose()}
        onOpenUpdate={rowData?.isDefault ? undefined : handleEdit}
      />

      <FundScopeModal
        open={scopeOpen}
        data={scopeData}
        stores={allStores}
        loading={store.updating}
        onClose={() => {
          setScopeOpen(false);
          setScopeData(undefined);
        }}
        onSubmit={handleSubmitScope}
      />
    </div>
  );
};

export default FundPage;
