import { describe, it, expect, vi } from 'vitest';
import { queryPermission, verifyPermission } from '../src/lib/fs';

describe('fs permission helpers', () => {
  describe('queryPermission', () => {
    it('returns false if handle is null', async () => {
      expect(await queryPermission(null as any)).toBe(false);
    });

    it('returns true if queryPermission returns "granted"', async () => {
      const mockHandle = {
        queryPermission: vi.fn().mockResolvedValue('granted'),
      };

      expect(await queryPermission(mockHandle as unknown as FileSystemHandle)).toBe(true);
      expect(mockHandle.queryPermission).toHaveBeenCalledWith({ mode: 'readwrite' });
    });

    it('returns false if queryPermission returns "prompt"', async () => {
      const mockHandle = {
        queryPermission: vi.fn().mockResolvedValue('prompt'),
      };

      expect(await queryPermission(mockHandle as unknown as FileSystemHandle)).toBe(false);
    });
  });

  describe('verifyPermission', () => {
    it('returns true directly if queryPermission returns "granted" without calling requestPermission', async () => {
      const mockHandle = {
        queryPermission: vi.fn().mockResolvedValue('granted'),
        requestPermission: vi.fn(),
      };

      expect(await verifyPermission(mockHandle as unknown as FileSystemHandle)).toBe(true);
      expect(mockHandle.requestPermission).not.toHaveBeenCalled();
    });

    it('calls requestPermission if queryPermission is "prompt" and returns true if user grants', async () => {
      const mockHandle = {
        queryPermission: vi.fn().mockResolvedValue('prompt'),
        requestPermission: vi.fn().mockResolvedValue('granted'),
      };

      expect(await verifyPermission(mockHandle as unknown as FileSystemHandle)).toBe(true);
      expect(mockHandle.requestPermission).toHaveBeenCalledWith({ mode: 'readwrite' });
    });

    it('returns false if requestPermission returns "denied"', async () => {
      const mockHandle = {
        queryPermission: vi.fn().mockResolvedValue('prompt'),
        requestPermission: vi.fn().mockResolvedValue('denied'),
      };

      expect(await verifyPermission(mockHandle as unknown as FileSystemHandle)).toBe(false);
    });
  });
});
