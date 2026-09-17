import { useState, type ReactNode } from "react";
import { FieldsContext, type NewField } from "@/context/FieldsContext";
import type { Field } from "@/types/field";
import { newFieldSchema } from "@/config/fieldValidation";

export const FieldsProvider = ({ children }: { children: ReactNode }) => {
  const [fields, setFields] = useState<Field[]>([]);
  const [activeFieldId, setActiveFieldId] = useState<string>();
  const activeField = fields.find((field) => field.id === activeFieldId);

  const addField = (newField: NewField) => {
    const field: Field = {
      ...newFieldSchema.parse(newField),
      id: crypto.randomUUID(),
    };
    setFields((currentFields) => [...currentFields, field]);
    setActiveFieldId(field.id);
    return field;
  };

  const selectField = (id: string) => {
    if (fields.some((field) => field.id === id)) setActiveFieldId(id);
  };

  return (
    <FieldsContext.Provider
      value={{
        fields,
        activeField,
        addField,
        selectField,
        clearActiveField: () => setActiveFieldId(undefined),
      }}
    >
      {children}
    </FieldsContext.Provider>
  );
};
