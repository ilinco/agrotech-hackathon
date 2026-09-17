export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type FieldFixture = {
  id: string;
  name: string;
  boundary: Coordinates[];
  cropName: string;
};

export type DroneImageFixture = {
  id: string;
  fieldId: string;
  fileName: string;
  capturedAt: string;
  center?: Coordinates;
  status: "ready" | "unlocated";
};

export type DetectionFixture = {
  id: string;
  imageId: string;
  speciesId: string;
  speciesName: string;
  vegetationStage: string;
  location: Coordinates;
  count: number;
  countLabel: "растений" | "участков";
  confidence: number;
};

export type AnalysisFixture = {
  id: string;
  fieldId: string;
  imageIds: string[];
  status: "succeeded";
  startedAt: string;
  completedAt: string;
  detectionIds: string[];
};

export type RouteFixture = {
  id: string;
  fieldId: string;
  name: string;
  waypoints: Coordinates[];
};

export type PlantFixture = {
  id: string;
  commonName: string;
  scientificName: string;
  description: string;
  distinguishingFeatures: string[];
  vegetationStages: string[];
};

/** Deterministic prototype data. It is not a real drone-analysis result. */
export const mockAgroData = {
  isDemoData: true,
  fields: [{
    id: "field-sever-01",
    name: "Северное поле",
    cropName: "Яровая пшеница",
    boundary: [
      { latitude: 45.0272, longitude: 63.9841 },
      { latitude: 45.0272, longitude: 63.9925 },
      { latitude: 45.0226, longitude: 63.9925 },
      { latitude: 45.0226, longitude: 63.9841 },
    ],
  }] satisfies FieldFixture[],
  images: [
    { id: "image-sever-001", fieldId: "field-sever-01", fileName: "DJI_20260614_101523_001.JPG", capturedAt: "2026-06-14T10:15:23+05:00", center: { latitude: 45.0259, longitude: 63.9862 }, status: "ready" },
    { id: "image-sever-002", fieldId: "field-sever-01", fileName: "DJI_20260614_101714_002.JPG", capturedAt: "2026-06-14T10:17:14+05:00", center: { latitude: 45.0241, longitude: 63.9903 }, status: "ready" },
    { id: "image-sever-003", fieldId: "field-sever-01", fileName: "DJI_20260614_101908_003.JPG", capturedAt: "2026-06-14T10:19:08+05:00", status: "unlocated" },
  ] satisfies DroneImageFixture[],
  detections: [
    { id: "detection-001", imageId: "image-sever-001", speciesId: "chenopodium-album", speciesName: "Марь белая", vegetationStage: "2–4 листа", location: { latitude: 45.0254, longitude: 63.9868 }, count: 12, countLabel: "растений", confidence: 0.92 },
    { id: "detection-002", imageId: "image-sever-002", speciesId: "convolvulus-arvensis", speciesName: "Вьюнок полевой", vegetationStage: "Стеблевание", location: { latitude: 45.0237, longitude: 63.9907 }, count: 1, countLabel: "участков", confidence: 0.87 },
  ] satisfies DetectionFixture[],
  analyses: [{
    id: "analysis-sever-20260614",
    fieldId: "field-sever-01",
    imageIds: ["image-sever-001", "image-sever-002"],
    status: "succeeded",
    startedAt: "2026-06-14T10:24:00+05:00",
    completedAt: "2026-06-14T10:26:18+05:00",
    detectionIds: ["detection-001", "detection-002"],
  }] satisfies AnalysisFixture[],
  routes: [{
    id: "route-sever-01",
    fieldId: "field-sever-01",
    name: "Облёт северного поля",
    waypoints: [
      { latitude: 45.0268, longitude: 63.9847 }, { latitude: 45.0268, longitude: 63.9919 },
      { latitude: 45.0257, longitude: 63.9919 }, { latitude: 45.0257, longitude: 63.9847 },
      { latitude: 45.0246, longitude: 63.9847 }, { latitude: 45.0246, longitude: 63.9919 },
      { latitude: 45.0234, longitude: 63.9919 }, { latitude: 45.0234, longitude: 63.9847 },
    ],
  }] satisfies RouteFixture[],
  plants: [
    { id: "chenopodium-album", commonName: "Марь белая", scientificName: "Chenopodium album", description: "Однолетний сорняк с мучнистым налётом на молодых листьях.", distinguishingFeatures: ["Ромбические листья", "Мучнистый налёт"], vegetationStages: ["Всходы", "2–4 листа", "Ветвление"] },
    { id: "convolvulus-arvensis", commonName: "Вьюнок полевой", scientificName: "Convolvulus arvensis", description: "Многолетний вьющийся сорняк с длинными стелющимися побегами.", distinguishingFeatures: ["Стреловидные листья", "Вьющийся стебель"], vegetationStages: ["Всходы", "Стеблевание", "Бутонизация"] },
  ] satisfies PlantFixture[],
} as const;
