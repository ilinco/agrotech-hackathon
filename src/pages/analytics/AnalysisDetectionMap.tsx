import { latLngBounds } from "leaflet";
import {
  CircleMarker,
  MapContainer,
  Polygon,
  TileLayer,
  Tooltip,
} from "react-leaflet";
import type { Field } from "@/types/field";
import type { MappedDetection } from "@/types/analysis";
import "leaflet/dist/leaflet.css";

type AnalysisDetectionMapProps = {
  field: Field;
  detections: MappedDetection[];
  selectedDetectionId?: number;
  onSelectDetection: (id: number) => void;
};

export const AnalysisDetectionMap = ({
  field,
  detections,
  selectedDetectionId,
  onSelectDetection,
}: AnalysisDetectionMapProps) => {
  const positions = [
    ...field.boundary.map(({ latitude, longitude }): [number, number] => [
      latitude,
      longitude,
    ]),
    ...detections.map(({ latitude, longitude }): [number, number] => [
      latitude,
      longitude,
    ]),
  ];
  const bounds = positions.length ? latLngBounds(positions) : undefined;

  return (
    <div className="h-96 overflow-hidden rounded-lg border border-slate-200">
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [35, 35] }}
        center={bounds ? undefined : [53.2, 63.7]}
        zoom={bounds ? undefined : 9}
        scrollWheelZoom
        className="h-full w-full bg-slate-100"
        aria-label="Карта обнаружений сорняков"
      >
        <TileLayer
          url={
            import.meta.env.VITE_MAP_TILE_URL ||
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          attribution={
            import.meta.env.VITE_MAP_ATTRIBUTION ||
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
          maxZoom={19}
        />
        {field.boundary.length >= 3 && (
          <Polygon
            positions={field.boundary.map(({ latitude, longitude }) => [
              latitude,
              longitude,
            ])}
            interactive={false}
            pathOptions={{ color: "#166534", weight: 2, fillOpacity: 0.06 }}
          />
        )}
        {detections.map((detection) => {
          const selected = detection.detectionId === selectedDetectionId;
          return (
            <CircleMarker
              key={detection.detectionId}
              center={[detection.latitude, detection.longitude]}
              radius={selected ? 8 : 5}
              bubblingMouseEvents={false}
              pathOptions={{
                color: selected ? "#0f172a" : "#fff",
                weight: 2,
                fillColor: "#dc2626",
                fillOpacity: 0.9,
              }}
              eventHandlers={{
                click: () => onSelectDetection(detection.detectionId),
              }}
            >
              <Tooltip direction="top">
                {detection.speciesName ?? detection.speciesGuess}
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};
