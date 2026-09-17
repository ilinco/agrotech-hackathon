import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FieldCreationPanel } from "../components/ui/FieldCreationPanel";
import { FieldDetailsPanel } from "../components/ui/FieldDetailsPanel";
import { FieldDisplaySettings } from "@/components/ui/FieldDisplaySettings";
import { FieldsList } from "@/components/ui/FieldsList";
import { Container } from "@/components/layout/Container";
import { FieldMap } from "./map/FieldMap";
import { useFields } from "@/hooks/useFields";
import type { GeographicCoordinate } from "@/types/field";
import {
  fieldNameSchema,
  newFieldSchema,
  boundaryError,
} from "@/config/fieldValidation";

export const HomePage = () => {
  const {
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
    selectField,
    clearActiveField,
  } = useFields();
  const [showBoundary, setShowBoundary] = useState(true);
  const [detailView, setDetailView] = useState<"field" | "images">("field");
  const [drawing, setDrawing] = useState(false);
  const [draft, setDraft] = useState<GeographicCoordinate[]>([]);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string>();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [selectedDraftIndex, setSelectedDraftIndex] = useState<number | null>(
    null,
  );
  const [pointInputMode, setPointInputMode] = useState<"map" | "coordinates">(
    "map",
  );
  const draftError = boundaryError(draft);

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
    setNameError(undefined);
    setSelectedDraftIndex(null);
    setPointInputMode("map");
    setConfirmCancel(false);
  };

  const saveField = async () => {
    const result = newFieldSchema.safeParse({ name, boundary: draft });
    if (!result.success) {
      setNameError(
        result.error.issues.find((issue) => issue.path[0] === "name")?.message,
      );
      return;
    }
    try {
      await addField(result.data);
      setShowBoundary(true);
      setDetailView("field");
      cancelDrawing();
    } catch {
      // The provider exposes the API error above the workspace.
    }
  };

  const addDraftPoint = (point: GeographicCoordinate) => {
    if (selectedDraftIndex === null) {
      setDraft((current) => [...current, point]);
      return;
    }
    setDraft((current) =>
      current.map((item, index) =>
        index === selectedDraftIndex ? point : item,
      ),
    );
    setSelectedDraftIndex(null);
  };

  const addCoordinate = (point: GeographicCoordinate) => {
    if (selectedDraftIndex === null) setDraft((current) => [...current, point]);
    else {
      setDraft((current) =>
        current.map((item, index) =>
          index === selectedDraftIndex ? point : item,
        ),
      );
      setSelectedDraftIndex(null);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 lg:h-dvh">
      <Container className="flex shrink-0 flex-wrap items-start justify-between gap-3 py-5">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-slate-900 sm:text-2xl">
            {drawing ? "Добавление поля" : "Карта полей"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {drawing
              ? "Отметьте границы поля на карте и сохраните контур."
              : "Выберите поле, чтобы перейти к снимкам и результатам анализа."}
          </p>
        </div>
        {drawing ? (
          <Badge tone="success" className="mt-1 px-3 py-1.5">
            Режим добавления
          </Badge>
        ) : (
          <Button onClick={() => setDrawing(true)}>Добавить поле</Button>
        )}
      </Container>

      {error && (
        <Container className="shrink-0 pb-4">
          <Alert
            tone="danger"
            title="Данные не загрузились"
            action={
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void refreshFields()}
              >
                Повторить
              </Button>
            }
          >
            <span>{error}</span>
          </Alert>
        </Container>
      )}

      <Container className="grid min-h-0 flex-1 grid-cols-1 gap-4 pb-4 sm:pb-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        {!drawing && (
          <aside
            aria-label="Поля и настройки"
            className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white lg:overflow-y-auto"
          >
            <FieldsList
              fields={fields}
              activeFieldId={activeField?.id}
              onSelectField={openField}
              loading={loading}
            />
            <FieldDisplaySettings
              showBoundary={showBoundary}
              onShowBoundaryChange={setShowBoundary}
            />
          </aside>
        )}

        <div className="h-[50dvh] min-h-80 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-auto lg:min-h-0 [&>section]:h-full">
          <FieldMap
            field={activeField}
            fields={fields}
            mappedPhotos={mappedFieldPhotos}
            drawing={drawing}
            pointInputMode={pointInputMode}
            draft={draft}
            onAddPoint={addDraftPoint}
            selectedDraftIndex={selectedDraftIndex}
            onSelectDraftPoint={setSelectedDraftIndex}
            selected={Boolean(activeField)}
            showBoundary={showBoundary}
            onSelect={(field) => openField(field.id)}
          />
        </div>

        {drawing ? (
          <FieldCreationPanel
            key={`${pointInputMode}-${selectedDraftIndex ?? "new"}`}
            draft={draft}
            name={name}
            nameError={nameError}
            pointInputMode={pointInputMode}
            selectedDraftIndex={selectedDraftIndex}
            boundaryError={draftError}
            onNameChange={(nextName) => {
              setName(nextName);
              if (nameError) {
                const result = fieldNameSchema.safeParse(nextName);
                setNameError(
                  result.success ? undefined : result.error.issues[0]?.message,
                );
              }
            }}
            onNameBlur={() => {
              const result = fieldNameSchema.safeParse(name);
              setNameError(
                result.success ? undefined : result.error.issues[0]?.message,
              );
            }}
            onPointInputModeChange={(mode) => {
              setPointInputMode(mode);
              setSelectedDraftIndex(null);
            }}
            onSelectDraftPoint={setSelectedDraftIndex}
            onAddCoordinate={addCoordinate}
            onDeletePoint={(index) => {
              setDraft((current) =>
                current.filter((_, pointIndex) => pointIndex !== index),
              );
              setSelectedDraftIndex(null);
            }}
            onRemoveLastPoint={() => {
              setDraft((current) => current.slice(0, -1));
              setSelectedDraftIndex(null);
            }}
            onResetPoints={() => setConfirmReset(true)}
            onSave={saveField}
            saving={mutating}
            onCancel={() =>
              draft.length || name.trim()
                ? setConfirmCancel(true)
                : cancelDrawing()
            }
          />
        ) : (
          <FieldDetailsPanel
            key={activeField?.id ?? "no-field"}
            fieldsCount={fields.length}
            field={activeField}
            detailView={detailView}
            onDetailViewChange={setDetailView}
            onClearField={clearActiveField}
            onStartDrawing={() => setDrawing(true)}
            photos={activeFieldPhotos}
            availablePhotos={availablePhotos}
            loading={detailLoading}
            mutating={mutating}
            onRenameField={renameField}
            onSyncPhotos={refreshPhotos}
            onAssignPhotos={assignPhotos}
          />
        )}
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
