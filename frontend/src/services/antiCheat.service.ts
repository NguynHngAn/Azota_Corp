import * as antiCheatApi from "@/api/antiCheat";

export const logAntiCheatEvent = antiCheatApi.logAntiCheatEvent;
export const sendAntiCheatHeartbeat = antiCheatApi.sendAntiCheatHeartbeat;
export const getTeacherAntiCheatMonitor = antiCheatApi.getTeacherAntiCheatMonitor;

export type {
  AntiCheatEventType,
  AntiCheatEventCreate,
  AntiCheatHeartbeatResponse,
  AntiCheatMonitorSummary,
  AntiCheatMonitorRow,
  AntiCheatMonitorResponse,
} from "@/api/antiCheat";
