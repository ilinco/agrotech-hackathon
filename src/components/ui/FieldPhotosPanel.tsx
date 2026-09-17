import { useState } from "react";
import { Camera, MapPin, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loader } from "@/components/ui/Loader";
import type { FieldPhoto } from "@/types/field";

type FieldPhotosPanelProps = {
  photos: FieldPhoto[];
  availablePhotos: FieldPhoto[];
  loading: boolean;
  mutating: boolean;
  onSync: () => Promise<number>;
  onAssign: (photoIds: number[]) => Promise<number>;
};

const PhotoRow = ({ photo }: { photo: FieldPhoto }) => (
  <li className="rounded-lg border border-slate-200 p-3">
    <div className="flex min-w-0 items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Camera aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" title={photo.originalName}>
          {photo.originalName}
        </p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {photo.latitude !== null && photo.longitude !== null ? (
            <Badge tone="success">
              <MapPin aria-hidden="true" className="mr-1 size-3" />
              Есть координаты
            </Badge>
          ) : (
            <Badge tone="warning">Без координат</Badge>
          )}
          {photo.width && photo.height ? (
            <Badge>
              {photo.width} × {photo.height}
            </Badge>
          ) : null}
        </div>
      </div>
    </div>
  </li>
);

export const FieldPhotosPanel = ({
  photos,
  availablePhotos,
  loading,
  mutating,
  onSync,
  onAssign,
}: FieldPhotosPanelProps) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [message, setMessage] = useState<string>();

  if (loading) {
    return (
      <div className="p-4">
        <Loader label="Загружаем снимки…" />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium">Снимки поля</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Привязано: {photos.length}
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          loading={mutating}
          onClick={() => {
            setMessage(undefined);
            void onSync()
              .then((count) =>
                setMessage(
                  count
                    ? `Найдено новых снимков: ${count}.`
                    : "Новых снимков не найдено.",
                ),
              )
              .catch(() => undefined);
          }}
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          Синхронизировать
        </Button>
      </div>

      {message && <p className="text-xs text-slate-600">{message}</p>}

      {photos.length ? (
        <ul className="space-y-2">
          {photos.map((photo) => (
            <PhotoRow key={photo.id} photo={photo} />
          ))}
        </ul>
      ) : (
        <EmptyState
          title="Снимков пока нет"
          description="Синхронизируйте каталог или привяжите непривязанные снимки вручную."
        />
      )}

      {availablePhotos.length > 0 && (
        <section className="border-t border-slate-200 pt-4">
          <h3 className="text-sm font-medium">Непривязанные снимки</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Ручная привязка не проверяет GPS-координаты снимка.
          </p>
          <ul className="mt-3 max-h-52 space-y-2 overflow-y-auto">
            {availablePhotos.map((photo) => (
              <li
                key={photo.id}
                className="rounded-lg border border-slate-200 p-3"
              >
                <Checkbox
                  label={photo.originalName}
                  checked={selectedIds.includes(photo.id)}
                  onChange={(event) =>
                    setSelectedIds((current) =>
                      event.target.checked
                        ? [...current, photo.id]
                        : current.filter((id) => id !== photo.id),
                    )
                  }
                />
              </li>
            ))}
          </ul>
          <Button
            className="mt-3 w-full"
            disabled={!selectedIds.length}
            loading={mutating}
            onClick={() => {
              setMessage(undefined);
              void onAssign(selectedIds)
                .then((count) => {
                  setSelectedIds([]);
                  setMessage(`Привязано снимков: ${count}.`);
                })
                .catch(() => undefined);
            }}
          >
            Привязать выбранные · {selectedIds.length}
          </Button>
        </section>
      )}
    </div>
  );
};
