import { describe, it, expect } from 'vitest';
import { parseFrontmatter, stringifyFrontmatter, generateNoteFilename } from '../src/lib/frontmatter';

describe('frontmatter utils', () => {
  it('parseFrontmatter extracts windowTitle and body content', () => {
    const sample = `---
windowTitle: "My Test Window Title"
author: "Jules"
---

# Hello World

This is a test body.`;

    const { data, content } = parseFrontmatter(sample);
    expect(data.windowTitle).toBe('My Test Window Title');
    expect(data.author).toBe('Jules');
    expect(content).toBe('# Hello World\n\nThis is a test body.');
  });

  it('parseFrontmatter handles content without frontmatter', () => {
    const sample = `# Hello World

No frontmatter here.`;

    const { data, content } = parseFrontmatter(sample);
    expect(data).toEqual({});
    expect(content).toBe(sample);
  });

  it('stringifyFrontmatter formats object into frontmatter string', () => {
    const data = { windowTitle: 'My Window Title' };
    const body = '# Note Title\n\nContent goes here.';

    const result = stringifyFrontmatter(data, body);
    expect(result.startsWith('---\nwindowTitle: My Window Title\n---')).toBe(true);
    expect(result.includes('# Note Title\n\nContent goes here.')).toBe(true);
  });

  it('generateNoteFilename produces YYYY-MM-DD-HHMM.SSS.md pattern', () => {
    const date = new Date(2025, 0, 15, 14, 30, 0, 123); // Jan 15 2025 14:30:00.123
    const filename = generateNoteFilename(date);
    expect(filename).toBe('2025-01-15-1430.123.md');
  });
});
