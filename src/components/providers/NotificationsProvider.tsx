import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import {
  NotificationsContext,
  type Notification,
  type NotificationInput,
  type NotificationTone,
} from "@/context/NotificationsContext";
import { NotificationViewport } from "@/components/ui/NotificationViewport";

const MAX_VISIBLE_NOTIFICATIONS = 4;

export const NotificationsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback((input: NotificationInput) => {
    const id = ++nextId.current;
    setNotifications((current) =>
      [...current, { ...input, id, tone: input.tone ?? "neutral" }].slice(
        -MAX_VISIBLE_NOTIFICATIONS,
      ),
    );
    return id;
  }, []);

  const createToneNotifier = useCallback(
    (tone: NotificationTone) => (title: string, description?: string) =>
      notify({ title, description, tone }),
    [notify],
  );

  const value = useMemo(
    () => ({
      notify,
      dismiss,
      success: createToneNotifier("success"),
      error: createToneNotifier("danger"),
      warning: createToneNotifier("warning"),
      info: createToneNotifier("neutral"),
    }),
    [createToneNotifier, dismiss, notify],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <NotificationViewport notifications={notifications} onDismiss={dismiss} />
    </NotificationsContext.Provider>
  );
};
