import React, { useEffect, useMemo, useState } from "react";
import { Empty, Table } from "antd";
import type { TableColumnsType } from "antd";
import { CustomizeColumnDisplay } from "./CustomizeColumnDisplay";
import { HandleColumnSelector, ColumnsConfigType } from "./handleColumnSelector";
import { TableProps } from "antd/lib";
import { SorterResult } from "antd/es/table/interface";
import { getInitialConfigColumns } from "./columnConfig";
import { PaginationProps, SummaryData } from "@/shared/interfaces/api";
import { useGlobalData } from "@/shared/hooks/useGlobalData";
import { checkCanPermission } from "@/shared/utils/permission.util";
import { CustomPagination } from "../CustomPagination";
import { CLASSNAME } from "@/shared/constants/ui";
import { Entity } from "@/shared/base/entity";
import { formatDateTimeDDMMYYYY } from "@/shared/utils/date.util";
import { DropdownAction } from "../dropdown";
import { ExpandIconButton } from "../button/ExpandIconButton";

export interface TableColumnConfigProps extends Omit<TableProps, "pagination"> {
  columns: ColumnsConfigType;
  tableKey: string;
  dataSource: any[];
  loading?: boolean;
  pagination?: PaginationProps | null;
  itemName: string;
  hasFilter?: boolean;
  detailTableColumns?: ColumnsConfigType;
  detailTableTitle?: string;
  actionWidth?: number | string;
  showTotal?: boolean;
  resize?: boolean;
  summaryData?: SummaryData | null;
  hasSummary?: boolean;
  dataLength?: number;
  hasStoreInfo?: boolean;
  /** Hiển thị cột TK tạo (mặc định: true). Có thể tùy chỉnh ghim trong bộ chọn cột */
  showCreator?: boolean;
  /** Hiển thị cột TK sửa (mặc định: true). Có thể tùy chỉnh ghim trong bộ chọn cột */
  showUpdater?: boolean;
  setPage?: (page: number) => void;
  setSize?: (size: number) => void;
  onEdit?: (record: any) => void;
  onDelete?: (record: any) => void;
  onCopy?: (record: any) => void;
  onUpdate?: (record: any) => void;
  onViewDetail?: (record: any) => void;
  onExportPdf?: (record: any) => void;
  onExportExcel?: (record: any) => void;
  onPrint?: (record: any) => void;
  onPrintBarcode?: (record: any) => void;

  onExport?: (record: any) => void;
  onImport?: (record: any) => void;

  onResetPassword?: (record: any) => void;

  onApprove?: (record: any) => void;
  onReject?: (record: any) => void;
  onCustomerApprove?: (record: any) => void;
  onCustomerReject?: (record: any) => void;
  onCreatePurchase?: (record: any) => void;
  onCreateQuotation?: (record: any) => void;

  // hủy đơn, khôi phục đơn
  onConfirm?: (record: any) => void;
  onCancel?: (record: any) => void;
  onRestore?: (record: any) => void;
  onSort?: (field: string | undefined, type: string | undefined) => void;
  onComplete?: (record: any) => void;
}

export interface ObjectTableProps extends Omit<
  TableColumnConfigProps,
  "columns" | "tableKey" | "itemName"
> {
  onShowProgress?: (record: any) => void;
}

const projectName = "TOTO PAINT";

// Keep configured data-column widths numeric and bounded. The trailing action
// column is intentionally excluded from this rule so it can absorb spare
// table width while still using a minimum width for its toolbar.
const DEFAULT_COLUMN_WIDTH = 120;
const MIN_COLUMN_WIDTH = 40;
const MAX_COLUMN_WIDTH = 600;
const INDEX_COLUMN_WIDTH = 50;
const EXPAND_COLUMN_WIDTH = 32;
const ACTION_COLUMN_MIN_WIDTH = 50;

