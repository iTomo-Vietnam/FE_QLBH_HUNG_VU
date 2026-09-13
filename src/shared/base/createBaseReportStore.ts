import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatPayload } from "@/shared/utils/common.util";
import {
  ApiRequestQuery,
  ApiResponse,
  BaseFailurePayload,
  PaginationProps,
  SummaryData,
} from "@/shared/interfaces/api";
import { getData } from "../api/apiClient";
import { Entity } from "./entity";
import { Module, Permission } from "../constants/permission";
import { useGlobalData } from "../hooks/useGlobalData";
import { checkPermission } from "../utils/permission.util";

export type BaseReportStoreReturn<TReport = any, TTransaction = any> = {
  reports: TReport[];
  summary?: SummaryData | null;
  pagination?: PaginationProps | null;
  loading: boolean;
  transactions: TTransaction[];
  transactionSummary?: SummaryData | null;
  transactionPagination?: PaginationProps | null;
};

export function createBaseReportStore<
  TReport extends Entity,
  TTransaction extends Entity,
  TQuery extends ApiRequestQuery,
>(config: {
  key: string;
  apiUrl: string;
  permissionModule?: Module | string;
  /** Reports are scoped by the backend to all stores readable by the user. */
  storeScope?: "available" | "current" | "none";
}): (params?: TQuery) => BaseReportStoreReturn<TReport, TTransaction> {
  return function useBaseReportStore(
    params?: TQuery,
  ): BaseReportStoreReturn<TReport, TTransaction> {
    const { permissions } = useGlobalData();

    const can = config.permissionModule
      ? (permission: Permission) =>
          checkPermission(permissions, config.permissionModule! as Module, permission)
      : () => true;

    const paramsWithStore = { ...params };
    const reportQuery = useQuery<ApiResponse<TReport[]>, BaseFailurePayload>({
      queryKey: [config.key, "report", paramsWithStore],
      placeholderData: keepPreviousData,
      queryFn: async () => {
        let finalParams = formatPayload(paramsWithStore);
        return await getData<TReport[]>(`${config.apiUrl}/report`, finalParams);
      },
      enabled: can("read") && (!paramsWithStore || !paramsWithStore.isLockedReport),
    });

    const transactionQuery = useQuery<ApiResponse<TTransaction[]>, BaseFailurePayload>({
      queryKey: [config.key, "transaction", paramsWithStore],
      placeholderData: keepPreviousData,
      queryFn: async () => {
        let finalParams = formatPayload(paramsWithStore);
        return await getData<TTransaction[]>(`${config.apiUrl}/transaction`, finalParams);
      },
      enabled: can("read") && (!paramsWithStore || !paramsWithStore.isLockedTransaction),
    });

    return {
      loading: reportQuery.isLoading || transactionQuery.isLoading,
      reports: reportQuery.data?.data || [],
      summary: reportQuery.data?.summary || null,
      pagination: reportQuery.data?.pagination || null,
      transactions: transactionQuery.data?.data || [],
      transactionSummary: transactionQuery.data?.summary || null,
      transactionPagination: transactionQuery.data?.pagination || null,
    };
  };
}
