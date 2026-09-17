import type { FieldPhoto } from "@/types/field";

export type AnalysisStatus = "PENDING" | "RUNNING" | "DONE" | "FAILED";
export type VegetationStage =
  "SEEDLING" | "VEGETATIVE" | "FLOWERING" | "UNKNOWN";
export type TaxonClass = "DICOT" | "GRASS";
export type Lifecycle = "ANNUAL" | "PERENNIAL";

export type WeedSpecies = {
  id: number;
  name: string;
  latinName: string | null;
  referenceDir: string;
  taxonClass: TaxonClass | null;
  lifecycle: Lifecycle | null;
  createdAt: string;
};

export type Detection = {
  id: number;
  runId: number;
  photoId: number;
  speciesId: number | null;
  speciesGuess: string;
  confidence: number;
  stage: VegetationStage;
  bboxX: number;
  bboxY: number;
  bboxWidth: number;
  bboxHeight: number;
  areaPx: number;
  isWeed: boolean;
  createdAt: string;
  species?: WeedSpecies | null;
  photo?: FieldPhoto;
};

export type Infestation = {
  weedAreaPx: number;
  totalAreaPx: number;
  coveragePercent: number | null;
  level: "низкая" | "средняя" | "высокая" | null;
  weedCount: number;
  cropCount: number;
  photosWithAreaKnown: number;
  photosTotal: number;
};

export type SprayRecommendation = {
  areaM2: number | null;
  annualCount: number;
  annualDensityPerM2: number | null;
  perennialCount: number;
  perennialDensityPerM2: number | null;
  unclassifiedCount: number;
  densityLevel: "слабая" | "средняя" | "сильная" | "критическая" | null;
  action:
    | "не опрыскивать"
    | "стандартная норма"
    | "максимум"
    | "срочно обработать"
    | null;
  dosagePercent: number | null;
  phaseBreakdown: {
    seedling: number;
    vegetative: number;
    flowering: number;
    unknown: number;
  };
  warnings: string[];
};

export type AnalysisRunPhoto = {
  id: number;
  runId: number;
  photoId: number;
  annotatedPath: string | null;
  photo: FieldPhoto;
};

export type AnalysisRun = {
  id: number;
  status: AnalysisStatus;
  summary: string | null;
  errorMessage: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  detections: Detection[];
  photos: AnalysisRunPhoto[];
  infestation?: Infestation | null;
  sprayRecommendation?: SprayRecommendation | null;
};

export type MappedDetection = {
  detectionId: number;
  photoId: number;
  originalName: string;
  speciesGuess: string;
  speciesId: number | null;
  speciesName: string | null;
  stage: VegetationStage;
  confidence: number;
  latitude: number;
  longitude: number;
  altitudeSource: "exif" | "default";
  yawSource: "exif" | "default";
  annotatedUrl: string;
};

export type AnalysisMap = {
  detections: MappedDetection[];
  meta: {
    runId: number;
    detectionsTotal: number;
    detectionsMapped: number;
    photosTotal: number;
    photosWithGeo: number;
    photosWithoutGeo: number;
    notes: string[];
  };
};

export type AggregateRun = {
  id: number;
  createdAt: string;
  status: AnalysisStatus;
  photosCount: number;
  detectionsCount: number;
  bySpecies: Record<string, number>;
  byStage: Record<string, number>;
  infestation?: Infestation | null;
};

export type AggregateReport = {
  fieldId: number | null;
  from: string | null;
  to: string | null;
  runsCount: number;
  detectionsCount: number;
  bySpecies: Record<string, number>;
  byStage: Record<string, number>;
  infestation?: Infestation | null;
  perRun: AggregateRun[];
};