const getStableColumnWidth = (width: unknown, fallback: unknown = DEFAULT_COLUMN_WIDTH) => {
  const parsedWidth = typeof width === "number" ? width : Number(width);
  const parsedFallback = typeof fallback === "number" ? fallback : Number(fallback);
  const safeWidth = Number.isFinite(parsedWidth) ? parsedWidth : parsedFallback;
  const safeFallback = Number.isFinite(parsedFallback) ? parsedFallback : DEFAULT_COLUMN_WIDTH;

  return Math.min(
    MAX_COLUMN_WIDTH,
    Math.max(MIN_COLUMN_WIDTH, Number.isFinite(safeWidth) ? safeWidth : safeFallback),
  );
};

export const TableColumnConfig: React.FC<TableColumnConfigProps> = ({
  columns,
  tableKey,
  dataSource,
  loading,
  pagination,
  itemName,
  detailTableColumns,
  detailTableTitle,
  actionWidth = 60,
  showTotal = true,
  resize = false,
  className,
  hasSummary = false,
  dataLength,
  hasStoreInfo = false,
  showCreator = true,
  showUpdater = false,
  setPage,
  setSize,
  onEdit,
  onDelete,
  onCopy,
  onUpdate,
  onConfirm,
  onCancel,
  onRestore,
  onSort,
  onComplete,
  onViewDetail,
  onExportPdf,
  onExportExcel,
  onPrint,
  onPrintBarcode,
  onExport,
  onImport,
  onResetPassword,
  onApprove,
  onReject,
  onCustomerApprove,
  onCustomerReject,
  onCreatePurchase,
  onCreateQuotation,
  rowSelection,
  ...rest
}) => {
  const fullTableKey = `${projectName}-${tableKey}`;

  // ── Gộp cột hệ thống (TK tạo, TK sửa) vào danh sách cột nếu bật ──
  const mergedColumns = useMemo((): ColumnsConfigType => {
    const systemCols: ColumnsConfigType = [];

    if (showCreator) {
      systemCols.push({
        title: "TK tạo",
        key: "creatorSnapshot",
        width: 150,
        ellipsis: true,
        hidden: true,
        canHide: true,
        render: (record?: Entity) => {
          const { creatorSnapshot, createdAt } = record || {};
          return (
            creatorSnapshot && (
              <div className="flex flex-col">
                <span className="text-xs font-semibold">
                  {creatorSnapshot?.name || creatorSnapshot?.username || "N/A"}
                </span>
                <span className="text-2xs text-gray-500">{formatDateTimeDDMMYYYY(createdAt)}</span>
              </div>
            )
          );
        },
      });
    }

    if (showUpdater) {
      systemCols.push({
        title: "TK sửa",
        key: "updaterSnapshot",
        width: 150,
        ellipsis: true,
        hidden: true,
        canHide: true,
        render: (record?: Entity) => {
          const { updaterSnapshot, updatedAt } = record || {};
          return (
            updaterSnapshot && (
              <div className="flex flex-col">
                <span className="text-xs font-semibold">
                  {updaterSnapshot?.name || updaterSnapshot?.username || "N/A"}
                </span>
                <span className="text-2xs text-gray-500">{formatDateTimeDDMMYYYY(updatedAt)}</span>
              </div>
            )
          );
        },
      });
    }

    if (systemCols.length === 0) return columns;

    // Tránh trùng key nếu columns đã có creatorSnapshot/updaterSnapshot
    const existingKeys = new Set(columns.map((c) => c.key));
    return [...columns, ...systemCols.filter((c) => !existingKeys.has(c.key))];
  }, [columns, showCreator, showUpdater]);

  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [configColumns, setConfigColumns] = useState<ColumnsConfigType>(() =>
    getInitialConfigColumns(mergedColumns, fullTableKey),
  );
  const { isMobile, currentStore } = useGlobalData();
  const length = dataSource?.length;
  const increasedLength = hasSummary ? 1 : 0;
  const hasRowExpandable = (record: any) =>
    (Array.isArray(record.children) && record.children.length > 0) ||
    (Array.isArray(record.details) && record.details.length > 0) ||
    (Array.isArray(record.items) && record.items.length > 0);
  const hasAnyExpandable = dataSource.some(
    (record, index) => !record.isSummary && hasRowExpandable(record),
  );
  const indexRen = (value: any, record: any, index: number) => {
    return record.isSummary
      ? ""
      : value !== undefined
        ? value
        : ((pagination?.currentPage || 1) - 1) * (pagination?.size || 20) +
            index +
            1 -
            increasedLength || "";
  };

  const handleResize =
    (key: React.Key) =>
    (e: React.SyntheticEvent<Element>, { size }: { size: { width: number } }) => {
      setConfigColumns((prev) =>
        prev.map((column) =>
          column.key === key
            ? { ...column, width: getStableColumnWidth(size.width, column.width) }
            : column,
        ),
      );
    };

  const getFinalColumns = (cols: ColumnsConfigType): TableColumnsType => {
    // Nhóm các cột config theo fixed: ghim trái → bình thường → ghim phải
    const visibleCols = cols.filter((col) => !col.hidden);
    const leftFixedCols = visibleCols.filter((c) => c.fixed === "left");
    const normalCols = visibleCols.filter((c) => !c.fixed);
    const rightFixedCols = visibleCols.filter((c) => c.fixed === "right");
    const actionColumnMinWidth = Math.max(
      ACTION_COLUMN_MIN_WIDTH,
      getStableColumnWidth(actionWidth, 60),
    );

    const mapCol = (col: ColumnsConfigType[number]) => {
      const width = getStableColumnWidth(col.width);

      return {
        ...col,
        fixed: isMobile ? undefined : col.fixed, // Disable fixed columns on mobile for better UX
        width,
        ellipsis: true,
        onHeaderCell: () => {
          const headerProps: React.HTMLAttributes<any> = (col as any).onHeaderCell?.() || {};
          return {
            ...headerProps,
            width,
            onResize: handleResize(col.key),
          } as unknown as React.HTMLAttributes<any>;
        },
      };
    };

    const baseColumns = [
      // ── STT: luôn ghim trái ──
      {
        title: "STT",
        dataIndex: "index",
        key: "index",
        align: "center",
        fixed: isMobile ? undefined : "left",
        width: INDEX_COLUMN_WIDTH,
        ellipsis: true,
        className: "index-column",
        // Static/generated columns do not go through mapCol. Forward their
        // width to the fixed header as well; otherwise rc-table can measure
        // them as 0px while rendering an empty table.
        onHeaderCell: () => ({ width: INDEX_COLUMN_WIDTH }),
        render: (value: any, record: any, index: number) => indexRen(value, record, index),
      },
      // ── Cột ghim trái ──
      ...leftFixedCols.map((col) => mapCol(col)),
      // ── Cột bình thường ──
      ...normalCols.map((col) => mapCol(col)),
      // ── Cột ghim phải ──
      ...rightFixedCols.map((col) => mapCol(col)),
      // ── Chi nhánh (nếu có) ──
      hasStoreInfo && !currentStore
        ? {
            title: "Cửa hàng",
            dataIndex: ["store", "name"],
            key: "storeName",
            width: 80,
            ellipsis: true,
            fixed: isMobile ? undefined : "right",
            onHeaderCell: () => ({ width: 150 }),
          }
        : null,
      // ── _actions: luôn ghim phải ──
      {
        title: (
          <CustomizeColumnDisplay
            title={"Tùy chỉnh cột hiển thị"}
            content={
              <HandleColumnSelector
                columns={configColumns}
                onConfigColumns={setConfigColumns}
                onResetColumns={() => setConfigColumns(mergedColumns)}
              />
            }
          />
        ),
        key: "_actions",
        className: "action-column",
        fixed: "right",
        align: "right",
        // Deliberately leave this column flexible. It is the trailing column,
        // so rc-table will give it the remaining table width when available.
        // The minimum is applied to the cells below to protect the toolbar.
        width: undefined,
        ellipsis: true,
        onHeaderCell: () => ({
          style: {
            minWidth: actionColumnMinWidth,
          },
        }),
        onCell: () => ({ style: { minWidth: actionColumnMinWidth } }),
        render(record: any) {
          const canEdit = !!onEdit && !!checkCanPermission(record, "update");
          const canDelete = !!onDelete && !!checkCanPermission(record, "delete");
          const canConfirm = !!onConfirm && !!checkCanPermission(record, "confirm");
          const canCancel = !!onCancel && !!checkCanPermission(record, "cancel");
          const canComplete = !!onComplete && !!checkCanPermission(record, "complete");

          const canExport = !!onExport && !!checkCanPermission(record, "export");
          const canImport = !!onImport && !!checkCanPermission(record, "import");

          const canApprove = !!onApprove && !!checkCanPermission(record, "approve");
          const canReject = !!onReject && !!checkCanPermission(record, "reject");
          const canCustomerApprove =
            !!onCustomerApprove && !!checkCanPermission(record, "customerApprove");
          const canCustomerReject =
            !!onCustomerReject && !!checkCanPermission(record, "customerReject");

          const canCreatePurchase =
            !!onCreatePurchase && !!checkCanPermission(record, "createPurchase");
          const canCreateQuotation =
            !!onCreateQuotation && !!checkCanPermission(record, "createQuotation");

          const hideActions = !!record.isChild || !!record.isSummary;
          return (
            <div className="flex w-full min-w-[50px] justify-end">
              <div
                onClick={(e) => e.stopPropagation()}
                className={`
                  hover:text-white flex justify-center
                  ${CLASSNAME.inputHeight}
                  `}
              >
                {hideActions ? (
                  <></>
                ) : (
                  <DropdownAction
                    onDelete={canDelete ? () => onDelete(record) : undefined}
                    onEdit={canEdit ? () => onEdit(record) : undefined}
                    onApprove={canApprove ? () => onApprove(record) : undefined}
                    onReject={canReject ? () => onReject(record) : undefined}
                    onCustomerApprove={
                      canCustomerApprove ? () => onCustomerApprove(record) : undefined
                    }
                    onCustomerReject={
                      canCustomerReject ? () => onCustomerReject(record) : undefined
                    }
                    onCreatePurchase={
                      canCreatePurchase ? () => onCreatePurchase(record) : undefined
                    }
                    onCreateQuotation={
                      canCreateQuotation ? () => onCreateQuotation(record) : undefined
                    }
                    onConfirm={canConfirm ? () => onConfirm(record) : undefined}
                    onComplete={canComplete ? () => onComplete(record) : undefined}
                    onCancel={canCancel ? () => onCancel(record) : undefined}
                    onExport={canExport ? () => onExport(record) : undefined}
                    onImport={canImport ? () => onImport(record) : undefined}
                    onCopy={onCopy ? () => onCopy(record) : undefined}
                    onViewDetail={onViewDetail ? () => onViewDetail(record) : undefined}
                    onExportPdf={onExportPdf ? () => onExportPdf(record) : undefined}
                    onExportExcel={onExportExcel ? () => onExportExcel(record) : undefined}
                    onPrint={onPrint ? () => onPrint(record) : undefined}
                    onPrintBarcode={onPrintBarcode ? () => onPrintBarcode(record) : undefined}
                  />
                )}
              </div>
            </div>
          );
        },
      },
    ].filter(Boolean) as TableColumnsType;

    // Add EXPAND_COLUMN at the beginning if has expandable data
    if (hasAnyExpandable && !detailTableColumns) {
      return [
        {
          title: "",
          dataIndex: "expand",
          key: "expand",
          align: "right",
          width: EXPAND_COLUMN_WIDTH,
          fixed: isMobile ? undefined : "left",
          className: "ant-table-cell-with-append",
          onHeaderCell: () => ({ width: EXPAND_COLUMN_WIDTH }),
        },
        ...baseColumns,
      ];
    }

    return baseColumns;
  };
  // Build columns during render so the table never mounts once with an empty
  // column list and then reflows after an effect.
  const finalColumns = getFinalColumns(configColumns);

  // Sync configColumns with columns prop changes while preserving user settings AND order
  useEffect(() => {
    setConfigColumns((prevConfig) => {
      // First, update existing columns in their current order (preserving user's sort order)
      const updatedColumns = prevConfig
        .map((oldCol) => {
          const newCol = mergedColumns.find((c) => c.key === oldCol.key);
          if (newCol) {
            // Preserve user settings (hidden, fixed, width, order) but update dynamic properties (render, title)
            return {
              ...newCol,
              hidden: oldCol.hidden,
              fixed: oldCol.fixed,
              width: oldCol.width,
            };
          }
          return null; // Column no longer exists in new columns
        })
        .filter(Boolean); // Remove nulls

      // Then add any new columns that weren't in prevConfig
      const newColumns = mergedColumns.filter((col) => !prevConfig.find((c) => c.key === col.key));

      return [...updatedColumns, ...newColumns] as ColumnsConfigType;
    });
  }, [mergedColumns]);

  useEffect(() => {
    const openColumnKeys = configColumns.map((col) => ({
      key: col.key,
      hidden: col.hidden,
      fixed: col.fixed,
      width: col.width,
    }));

    localStorage.setItem(fullTableKey, JSON.stringify(openColumnKeys));
  }, [configColumns, fullTableKey]);

  const onChange: TableProps<any>["onChange"] = (pagination, filters, sorter, extra) => {
    const { field, order } = sorter as SorterResult;
    onSort?.(
      field ? field.toString() : undefined,
      order ? order.replace("end", "").toUpperCase() : undefined,
    );
  };

  // Summary rows are display-only. Keep them out of Ant Design's selection
  // calculation so the header checkbox can still show the correct state.
  const normalizedRowSelection = rowSelection
    ? {
        ...rowSelection,
        getCheckboxProps: (record: any) => ({
          ...(rowSelection.getCheckboxProps?.(record) || {}),
          ...(record?.isSummary ? { disabled: true } : {}),
        }),
        renderCell: (checked: boolean, record: any, index: number, originNode: React.ReactNode) =>
          record?.isSummary
            ? null
            : (rowSelection.renderCell?.(checked, record, index, originNode) ?? originNode),
      }
    : undefined;

  return (
    <div className="flex flex-col w-full h-full relative">
      <Table
        rowKey="key"
        columns={finalColumns}
        dataSource={dataSource.map((data, index) => ({
          ...data,
          key: data.id || data.key || `key-${index}`,
        }))}
        pagination={false}
        loading={loading}
        footer={() =>
          pagination === undefined ? (
            <></>
          ) : (
            <CustomPagination
              pagination={pagination}
              itemName={itemName}
              length={dataLength || length - increasedLength}
              showTotal={showTotal}
              setPage={setPage}
              setSize={setSize}
            />
          )
        }
        onChange={onChange}
        tableLayout="fixed"
        locale={{
          emptyText: (
            <div className="h-[calc(100vh-28rem)] flex items-center justify-center">
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          ),
        }}
        expandable={
          hasAnyExpandable
            ? {
                expandIcon: (props) => {
                  const { record } = props;

                  if (record?.isSummary || !hasRowExpandable(record)) {
                    return <span style={{ display: "inline-block", width: 16 }} />;
                  }

                  return <ExpandIconButton {...props} />;
                },

                expandedRowKeys,
                onExpand: (expanded, record) => {
                  setExpandedRowKeys((prev) =>
                    expanded ? [...prev, record.key] : prev.filter((k) => k !== record.key),
                  );
                },

                ...(detailTableColumns
                  ? {
                      expandedRowRender: (record) => (
                        <div className="flex flex-col lg:pl-8 py-2">
                          <div className="border p-1 pb-0 rounded-lg sub-table bg-panel">
                            <Table
                              columns={detailTableColumns}
                              dataSource={record.children || record.details || record.items || []}
                              pagination={false}
                              rowKey="id"
                              size="small"
                              scroll={{ x: "max-content", y: "max-content" }}
                            />
                          </div>
                        </div>
                      ),
                    }
                  : {}),
              }
            : undefined
        }
        className={CLASSNAME.table + (className ? ` ${className}` : "")}
        scroll={{ x: "max-content", y: "max-content" }}
        rowClassName={(record: any) =>
          record.isSummary ? "summary-row sticky-top-row font-semibold" : "cursor-pointer"
        }
        rowSelection={normalizedRowSelection}
        {...rest}
      />
    </div>
  );
};
