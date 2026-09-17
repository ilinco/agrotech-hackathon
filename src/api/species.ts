import { api } from "@/api/axios";
import type { WeedSpecies } from "@/types/analysis";

export const getSpecies = async (): Promise<WeedSpecies[]> => {
  const { data } = await api.get<WeedSpecies[]>("/species");
  return data;
};

export const syncSpecies = async (): Promise<{
  synced: number;
  species: WeedSpecies[];
}> => {
  const { data } = await api.post<{
    synced: number;
    species: WeedSpecies[];
  }>("/species/sync");
  return data;
};
