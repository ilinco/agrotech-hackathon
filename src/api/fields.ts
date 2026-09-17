import { api } from '@/api/axios';
import type {
  Field,
  FieldPhoto,
  GeographicCoordinate,
  MappedFieldPhoto,
} from '@/types/field';

type ApiField = {
  id: number;
  name: string;
  boundary: Array<{ lat: number; lng: number }> | null;
  createdAt: string;
  _count?: { photos: number };
  photos?: FieldPhoto[];
};

type FieldPayload = {
  name: string;
  boundary: Array<{ lat: number; lng: number }>;
};

type FieldMapResponse = {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry:
      | { type: 'Point'; coordinates: [number, number] }
      | { type: 'Polygon'; coordinates: number[][][] };
    properties: {
      kind: 'boundary' | 'photo';
      id?: number;
      photoId?: number;
      originalName?: string;
      name?: string;
    };
  }>;
};

const boundaryFromApiField = (field: ApiField): GeographicCoordinate[] => {
  return (field.boundary ?? []).map(({ lat, lng }) => ({
    latitude: lat,
    longitude: lng,
  }));
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
  return {
    name,
    boundary: boundary.map(({ latitude, longitude }) => ({
      lat: latitude,
      lng: longitude,
    })),
  };
};

export const getFields = async (): Promise<Field[]> => {
  const { data } = await api.get<ApiField[]>('/fields');
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
    '/fields',
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

export const updateFieldBoundary = async (
  fieldId: string,
  boundary: GeographicCoordinate[],
): Promise<Field> => {
  const { data } = await api.patch<ApiField>(`/fields/${fieldId}`, {
    boundary: boundary.map(({ latitude, longitude }) => ({
      lat: latitude,
      lng: longitude,
    })),
  });
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
    if (feature.geometry.type !== 'Point') return [];
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
