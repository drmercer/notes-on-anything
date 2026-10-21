import { describe, it, expect, vi } from 'vitest';
import { MarkdownEditor } from '../src/components/MarkdownEditor';

describe('MarkdownEditor component', () => {
  it('renders MarkdownEditor component with props', () => {
    const vnode = (
      <MarkdownEditor
        activeNoteKey="test-note.md"
        defaultValue="# Hello Markdown"
        onChange={vi.fn()}
      />
    );

    expect(vnode.type).toBe(MarkdownEditor);
    expect(vnode.props.activeNoteKey).toBe('test-note.md');
    expect(vnode.props.defaultValue).toBe('# Hello Markdown');
  });

  it('instantiates VNode tree with activeNoteKey and default values', () => {
    const vnode = (
      <MarkdownEditor
        activeNoteKey="note1.md"
        defaultValue="Sample text"
        onChange={vi.fn()}
        readOnly={true}
      />
    );

    expect(vnode.props.readOnly).toBe(true);
    expect(vnode.props.activeNoteKey).toBe('note1.md');
  });
});
