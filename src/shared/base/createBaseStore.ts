import { useState, useEffect } from "react";
import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatPayload } from "@/shared/utils/common.util";
import {
  ApiRequestQuery,
  ApiResponse,
  BaseError,
  BaseFailurePayload,
  FilterItem,
  MenuProps,
  PaginationProps,
  PayloadWithSubId,
  SummaryData,
} from "@/shared/interfaces/api";
import { deleteData, deleteMultiData, getData, postData, putData } from "../api/apiClient";
import { Entity } from "./entity";
import { useErrorState } from "../hooks/useErrorState";
import { Module, Permission } from "../constants/permission";
import { useGlobalData } from "../hooks/useGlobalData";
import { checkPermission } from "../utils/permission.util";

export type BaseStoreReturn<T> = {
  isSuccess: boolean;
  data: T[];
  pagination?: PaginationProps;
  summary?: SummaryData | null;
  errors: BaseError[];
  menu: MenuProps[];
  loading: boolean;
  filterItems: FilterItem[];

  fetching: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;

  getById?: (
    payload: string | PayloadWithSubId,
    opts?: { onSuccess?: (data: T | null) => void },
  ) => void;
  /** Fetch a non-paginated, full-detail list without changing the current list query. */
  getAll?: (params?: any) => Promise<T[]>;
  create?: (data: Partial<T>, opts?: { onSuccess?: (data?: T) => void }) => void;
  createMany?: (data: Partial<T>[], opts?: { onSuccess?: (data?: T[]) => void }) => void;
  update?: (data: Partial<T>, opts?: { onSuccess?: (data?: T) => void }) => void;
  remove?: (payload: string | PayloadWithSubId, opts?: { onSuccess?: () => void }) => void;
  removeMany?: (ids: string[], opts?: { onSuccess?: () => void }) => void;

  newItem: T | null;
  deletedId: string | null;
  deleteManyIds: string[];
  dataById: T | null;
};

interface EntityMessage {
  ADD: string;
  UPDATE: string;
  DELETE: string;
}

export function createBaseStore<
  T extends Entity,
  TQuery extends ApiRequestQuery,
  TExtra extends Record<string, any> = {},
