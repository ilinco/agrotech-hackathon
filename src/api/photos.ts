import { api } from "@/api/axios";
import type { FieldPhoto } from "@/types/field";

export const getPhotos = async (): Promise<FieldPhoto[]> => {
  const { data } = await api.get<FieldPhoto[]>("/photos");
  return data;
};

export const syncPhotos = async (): Promise<number> => {
  const { data } = await api.post<{ synced: number; photos: FieldPhoto[] }>(
    "/photos/sync",
  );
  return data.synced;
};
