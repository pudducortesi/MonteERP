import type { DocType } from "@/types";

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  im: "Information Memorandum",
  business_plan: "Business Plan",
  contract: "Contratto",
  nda: "NDA",
  teaser: "Teaser",
  financial: "Documenti Finanziari",
  other: "Altro",
};

export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null || bytes === 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function isPreviewable(mimeType: string | null): boolean {
  if (!mimeType) return false;
  return mimeType === "application/pdf" || mimeType.startsWith("image/");
}
