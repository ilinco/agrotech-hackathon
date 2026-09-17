import { api } from "@/api/axios";

const filenameFromDisposition = (value?: string) => {
  const match = value?.match(/filename="?([^";]+)"?/i);
  return match?.[1];
};

export const downloadApiFile = async (
  url: string,
  fallbackFilename: string,
) => {
  const response = await api.get<Blob>(url, { responseType: "blob" });
  const objectUrl = URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download =
    filenameFromDisposition(response.headers["content-disposition"]) ??
    fallbackFilename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
};
