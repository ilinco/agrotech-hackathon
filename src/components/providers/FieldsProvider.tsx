import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  assignFieldPhotos,
  createField,
  getField,
  getFields,
  getMappedFieldPhotos,
  updateFieldName,
} from "@/api/fields";
import { getPhotos, syncPhotos } from "@/api/photos";
import { FieldsContext, type NewField } from "@/context/FieldsContext";
import type { Field, FieldPhoto, MappedFieldPhoto } from "@/types/field";
import { newFieldSchema } from "@/config/fieldValidation";
import { getApiErrorMessage } from "@/api/errors";
import { useNotifications } from "@/hooks/useNotifications";

export const FieldsProvider = ({ children }: { children: ReactNode }) => {
  const notifications = useNotifications();
  const [fields, setFields] = useState<Field[]>([]);
  const [activeFieldId, setActiveFieldId] = useState<string>();
  const [activeFieldPhotos, setActiveFieldPhotos] = useState<FieldPhoto[]>([]);
  const [availablePhotos, setAvailablePhotos] = useState<FieldPhoto[]>([]);
  const [mappedFieldPhotos, setMappedFieldPhotos] = useState<
    MappedFieldPhoto[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string>();
  const activeField = fields.find((field) => field.id === activeFieldId);

  const refreshFields = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setFields(await getFields());
      notifications.success("Поля загружены", "Данные на карте обновлены.");
    } catch (requestError) {
      const message = getApiErrorMessage(
        requestError,
        "Не удалось загрузить список полей.",
      );
      setError(message);
      notifications.error("Не удалось загрузить поля", message);
    } finally {
      setLoading(false);
    }
  }, [notifications]);

  useEffect(() => {
    let cancelled = false;
    getFields()
      .then((items) => {
        if (!cancelled) setFields(items);
      })
      .catch((requestError: unknown) => {
        if (cancelled) return;
        const message = getApiErrorMessage(
          requestError,
          "Не удалось загрузить список полей.",
        );
        setError(message);
        notifications.error("Не удалось загрузить поля", message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [notifications]);

  useEffect(() => {
    if (!activeFieldId) {
      return;
    }

    let cancelled = false;
    Promise.all([
      getField(activeFieldId),
      getMappedFieldPhotos(activeFieldId),
      getPhotos(),
    ])
      .then(([fieldDetails, mappedPhotos, photos]) => {
        if (cancelled) return;
        setFields((current) =>
          current.map((item) =>
            item.id === fieldDetails.field.id ? fieldDetails.field : item,
          ),
        );
        setActiveFieldPhotos(fieldDetails.photos);
        setMappedFieldPhotos(mappedPhotos);
        setAvailablePhotos(photos.filter((photo) => photo.fieldId === null));
      })
      .catch((requestError: unknown) => {
        if (cancelled) return;
        const message = getApiErrorMessage(
          requestError,
          "Не удалось получить данные выбранного поля.",
        );
        setError(message);
        notifications.error("Не удалось открыть поле", message);
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeFieldId, notifications]);

  const refreshActiveField = useCallback(async () => {
    if (!activeFieldId) return;
    const [fieldDetails, mappedPhotos, photos] = await Promise.all([
      getField(activeFieldId),
      getMappedFieldPhotos(activeFieldId),
      getPhotos(),
    ]);
    setFields((current) =>
      current.map((item) =>
        item.id === fieldDetails.field.id ? fieldDetails.field : item,
      ),
    );
    setActiveFieldPhotos(fieldDetails.photos);
    setMappedFieldPhotos(mappedPhotos);
    setAvailablePhotos(photos.filter((photo) => photo.fieldId === null));
  }, [activeFieldId]);

  const addField = async (newField: NewField) => {
    const validatedField = newFieldSchema.parse(newField);
    setMutating(true);
    setError(undefined);
    try {
      const field = await createField(
        validatedField.name,
        validatedField.boundary,
      );
      setFields((current) => [...current, field]);
      setDetailLoading(true);
      setActiveFieldId(field.id);
      notifications.success(
        "Поле создано",
        `«${field.name}» сохранено и появилось на карте.`,
      );
      return field;
    } catch (requestError) {
      notifications.error(
        "Не удалось создать поле",
        getApiErrorMessage(
          requestError,
          "Проверьте данные и повторите попытку.",
        ),
      );
      throw requestError;
    } finally {
      setMutating(false);
    }
  };

  const renameField = async (fieldId: string, name: string) => {
    setMutating(true);
    setError(undefined);
    try {
      const updatedField = await updateFieldName(fieldId, name);
      setFields((current) =>
        current.map((item) =>
          item.id === fieldId
            ? { ...updatedField, photosCount: item.photosCount }
            : item,
        ),
      );
      notifications.success(
        "Название обновлено",
        `Поле переименовано в «${name}».`,
      );
    } catch (requestError) {
      notifications.error(
        "Не удалось переименовать поле",
        getApiErrorMessage(requestError),
      );
      throw requestError;
    } finally {
      setMutating(false);
    }
  };

  const refreshPhotos = async () => {
    setMutating(true);
    setError(undefined);
    try {
      const synced = await syncPhotos();
      const [nextFields] = await Promise.all([
        getFields(),
        refreshActiveField(),
      ]);
      setFields(nextFields);
      notifications.success(
        synced ? "Снимки синхронизированы" : "Синхронизация завершена",
        synced
          ? `Новых снимков: ${synced}.`
          : "Новых снимков в каталоге не найдено.",
      );
      return synced;
    } catch (requestError) {
      notifications.error(
        "Не удалось синхронизировать снимки",
        getApiErrorMessage(requestError),
      );
      throw requestError;
    } finally {
      setMutating(false);
    }
  };

  const assignPhotos = async (photoIds: number[]) => {
    if (!activeFieldId) return 0;
    setMutating(true);
    setError(undefined);
    try {
      const assigned = await assignFieldPhotos(activeFieldId, photoIds);
      const [nextFields] = await Promise.all([
        getFields(),
        refreshActiveField(),
      ]);
      setFields(nextFields);
      notifications.success(
        "Снимки привязаны",
        `К полю привязано снимков: ${assigned}.`,
      );
      return assigned;
    } catch (requestError) {
      notifications.error(
        "Не удалось привязать снимки",
        getApiErrorMessage(requestError),
      );
      throw requestError;
    } finally {
      setMutating(false);
    }
  };

  const value = {
    fields,
    activeField,
    activeFieldPhotos,
    availablePhotos,
    mappedFieldPhotos,
    loading,
    detailLoading,
    mutating,
    error,
    addField,
    renameField,
    refreshFields,
    refreshPhotos,
    assignPhotos,
    selectField: (id: string) => {
      if (!fields.some((field) => field.id === id)) return;
      if (activeFieldId === id) return;
      setActiveFieldPhotos([]);
      setAvailablePhotos([]);
      setMappedFieldPhotos([]);
      setDetailLoading(true);
      setError(undefined);
      setActiveFieldId(id);
    },
    clearActiveField: () => {
      setActiveFieldId(undefined);
      setActiveFieldPhotos([]);
      setAvailablePhotos([]);
      setMappedFieldPhotos([]);
    },
  };

  return (
    <FieldsContext.Provider value={value}>{children}</FieldsContext.Provider>
  );
};
