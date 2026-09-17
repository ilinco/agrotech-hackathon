import { createContext } from "react";

export type NotificationTone = "neutral" | "success" | "warning" | "danger";

export type NotificationInput = {
  title: string;
  description?: string;
  tone?: NotificationTone;
  duration?: number;
};

export type Notification = NotificationInput & {
  id: number;
  tone: NotificationTone;
};

export type NotificationsContextValue = {
  notify: (notification: NotificationInput) => number;
  dismiss: (id: number) => void;
  success: (title: string, description?: string) => number;
  error: (title: string, description?: string) => number;
  warning: (title: string, description?: string) => number;
  info: (title: string, description?: string) => number;
};

export const NotificationsContext = createContext<
  NotificationsContextValue | undefined
>(undefined);