>(config: {
  key: string;
  apiUrl: string;
  permissionModule?: Module | string;
  /** Normal screens are scoped to the active store; dashboards/reports can opt out. */
  storeScope?: "current" | "available" | "none";
  messages?: EntityMessage;

  extend?: (ctx: {
    queryClient: ReturnType<typeof useQueryClient>;
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    can: (permission: Permission) => boolean;
    notify: (type: "success" | "error" | "info" | "warning", message: string) => void;
    onSuccess?: () => void;
    onError: (error: any) => void;
  }) => TExtra;
}): (params?: TQuery, onSuccess?: () => void) => BaseStoreReturn<T> & TExtra {
  return function useBaseStore(
    params?: TQuery,
    onSuccess?: () => void,
  ): BaseStoreReturn<T> & TExtra {
    const queryClient = useQueryClient();
    const { permissions, currentStore } = useGlobalData();
    const effectiveParams =
      config.storeScope === "none"
        ? params
        : config.storeScope === "available"
          ? params
          : {
              ...params,
              storeIds:
                (params as any)?.storeIds ?? (currentStore?.id ? [currentStore.id] : []),
            };

    const can = config.permissionModule
      ? (permission: Permission) =>
          checkPermission(permissions, config.permissionModule! as Module, permission)
      : () => true;

    // ===== temporary states =====
    const [newItem, setNewItem] = useState<T | null>(null);
    const [deletedId, setDeletedId] = useState<string | null>(null);
    const [deleteManyIds, setDeleteManyIds] = useState<string[]>([]);
    const [dataById, setDataById] = useState<T | null>(null);
    const { notify, errors, onError } = useErrorState();

    const query = useQuery<ApiResponse<T[]>, BaseFailurePayload>({
      queryKey: [config.key, effectiveParams],
      placeholderData: keepPreviousData,
      queryFn: async () => {
        let finalParams = formatPayload(effectiveParams);
        return await getData<T[]>(config.apiUrl, finalParams);
      },
      enabled: can("read") && (!effectiveParams || !effectiveParams.isLocked),
    });

    // ===== CREATE =====
    const createMutation = useMutation<ApiResponse<T>, BaseFailurePayload, Partial<T>>({
      mutationFn: async (data: Partial<T>) => await postData(config.apiUrl, data),
    });
    const create = can("create")
      ? (data: Partial<T>, opts?: { onSuccess?: (createdItem: T) => void }) => {
          createMutation.mutate(data, {
            onSuccess: (res) => {
              setNewItem(res.data || null);
              queryClient.invalidateQueries({
                queryKey: [config.key],
              });
              if (res.data) opts?.onSuccess?.(res.data);
              onSuccess?.();
              notify("success", config.messages?.ADD || "Thêm mới thành công");
            },
            onError,
          });
        }
      : undefined;

    // ===== CREATE MANY =====
    const createManyMutation = useMutation<ApiResponse<T[]>, BaseFailurePayload, Partial<T>[]>({
      mutationFn: async (data: Partial<T>[]) => await postData(`${config.apiUrl}/bulk`, { data }),
    });
    const createMany = can("create")
      ? (data: Partial<T>[], opts?: { onSuccess?: (createdItems: T[]) => void }) => {
          createManyMutation.mutate(data, {
            onSuccess: (res) => {
              queryClient.invalidateQueries({
                queryKey: [config.key],
              });
              if (res.data) opts?.onSuccess?.(res.data);
              onSuccess?.();
              notify("success", config.messages?.ADD || "Thêm mới thành công");
            },
            onError,
          });
        }
      : undefined;

    // ===== UPDATE =====
    const updateMutation = useMutation<ApiResponse<T>, BaseFailurePayload, Partial<T>>({
      mutationFn: async (data: Partial<T>) => await putData(`${config.apiUrl}/${data.id}`, data),
    });
    const update = can("update")
      ? (data: Partial<T>, opts?: { onSuccess?: (updatedItem: T) => void }) => {
          updateMutation.mutate(data, {
            onSuccess: (res) => {
              setNewItem(res.data || null);
              queryClient.invalidateQueries({
                queryKey: [config.key],
              });
              if (res.data) opts?.onSuccess?.(res.data);
              onSuccess?.();
              notify("success", config.messages?.UPDATE || "Cập nhật thành công");
            },
            onError,
          });
        }
      : undefined;

    // ===== DELETE =====
    const deleteMutation = useMutation<ApiResponse, BaseFailurePayload, string | PayloadWithSubId>({
      mutationFn: async (payload: string | PayloadWithSubId) => {
        let id: string;
        let data = payload;

        if (typeof payload === "object") {
          id = payload.id;
        } else {
          id = payload;
        }

        return await deleteData(`${config.apiUrl}/${id}`, data);
      },
    });
    const remove = can("delete")
      ? (payload: string | PayloadWithSubId, opts?: { onSuccess?: () => void }) => {
          deleteMutation.mutate(payload, {
            onSuccess: () => {
              setDeletedId(typeof payload === "string" ? payload : payload.id);
              queryClient.invalidateQueries({
                queryKey: [config.key],
              });
              opts?.onSuccess?.();
              onSuccess?.();
              notify("success", config.messages?.DELETE || "Xóa thành công");
            },
            onError,
          });
        }
      : undefined;

    const deleteManyMutation = useMutation<ApiResponse, BaseFailurePayload, string[]>({
      mutationFn: async (ids: string[]) => await deleteMultiData(`${config.apiUrl}/bulk`, { ids }),
    });
    const removeMany = can("delete")
      ? (ids: string[], opts?: { onSuccess?: () => void }) => {
          deleteManyMutation.mutate(ids, {
            onSuccess: () => {
              setDeleteManyIds(ids);
              queryClient.invalidateQueries({
                queryKey: [config.key],
              });
              opts?.onSuccess?.();
              onSuccess?.();
              notify("success", config.messages?.DELETE || "Xóa thành công");
            },
            onError,
          });
        }
      : undefined;

    // ===== GET BY ID =====
    const getByIdMutation = useMutation<
      ApiResponse<T>,
      BaseFailurePayload,
      string | PayloadWithSubId
    >({
      mutationFn: async (payload: string | PayloadWithSubId) => {
        let id: string;
        if (typeof payload === "object") {
          id = payload.id;
        } else {
          id = payload;
        }

        let url = `${config.apiUrl}/${id}`;

        return await getData(url);
      },
    });
    const getById = can("read")
      ? (payload: string | PayloadWithSubId, opts?: { onSuccess?: (data: T | null) => void }) => {
          getByIdMutation.mutate(payload, {
            onSuccess: (res) => {
              setDataById(res.data || null);
              opts?.onSuccess?.(res.data || null);
            },
            onError,
          });
        }
      : undefined;

    const getAll = can("read")
      ? async (params?: any): Promise<T[]> => {
          const response = await getData<T[]>(config.apiUrl, formatPayload(params));
          return response.data || [];
        }
      : undefined;

    // Handle error for query
    useEffect(() => {
      if (!query.error) return;

      onError(query.error);
    }, [query.error]);

    // ===== auto-reset temporary states =====
    useEffect(() => {
      if (newItem) setNewItem(null);
    }, [newItem]);

    useEffect(() => {
      if (deletedId) setDeletedId(null);
    }, [deletedId]);

    useEffect(() => {
      if (!!deleteManyIds.length) setDeleteManyIds([]);
    }, [deleteManyIds]);

    useEffect(() => {
      if (dataById) setDataById(null);
    }, [dataById]);

    const extra = (config.extend?.({
      queryClient,
      canCreate: can("create"),
      canRead: can("read"),
      canUpdate: can("update"),
      canDelete: can("delete"),
      can,
      notify,
      onSuccess,
      onError,
    }) || {}) as TExtra;

    return {
      isSuccess: query.isSuccess,
      data: query.data?.data || [],
      pagination: query.data?.pagination,
      summary: query.data?.summary,
      errors,
      filterItems: query.data?.filterItems || [],
      menu: query.data?.menu || [],
      loading: query.isLoading,

      fetching: getByIdMutation.isPending,
      creating: createMutation.isPending || createManyMutation.isPending,
      updating: updateMutation.isPending,
      deleting: deleteMutation.isPending || deleteManyMutation.isPending,

      // actions
      getById,
      getAll,
      create,
      createMany,
      update,
      remove,
      removeMany,

      // temporary states
      newItem,
      deletedId,
      deleteManyIds,
      dataById,

      ...(extra || {}),
    };
  };
}
