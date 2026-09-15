import { useCallback } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { RootState } from "@/shared/stores";
import {
  setCollapsed,
  setDrawerOpen,
  setCustomTitle,
  setFilter,
  setHorizontal,
  setThemeMode,
  setTotalUnread,
  setInfo,
  setPermissions,
  setIsMobile,
  clearState,
  setCurrentStore,
} from "@/shared/stores/global.slice";
import { ThemeMode } from "@/shared/interfaces/common";
import { UserInfo } from "../interfaces/auth";
import { Store } from "@/shared/base/entity";
import { Module, readPermissionFallbackMap } from "../constants";

export const useGlobalData = () => {
  const dispatch = useDispatch();
  const {
    horizontal,
    collapsed,
    drawerOpen,
    format,
    info,
    isMobile,
    permissions,
    totalUnread,
    customTitle,
    themeMode,
    filter,
    currentStore,
  } = useSelector((state: RootState) => state.Global, shallowEqual);
  const allStores = info?.allStores || [];

  const handleSetIsMobile = useCallback(
    (isMobile: boolean) => {
      dispatch(setIsMobile(isMobile));
    },
    [dispatch],
  );

  const handleSetTotalUnread = useCallback(
    (count: number) => {
      dispatch(setTotalUnread(count));
    },
    [dispatch],
  );

  const handleSetCustomTitle = useCallback(
    (title: string | null) => {
      dispatch(setCustomTitle(title));
    },
    [dispatch],
  );

  const handleSetFilter = useCallback(
    (filterData: typeof filter) => {
      dispatch(setFilter(filterData));
    },
    [dispatch],
  );

  const handleClearFilter = useCallback(() => {
    dispatch(setFilter({}));
  }, [dispatch]);

  const handleSetInfo = useCallback(
    (data?: UserInfo | null) => {
      dispatch(setInfo(data));
    },
    [dispatch],
  );
  const handleSetHorizontal = useCallback(
    (isHorizontal: boolean) => {
      dispatch(setHorizontal(isHorizontal));
    },
    [dispatch],
  );
  const handleSetCollapsed = useCallback(
    (isCollapsed: boolean) => {
      dispatch(setCollapsed(isCollapsed));
    },
    [dispatch],
  );
  const handleSetDrawerOpen = useCallback(
    (isOpen: boolean) => {
      dispatch(setDrawerOpen(isOpen));
    },
    [dispatch],
  );
  const handleSetThemeMode = useCallback(
    (mode: ThemeMode) => {
      dispatch(setThemeMode(mode));
    },
    [dispatch],
  );
  const handleSetCurrentStore = useCallback(
    (company?: Store | null, reload: boolean = true) => {
      if (company) {
        sessionStorage.setItem("currentStore", JSON.stringify(company));
      } else {
        sessionStorage.removeItem("currentStore");
      }
      dispatch(setCurrentStore(company));

      if (company && !info?.isAdmin) {
        const storePermissions = info?.storeUsers?.find(
          (storeUser) => storeUser.storeId === company.id,
        )?.role?.permissions;
        dispatch(setPermissions(storePermissions || null));
      }

      if (reload) {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    },
    [dispatch, info],
  );

  const handleClearState = useCallback(() => {
    dispatch(clearState());
  }, [dispatch]);

  const getAvailableStores = useCallback(
    (module: Module): Store[] => {
      if (!info) return [];
      if (info.isAdmin) return allStores;

      const fallbackModules = readPermissionFallbackMap[module] || [];
      const hasReadPermission = (permissions?: Record<string, string[]>) =>
        Boolean(
          permissions?.[module]?.includes("read") ||
            fallbackModules.some(
              (fallback) =>
                permissions?.[fallback]?.includes("read") ||
                permissions?.[fallback]?.includes("create"),
            ),
        );

      return (info.storeUsers || [])
        .filter((storeUser) => hasReadPermission(storeUser.role?.permissions))
        .map((storeUser) => storeUser.store)
        .filter((store): store is Store => Boolean(store));
    },
    [allStores, info],
  );

  return {
    currentStore,
    horizontal,
    collapsed,
    drawerOpen,
    format,
    info,
    isMobile,
    permissions,
    totalUnreadNotifications: totalUnread,
    customTitle,
    themeMode,
    filter,
    allStores,
    getAvailableStores,
    handleSetIsMobile,
    handleSetTotalUnread,
    handleSetCustomTitle,
    handleSetFilter,
    handleClearFilter,
    handleSetInfo,
    handleSetHorizontal,
    handleSetCollapsed,
    handleSetThemeMode,
    handleSetDrawerOpen,
    handleSetCurrentStore,
    handleClearState,
  };
};
