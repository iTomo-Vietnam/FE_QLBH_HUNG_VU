import { createBaseStore } from "@/shared/base/createBaseStore";
import { getData, postData } from "@/shared/api/apiClient";
import { apiEndpoint } from "@/shared/constants/apiEndpoint";
import { DailyReport } from "./dailyReport.model";

export const useDailyReportStore = createBaseStore<
  DailyReport,
  { page?: number; size?: number; isLocked?: boolean },
  {
    getCurrent?: () => Promise<DailyReport | null>;
    cancelReport?: (id: string) => Promise<void>;
  }
>({
  key: "daily-reports",
  apiUrl: apiEndpoint.dailyReport.base,
  permissionModule: "dailyReport",
  extend: ({ can, queryClient, notify }) => ({
    getCurrent: can("read")
      ? async () => {
          const response = await getData<DailyReport>(apiEndpoint.dailyReport.current);
          return response.data || null;
        }
      : undefined,
    cancelReport: can("update")
      ? async (id: string) => {
          await postData(apiEndpoint.dailyReport.cancel.replace(":id", id), {});
          queryClient.invalidateQueries({ queryKey: ["daily-report-current"] });
          queryClient.invalidateQueries({ queryKey: ["daily-reports"] });
          notify("success", "Đã hủy báo cáo hằng ngày");
        }
      : undefined,
  }),
});
