import { describe, it, expect } from 'vitest';
import { NotesApp } from '../src/components/NotesApp';

import { verifyPermission } from '../src/lib/fs';

describe('NotesApp component', () => {
  it('creates NotesApp JSX vnode element', () => {
    const vnode = <NotesApp />;
    expect(vnode).toBeDefined();
    expect(vnode.type).toBe(NotesApp);
  });

  it('verifyPermission verifies readwrite permissions for directory handles', async () => {
    const mockHandle = {
      queryPermission: async () => 'prompt',
      requestPermission: async (opts: { mode?: string }) => {
        return opts?.mode === 'readwrite' ? 'granted' : 'denied';
      }
    };

    const hasPerm = await verifyPermission(mockHandle as unknown as FileSystemHandle, true);
    expect(hasPerm).toBe(true);
  });

  it('correctly identifies titles that should be ignored when containing Notes on Anything 📝', () => {
    const shouldIgnore = (title: string) => title.includes('Notes on Anything 📝');

    expect(shouldIgnore('Notes on Anything 📝')).toBe(true);
    expect(shouldIgnore('My Note - Notes on Anything 📝')).toBe(true);
    expect(shouldIgnore('Google Chrome')).toBe(false);
    expect(shouldIgnore('VS Code')).toBe(false);
  });
});
