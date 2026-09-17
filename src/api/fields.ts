import { api } from "@/api/axios";
import type {
  Field,
  FieldPhoto,
  GeographicCoordinate,
  MappedFieldPhoto,
} from "@/types/field";

type ApiField = {
  id: number;
  name: string;
  minLat: number | null;
  minLng: number | null;
  maxLat: number | null;
  maxLng: number | null;
  createdAt: string;
  _count?: { photos: number };
  photos?: FieldPhoto[];
};

type FieldPayload = {
  name: string;
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
};

type FieldMapResponse = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry:
      | { type: "Point"; coordinates: [number, number] }
      | { type: "Polygon"; coordinates: number[][][] };
    properties: {
      kind: "boundary" | "photo";
      id?: number;
      photoId?: number;
      originalName?: string;
      name?: string;
    };
  }>;
};

const boundaryFromApiField = (field: ApiField): GeographicCoordinate[] => {
  if (
    field.minLat === null ||
    field.minLng === null ||
    field.maxLat === null ||
    field.maxLng === null
  ) {
    return [];
  }

  return [
    { latitude: field.minLat, longitude: field.minLng },
    { latitude: field.minLat, longitude: field.maxLng },
    { latitude: field.maxLat, longitude: field.maxLng },
    { latitude: field.maxLat, longitude: field.minLng },
  ];
};

const toField = (field: ApiField): Field => ({
  id: String(field.id),
  name: field.name,
  boundary: boundaryFromApiField(field),
  photosCount: field._count?.photos ?? field.photos?.length ?? 0,
  createdAt: field.createdAt,
});

const toFieldPayload = (
  name: string,
  boundary: GeographicCoordinate[],
): FieldPayload => {
  const latitudes = boundary.map(({ latitude }) => latitude);
  const longitudes = boundary.map(({ longitude }) => longitude);

  return {
    name,
    minLat: Math.min(...latitudes),
    minLng: Math.min(...longitudes),
    maxLat: Math.max(...latitudes),
    maxLng: Math.max(...longitudes),
  };
};

export const getFields = async (): Promise<Field[]> => {
  const { data } = await api.get<ApiField[]>("/fields");
  return data.map(toField);
};

export const getField = async (
  fieldId: string,
): Promise<{ field: Field; photos: FieldPhoto[] }> => {
  const { data } = await api.get<ApiField>(`/fields/${fieldId}`);
  return { field: toField(data), photos: data.photos ?? [] };
};

export const createField = async (
  name: string,
  boundary: GeographicCoordinate[],
): Promise<Field> => {
  const { data } = await api.post<ApiField>(
    "/fields",
    toFieldPayload(name, boundary),
  );
  return toField(data);
};

export const updateFieldName = async (
  fieldId: string,
  name: string,
): Promise<Field> => {
  const { data } = await api.patch<ApiField>(`/fields/${fieldId}`, { name });
  return toField(data);
};

export const assignFieldPhotos = async (
  fieldId: string,
  photoIds: number[],
): Promise<number> => {
  const { data } = await api.post<{ assigned: number }>(
    `/fields/${fieldId}/photos`,
    { photoIds },
  );
  return data.assigned;
};

export const getMappedFieldPhotos = async (
  fieldId: string,
): Promise<MappedFieldPhoto[]> => {
  const { data } = await api.get<FieldMapResponse>(`/fields/${fieldId}/map`);

  return data.features.flatMap((feature) => {
    if (feature.geometry.type !== "Point") return [];
    const [longitude, latitude] = feature.geometry.coordinates;
    const id = feature.properties.photoId ?? feature.properties.id;
    if (id === undefined) return [];

    return [
      {
        id,
        originalName: feature.properties.originalName ?? `Снимок ${id}`,
        latitude,
        longitude,
      },
    ];
  });
};
