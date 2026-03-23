import * as antiCheatApi from "@/api/antiCheat";

export const logAntiCheatEvent = antiCheatApi.logAntiCheatEvent;
export const getTeacherAntiCheatMonitor = antiCheatApi.getTeacherAntiCheatMonitor;

export type {
  AntiCheatEventType,
  AntiCheatEventCreate,
  AntiCheatMonitorSummary,
  AntiCheatMonitorRow,
  AntiCheatMonitorResponse,
} from "@/api/antiCheat";
