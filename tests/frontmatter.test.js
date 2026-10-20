import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontmatter, stringifyFrontmatter, generateNoteFilename } from '../src/lib/frontmatter.js';

test('parseFrontmatter extracts windowTitle and body content', () => {
  const sample = `---
windowTitle: "My Test Window Title"
author: "Jules"
---

# Hello World

This is a test body.`;

  const { data, content } = parseFrontmatter(sample);
  assert.equal(data.windowTitle, 'My Test Window Title');
  assert.equal(data.author, 'Jules');
  assert.equal(content, '# Hello World\n\nThis is a test body.');
});

test('parseFrontmatter handles content without frontmatter', () => {
  const sample = `# Hello World

No frontmatter here.`;

  const { data, content } = parseFrontmatter(sample);
  assert.deepEqual(data, {});
  assert.equal(content, sample);
});

test('stringifyFrontmatter formats object into frontmatter string', () => {
  const data = { windowTitle: 'My Window Title' };
  const body = '# Note Title\n\nContent goes here.';

  const result = stringifyFrontmatter(data, body);
  assert.ok(result.startsWith('---\nwindowTitle: My Window Title\n---'));
  assert.ok(result.includes('# Note Title\n\nContent goes here.'));
});

test('generateNoteFilename produces YYYY-MM-DD-HHMM.SSS.md pattern', () => {
  const date = new Date(2025, 0, 15, 14, 30, 0, 123); // Jan 15 2025 14:30:00.123
  const filename = generateNoteFilename(date);
  assert.equal(filename, '2025-01-15-1430.123.md');
});
