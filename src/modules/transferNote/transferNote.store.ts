import { createBaseStore } from "@/shared/base/createBaseStore";
import { apiEndpoint } from "@/shared/constants/apiEndpoint";
import { TransferNote, TransferNoteQuery } from "./transferNote.model";

export const useTransferNoteStore = createBaseStore<TransferNote, TransferNoteQuery>({
  key: "transfer-notes",
  apiUrl: apiEndpoint.transferNote.base,
  permissionModule: "transferNote",
});
