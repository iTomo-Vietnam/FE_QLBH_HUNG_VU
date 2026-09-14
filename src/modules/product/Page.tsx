import React, { useMemo, useState } from "react";
import { usePageState } from "@/shared/hooks/usePageState";
import { SearchInput } from "@/shared/components";
import { PanelFilter } from "@/shared/components/filters";
import { DateRangeFilter } from "@/shared/components";
import { AddButton } from "@/shared/components";
import { Panel } from "@/shared/components";
import { Dropdown, Tabs, Table, Button } from "antd";
import { CustomPagination } from "@/shared/components";
import { formatMoney, formatQuantity } from "@/shared/utils/number.util";
import dayjs from "dayjs";
import { CLASSNAME } from "@/shared/constants/ui";
import { SortOrder } from "@/shared/constants/enum";
import { DropdownAction } from "@/shared/components";

import "./index.css";
import { useProductHandlers } from "./product.handlers";
import { filterUses, Product, rangerItems, sortItems } from "./product.model";
import { useProductPriceHistoryStore, useProductStore } from "./product.store";
import {
  ProductBarcodePrintModal,
  ProductChangeGroupModal,
  ProductTable,
  ProductAddUpdateModal,
  ProductDetailModal,
} from "./components";
import { ExcelButton, ExcelEntityType } from "@/modules/excel";
import {
  EllipsisHorizontalIcon,
  FolderOpenIcon,
  NoSymbolIcon,
  PrinterIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useGlobalData } from "@/shared/hooks";

