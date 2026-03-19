import { API_BASE_URL } from "./constants";

export function resolveStaticUrl(pathOrUrl: string | null | undefined): string {
  const v = (pathOrUrl ?? "").trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  if (v.startsWith("/")) return `${API_BASE_URL}${v}`;
  return v;
}

