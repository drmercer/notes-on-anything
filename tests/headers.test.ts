import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Netlify headers configuration', () => {
  it('should have public/_headers with Connection-Allowlist', () => {
    const filePath = path.join(process.cwd(), 'public', '_headers');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('Connection-Allowlist: ("https://danmercer.net/*" response-origin)');
  });

  it('should have netlify.toml with Connection-Allowlist', () => {
    const filePath = path.join(process.cwd(), 'netlify.toml');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('Connection-Allowlist = \'("https://danmercer.net/*" response-origin)\'');
  });
});
