import { isAxiosError } from "axios";

type ApiErrorBody = {
  error?: string | { message?: string };
  message?: string;
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Не удалось выполнить запрос.",
) => {
  if (!isAxiosError<ApiErrorBody>(error)) return fallback;

  if (error.code === "ECONNABORTED") {
    return "Сервер не ответил вовремя. Проверьте подключение и повторите попытку.";
  }
  if (!error.response) {
    return "Не удалось подключиться к серверу. Проверьте, запущен ли API.";
  }

  const apiError = error.response.data?.error;
  if (typeof apiError === "string" && apiError.trim()) return apiError;
  if (typeof apiError === "object" && apiError?.message) {
    return apiError.message;
  }
  if (error.response.data?.message) return error.response.data.message;
  if (error.response.status === 404) return "Запрошенные данные не найдены.";
  if (error.response.status >= 500) {
    return "Сервис временно недоступен. Повторите попытку позже.";
  }

  return fallback;
};
