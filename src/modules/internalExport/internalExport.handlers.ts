import { InternalExport } from "./internalExport.model";
import { randomId } from "@/shared/utils/common.util";

type InternalExportMutation = (
  data: Partial<InternalExport>,
  opts?: { onSuccess?: (data?: InternalExport) => void },
) => void;

interface InternalExportHandlersInput {
  create?: InternalExportMutation;
  update?: InternalExportMutation;
  remove?: (id: string) => void;
  getById?: (
    id: string,
    opts?: { onSuccess?: (data: InternalExport | null) => void },
  ) => void;
  setOpen: (open: boolean) => void;
  setOpenDetail: (open: boolean) => void;
  setRowData: (data: InternalExport | undefined) => void;
  setDefaultData: (data: Partial<InternalExport> | undefined) => void;
}

export function useInternalExportHandlers({
  create,
  update,
  remove,
  getById,
  setOpen,
  setOpenDetail,
  setRowData,
  setDefaultData,
}: InternalExportHandlersInput) {
  const withDetails = (record: InternalExport, callback: (data: InternalExport) => void) => {
    if (getById) getById(record.id, { onSuccess: (data) => data && callback(data) });
    else callback(record);
  };

  const handleOpenAdd = create
    ? () => {
        setRowData(undefined);
        setDefaultData(undefined);
        setOpen(true);
      }
    : undefined;

  const handleOpenEdit = update
    ? (record: InternalExport) =>
        withDetails(record, (data) => {
          setDefaultData(undefined);
          setRowData(data);
          setOpen(true);
        })
    : undefined;

  const handleOpenDetail = (record: InternalExport) =>
    withDetails(record, (data) => {
      setRowData(data);
      setOpenDetail(true);
    });

  const handleDelete = remove ? (record: InternalExport) => remove(record.id) : undefined;

  const handleCopy = create
    ? (record: InternalExport) =>
        withDetails(record, (data) => {
          setOpenDetail(false);
          setRowData(undefined);
          setDefaultData({
            ...data,
            id: undefined,
            tempId: randomId(),
            code: "",
            lines: (data.lines || []).map((line) => ({
              ...line,
              id: undefined,
              tempId: randomId(),
              internalExportId: undefined,
            })),
          } as any);
          setOpen(true);
        })
    : undefined;

  return { handleOpenAdd, handleOpenEdit, handleOpenDetail, handleDelete, handleCopy } as const;
}
