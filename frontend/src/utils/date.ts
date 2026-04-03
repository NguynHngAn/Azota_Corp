const VIETNAM_TZ = "Asia/Ho_Chi_Minh";

export function formatDateTimeVietnam(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", {
    timeZone: VIETNAM_TZ,
    dateStyle: "short",
    timeStyle: "short",
  });
}
