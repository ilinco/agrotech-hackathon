import { useState } from "react";
import { Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { GeographicCoordinate } from "@/types/field";
import { coordinateFormSchema } from "@/config/fieldValidation";
import { pointColor } from "../../pages/map/fieldBoundary";

type CoordinateErrors = { latitude?: string; longitude?: string };

type FieldCreationPanelProps = {
  draft: GeographicCoordinate[];
  name: string;
  nameError?: string;
  pointInputMode: "map" | "coordinates";
  selectedDraftIndex: number | null;
  boundaryError?: string;
  onNameChange: (name: string) => void;
  onNameBlur: () => void;
  onPointInputModeChange: (mode: "map" | "coordinates") => void;
  onSelectDraftPoint: (index: number | null) => void;
  onAddCoordinate: (coordinate: GeographicCoordinate) => void;
  onDeletePoint: (index: number) => void;
  onRemoveLastPoint: () => void;
  onResetPoints: () => void;
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
};

export const FieldCreationPanel = ({
  draft,
  name,
  nameError,
  pointInputMode,
  selectedDraftIndex,
  boundaryError,
  onNameChange,
  onNameBlur,
  onPointInputModeChange,
  onSelectDraftPoint,
  onAddCoordinate,
  onDeletePoint,
  onRemoveLastPoint,
  onResetPoints,
  onSave,
  onCancel,
  saving = false,
}: FieldCreationPanelProps) => {
  const [coordinateErrors, setCoordinateErrors] = useState<CoordinateErrors>(
    {},
  );

  return (
    <section
      aria-label="Добавление поля"
      className="min-h-0 rounded-lg border border-green-600 bg-white lg:col-start-1 lg:overflow-y-auto"
    >
      <div className="flex flex-col gap-4 p-4">
        <div>
          <Badge tone="success">Создание контура</Badge>
          <h2 className="mt-2 text-base font-medium">Новое поле</h2>
        </div>
        <ol className="space-y-1.5 border-l-2 border-green-200 pl-3 text-sm text-slate-600">
          <li>1. Укажите название поля.</li>
          <li>
            2. Добавьте минимум три точки{" "}
            {pointInputMode === "map" ? "на карте" : "координатами"}.
          </li>
          <li>3. Проверьте контур и сохраните поле.</li>
        </ol>
        <Input
          label="Название поля"
          value={name}
          error={nameError}
          onChange={(event) => onNameChange(event.target.value)}
          onBlur={onNameBlur}
          required
        />
        <p className="text-sm text-slate-500">
          Выберите один способ добавления точек. Контур замыкается
          автоматически.
        </p>
        <div
          role="group"
          aria-label="Способ добавления точек"
          className="grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1"
        >
          <Button
            type="button"
            size="sm"
            variant={pointInputMode === "map" ? "secondary" : "ghost"}
            aria-pressed={pointInputMode === "map"}
            onClick={() => onPointInputModeChange("map")}
          >
            На карте
          </Button>
          <Button
            type="button"
            size="sm"
            variant={pointInputMode === "coordinates" ? "secondary" : "ghost"}
            aria-pressed={pointInputMode === "coordinates"}
            onClick={() => onPointInputModeChange("coordinates")}
          >
            Координатами
          </Button>
        </div>
        <p className="text-xs text-slate-500">
          {pointInputMode === "map"
            ? "Нажмите на карту в нужных местах. Для изменения точки выберите её номер и нажмите на новое место."
            : "Введите широту и долготу каждой точки. Новая точка добавится в конец списка."}
        </p>
        <p role="status" className="text-sm text-slate-600">
          Точек: {draft.length}. {boundaryError}
        </p>
        <ol className="max-h-48 space-y-2 overflow-y-auto text-xs tabular-nums">
          {draft.map((point, index) => (
            <li
              key={index}
              className={`flex items-center gap-2 rounded-md border p-2 ${selectedDraftIndex === index ? "border-green-700 bg-green-50" : "border-slate-200"}`}
            >
              <svg
                width="12"
                height="12"
                aria-hidden="true"
                className="shrink-0"
              >
                <circle cx="6" cy="6" r="5" fill={pointColor(index)} />
              </svg>
              <span className="min-w-0 flex-1">
                {index + 1}. Ш: {point.latitude.toFixed(6)} · Д:{" "}
                {point.longitude.toFixed(6)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="min-h-8 px-2"
                aria-label={`Редактировать точку ${index + 1}`}
                aria-pressed={selectedDraftIndex === index}
                onClick={() =>
                  onSelectDraftPoint(
                    selectedDraftIndex === index ? null : index,
                  )
                }
              >
                <Pencil aria-hidden="true" className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="min-h-8 px-2 text-red-700 hover:bg-red-50"
                aria-label={`Удалить точку ${index + 1}`}
                onClick={() => onDeletePoint(index)}
              >
                <Trash2 aria-hidden="true" className="size-4" />
              </Button>
            </li>
          ))}
        </ol>
        {pointInputMode === "coordinates" && (
          <form
            key={selectedDraftIndex ?? "new-point"}
            className="flex flex-col gap-3"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              const values = new FormData(event.currentTarget);
              const result = coordinateFormSchema.safeParse({
                latitude: values.get("latitude"),
                longitude: values.get("longitude"),
              });
              if (!result.success) {
                const errors: CoordinateErrors = {};
                for (const issue of result.error.issues) {
                  const field = issue.path[0];
                  if (field === "latitude" || field === "longitude")
                    errors[field] ??= issue.message;
                }
                setCoordinateErrors(errors);
                return;
              }
              setCoordinateErrors({});
              onAddCoordinate(result.data);
            }}
          >
            <div className="grid gap-3">
              <Input
                label="Широта"
                name="latitude"
                type="number"
                step="any"
                min={-90}
                max={90}
                error={coordinateErrors.latitude}
                defaultValue={
                  selectedDraftIndex === null
                    ? undefined
                    : draft[selectedDraftIndex]?.latitude
                }
                required
              />
              <Input
                label="Долгота"
                name="longitude"
                type="number"
                step="any"
                min={-180}
                max={180}
                error={coordinateErrors.longitude}
                defaultValue={
                  selectedDraftIndex === null
                    ? undefined
                    : draft[selectedDraftIndex]?.longitude
                }
                required
              />
            </div>
            <Button type="submit" variant="secondary">
              {selectedDraftIndex === null
                ? "Добавить по координатам"
                : "Сохранить координаты точки"}
            </Button>
          </form>
        )}
        <div className="grid gap-2">
          <Button
            variant="secondary"
            disabled={!draft.length}
            onClick={onRemoveLastPoint}
          >
            Убрать последнюю точку
          </Button>
          <Button
            variant="ghost"
            disabled={!draft.length}
            onClick={onResetPoints}
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Сбросить все точки
          </Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Button
            className="w-full"
            disabled={Boolean(boundaryError)}
            loading={saving}
            onClick={onSave}
          >
            Сохранить
          </Button>
          <Button variant="ghost" className="w-full" onClick={onCancel}>
            Отмена
          </Button>
        </div>
      </div>
    </section>
  );
};
