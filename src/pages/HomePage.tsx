import { useEffect, useState } from "react";
import {
  ChevronRight,
  MapPinned,
  Pencil,
  RotateCcw,
  ScanLine,
  Trash2,
  X,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { useFields } from "@/hooks/useFields";
import type { GeographicCoordinate } from "@/types/field";
import { boundaryError, pointColor } from "./map/fieldBoundary";
import { FieldMap } from "./map/FieldMap";

export const HomePage = () => {
  const [showBoundary, setShowBoundary] = useState(true);
  const [detailView, setDetailView] = useState<"field" | "images">("field");

  const { fields, activeField, addField, selectField, clearActiveField } =
    useFields();
  const [drawing, setDrawing] = useState(false);
  const [draft, setDraft] = useState<GeographicCoordinate[]>([]);
  const [name, setName] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [selectedDraftIndex, setSelectedDraftIndex] = useState<number | null>(
    null,
  );
  const error = boundaryError(draft);
  useEffect(() => {
    if (!drawing || (!draft.length && !name.trim())) return;
    const preventUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", preventUnload);
    return () => window.removeEventListener("beforeunload", preventUnload);
  }, [drawing, draft.length, name]);

  const openField = (fieldId: string) => {
    if (drawing) return;
    selectField(fieldId);
    setDetailView("field");
  };
  const cancelDrawing = () => {
    setDrawing(false);
    setDraft([]);
    setName("");
    setSelectedDraftIndex(null);
    setConfirmCancel(false);
  };
  const saveField = () => {
    if (error || !name.trim()) return;
    addField({
      name: name.trim(),
      boundary: draft,
    });
    setShowBoundary(true);
    setDetailView("field");
    cancelDrawing();
  };

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 lg:h-dvh">
      <Container className="flex shrink-0 flex-wrap items-start justify-between gap-3 py-5">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-slate-900 sm:text-2xl">
            Карта полей
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Выберите поле, чтобы перейти к снимкам и результатам анализа.
          </p>
        </div>
        <Button disabled={drawing} onClick={() => setDrawing(true)}>
          Добавить поле
        </Button>
      </Container>

      <Container className="grid min-h-0 flex-1 grid-cols-1 gap-4 pb-4 sm:pb-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        {!drawing && (
          <aside
            aria-label="Поля и настройки"
            className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white lg:overflow-y-auto"
          >
            <div className="border-b border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-medium">Поля</h2>
                <span className="text-xs text-slate-500">
                  Всего: {fields.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {fields.map((field) => (
                  <button
                    key={field.id}
                    type="button"
                    disabled={drawing}
                    aria-pressed={activeField?.id === field.id}
                    onClick={() => openField(field.id)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left focus-visible:outline-2 focus-visible:outline-green-700 disabled:opacity-50 ${activeField?.id === field.id ? "border-green-700 bg-green-50" : "border-slate-200 hover:bg-slate-50"}`}
                  >
                    <MapPinned
                      aria-hidden="true"
                      className="size-5 shrink-0 text-green-800"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block wrap-break-word text-sm font-medium">
                        {field.name}
                      </span>
                      <span className="block text-xs text-slate-500">
                        В текущей сессии
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
            <div className="px-4 py-3">
              <Checkbox
                label="Показывать контур поля"
                checked={showBoundary}
                onChange={(event) => setShowBoundary(event.target.checked)}
              />
            </div>
          </aside>
        )}

        <div className="h-[50dvh] min-h-80 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-auto lg:min-h-0 [&>section]:h-full">
          <FieldMap
            field={activeField}
            fields={fields}
            drawing={drawing}
            draft={draft}
            onAddPoint={(point) => {
              if (selectedDraftIndex === null) {
                setDraft((current) => [...current, point]);
                return;
              }
              setDraft((current) =>
                current.map((draftPoint, index) =>
                  index === selectedDraftIndex ? point : draftPoint,
                ),
              );
              setSelectedDraftIndex(null);
            }}
            selectedDraftIndex={selectedDraftIndex}
            onSelectDraftPoint={setSelectedDraftIndex}
            selected={Boolean(activeField)}
            showBoundary={showBoundary}
            onSelect={(field) => openField(field.id)}
          />
        </div>

        <section
          aria-label="Информация о поле"
          className="min-h-0 rounded-lg border border-slate-200 bg-white lg:col-start-1 lg:overflow-y-auto"
        >
          {drawing ? (
            <div className="flex flex-col gap-4 p-4">
              <h2 className="text-sm font-medium">Новое поле</h2>
              <Input
                label="Название поля"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
              <p className="text-sm text-slate-500">
                Отмечайте точки по порядку вдоль границы. Контур замыкается
                автоматически. Количество точек не ограничено.
              </p>
              <p role="status" className="text-sm text-slate-600">
                Точек: {draft.length}. {error}
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
                        setSelectedDraftIndex((current) =>
                          current === index ? null : index,
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
                      onClick={() => {
                        setDraft((current) =>
                          current.filter(
                            (_, pointIndex) => pointIndex !== index,
                          ),
                        );
                        setSelectedDraftIndex(null);
                      }}
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </Button>
                  </li>
                ))}
              </ol>
              <form
                key={selectedDraftIndex ?? "new-point"}
                className="flex flex-col gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const values = new FormData(form);
                  const latitude = Number(values.get("latitude"));
                  const longitude = Number(values.get("longitude"));
                  if (
                    !Number.isFinite(latitude) ||
                    !Number.isFinite(longitude) ||
                    Math.abs(latitude) > 90 ||
                    Math.abs(longitude) > 180
                  )
                    return;
                  if (selectedDraftIndex === null) {
                    setDraft((current) => [
                      ...current,
                      { latitude, longitude },
                    ]);
                  } else {
                    setDraft((current) =>
                      current.map((point, index) =>
                        index === selectedDraftIndex
                          ? { latitude, longitude }
                          : point,
                      ),
                    );
                    setSelectedDraftIndex(null);
                  }
                  form.reset();
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
              <div className="grid gap-2">
                <Button
                  variant="secondary"
                  disabled={!draft.length}
                  onClick={() => {
                    setDraft((current) => current.slice(0, -1));
                    setSelectedDraftIndex(null);
                  }}
                >
                  Убрать последнюю точку
                </Button>
                <Button
                  variant="ghost"
                  disabled={!draft.length}
                  onClick={() => setConfirmReset(true)}
                >
                  <RotateCcw aria-hidden="true" className="size-4" />
                  Сбросить все точки
                </Button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <Button
                  className="w-full"
                  disabled={Boolean(error) || !name.trim()}
                  onClick={saveField}
                >
                  Сохранить
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() =>
                    draft.length || name.trim()
                      ? setConfirmCancel(true)
                      : cancelDrawing()
                  }
                >
                  Отмена
                </Button>
              </div>
            </div>
          ) : activeField ? (
            <>
              <div className="flex items-center justify-between gap-2 px-4 pt-3">
                <h2 className="text-sm font-medium">{activeField.name}</h2>
                <Button
                  variant="ghost"
                  aria-label="Снять выбор поля"
                  className="px-2"
                  onClick={clearActiveField}
                >
                  <X aria-hidden="true" className="size-4" />
                </Button>
              </div>
              <div
                className="flex gap-1 border-b border-slate-200 px-3 pb-2"
                aria-label="Информация и снимки"
              >
                <Button
                  size="sm"
                  variant={detailView === "field" ? "secondary" : "ghost"}
                  aria-pressed={detailView === "field"}
                  onClick={() => setDetailView("field")}
                >
                  О поле
                </Button>
                <Button
                  size="sm"
                  variant={detailView === "images" ? "secondary" : "ghost"}
                  aria-pressed={detailView === "images"}
                  onClick={() => setDetailView("images")}
                >
                  Снимки
                </Button>
              </div>
              {detailView === "field" ? (
                <div className="p-4">
                  <Badge>В текущей сессии</Badge>
                  <details className="mt-4 text-sm">
                    <summary className="cursor-pointer py-2 font-medium focus-visible:outline-2 focus-visible:outline-green-700">
                      Координаты контура · {activeField.boundary.length} точки
                    </summary>
                    <table className="mt-2 w-full text-left text-xs tabular-nums">
                      <thead className="text-slate-500">
                        <tr>
                          <th scope="col" className="py-2 font-normal">
                            №
                          </th>
                          <th scope="col" className="py-2 font-normal">
                            Широта
                          </th>
                          <th scope="col" className="py-2 font-normal">
                            Долгота
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeField.boundary.map(
                          ({ latitude, longitude }, index) => (
                            <tr
                              key={index}
                              className="border-t border-slate-100"
                            >
                              <td className="py-2">{index + 1}</td>
                              <td>{latitude}</td>
                              <td>{longitude}</td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </details>
                </div>
              ) : (
                <EmptyState
                  title="Снимков пока нет"
                  description="Здесь появятся снимки выбранного поля. Анализ станет доступен после подключения сервиса и добавления снимков."
                />
              )}
            </>
          ) : (
            <div className="px-4 py-6">
              <ScanLine
                aria-hidden="true"
                className="mb-3 size-5 text-slate-400"
              />
              <h2 className="text-sm font-medium">
                {fields.length ? "Выберите поле" : "Полей пока нет"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {fields.length
                  ? "Нажмите на контур на карте или на поле в списке, чтобы открыть информацию."
                  : "Добавьте поле и отметьте точки его контура на карте."}
              </p>
              {!fields.length && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => setDrawing(true)}
                >
                  Добавить поле
                </Button>
              )}
            </div>
          )}
        </section>
      </Container>
      <Dialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Отменить добавление поля?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmCancel(false)}>
              Продолжить рисование
            </Button>
            <Button variant="danger" onClick={cancelDrawing}>
              Удалить черновик
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Название и отмеченные точки будут потеряны.
        </p>
      </Dialog>
      <Dialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Сбросить все точки?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              Оставить точки
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setDraft([]);
                setSelectedDraftIndex(null);
                setConfirmReset(false);
              }}
            >
              Сбросить
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Все отмеченные точки контура будут удалены.
        </p>
      </Dialog>
    </div>
  );
};
