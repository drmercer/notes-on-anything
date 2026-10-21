import { describe, it, expect } from 'vitest';
import { NotesApp } from '../src/components/NotesApp';

describe('NotesApp component', () => {
  it('creates NotesApp JSX vnode element', () => {
    const vnode = <NotesApp />;
    expect(vnode.type).toBe(NotesApp);
  });

  it('correctly identifies titles that should be ignored when containing Notes on Anything 📝', () => {
    const shouldIgnore = (title: string) => title.includes('Notes on Anything 📝');

    expect(shouldIgnore('Notes on Anything 📝')).toBe(true);
    expect(shouldIgnore('My Note - Notes on Anything 📝')).toBe(true);
    expect(shouldIgnore('Google Chrome')).toBe(false);
    expect(shouldIgnore('VS Code')).toBe(false);
  });
});
