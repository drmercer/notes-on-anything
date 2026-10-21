import { describe, it, expect, vi } from 'vitest';
import { LandingPage } from '../src/components/LandingPage';

describe('LandingPage component', () => {
  it('renders landing page component with props', () => {
    const vnode = (
      <LandingPage
        isSupported={true}
        onOpenFolder={vi.fn()}
      />
    );

    expect(vnode.type).toBe(LandingPage);
    expect(vnode.props.isSupported).toBe(true);
  });

  it('contains links to GitHub repo, danmercer.net, and app title in rendered output', () => {
    const rendered = LandingPage({
      isSupported: true,
      onOpenFolder: vi.fn()
    });

    const json = JSON.stringify(rendered);
    expect(json).toContain('https://danmercer.net');
    expect(json).toContain('https://github.com/drmercer/notes-on-anything');
    expect(json).toContain('Open a folder');
    expect(json).toContain('Notes on Anything 📝');
  });

  it('renders unsupported CTA button and explanation when Web FS is not supported', () => {
    const rendered = LandingPage({
      isSupported: false,
      onOpenFolder: vi.fn()
    });

    const json = JSON.stringify(rendered);
    expect(json).toContain('Send to desktop');
    expect(json).toContain('requires the Web File System API');
    expect(json).not.toContain('Open a folder');
  });

  it('renders welcome back message with two buttons when saved folder exists', () => {
    const rendered = LandingPage({
      isSupported: true,
      savedFolderName: 'my-notes-folder',
      onOpenFolder: vi.fn(),
      onOpenSavedFolder: vi.fn()
    });

    const json = JSON.stringify(rendered);
    expect(json).toContain('my-notes-folder');
    expect(json).toContain('Open');
    expect(json).toContain('Select a different folder');
  });
});
