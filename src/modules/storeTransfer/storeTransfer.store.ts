import { createBaseStore } from "@/shared/base/createBaseStore";
import { apiEndpoint } from "@/shared/constants/apiEndpoint";
import { postData } from "@/shared/api/apiClient";
import { buildUrlWithId } from "@/shared/utils/url.util";
import { StoreTransfer, StoreTransferQuery } from "./storeTransfer.model";

export const useStoreTransferStore = createBaseStore<
  StoreTransfer,
  StoreTransferQuery,
  {
    exportTransfer?: (id: string) => Promise<void>;
    importTransfer?: (id: string) => Promise<void>;
    cancelTransfer?: (id: string) => Promise<void>;
  }
>({
  key: "storeTransfers",
  apiUrl: apiEndpoint.storeTransfer.base,
  permissionModule: "storeTransfer",
  extend: ({ queryClient, notify, onError, onSuccess, can }) => ({
    exportTransfer: can("complete")
      ? async (id: string) => {
          try {
            await postData(buildUrlWithId(`${apiEndpoint.storeTransfer.base}/:id/export`, id), {});
            queryClient.invalidateQueries({ queryKey: ["storeTransfers"] });
            notify("success", "Xuất kho chuyển thành công");
            onSuccess?.();
          } catch (error) {
            onError(error);
            throw error;
          }
        }
      : undefined,
    importTransfer: can("complete")
      ? async (id: string) => {
          try {
            await postData(buildUrlWithId(`${apiEndpoint.storeTransfer.base}/:id/import`, id), {});
            queryClient.invalidateQueries({ queryKey: ["storeTransfers"] });
            notify("success", "Nhập kho chuyển thành công");
            onSuccess?.();
          } catch (error) {
            onError(error);
            throw error;
          }
        }
      : undefined,
    cancelTransfer: can("update")
      ? async (id: string) => {
          try {
            await postData(buildUrlWithId(`${apiEndpoint.storeTransfer.base}/:id/cancel`, id), {});
            queryClient.invalidateQueries({ queryKey: ["storeTransfers"] });
            notify("success", "Hủy phiếu chuyển hàng thành công");
            onSuccess?.();
          } catch (error) {
            onError(error);
            throw error;
          }
        }
      : undefined,
  }),
});
