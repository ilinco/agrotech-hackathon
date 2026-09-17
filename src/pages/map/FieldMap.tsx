import { useEffect, useRef, useState } from "react";
import { latLngBounds, type Map } from "leaflet";
import {
  MapContainer,
  Polygon,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { LocateFixed, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { Field } from "@/types/field";
import "leaflet/dist/leaflet.css";

type FieldMapProps = {
  field: Field;
  selected: boolean;
  showBoundary: boolean;
  onSelect: () => void;
};

const ResizeMap = () => {
  const map = useMap();

  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);

  return null;
};

export const FieldMap = ({
  field,
  selected,
  showBoundary,
  onSelect,
}: FieldMapProps) => {
  const mapRef = useRef<Map | null>(null);
  const [tileError, setTileError] = useState(false);
  const [tileAttempt, setTileAttempt] = useState(0);
  // Leaflet takes latitude first; the domain model keeps both names explicit.
  const positions = field.boundary.map(
    ({ latitude, longitude }): [number, number] => [latitude, longitude],
  );
  const bounds = latLngBounds(positions);

  return (
    <section
      aria-label="Карта полей"
      className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2">
        <span className="flex items-center gap-2 text-xs text-slate-600">
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-green-700"
          />
          {showBoundary ? "Контур поля" : "Контур скрыт"}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            mapRef.current?.fitBounds(bounds, {
              padding: [40, 40],
              animate: false,
            })
          }
        >
          <LocateFixed aria-hidden="true" className="size-4" />К полю
        </Button>
      </div>
      <div className="relative isolate min-h-80 flex-1">
        <MapContainer
          ref={mapRef}
          bounds={bounds}
          boundsOptions={{ padding: [55, 55] }}
          zoomControl={false}
          scrollWheelZoom
          className="z-0 h-full min-h-80 w-full bg-slate-100"
          aria-label="Интерактивная карта. Масштаб: кнопки плюс и минус; перемещение: стрелки."
        >
          <TileLayer
            key={tileAttempt}
            url={
              import.meta.env.VITE_MAP_TILE_URL ||
              "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            }
            attribution={
              import.meta.env.VITE_MAP_ATTRIBUTION ||
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
            maxZoom={19}
            eventHandlers={{ tileerror: () => setTileError(true) }}
          />
          {showBoundary && (
            <Polygon
              positions={positions}
              pathOptions={{
                color: selected ? "#166534" : "#64748b",
                weight: selected ? 3 : 2,
                fillOpacity: selected ? 0.16 : 0.08,
              }}
              eventHandlers={{ click: onSelect }}
            >
              <Tooltip permanent direction="center">
                {field.name}
              </Tooltip>
            </Polygon>
          )}
          <ResizeMap />
        </MapContainer>
        <div
          className="absolute right-3 top-3 flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-1"
          aria-label="Масштаб карты"
        >
          <Button
            variant="ghost"
            aria-label="Приблизить карту"
            className="min-h-11 px-3"
            onClick={() =>
              mapRef.current?.zoomIn(undefined, { animate: false })
            }
          >
            <Plus aria-hidden="true" className="size-4" />
          </Button>
          <Button
            variant="ghost"
            aria-label="Отдалить карту"
            className="min-h-11 px-3"
            onClick={() =>
              mapRef.current?.zoomOut(undefined, { animate: false })
            }
          >
            <Minus aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </div>
      {tileError && (
        <div className="p-3">
          <Alert tone="warning">
            <p>
              Не удалось загрузить часть карты. Проверьте подключение к
              интернету.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-2"
              onClick={() => {
                setTileError(false);
                setTileAttempt((attempt) => attempt + 1);
              }}
            >
              Повторить загрузку
            </Button>
          </Alert>
        </div>
      )}
    </section>
  );
};
