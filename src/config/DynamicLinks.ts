export const DynamicLinks = {
  analytics: (fieldId: string) => `/analytics/${encodeURIComponent(fieldId)}`,
} as const;
