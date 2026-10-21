import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isWebFSSupported, getMailtoUrl, sendToDesktop } from '../src/lib/browserSupport';

describe('browserSupport utils', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('isWebFSSupported', () => {
    it('returns true when window.showDirectoryPicker is a function', () => {
      vi.stubGlobal('window', {
        location: { search: '' },
        showDirectoryPicker: vi.fn(),
      });
      expect(isWebFSSupported()).toBe(true);
    });

    it('returns false when window.showDirectoryPicker is undefined and no opfs query param', () => {
      vi.stubGlobal('window', {
        location: { search: '' },
      });
      expect(isWebFSSupported()).toBe(false);
    });

    it('returns true when opfs query param is present even if showDirectoryPicker is undefined', () => {
      vi.stubGlobal('window', {
        location: { search: '?opfs' },
      });
      expect(isWebFSSupported()).toBe(true);
    });
  });

  describe('getMailtoUrl', () => {
    it('generates a valid mailto url with encoded title and body', () => {
      const testUrl = 'https://example.com/notes';
      const mailto = getMailtoUrl(testUrl);
      expect(mailto).toContain('mailto:?subject=');
      expect(mailto).toContain(encodeURIComponent(testUrl));
      expect(mailto).toContain(encodeURIComponent('Notes on Anything 📝'));
    });
  });

  describe('sendToDesktop', () => {
    it('uses navigator.share if available', async () => {
      const shareMock = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal('window', {
        location: { href: 'https://example.com' }
      });
      vi.stubGlobal('navigator', {
        share: shareMock
      });

      await sendToDesktop();

      expect(shareMock).toHaveBeenCalledWith({
        title: expect.any(String),
        text: expect.any(String),
        url: 'https://example.com'
      });
    });

    it('falls back to mailto link if navigator.share is undefined', async () => {
      vi.stubGlobal('window', {
        location: { href: 'https://example.com' }
      });
      vi.stubGlobal('navigator', {});

      await sendToDesktop();

      expect(globalThis.window.location.href).toContain('mailto:?subject=');
    });

    it('falls back to mailto if navigator.share throws a non-AbortError', async () => {
      const shareMock = vi.fn().mockRejectedValue(new Error('Share failed'));
      vi.stubGlobal('window', {
        location: { href: 'https://example.com' }
      });
      vi.stubGlobal('navigator', {
        share: shareMock
      });

      await sendToDesktop();

      expect(globalThis.window.location.href).toContain('mailto:?subject=');
    });

    it('does not fall back to mailto if navigator.share throws AbortError', async () => {
      const abortErr = new Error('Abort');
      abortErr.name = 'AbortError';
      const shareMock = vi.fn().mockRejectedValue(abortErr);
      vi.stubGlobal('window', {
        location: { href: 'https://example.com' }
      });
      vi.stubGlobal('navigator', {
        share: shareMock
      });

      await sendToDesktop();

      expect(globalThis.window.location.href).toBe('https://example.com');
    });
  });
});
