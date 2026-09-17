import { ChevronRight, MapPinned } from "lucide-react";
import type { Field } from "@/types/field";

type FieldsListProps = {
  fields: Field[];
  activeFieldId?: string;
  onSelectField: (fieldId: string) => void;
};

export const FieldsList = ({
  fields,
  activeFieldId,
  onSelectField,
}: FieldsListProps) => {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto border-b border-slate-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium">Поля</h2>
        <span className="text-xs text-slate-500">Всего: {fields.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {fields.map((field) => (
          <button
            key={field.id}
            type="button"
            aria-pressed={activeFieldId === field.id}
            onClick={() => onSelectField(field.id)}
            className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left focus-visible:outline-2 focus-visible:outline-green-700 ${activeFieldId === field.id ? "border-green-700 bg-green-50" : "border-slate-200 hover:bg-slate-50"}`}
          >
            <MapPinned
              aria-hidden="true"
              className="size-5 shrink-0 text-green-800"
            />
            <span className="min-w-0 flex-1">
              <span className="block wrap-break-word text-sm font-medium">
                {field.name}
              </span>
            </span>
            <ChevronRight
              aria-hidden="true"
              className="size-4 shrink-0 text-slate-400"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
