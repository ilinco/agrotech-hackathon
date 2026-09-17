export type GeographicCoordinate = {
  latitude: number;
  longitude: number;
};

export type Field = {
  id: string;
  name: string;
  boundary: GeographicCoordinate[];
  photosCount: number;
  createdAt: string;
};

export type FieldPhoto = {
  id: number;
  fieldId: number | null;
  originalName: string;
  takenAt: string | null;
  width: number | null;
  height: number | null;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  relativeAltitude?: number | null;
  gimbalYawDeg?: number | null;
  focalLength35mm?: number | null;
  createdAt: string;
};

export type MappedFieldPhoto = {
  id: number;
  originalName: string;
  latitude: number;
  longitude: number;
};
