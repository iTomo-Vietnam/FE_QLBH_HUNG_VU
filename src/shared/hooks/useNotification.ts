import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatPayload } from "@/shared/utils/common.util";
import { getData, postData } from "../api/apiClient";
import { apiEndpoint } from "../constants/apiEndpoint";
import { ApiResponse, BaseFailurePayload } from "../interfaces/api";
import { Notification } from "../interfaces/notification";
import { useLocation, useNavigate } from "react-router-dom";
import { useGlobalData } from "./useGlobalData";
import { useErrorState } from "./useErrorState";
import { getNotificationTarget } from "@/shared/utils/notificationTarget";

const EMPTY_NOTIFICATIONS: Notification[] = [];

export const useNotification = (params?: { page?: number; size?: number; keyword?: string }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    info,
    permissions,
    currentStore,
    allStores,
    handleSetCurrentStore,
    handleSetTotalUnread,
  } = useGlobalData();
  const { errors, onError } = useErrorState();

  const onClick = (item: Notification) => {
    const storePermissions = Object.fromEntries(
      (info?.storeUsers || []).map((storeUser) => [
        storeUser.storeId,
        storeUser.role?.permissions || null,
      ]),
    );
    const target = getNotificationTarget(
      item,
      permissions,
      info?.isAdmin,
      storePermissions,
    );
    if (!target) return;

    const targetStoreId = target.state?.notification?.storeId;
    if (targetStoreId && targetStoreId !== currentStore?.id) {
      const targetStore =
        allStores.find((store) => store.id === targetStoreId) ||
        info?.storeUsers?.find((storeUser) => storeUser.storeId === targetStoreId)?.store;
      if (!targetStore) return;

      // Keep the current route alive so the notification state can be consumed
      // by the destination page after the store context has been changed.
      handleSetCurrentStore(targetStore, false);
    }

    const targetPath = target.path.split(/[?#]/, 1)[0].replace(/\/$/, "") || "/";
    const currentPath = location.pathname.replace(/\/$/, "") || "/";

    if (targetPath === currentPath) {
      void queryClient.refetchQueries({ type: "active" });
      if (target.state) navigate(target.path, { state: target.state });
      return;
    }

    navigate(target.path, { state: target.state });
  };

  // ===== QUERY =====
  const query = useQuery<ApiResponse<Notification[]>, BaseFailurePayload>({
    queryKey: ["notification", params, info?.id],
    queryFn: async () => {
      if (!info)
        return {
          statusCode: 0,
          success: false,
          message: "No user info",
          data: [],
          menu: [],
        } as ApiResponse<Notification[]>;
      const finalParams = formatPayload(params);
      return await getData(apiEndpoint.auth.notification.base, finalParams);
    },
  });

  // ===== ERROR HANDLE (v5 style) =====
  useEffect(() => {
    if (!query.error) return;
    onError(query.error);
  }, [onError, query.error]);

  useEffect(() => {
    if (query.data?.success) {
      handleSetTotalUnread(query.data?.summary?.totalUnread || 0);
    }
  }, [handleSetTotalUnread, query.data]);

  // ===== SEEN ONE =====
  const seenMutation = useMutation<ApiResponse, BaseFailurePayload, string>({
    mutationFn: async (id: string) => {
      return await postData(`${apiEndpoint.auth.notification.base}/${id}/mark-as-read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification"] });
    },
  });

  // ===== SEEN ALL =====
  const seenAllMutation = useMutation({
    mutationFn: async () => {
      return await postData(apiEndpoint.auth.notification.all, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification"] });
    },
  });

  return {
    notifications: query.data?.data ?? EMPTY_NOTIFICATIONS,
    totalUnread: query.data?.summary?.totalUnread || 0,
    pagination: query.data?.pagination,
    loading: query.isLoading,
    errors,

    onClick,
    seenNotifications: seenMutation.mutate,
    seenAllNotifications: seenAllMutation.mutate,
  };
};
