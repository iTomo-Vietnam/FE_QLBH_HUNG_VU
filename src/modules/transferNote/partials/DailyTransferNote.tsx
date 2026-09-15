import React, { useMemo } from "react";
import { Empty, Tag } from "antd";
import { AddButton, Panel, SearchInput } from "@/shared/components";
import { ButtonFilter } from "@/shared/components/filters";
import { useTransferNoteStore } from "../transferNote.store";
import { usePageState } from "@/shared/hooks/usePageState";
import {
  filterUses,
  sortItems,
  TransferNote,
  TransferNoteStatus,
  transferNoteStatusMap,
} from "../transferNote.model";
import { TransferNoteAddUpdateModal } from "../components";
import { useTransferNoteHandlers } from "../handlers";
import { SortOrder } from "@/shared/constants";
import { formatDateTimeDDMMYYYY, formatMoney } from "@/shared/utils";

interface Props {
  onClickReferenceCode?: (record: TransferNote) => void;
  onChanged?: () => void;
}

const shortTime = (value: string | Date) => {
  const parts = formatDateTimeDDMMYYYY(value).split(" ");
  return parts[parts.length - 1] || "—";
};

export const DailyTransferNote: React.FC<Props> = ({ onClickReferenceCode, onChanged }) => {
  const {
    isFilterActive,
    keyword,
    sortBy,
    sortOrder,
    filter,
    reload,
    open,
    setOpen,
    rowData,
    setRowData,
    pageAction,
  } = usePageState<TransferNote>({
    filterUses,
    sortBy: "occurredAt",
    sortOrder: SortOrder.ASC,
  });

  const { data, errors, loading, creating, updating, create, update, remove, getById } =
    useTransferNoteStore(
      {
        keyword,
        page: 1,
        size: 999999,
        reload,
        sortBy,
        sortOrder,
        ...filter,
      },
      () => {
        pageAction.handleClose();
        onChanged?.();
      },
    );

  const { handleOpenAdd, handleOpenEdit, handleDelete } = useTransferNoteHandlers({
    create,
    update,
    remove,
    getById,
    setOpen,
    setRowData,
  });

  const rows = useMemo(() => data || [], [data]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <SearchInput value={keyword} onSearch={pageAction.handleSearch} maxWidth={280} />
          <ButtonFilter
            filterActive={isFilterActive}
            sortItems={sortItems}
            sortValue={{ sortBy, sortOrder }}
            onSortChange={pageAction.handleSortChange}
            filterUses={filterUses}
            onClearFilter={pageAction.resetFilter}
          />
        </div>
        <AddButton title="Thêm ghi chú" onOpenAdd={handleOpenAdd} />
      </div>

      <Panel className="min-h-0 min-w-0 flex-1 overflow-hidden p-0">
        <div className="h-full overflow-auto">
          <table className="w-full min-w-[1050px] border-collapse text-xs">
            <colgroup>
              <col className="w-14" />
              <col className="w-20" />
              <col className="min-w-32 max-w-48" />
              <col className="min-w-40 max-w-64" />
              <col className="min-w-28 max-w-56" />
              <col className="w-24" />
              <col className="w-28" />
              <col className="min-w-28 max-w-40" />
              <col className="w-24" />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-slate-100 text-left text-slate-600">
              <tr className="text-xs">
                <th className="border-b px-2 py-2 text-center text-xs uppercase font-semibold">STT</th>
                <th className="border-b px-2 py-2 text-center text-xs uppercase font-semibold">Giờ</th>
                <th className="border-b px-2 py-2 text-xs uppercase font-semibold">Số phiếu đối soát</th>
                <th className="border-b px-2 py-2 text-xs uppercase font-semibold">STK nhận</th>
                <th className="border-b px-2 py-2 text-xs uppercase font-semibold">Ghi chú</th>
                <th className="border-b px-2 py-2 text-center text-xs uppercase font-semibold">
                  Trạng thái
                </th>
                <th className="border-b px-2 py-2 text-right text-xs uppercase font-semibold">Thống kê</th>
                <th className="border-b px-2 py-2 text-xs uppercase font-semibold">Người tạo</th>
                <th className="border-b px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-2 py-8 text-center text-slate-400" colSpan={9}>
                    Đang tải...
                  </td>
                </tr>
              ) : !rows.length ? (
                <tr>
                  <td className="px-2 py-8" colSpan={9}>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  </td>
                </tr>
              ) : (
                rows.map((record, index) => (
                  <tr key={record.id} className="border-b hover:bg-blue-50/50">
                    <td className="px-1 py-1.5 text-center text-slate-500">{index + 1}</td>
                    <td className="whitespace-nowrap px-1 py-1.5 text-center">
                      {shortTime(record.occurredAt)}
                    </td>
                    <td className="px-1 py-1.5">
                      <button
                        type="button"
                        className="font-mono font-medium text-primary hover:underline"
                        onClick={() => onClickReferenceCode?.(record)}
                      >
                        {record.referenceCode}
                      </button>
                    </td>
                    <td className="px-1 py-1.5">
                      {record.fund?.name || record.fundSnapshot?.name || "—"}
                    </td>
                    <td className="max-w-[220px] truncate px-1 py-1.5" title={record.note || ""}>
                      {record.note || "—"}
                    </td>
                    <td className="px-1 py-1.5 text-center">
                      <Tag
                        className="!m-0"
                        color={record.status === TransferNoteStatus.VALID ? "success" : "error"}
                      >
                        {transferNoteStatusMap[record.status]}
                      </Tag>
                    </td>
                    <td className="px-1 py-1.5 text-right font-medium">
                      {formatMoney(record.amount)}
                    </td>
                    <td className="px-1 py-1.5">{record.creatorSnapshot?.name || "—"}</td>
                    <td className="px-1 py-1.5 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          className="text-primary hover:underline"
                          onClick={() => handleOpenEdit?.(record)}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="text-red-600 hover:underline"
                          onClick={() => handleDelete?.(record)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <TransferNoteAddUpdateModal
        open={open}
        errors={errors}
        loading={creating || updating}
        editData={rowData}
        onAdd={create}
        onEdit={update}
        onClose={pageAction.handleClose}
      />
    </div>
  );
};
