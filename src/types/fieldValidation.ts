import { z } from "zod";
import type { GeographicCoordinate } from "./field";

const coordinateValue = (label: string, min: number, max: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.coerce
      .number({ error: `Введите ${label.toLowerCase()}.` })
      .min(min, `${label} не может быть меньше ${min}.`)
      .max(max, `${label} не может быть больше ${max}.`),
  );

export const fieldNameSchema = z
  .string()
  .trim()
  .min(1, "Введите название поля.")
  .max(120, "Название не должно превышать 120 символов.");

export const coordinateFormSchema = z.object({
  latitude: coordinateValue("Широту", -90, 90),
  longitude: coordinateValue("Долготу", -180, 180),
});

export const geographicCoordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const geometryError = (points: GeographicCoordinate[]) => {
  if (
    new Set(points.map((point) => `${point.latitude},${point.longitude}`))
      .size !== points.length
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

  for (let index = 0; index < points.length; index++) {
    const start = points[index];
    const end = points[(index + 1) % points.length];

    for (
      let comparedIndex = index + 1;
      comparedIndex < points.length;
      comparedIndex++
    ) {
      if (
        comparedIndex === index + 1 ||
        (index === 0 && comparedIndex === points.length - 1)
      ) {
        continue;
      }

      const comparedStart = points[comparedIndex];
      const comparedEnd = points[(comparedIndex + 1) % points.length];
      const startEndToComparedStart = turn(start, end, comparedStart);
      const startEndToComparedEnd = turn(start, end, comparedEnd);
      const comparedToStart = turn(comparedStart, comparedEnd, start);
      const comparedToEnd = turn(comparedStart, comparedEnd, end);

      if (
        (startEndToComparedStart * startEndToComparedEnd < 0 &&
          comparedToStart * comparedToEnd < 0) ||
        (startEndToComparedStart === 0 &&
          onSegment(start, end, comparedStart)) ||
        (startEndToComparedEnd === 0 && onSegment(start, end, comparedEnd)) ||
        (comparedToStart === 0 &&
          onSegment(comparedStart, comparedEnd, start)) ||
        (comparedToEnd === 0 && onSegment(comparedStart, comparedEnd, end))
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
  if (Math.abs(area) < 1e-12) {
    return "Точки не должны лежать на одной линии.";
  }
};

export const boundarySchema = z
  .array(geographicCoordinateSchema)
  .min(3, "Добавьте минимум три точки.")
  .superRefine((points, context) => {
    if (points.length < 3) return;
    const message = geometryError(points);
    if (message) context.addIssue({ code: "custom", message });
  });

export const newFieldSchema = z.object({
  name: fieldNameSchema,
  boundary: boundarySchema,
});

export const boundaryError = (points: GeographicCoordinate[]) => {
  const result = boundarySchema.safeParse(points);
  return result.success ? undefined : result.error.issues[0]?.message;
};
