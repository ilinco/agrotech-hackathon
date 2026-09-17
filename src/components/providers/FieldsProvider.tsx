import { useCallback, useEffect, useState, type ReactNode } from "react";
import { isAxiosError } from "axios";
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

const errorMessage = (error: unknown) => {
  if (isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error ?? "Не удалось выполнить запрос к API.";
  }
  return "Произошла непредвиденная ошибка.";
};

export const FieldsProvider = ({ children }: { children: ReactNode }) => {
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
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getFields()
      .then((items) => {
        if (!cancelled) setFields(items);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(errorMessage(requestError));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
        if (!cancelled) setError(errorMessage(requestError));
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeFieldId]);

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
      return field;
    } catch (requestError) {
      setError(errorMessage(requestError));
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
    } catch (requestError) {
      setError(errorMessage(requestError));
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
      await Promise.all([refreshFields(), refreshActiveField()]);
      return synced;
    } catch (requestError) {
      setError(errorMessage(requestError));
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
      await Promise.all([refreshFields(), refreshActiveField()]);
      return assigned;
    } catch (requestError) {
      setError(errorMessage(requestError));
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
