import { useEffect, useMemo, useRef, useState } from 'react';
import { latLngBounds, type Map } from 'leaflet';
import {
  MapContainer,
  Polygon,
  Polyline,
  CircleMarker,
  useMapEvents,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet';
import { Crosshair, LocateFixed, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { createFieldGrid, pointColor } from './fieldBoundary';
import type { GeographicCoordinate, Field } from '@/types/field';
import 'leaflet/dist/leaflet.css';

type FieldMapProps = {
  field?: Field;
  fields: Field[];
  drawing: boolean;
  pointInputMode: 'map' | 'coordinates';
  draft: GeographicCoordinate[];
  onAddPoint: (point: GeographicCoordinate) => void;
  selectedDraftIndex: number | null;
  onSelectDraftPoint: (index: number) => void;
  selected: boolean;
  showBoundary: boolean;
  onSelect: (field: Field) => void;
};

const FIELD_POINTS_MIN_ZOOM = 10;

const ResizeMap = () => {
  const map = useMap();

  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);

  return null;
};

const ZoomObserver = ({ onChange }: { onChange: (zoom: number) => void }) => {
  const map = useMapEvents({
    zoomend: () => onChange(map.getZoom()),
  });

  useEffect(() => onChange(map.getZoom()), [map, onChange]);

  return null;
};

const DrawingEvents = ({
  onAddPoint,
}: {
  onAddPoint: (point: GeographicCoordinate) => void;
}) => {
  const map = useMapEvents({
    click: (event) => {
      const coordinate = event.latlng.wrap();
      onAddPoint({ latitude: coordinate.lat, longitude: coordinate.lng });
    },
  });
  useEffect(() => {
    const enabled = map.doubleClickZoom.enabled();
    map.doubleClickZoom.disable();
    return () => {
      if (enabled) map.doubleClickZoom.enable();
    };
  }, [map]);
  return null;
};

export const FieldMap = ({
  field,
  fields,
  drawing,
  pointInputMode,
  draft,
  onAddPoint,
  selectedDraftIndex,
  onSelectDraftPoint,
  selected,
  showBoundary,
  onSelect,
}: FieldMapProps) => {
  const mapRef = useRef<Map | null>(null);
  const [tileError, setTileError] = useState(false);
  const [tileAttempt, setTileAttempt] = useState(0);
  const [mapZoom, setMapZoom] = useState(0);
  const positions = (field?.boundary ?? []).map(
    ({ latitude, longitude }): [number, number] => [latitude, longitude],
  );
  const bounds = positions.length ? latLngBounds(positions) : undefined;
  const fieldGrids = useMemo(
    () =>
      fields.map((item) => ({
        fieldId: item.id,
        lines: createFieldGrid(item.boundary),
      })),
    [fields],
  );
  const draftGrid = useMemo(() => createFieldGrid(draft), [draft]);

  return (
    <section
      aria-label="Карта полей"
      className={`flex min-h-0 flex-col overflow-hidden rounded-lg border bg-white ${drawing ? 'border-green-600' : 'border-slate-200'}`}
    >
      {drawing && (
        <div className="flex min-h-15 flex-wrap items-center gap-2 border-b border-green-200 bg-green-50 px-4 py-2">
          <Crosshair aria-hidden="true" className="size-5 text-green-800" />
          <p className="py-2 text-sm font-medium text-green-900">
            {selectedDraftIndex === null
              ? pointInputMode === 'map'
                ? `Режим рисования · нажмите на карту, чтобы добавить точку ${draft.length + 1}`
                : 'Режим координат · добавляйте точки через форму слева'
              : pointInputMode === 'map'
                ? `Редактирование точки ${selectedDraftIndex + 1} · нажмите на новое место`
                : `Редактирование точки ${selectedDraftIndex + 1} · измените координаты в форме`}
          </p>
        </div>
      )}
      <div className="relative isolate min-h-80 flex-1">
        <MapContainer
          ref={mapRef}
          center={bounds ? undefined : [53.2, 63.7]}
          zoom={bounds ? undefined : 9}
          bounds={bounds}
          boundsOptions={{ padding: [55, 55] }}
          zoomControl={false}
          scrollWheelZoom
          className={`z-0 h-full min-h-80 w-full bg-slate-100 ${drawing && pointInputMode === 'map' ? 'cursor-crosshair' : ''}`}
          aria-label={
            drawing && pointInputMode === 'map'
              ? 'Интерактивная карта в режиме рисования поля. Нажмите на карту, чтобы добавить точку контура.'
              : 'Интерактивная карта. Масштаб: кнопки плюс и минус; перемещение: стрелки.'
          }
        >
          <TileLayer
            key={tileAttempt}
            url={
              import.meta.env.VITE_MAP_TILE_URL ||
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            }
            maxZoom={19}
            eventHandlers={{ tileerror: () => setTileError(true) }}
          />
          {!drawing &&
            showBoundary &&
            fields
              .filter((item) => item.boundary.length >= 3)
              .map((item) => (
                <Polygon
                  key={item.id}
                  positions={item.boundary.map(({ latitude, longitude }) => [
                    latitude,
                    longitude,
                  ])}
                  interactive={!drawing}
                  bubblingMouseEvents={false}
                  pathOptions={{
                    color:
                      selected && item.id === field?.id ? '#166534' : '#64748b',
                    weight: 2,
                    fillOpacity: 0.12,
                  }}
                  eventHandlers={{ click: () => onSelect(item) }}
                >
                  <Tooltip permanent direction="center">
                    {item.name}
                  </Tooltip>
                </Polygon>
              ))}
          {!drawing &&
            showBoundary &&
            fieldGrids.flatMap(({ fieldId, lines }) =>
              lines.map((line, index) => (
                <Polyline
                  key={`${fieldId}-grid-${index}`}
                  interactive={false}
                  positions={line.map(({ latitude, longitude }) => [
                    latitude,
                    longitude,
                  ])}
                  pathOptions={{
                    color: fieldId === field?.id ? '#166534' : '#475569',
                    weight: 1,
                    opacity: fieldId === field?.id ? 0.55 : 0.35,
                  }}
                />
              )),
            )}
          {drawing && pointInputMode === 'map' && (
            <DrawingEvents onAddPoint={onAddPoint} />
          )}
          {drawing && draft.length >= 3 && (
            <>
              <Polygon
                interactive={false}
                positions={draft.map((p) => [p.latitude, p.longitude])}
                pathOptions={{
                  color: '#166534',
                  fillOpacity: 0.16,
                  weight: 2,
                }}
              />
              {draftGrid.map((line, index) => (
                <Polyline
                  key={`draft-grid-${index}`}
                  interactive={false}
                  positions={line.map(({ latitude, longitude }) => [
                    latitude,
                    longitude,
                  ])}
                  pathOptions={{ color: '#166534', weight: 1, opacity: 0.55 }}
                />
              ))}
            </>
          )}
          {drawing && draft.length === 2 && (
            <Polyline
              interactive={false}
              positions={draft.map((p) => [p.latitude, p.longitude])}
              pathOptions={{ color: '#166534', weight: 2 }}
            />
          )}
          {(drawing || mapZoom >= FIELD_POINTS_MIN_ZOOM) &&
            (drawing
              ? draft
              : selected && showBoundary
                ? (field?.boundary ?? [])
                : []
            ).map((point, index) => (
              <CircleMarker
                key={index}
                center={[point.latitude, point.longitude]}
                radius={8}
                interactive={drawing && pointInputMode === 'map'}
                bubblingMouseEvents={false}
                pathOptions={{
                  color:
                    drawing && selectedDraftIndex === index
                      ? '#0f172a'
                      : '#fff',
                  weight: drawing && selectedDraftIndex === index ? 3 : 2,
                  fillColor: pointColor(index),
                  fillOpacity: 1,
                }}
                eventHandlers={
                  drawing && pointInputMode === 'map'
                    ? { click: () => onSelectDraftPoint(index) }
                    : undefined
                }
              >
                <Tooltip permanent direction="top">
                  Точка {index + 1}
                  {drawing && selectedDraftIndex === index ? ' · выбрана' : ''}
                </Tooltip>
              </CircleMarker>
            ))}
          <ZoomObserver onChange={setMapZoom} />
          <ResizeMap />
        </MapContainer>
        <div
          className="absolute right-3 top-3 flex flex-col items-end gap-2"
          aria-label="Управление картой"
        >
          {!drawing && field && bounds && (
            <Button
              variant="secondary"
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
          )}
          <div
            className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-1"
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
        {showBoundary && !drawing && fields.length > 0 && (
          <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">
            <span
              aria-hidden="true"
              className="size-3 border border-green-700 bg-green-50"
            />
            Сетка 2 × 2 км
          </div>
        )}
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
