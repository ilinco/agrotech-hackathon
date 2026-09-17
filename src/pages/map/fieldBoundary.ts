import type { GeographicCoordinate } from "@/types/field";

export function pointColor(index: number): string {
  return `hsl(${(index * 137.508) % 360}, 65%, 38%)`;
}

export function boundaryError(
  points: GeographicCoordinate[],
): string | undefined {
  if (points.length < 3) return "Добавьте минимум три точки.";
  if (
    points.some(
      ({ latitude, longitude }) =>
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        Math.abs(latitude) > 90 ||
        Math.abs(longitude) > 180,
    )
  ) {
    return "Координаты выходят за допустимые пределы.";
  }
  if (
    new Set(points.map((p) => `${p.latitude},${p.longitude}`)).size !==
    points.length
  ) {
    return "Точки не должны совпадать. Контур замыкается автоматически.";
  }
  const turn = (
    a: GeographicCoordinate,
    b: GeographicCoordinate,
    c: GeographicCoordinate,
  ) =>
    (b.longitude - a.longitude) * (c.latitude - a.latitude) -
    (b.latitude - a.latitude) * (c.longitude - a.longitude);
  const onSegment = (
    a: GeographicCoordinate,
    b: GeographicCoordinate,
    c: GeographicCoordinate,
  ) =>
    c.longitude >= Math.min(a.longitude, b.longitude) &&
    c.longitude <= Math.max(a.longitude, b.longitude) &&
    c.latitude >= Math.min(a.latitude, b.latitude) &&
    c.latitude <= Math.max(a.latitude, b.latitude);
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length];
    const previous = points[(i + points.length - 1) % points.length];
    if (turn(previous, a, b) === 0 && !onSegment(previous, b, a))
      return "Стороны контура не должны накладываться друг на друга.";
    for (let j = i + 1; j < points.length; j++) {
      if (j === i + 1 || (i === 0 && j === points.length - 1)) continue;
      const c = points[j],
        d = points[(j + 1) % points.length];
      const abC = turn(a, b, c),
        abD = turn(a, b, d),
        cdA = turn(c, d, a),
        cdB = turn(c, d, b);
      if (
        (abC * abD < 0 && cdA * cdB < 0) ||
        (abC === 0 && onSegment(a, b, c)) ||
        (abD === 0 && onSegment(a, b, d)) ||
        (cdA === 0 && onSegment(c, d, a)) ||
        (cdB === 0 && onSegment(c, d, b))
      ) {
        return "Стороны контура не должны пересекаться.";
      }
    }
  }
  const area = points
    .slice(1, -1)
    .reduce(
      (sum, point, index) => sum + turn(points[0], point, points[index + 2]),
      0,
    );
  if (Math.abs(area) < 1e-12) return "Точки не должны лежать на одной линии.";
}
