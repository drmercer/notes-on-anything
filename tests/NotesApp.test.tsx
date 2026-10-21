import { describe, it, expect } from 'vitest';
import { NotesApp } from '../src/components/NotesApp';

describe('NotesApp component', () => {
  it('creates VNode for NotesApp component', () => {
    const vnode = <NotesApp />;
    expect(vnode).toBeDefined();
    expect(vnode.type).toBe(NotesApp);
  });
});
