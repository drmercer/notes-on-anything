export interface ActiveWindowData {
  title?: string;
  watcherName?: string;
  watcherHeartbeat?: string;
}

/**
 * Cleans a window title by replacing all sequences of non-alphanumeric characters/symbols
 * with a single space and trimming whitespace.
 */
export function cleanTitle(title: string): string {
  if (!title) return '';
  return title.replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

export function isHeartbeatStale(heartbeatIso: string | null | undefined, nowMs: number = Date.now()): boolean {
  if (!heartbeatIso) return true;
  const heartbeatMs = new Date(heartbeatIso).getTime();
  if (isNaN(heartbeatMs)) return true;
  return nowMs - heartbeatMs > 3000;
}
