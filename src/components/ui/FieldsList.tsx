import { ChevronRight, MapPinned, Sprout } from "lucide-react";
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
        <h2 className="text-sm font-semibold text-slate-900">Поля</h2>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium tabular-nums text-slate-500">
          {fields.length}
        </span>
      </div>
      {fields.length ? (
        <div className="flex flex-col gap-2">
          {fields.map((field) => (
            <button
              key={field.id}
              type="button"
              aria-pressed={activeFieldId === field.id}
              onClick={() => onSelectField(field.id)}
              className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-green-700 ${activeFieldId === field.id ? "border-green-700 bg-green-50" : "border-slate-200 hover:bg-slate-50"}`}
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
      ) : (
        <div className="flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center">
          <div
            className="relative mb-4 flex h-20 w-28 items-center justify-center"
            aria-hidden="true"
          >
            <div className="absolute inset-x-1 bottom-2 h-11 -rotate-3 rounded-lg border border-green-200 bg-green-50" />
            <div className="absolute inset-x-4 bottom-4 h-11 rotate-3 rounded-lg border border-dashed border-green-300 bg-white" />
            <div className="relative flex size-10 items-center justify-center rounded-full border border-green-200 bg-white text-green-800 shadow-sm">
              <Sprout className="size-5" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-800">Список пока пуст</p>
          <p className="mt-1 max-w-48 text-xs leading-relaxed text-slate-500">
            Сохранённые поля появятся здесь для быстрого выбора
          </p>
        </div>
      )}
    </div>
  );
};
