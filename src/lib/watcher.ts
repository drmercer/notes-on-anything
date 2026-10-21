export interface ActiveWindowData {
  title?: string;
  watcherName?: string;
  watcherHeartbeat?: string;
}

/**
 * Determines whether a watcher heartbeat timestamp is stale (older than 3 seconds) or invalid/missing.
 * @param heartbeatIso - ISO timestamp string of the last heartbeat
 * @param nowMs - Current time in milliseconds (defaults to Date.now())
 * @returns true if the heartbeat was more than 3 seconds (3000 ms) ago or missing/invalid
 */
export function isHeartbeatStale(heartbeatIso: string | null | undefined, nowMs: number = Date.now()): boolean {
  if (!heartbeatIso) return true;
  const heartbeatMs = new Date(heartbeatIso).getTime();
  if (isNaN(heartbeatMs)) return true;
  return nowMs - heartbeatMs > 3000;
}
