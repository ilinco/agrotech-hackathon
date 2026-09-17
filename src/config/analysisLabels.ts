import type {
  AnalysisStatus,
  Lifecycle,
  TaxonClass,
  VegetationStage,
} from "@/types/analysis";

export const analysisStatusLabels: Record<AnalysisStatus, string> = {
  PENDING: "В очереди",
  RUNNING: "Выполняется",
  DONE: "Завершён",
  FAILED: "Ошибка",
};

export const stageLabels: Record<VegetationStage, string> = {
  SEEDLING: "Семядоли — 2 листа",
  VEGETATIVE: "4–6 листьев",
  FLOWERING: "Более 6 листьев / цветение",
  UNKNOWN: "Не определено",
};

export const taxonClassLabels: Record<TaxonClass, string> = {
  DICOT: "Двудольные",
  GRASS: "Злаковые",
};

export const lifecycleLabels: Record<Lifecycle, string> = {
  ANNUAL: "Малолетние",
  PERENNIAL: "Многолетние",
};
