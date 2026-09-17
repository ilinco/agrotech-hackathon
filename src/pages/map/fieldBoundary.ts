import type { GeographicCoordinate } from "@/types/field";

export function pointColor(index: number): string {
  return `hsl(${(index * 137.508) % 360}, 65%, 38%)`;
}

const EARTH_RADIUS_METERS = 6_371_008.8;
const GRID_CELL_SIZE_METERS = 2_000;

type LocalPoint = {
  x: number;
  y: number;
};

const lineSegmentsInsidePolygon = (
  boundary: LocalPoint[],
  position: number,
  direction: "horizontal" | "vertical",
): [LocalPoint, LocalPoint][] => {
  const intersections: number[] = [];

  boundary.forEach((start, index) => {
    const end = boundary[(index + 1) % boundary.length];
    const startAcross = direction === "horizontal" ? start.y : start.x;
    const endAcross = direction === "horizontal" ? end.y : end.x;

    if (!(
      (startAcross <= position && endAcross > position) ||
      (endAcross <= position && startAcross > position)
    )) {
      return;
    }

    const ratio = (position - startAcross) / (endAcross - startAcross);
    intersections.push(
      direction === "horizontal"
        ? start.x + ratio * (end.x - start.x)
        : start.y + ratio * (end.y - start.y),
    );
  });

  intersections.sort((a, b) => a - b);

  const segments: [LocalPoint, LocalPoint][] = [];
  for (let index = 0; index + 1 < intersections.length; index += 2) {
    const start = intersections[index];
    const end = intersections[index + 1];
    if (start === undefined || end === undefined) continue;

    segments.push(
      direction === "horizontal"
        ? [
            { x: start, y: position },
            { x: end, y: position },
          ]
        : [
            { x: position, y: start },
            { x: position, y: end },
          ],
    );
  }

  return segments;
};

export const createFieldGrid = (
  boundary: GeographicCoordinate[],
): GeographicCoordinate[][] => {
  if (boundary.length < 3) return [];

  const referenceLatitude =
    boundary.reduce((sum, point) => sum + point.latitude, 0) / boundary.length;
  const referenceLatitudeRadians = (referenceLatitude * Math.PI) / 180;
  const longitudeScale =
    EARTH_RADIUS_METERS * Math.cos(referenceLatitudeRadians);
  const latitudeScale = EARTH_RADIUS_METERS;
  const toLocalPoint = ({
    latitude,
    longitude,
  }: GeographicCoordinate): LocalPoint => ({
    x: longitudeScale * ((longitude * Math.PI) / 180),
    y: latitudeScale * ((latitude * Math.PI) / 180),
  });
  const toGeographicCoordinate = ({
    x,
    y,
  }: LocalPoint): GeographicCoordinate => ({
    latitude: ((y / latitudeScale) * 180) / Math.PI,
    longitude: ((x / longitudeScale) * 180) / Math.PI,
  });
  const localBoundary = boundary.map(toLocalPoint);
  const xValues = localBoundary.map(({ x }) => x);
  const yValues = localBoundary.map(({ y }) => y);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const localSegments: [LocalPoint, LocalPoint][] = [];

  for (
    let x = minX + GRID_CELL_SIZE_METERS;
    x < maxX;
    x += GRID_CELL_SIZE_METERS
  ) {
    localSegments.push(
      ...lineSegmentsInsidePolygon(localBoundary, x, "vertical"),
    );
  }

  for (
    let y = minY + GRID_CELL_SIZE_METERS;
    y < maxY;
    y += GRID_CELL_SIZE_METERS
  ) {
    localSegments.push(
      ...lineSegmentsInsidePolygon(localBoundary, y, "horizontal"),
    );
  }

  return localSegments.map(([start, end]) => [
    toGeographicCoordinate(start),
    toGeographicCoordinate(end),
  ]);
};
