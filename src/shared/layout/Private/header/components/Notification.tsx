import { Badge, Button, Empty, List } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";

import { useGlobalData } from "@/shared/hooks/useGlobalData";
import { Notification as NotificationData } from "@/shared/interfaces/notification";
import { useNotification } from "@/shared/hooks/useNotification";
import socket from "@/shared/services/socket";
import { BellIcon } from "@heroicons/react/24/outline";
import { formatDateDDMMYYYY } from "@/shared/utils/date.util";
import { formatQuantity } from "@/shared/utils/number.util";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";

const PLACEHOLDER_REGEX = /\{([^}]+)\}/g;

const areNotificationListsEqual = (
  first: NotificationData[],
  second: NotificationData[],
): boolean =>
  first.length === second.length &&
  first.every(
    (notification, index) =>
      notification.id === second[index]?.id &&
      notification.isRead === second[index]?.isRead,
  );

const Highlight: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium"
    title={String(children)}
  >
    {children}
  </span>
);

function getValue(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce((current, key) => (current as Record<string, unknown> | undefined)?.[key], obj);
}

function formatValue(value: unknown): string {
  if (value == null) return "";

  if (typeof value === "number") {
    return formatQuantity(value);
  }

  if (typeof value === "boolean") {
    return value ? "Có" : "Không";
  }

  if (value instanceof Date) {
    return formatDateDDMMYYYY(value);
  }

  if (typeof value === "string") {
    // Only treat as date if it looks like ISO 8601 (avoids false positives like "MC-00034")
    const isoPattern = /^\d{4}-\d{2}-\d{2}(T| |\d)/;
    if (isoPattern.test(value) && dayjs(value).isValid()) {
      return formatDateDDMMYYYY(value);
    }

    return value;
  }

  return String(value);
}

function renderNotificationBody(template: string, data?: Record<string, unknown>): React.ReactNode {
  const result: React.ReactNode[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = PLACEHOLDER_REGEX.exec(template)) !== null) {
    if (match.index > lastIndex) {
      result.push(template.slice(lastIndex, match.index));
    }

    const key = match[1].trim();

    const value = getValue(data, key);

    result.push(<Highlight key={index++}>{formatValue(value)}</Highlight>);

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < template.length) {
    result.push(template.slice(lastIndex));
  }

  return result;
}

export const NotificationComponent: React.FC<{
  item: NotificationData;
}> = ({ item }) => {
  if (!item.body) return null;

  return <>{renderNotificationBody(item.body, item.data as Record<string, unknown>)}</>;
};

const Notification: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const { info, handleSetTotalUnread, totalUnreadNotifications } = useGlobalData();

  const {
    notifications: notificationData,
    loading,
    totalUnread,
    pagination,
    onClick,
    seenNotifications,
    seenAllNotifications,
  } = useNotification({
    page,
    size: 10,
  });

  const bellIconRef = useRef<HTMLDivElement>(null);
  const notifyTableRef = useRef<HTMLDivElement>(null);
  const totalUnreadRef = useRef(totalUnreadNotifications);

  useEffect(() => {
    totalUnreadRef.current = totalUnreadNotifications;
  }, [totalUnreadNotifications]);

  useEffect(() => {
    const currentPage = pagination?.currentPage ?? page;

    if (currentPage === 1) {
      setNotifications((previous) =>
        areNotificationListsEqual(previous, notificationData) ? previous : notificationData,
      );
      return;
    }

    setNotifications((prevList) => {
      const existingIds = new Set(prevList.map((item) => item.id));
      const newItems = notificationData.filter((item) => !existingIds.has(item.id));
      return newItems.length ? [...prevList, ...newItems] : prevList;
    });
  }, [notificationData, pagination?.currentPage, page]);

  useEffect(() => {
    if (!info?.id) return;

    socket.emit("register", info.id);

    const handleNewNotification = (newNotification: NotificationData) => {
      setNotifications((prevList) => {
        if (prevList.some((n) => n.id === newNotification.id)) return prevList;
        return [newNotification, ...prevList];
      });
      totalUnreadRef.current += 1;
      handleSetTotalUnread(totalUnreadRef.current);
    };

    socket.on("notification", handleNewNotification);

    return () => {
      socket.off("notification", handleNewNotification);
    };
  }, [handleSetTotalUnread, info?.id]);

  const handleViewMore = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPage((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bellIconRef.current &&
        !bellIconRef.current.contains(event.target as Node) &&
        notifyTableRef.current &&
        !notifyTableRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickNotification = (item: NotificationData) => {
    if (!item.isRead) {
      handleSetTotalUnread(totalUnreadNotifications - 1);
      setNotifications((prevList) =>
        prevList.map((notif) => (notif.id === item.id ? { ...notif, isRead: true } : notif)),
      );
      seenNotifications(item.id);
    }

    onClick(item);
    setShowNotifications(false);
  };

  const handleSeenAll = () => {
    if (totalUnreadNotifications === 0) return;
    handleSetTotalUnread(0);
    setNotifications((prevList) => prevList.map((notif) => ({ ...notif, isRead: true })));
    seenAllNotifications();
  };

  return (
    <div className="flex gap-4 items-center">
      <section
        className="flex items-center cursor-pointer relative select-none h-full"
        ref={bellIconRef}
        onClick={() => setShowNotifications((prev) => !prev)}
      >
        <Badge count={totalUnreadNotifications} size="small" offset={[2, 0]}>
          <Icon
            icon="solar:bell-line-duotone"
            className="h-6 w-6 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
          />
        </Badge>
        {showNotifications && (
          <div
            className="absolute -right-2 top-8 w-[420px] max-w-[calc(100vw-32px)] bg-panel dark:bg-gray-900 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden flex flex-col"
            ref={notifyTableRef}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-primary text-white">
              <span className="font-semibold text-base">Thông báo</span>
              {totalUnreadNotifications > 0 && (
                <button
                  className="text-sm font-medium opacity-90 hover:opacity-100 transition-opacity"
                  onClick={handleSeenAll}
                >
                  Đọc tất cả
                </button>
              )}
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-[480px] bg-panel dark:bg-gray-900 overflow-x-hidden">
              <List
                loading={loading}
                dataSource={notifications}
                locale={{
                  emptyText: (
                    <Empty
                      description={"Không có thông báo nào"}
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ),
                }}
                renderItem={(item) => (
                  <List.Item
                    className={`
                      !px-4 !py-3 transition-all cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-0
                      ${
                        item.isRead
                          ? "bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          : "bg-primary/5 hover:bg-primary/10 dark:bg-primary/10 dark:hover:bg-primary/20"
                      }
                    `}
                    onClick={() => handleClickNotification(item)}
                  >
                    <div className="flex gap-3 w-full">
                      {/* Unread Dot */}
                      {!item.isRead && (
                        <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                      )}

                      <div className="flex-1 min-w-0">
                        {/* Title & Time */}
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span
                            className={`truncate text-sm ${
                              item.isRead
                                ? "font-normal text-gray-700 dark:text-gray-300"
                                : "font-semibold text-gray-900 dark:text-gray-100"
                            }`}
                          >
                            {item.title}
                          </span>
                          <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap pt-0.5">
                            {formatDateDDMMYYYY(item.createdAt)}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          <NotificationComponent item={item} />
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>

            {/* Footer / View More */}
            {!!notifications?.length && notifications?.length < (pagination?.totalRecords || 0) && (
              <div className="p-2 text-center border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                <Button
                  type="link"
                  size="small"
                  onClick={handleViewMore}
                  className="text-primary hover:text-primary-hover w-full"
                >
                  Xem thêm thông báo
                </Button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Notification;