export const ProductPage: React.FC = () => {
  const { currentStore } = useGlobalData();
  const {
    isFilterActive,
    keyword,
    page,
    size,
    sortBy,
    sortOrder,
    filter,
    ranger,
    reload,
    setPage,
    setSize,

    open,
    setOpen,
    openDetail,
    setOpenDetail,
    rowData,
    setRowData,
    pageAction,
  } = usePageState<Product>({
    sortBy: "createAt",
    sortOrder: SortOrder.DESC,
    filterUses,
  });

  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [openChangeGroup, setOpenChangeGroup] = useState(false);
  const [openPrintLabels, setOpenPrintLabels] = useState(false);
  const hasSelectedProducts = selectedProducts.length > 0;

  // Type is always known for product - attribute group depends on
  const {
    data,
    loading,
    creating,
    updating,
    errors,
    pagination,
    getById,
    create,
    update,
    remove,
    removeMany,
    changeGroup,
    stopSelling,
  } = useProductStore(
    { page, size, keyword, sortBy, sortOrder, reload, useFullDetail: true, ...filter, ...ranger },
    () => pageAction.handleClose(),
  );

  const {
    handleOpenAdd,
    handleOpenEdit,
    handleOpenDetail,
    handleDelete,
    handleEditFromDetail,
    handleChangeGroup,
    handleSubmitChangeGroup,
    handleStopSelling,
    handleDeleteSelected,
    handlePrintSelected,
  } = useProductHandlers({
    getById,
    create,
    update,
    remove,
    removeMany,
    changeGroup,
    stopSelling,
    selectedProducts,
    currentStoreId: currentStore?.id,
    currentStoreName: currentStore?.name,
    setSelectedProducts,
    setOpenChangeGroup,
    setOpenPrintLabels,
    setOpen,
    setOpenDetail,
    setRowData,
  });

  const selectedProductIds = selectedProducts.map((product) => product.id);

  const selectedDestructiveItems = [
    stopSelling && {
      key: "stop-selling",
      label: "Ngừng kinh doanh",
      danger: true,
      icon: <NoSymbolIcon className="h-4 w-4" />,
      onClick: handleStopSelling,
    },
    removeMany && {
      key: "delete",
      label: "Xóa",
      danger: true,
      icon: <TrashIcon className="h-4 w-4" />,
      onClick: handleDeleteSelected,
    },
  ].filter(Boolean) as any[];

  const selectedActionItems = [
    changeGroup && {
      key: "change-group",
      label: "Đổi nhóm hàng",
      icon: <FolderOpenIcon className="h-4 w-4" />,
      onClick: handleChangeGroup,
    },
    {
      key: "print-labels",
      label: "In tem",
      icon: <PrinterIcon className="h-4 w-4" />,
      onClick: handlePrintSelected,
    },
    ...(selectedDestructiveItems.length ? [{ type: "divider" as const }] : []),
    ...selectedDestructiveItems,
  ].filter(Boolean) as any[];

  return (
    <div className="flex gap-3 w-full h-full">
      <PanelFilter
        filterActive={isFilterActive}
        sortItems={sortItems}
        sortValue={{ sortBy, sortOrder }}
        onSortChange={pageAction.handleSortChange}
        filterUses={filterUses}
        onClearFilter={pageAction.resetFilter}
        rangerValue={ranger}
        rangerItems={rangerItems}
        onRangerChange={pageAction.handleRangerChange}
      />
      <div className="flex flex-col h-full w-[calc(100%-266px)] gap-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-3">
            <SearchInput value={keyword} onSearch={pageAction.handleSearch} maxWidth={440} />
            {hasSelectedProducts && (
              <div className="flex items-center flex-shrink-0 gap-1 font-semibold font-semibold">
                <span className="text-sm text-gray-500">
                  {formatQuantity(selectedProducts.length)} đã chọn
                </span>
                <button>
                  <XMarkIcon
                    className="w-4 h-4 font-bold text-gray-400 hover:text-red-500 transition-colors ease-out"
                    onClick={() => setSelectedProducts([])}
                  />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <ExcelButton
              entityType={ExcelEntityType.PRODUCT}
              onSuccess={() => pageAction.handleReload()}
              exportOptions={{
                filters: {
                  ...filter,
                  ...ranger,
                  ids: selectedProducts.map((p) => p.id),
                  keyword,
                  sortBy,
                  sortOrder,
                },
                filename: "danh_sach_hang_hoa_",
              }}
            />
            {/* Thêm action bằng 1 cái dropdown có dấu 3 chấm */}
            {hasSelectedProducts && selectedActionItems.length > 0 && (
              <Dropdown
                trigger={["click"]}
                menu={{ items: selectedActionItems }}
                placement="bottomRight"
              >
                <Button
                  htmlType="button"
                  className="p-0 px-2"
                  aria-label="Thao tác hàng hóa đã chọn"
                >
                  <EllipsisHorizontalIcon className="h-5 w-5" />
                </Button>
              </Dropdown>
            )}
            <AddButton onOpenAdd={handleOpenAdd} />
          </div>
        </div>
        <Panel className="h-[calc(100%-44px)] !p-1">
          <ProductTable
            dataSource={data}
            loading={loading}
            pagination={pagination}
            setPage={setPage}
            setSize={setSize}
            onEdit={handleOpenEdit}
            onViewDetail={handleOpenDetail}
            onDelete={handleDelete}
            rowSelection={{
              type: "checkbox",
              selectedRowKeys: selectedProducts.map((p) => p.id),
              onChange: (_selectedRowKeys: React.Key[], selectedRows: any[]) => {
                setSelectedProducts(selectedRows as Product[]);
              },
            }}
          />
        </Panel>

        <ProductAddUpdateModal
          open={open}
          editData={rowData}
          loading={creating || updating}
          errors={errors}
          onAdd={create}
          onEdit={update}
          onClose={() => pageAction.handleClose(false)}
        />

        <ProductDetailModal
          open={openDetail}
          data={rowData}
          onClose={pageAction.handleClose}
          onOpenUpdate={handleEditFromDetail}
        />

        <ProductChangeGroupModal
          open={openChangeGroup}
          productCount={selectedProducts.length}
          onClose={() => setOpenChangeGroup(false)}
          onSubmit={handleSubmitChangeGroup}
        />

        <ProductBarcodePrintModal
          open={openPrintLabels}
          products={selectedProducts}
          onClose={() => setOpenPrintLabels(false)}
        />
      </div>
    </div>
  );
};

interface PriceHistoryRow extends Product {
  [dateKey: string]: any;
}

export const ProductPriceHistoryPage: React.FC = () => {
  const {
    keyword,
    page,
    size,
    startAt,
    endAt,
    type,
    reload,
    setPage,
    setSize,
    open,
    setOpen,
    openDetail,
    setOpenDetail,
    rowData,
    setRowData,
    pageAction,
  } = usePageState<Product>();

  const { data, loading, pagination } = useProductPriceHistoryStore({
    page,
    size,
    keyword,
    startAt,
    endAt,
    reload,
  });

  const { updating, errors, getById, update } = useProductStore({ isLocked: true }, () => {
    pageAction.handleClose();
    pageAction.handleReload();
  });

  const { handleOpenEdit, handleOpenDetail, handleEditFromDetail } = useProductHandlers({
    getById,
    update,
    setOpen,
    setOpenDetail,
    setRowData,
  });

  // Build unique sorted date list from all products' priceHistories
  const { dateColumns, rows } = useMemo(() => {
    if (!data?.length) return { dateColumns: [], rows: [] };

    // Gather all unique dates
    const dateSet = new Set<string>();
    for (const product of data) {
      for (const ph of product.priceHistories || []) {
        if (ph.createdAt) {
          dateSet.add(dayjs(ph.createdAt).format("YYYY-MM-DD"));
        }
      }
    }
    const sortedDates = Array.from(dateSet).sort();

    // Build pivot rows: for each product, map date ? latest price of that day
    const rows: PriceHistoryRow[] = data.map((product) => {
      const row: PriceHistoryRow = { ...product };

      // Group histories by unitId ? date ? price
      const byUnit: Record<string, Record<string, number>> = {};
      for (const ph of product.priceHistories || []) {
        if (!ph.createdAt) continue;
        const date = dayjs(ph.createdAt).format("YYYY-MM-DD");
        const unitId = product.baseUnitId || "base";
        if (!byUnit[unitId]) byUnit[unitId] = {};
        // Keep latest price for that unit on that date (last one wins since sorted DESC)
        if (!(date in byUnit[unitId])) {
          byUnit[unitId][date] = ph.costPrice;
        }
      }

      // For each date, compute price from baseUnit (if exists)
      for (const date of sortedDates) {
        const baseUnitId = product.baseUnitId || "base";
        if (baseUnitId && byUnit[baseUnitId]?.[date] != null) {
          row[date] = byUnit[baseUnitId][date];
        } else {
          row[date] = null;
        }
      }

      return row;
    });

    return {
      dateColumns: sortedDates,
      rows,
    };
  }, [data]);

  // Build Ant Design columns
  const columns: any[] = useMemo(() => {
    const base: any[] = [
      {
        title: "STT",
        key: "idx",
        width: 50,
        align: "center",
        fixed: "left",
        render: (_: any, __: any, index: number) => (page - 1) * size + index + 1,
      },
      {
        title: "M?",
        dataIndex: "code",
        key: "code",
        width: 110,
        fixed: "left",
        ellipsis: true,
        className: "font-mono",
      },
      {
        title: "T�n h�ng",
        dataIndex: "name",
        key: "name",
        fixed: "left",
        width: 180,
        ellipsis: true,
      },
      {
        title: "�VT",
        dataIndex: ["baseUnit", "name"],
        key: "baseUnit",
        width: 80,
        align: "center",
        ellipsis: true,
      },
    ];

    const dateCols = dateColumns.map((date) => ({
      title: dayjs(date).format("DD/MM"),
      dataIndex: date,
      key: date,
      width: 120,
      align: "right" as const,
      render: (v: number | null) =>
        v != null ? formatMoney(v) : <span className="text-gray-300">�</span>,
    }));

    return [
      ...base,
      ...dateCols,
      {
        dataIndex: "action",
        key: "action",
        className: "action-column",
        fixed: "right",
        align: "right",
        render(_: any, record: any) {
          return (
            <div className="flex w-full min-w-[50px] justify-end">
              <div
                onClick={(e) => e.stopPropagation()}
                className={`
                  hover:text-white flex justify-center
                  ${CLASSNAME.inputHeight}
                  `}
              >
                {(!handleOpenEdit && !handleOpenDetail) || record.isChild || record.isSummary ? (
                  <></>
                ) : (
                  <DropdownAction
                    onViewDetail={handleOpenDetail ? () => handleOpenDetail(record) : undefined}
                    onEdit={handleOpenEdit ? () => handleOpenEdit(record) : undefined}
                  />
                )}
              </div>
            </div>
          );
        },
      },
    ];
  }, [dateColumns, page, size]);

  return (
    <div className="flex flex-col h-full w-full gap-1">
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-center gap-3">
          <DateRangeFilter
            startDate={startAt}
            endDate={endAt}
            onRangeChange={pageAction.handleDateRangerChange}
          />
          <SearchInput value={keyword} onSearch={pageAction.handleSearch} maxWidth={280} />
        </div>
      </div>
      <Panel>
        <div className="flex flex-col h-full">
          <Table
            columns={columns}
            dataSource={rows}
            loading={loading}
            pagination={false}
            rowKey="id"
            scroll={{ x: "max-content", y: "max-content" }}
            size="small"
            bordered
            className="table-h-full product-history-table"
            footer={() => (
              <CustomPagination
                itemName="h�ng h�a"
                length={data?.length}
                pagination={pagination}
                setPage={setPage}
                setSize={setSize}
                showTotal
              />
            )}
          />
        </div>
      </Panel>

      <ProductAddUpdateModal
        open={open}
        editData={rowData}
        loading={updating}
        errors={errors}
        onEdit={update}
        onClose={() => pageAction.handleClose(false)}
      />

      <ProductDetailModal
        open={openDetail}
        data={rowData}
        onClose={pageAction.handleClose}
        onOpenUpdate={handleEditFromDetail}
      />
    </div>
  );
};
