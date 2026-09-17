import { api } from "@/api/axios";
import { downloadApiFile } from "@/api/downloads";
import type {
  AggregateReport,
  AnalysisMap,
  AnalysisRun,
  AnalysisStatus,
  MappedDetection,
} from "@/types/analysis";

type AnalysisMapResponse = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: { type: "Point"; coordinates: [number, number] };
    properties: Omit<MappedDetection, "latitude" | "longitude">;
  }>;
  meta: AnalysisMap["meta"];
};

export const createAnalysisRun = async (
  fieldPhotoIds: number[],
): Promise<{ id: number; status: AnalysisStatus }> => {
  const { data } = await api.post<{ id: number; status: AnalysisStatus }>(
    "/analysis-runs",
    { fieldPhotoIds },
  );
  return data;
};

export const getAnalysisRun = async (runId: number): Promise<AnalysisRun> => {
  const { data } = await api.get<AnalysisRun>(`/analysis-runs/${runId}`);
  return data;
};

export const getAnalysisMap = async (runId: number): Promise<AnalysisMap> => {
  const { data } = await api.get<AnalysisMapResponse>(
    `/analysis-runs/${runId}/map`,
  );
  return {
    meta: data.meta,
    detections: data.features.map((feature) => {
      const [longitude, latitude] = feature.geometry.coordinates;
      return { ...feature.properties, latitude, longitude };
    }),
  };
};

export const getAggregateReport = async (
  fieldId?: string,
  from?: string,
  to?: string,
): Promise<AggregateReport> => {
  const { data } = await api.get<AggregateReport>("/reports/aggregate", {
    params: { fieldId, from: from || undefined, to: to || undefined },
  });
  return data;
};

export const downloadRunExport = (runId: number, format: "json" | "csv") =>
  downloadApiFile(
    `/analysis-runs/${runId}/export?format=${format}`,
    `run-${runId}-detections.${format}`,
  );

export const downloadRunReport = (runId: number) =>
  downloadApiFile(
    `/analysis-runs/${runId}/report.pdf`,
    `run-${runId}-report.pdf`,
  );

export const downloadAnnotatedPhoto = (runId: number, photoId: number) =>
  downloadApiFile(
    `/analysis-runs/${runId}/photos/${photoId}/annotated`,
    `run-${runId}-photo-${photoId}-annotated.jpg`,
  );

export const downloadAggregateReport = (
  fieldId?: string,
  from?: string,
  to?: string,
) => {
  const params = new URLSearchParams({ format: "pdf" });
  if (fieldId) params.set("fieldId", fieldId);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return downloadApiFile(
    `/reports/aggregate?${params.toString()}`,
    "aggregate-report.pdf",
  );
};
