import React, { useState } from "react";
import { AddButton, Panel, SearchInput } from "@/shared/components";
import { usePageState } from "@/shared/hooks/usePageState";
import { Attribute } from "./attribute.model";
import { useAttributeStore } from "./attribute.store";
import { AttributeType, attributeTypeMap } from "./attribute.enum";
import { useAttributeHandlers } from "./attribute.handlers";
import {
  AttributeAddUpdateModal,
  AttributeDetailModal,
  AttributeSideBar,
  AttributeTable,
} from "./components";

export const AttributePage: React.FC = () => {
  const {
    keyword,
    page,
    size,
    sortBy,
    sortOrder,
    setPage,
    setSize,
    open,
    setOpen,
    openDetail,
    setOpenDetail,
    rowData,
    setRowData,
    reload,
    pageAction,
  } = usePageState<Attribute>();
  const [type, setType] = useState<AttributeType>(AttributeType.PRODUCT_GROUP);

  const { data, loading, creating, updating, errors, pagination, getById, create, update, remove } =
    useAttributeStore(
      { page, size, keyword, sortBy, sortOrder, reload, type, showStatistics: true },
      () => pageAction.handleClose(),
    );
  const {
    handleOpenAdd,
    handleOpenEdit,
    handleOpenDetail,
    handleDelete,
    handleTypeChange,
  } = useAttributeHandlers({
    getById,
    create,
    update,
    remove,
    setOpen,
    setOpenDetail,
    setRowData,
    setType,
    setPage,
  });
  return (
    <div className="flex h-full w-full max-w-7xl mx-auto gap-3">
      <AttributeSideBar activeType={type} onTypeChange={handleTypeChange} />

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">{attributeTypeMap[type]}</h2>
          <div className="flex items-center gap-3">
            <SearchInput value={keyword} onSearch={pageAction.handleSearch} maxWidth={340} />
            <AddButton onOpenAdd={handleOpenAdd} />
          </div>
        </div>

        <Panel className="p-1 h-[calc(100%-44px)] rounded-lg">
          <AttributeTable
            dataSource={data}
            type={type}
            loading={loading}
            pagination={pagination}
            setPage={setPage}
            setSize={setSize}
            onEdit={handleOpenEdit}
            onViewDetail={handleOpenDetail}
            onDelete={handleDelete}
          />
        </Panel>
      </div>

      <AttributeAddUpdateModal
        open={open}
        editData={rowData}
        type={type}
        loading={creating || updating}
        errors={errors}
        onAdd={create}
        onEdit={update}
        onClose={() => pageAction.handleClose(false)}
      />
      <AttributeDetailModal open={openDetail} data={rowData} onClose={pageAction.handleClose} />
    </div>
  );
};

export default AttributePage;
