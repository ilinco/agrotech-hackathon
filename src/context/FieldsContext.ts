import { createContext } from "react";
import type { Field, FieldPhoto, MappedFieldPhoto } from "@/types/field";

export type NewField = Pick<Field, "name" | "boundary">;

export type FieldsContextValue = {
  fields: Field[];
  activeField: Field | undefined;
  activeFieldPhotos: FieldPhoto[];
  availablePhotos: FieldPhoto[];
  mappedFieldPhotos: MappedFieldPhoto[];
  loading: boolean;
  detailLoading: boolean;
  mutating: boolean;
  error?: string;
  addField: (field: NewField) => Promise<Field>;
  renameField: (fieldId: string, name: string) => Promise<void>;
  refreshFields: () => Promise<void>;
  refreshPhotos: () => Promise<number>;
  assignPhotos: (photoIds: number[]) => Promise<number>;
  selectField: (id: string) => void;
  clearActiveField: () => void;
};

export const FieldsContext = createContext<FieldsContextValue | undefined>(
  undefined,
);
