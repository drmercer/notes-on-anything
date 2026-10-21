import { describe, it, expect } from 'vitest';
import { isHeartbeatStale, cleanTitle } from '../src/lib/watcher';

describe('cleanTitle', () => {
  it('replaces all sequences of symbols with a single space and trims whitespace', () => {
    expect(cleanTitle("* #dev-random - Slack")).toBe("dev random Slack");
    expect(cleanTitle("⠹ Some codex session | main - main - Visual Studio Code")).toBe("Some codex session main main Visual Studio Code");
  });

  it('handles empty or blank titles', () => {
    expect(cleanTitle('')).toBe('');
    expect(cleanTitle('   ')).toBe('');
    expect(cleanTitle('***')).toBe('');
  });

  it('preserves numbers and letters across languages', () => {
    expect(cleanTitle('Notes - 123 (Draft) [v2]!')).toBe('Notes 123 Draft v2');
    expect(cleanTitle('  Project: Alpha_Beta  ')).toBe('Project Alpha Beta');
  });
});

describe('isHeartbeatStale', () => {
  const now = new Date('2026-03-30T12:00:10.000Z').getTime();

  it('returns false when heartbeat is recent (within 3 seconds)', () => {
    // 1 second ago
    const heartbeat1s = new Date('2026-03-30T12:00:09.000Z').toISOString();
    expect(isHeartbeatStale(heartbeat1s, now)).toBe(false);

    // Exactly 3 seconds ago (3000ms)
    const heartbeat3s = new Date('2026-03-30T12:00:07.000Z').toISOString();
    expect(isHeartbeatStale(heartbeat3s, now)).toBe(false);

    // Same time
    const heartbeat0s = new Date('2026-03-30T12:00:10.000Z').toISOString();
    expect(isHeartbeatStale(heartbeat0s, now)).toBe(false);
  });

  it('returns true when heartbeat is older than 3 seconds', () => {
    // 3.001 seconds ago
    const heartbeat3001ms = new Date(now - 3001).toISOString();
    expect(isHeartbeatStale(heartbeat3001ms, now)).toBe(true);

    // 5 seconds ago
    const heartbeat5s = new Date('2026-03-30T12:00:05.000Z').toISOString();
    expect(isHeartbeatStale(heartbeat5s, now)).toBe(true);

    // 1 minute ago
    const heartbeat1m = new Date('2026-03-30T11:59:10.000Z').toISOString();
    expect(isHeartbeatStale(heartbeat1m, now)).toBe(true);
  });

  it('returns true when heartbeat timestamp is missing, null, or empty', () => {
    expect(isHeartbeatStale(undefined, now)).toBe(true);
    expect(isHeartbeatStale(null, now)).toBe(true);
    expect(isHeartbeatStale('', now)).toBe(true);
  });

  it('returns true when heartbeat timestamp is invalid', () => {
    expect(isHeartbeatStale('invalid-date-string', now)).toBe(true);
  });
});
