import type { Field } from "@/types/field";

export const demoField: Field = {
  id: "demo-field",
  name: "Тестовое поле",
  isDemo: true,
  boundary: [
    { latitude: 53.245, longitude: 63.705 },
    { latitude: 53.247, longitude: 63.728 },
    { latitude: 53.235, longitude: 63.733 },
    { latitude: 53.231, longitude: 63.713 },
  ],
};
