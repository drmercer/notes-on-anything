import { describe, it, expect } from 'vitest';
import { renderToString } from 'preact-render-to-string';
import { UbuntuInstallPage } from '../src/components/UbuntuInstallPage';

describe('UbuntuInstallPage component', () => {
  it('renders Ubuntu installation steps explaining how to download from GitHub', () => {
    const html = renderToString(<UbuntuInstallPage />);

    expect(html).toContain('Ubuntu GNOME Extension Installation');
    expect(html).toContain('raw.githubusercontent.com');
    expect(html).toContain('notes-on-anything-watcher@local');
    expect(html).toContain('metadata.json');
    expect(html).toContain('extension.js');
    expect(html).toContain('gnome-extensions enable');
    expect(html).toContain('targetDir');
  });

  it('includes warnings regarding sensitive directory permissions', () => {
    const html = renderToString(<UbuntuInstallPage />);

    expect(html).toContain('~/.config');
    expect(html).toContain('Web File System API');
  });
});
