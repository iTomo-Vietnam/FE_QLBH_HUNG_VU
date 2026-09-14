import React, { useState } from "react";
import { BanknotesIcon, BuildingOffice2Icon, CreditCardIcon } from "@heroicons/react/24/outline";
import { AddButton, Panel, SearchInput } from "@/shared/components";
import { useGlobalData } from "@/shared/hooks/useGlobalData";
import { usePageState } from "@/shared/hooks/usePageState";
import { SortOrder } from "@/shared/constants/enum";
import { Fund, FundType } from "./fund.model";
import { useFundStore } from "./fund.store";
import { useFundHandlers } from "./fund.handlers";
import { FundAddUpdateModal, FundDetailModal, FundList, FundScopeModal } from "./components";

const FundPage: React.FC = () => {
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

  const {
    handleOpenAdd,
    handleOpenBankAdd,
    handleEdit,
    handleDetail,
    handleDelete,
    handleSetActive,
    handleChangeScope,
    handleSubmitScope,
  } = useFundHandlers({
    create: store.create,
    update: store.update,
    remove: store.remove,
    getById: store.getById,
    setOpen,
    setOpenDetail,
    setRowData,
    setFormType,
    scopeData,
    setScopeData,
    setScopeOpen,
  });

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
          onOpenAdd={store.create ? handleOpenBankAdd : undefined}
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
