import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NotificationNavigationState } from "@/shared/utils/notificationTarget";

export const useNotificationDetailNavigation = <T extends { id: string }>(
  onOpenDetail?: (record: T) => void,
) => {
  const location = useLocation();
  const navigate = useNavigate();
  const handledKey = useRef<string>();
  const state = location.state as NotificationNavigationState | null;
  const notification = state?.notification;
  const entityId = notification?.entityId;
  const key = notification?.notificationId || entityId;

  useEffect(() => {
    if (!key || !entityId) {
      handledKey.current = undefined;
      return;
    }
    if (handledKey.current === key || !onOpenDetail) return;

    handledKey.current = key;
    onOpenDetail({ id: entityId } as T);
    const currentState = location.state;
    const nextState =
      currentState && typeof currentState === "object"
        ? { ...(currentState as Record<string, unknown>) }
        : null;
    if (nextState) delete nextState.notification;
    void navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: nextState && Object.keys(nextState).length ? nextState : null,
    });
  }, [
    entityId,
    key,
    location.pathname,
    location.search,
    location.state,
    navigate,
    onOpenDetail,
  ]);
};
