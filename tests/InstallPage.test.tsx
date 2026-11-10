import { describe, it, expect } from 'vitest';
import { renderToString } from 'preact-render-to-string';
import { InstallPage, AI_PROMPT } from '../src/components/InstallPage';

describe('InstallPage component', () => {
  it('renders InstallPage component with platform choices', () => {
    const html = renderToString(<InstallPage />);

    expect(html).toContain('Install Watcher');
    expect(html).toContain('Ubuntu (GNOME)');
    expect(html).toContain('Something else');
    expect(html).toContain('Choose your platform');
    expect(html).toContain('View Ubuntu Instructions');
    expect(html).toContain('Get AI Setup Prompt');
  });

  it('contains AI prompt detailing active.json requirements and structure', () => {
    expect(AI_PROMPT).toContain('active.json');
    expect(AI_PROMPT).toContain('"title"');
    expect(AI_PROMPT).toContain('"watcherName"');
    expect(AI_PROMPT).toContain('"watcherHeartbeat"');
    expect(AI_PROMPT).toContain('Target Directory');
    expect(AI_PROMPT).toContain('directory that I specify');
    expect(AI_PROMPT).toContain('Notes on Anything');
  });

  it('has valid structure and exports AI_PROMPT string', () => {
    expect(typeof AI_PROMPT).toBe('string');
    expect(AI_PROMPT.length).toBeGreaterThan(100);
  });
});
