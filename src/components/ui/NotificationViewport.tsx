import { useEffect } from "react";
import {
  CheckCircle2,
  CircleAlert,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type {
  Notification,
  NotificationTone,
} from "@/context/NotificationsContext";

type NotificationViewportProps = {
  notifications: Notification[];
  onDismiss: (id: number) => void;
};

const toneStyles: Record<NotificationTone, string> = {
  neutral: "border-slate-200 text-slate-700",
  success: "border-green-200 text-green-800",
  warning: "border-amber-200 text-amber-800",
  danger: "border-red-200 text-red-700",
};

const toneIconStyles: Record<NotificationTone, string> = {
  neutral: "bg-slate-100",
  success: "bg-green-50",
  warning: "bg-amber-50",
  danger: "bg-red-50",
};

const icons = {
  neutral: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: CircleAlert,
};

const NotificationItem = ({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: (id: number) => void;
}) => {
  const Icon = icons[notification.tone];
  const duration =
    notification.duration ?? (notification.tone === "danger" ? 8_000 : 5_000);

  useEffect(() => {
    if (duration <= 0) return;
    const timeout = window.setTimeout(
      () => onDismiss(notification.id),
      duration,
    );
    return () => window.clearTimeout(timeout);
  }, [duration, notification.id, onDismiss]);

  return (
    <article
      role={notification.tone === "danger" ? "alert" : "status"}
      className={`pointer-events-auto grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-xl border bg-white p-3.5 shadow-lg shadow-slate-900/10 ${toneStyles[notification.tone]}`}
    >
      <span
        className={`flex size-9 items-center justify-center rounded-lg ${toneIconStyles[notification.tone]}`}
      >
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-semibold text-slate-900">
          {notification.title}
        </p>
        {notification.description && (
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            {notification.description}
          </p>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="min-h-8 px-2 text-slate-500"
        aria-label="Закрыть уведомление"
        onClick={() => onDismiss(notification.id)}
      >
        <X aria-hidden="true" className="size-4" />
      </Button>
    </article>
  );
};

export const NotificationViewport = ({
  notifications,
  onDismiss,
}: NotificationViewportProps) => (
  <div
    aria-label="Уведомления"
    className="pointer-events-none fixed inset-x-4 top-4 z-[1000] flex flex-col gap-2 sm:left-auto sm:w-full sm:max-w-sm"
  >
    {notifications.map((notification) => (
      <NotificationItem
        key={notification.id}
        notification={notification}
        onDismiss={onDismiss}
      />
    ))}
  </div>
);
