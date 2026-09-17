import { createContext } from "react";
import type { Field } from "@/types/field";

export type NewField = Pick<Field, "name" | "boundary">;

export type FieldsContextValue = {
  fields: Field[];
  activeField: Field | undefined;
  addField: (field: NewField) => Field;
  selectField: (id: string) => void;
  clearActiveField: () => void;
};

export const FieldsContext = createContext<FieldsContextValue | undefined>(
  undefined,
);
