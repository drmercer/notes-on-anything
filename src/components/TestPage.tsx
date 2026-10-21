import { useState, useEffect, useRef } from 'preact/hooks';
import { parseFrontmatter } from '../lib/frontmatter';

const APP_TITLE = 'Notes on Anything 📝';

async function getOpfsTestDir(): Promise<FileSystemDirectoryHandle | null> {
  if (typeof navigator === 'undefined' || !navigator.storage || !navigator.storage.getDirectory) {
    return null;
  }
  try {
    const root = await navigator.storage.getDirectory();
    return await root.getDirectoryHandle('test', { create: true });
  } catch (e) {
    console.error('Error accessing OPFS test directory:', e);
    return null;
  }
}

async function writeActiveJson(testDir: FileSystemDirectoryHandle, title: string): Promise<void> {
  const fileHandle = await testDir.getFileHandle('active.json', { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify({ title }));
  await writable.close();
}

async function readActiveJson(testDir: FileSystemDirectoryHandle): Promise<string> {
  try {
    const fileHandle = await testDir.getFileHandle('active.json');
    const file = await fileHandle.getFile();
    const text = await file.text();
    const data = JSON.parse(text);
    return data?.title || '';
  } catch (e) {
    return '';
  }
}

export function TestPage() {
  const [openWindows, setOpenWindows] = useState<string[]>([]);
  const [activeWindow, setActiveWindow] = useState<string>('');
  const [newWindowName, setNewWindowName] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('Initializing OPFS...');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const checkAndSyncIframeFocus = async () => {
    if (typeof document !== 'undefined' && iframeRef.current && document.activeElement === iframeRef.current) {
      const testDir = await getOpfsTestDir();
      if (testDir) {
        await writeActiveJson(testDir, APP_TITLE);
        setActiveWindow(APP_TITLE);
      }
    }
  };

  const refreshWindows = async () => {
    const testDir = await getOpfsTestDir();
    if (!testDir) {
      setStatusMessage('OPFS not supported in this environment.');
      return;
    }

    try {
      if (typeof document !== 'undefined' && iframeRef.current && document.activeElement === iframeRef.current) {
        await writeActiveJson(testDir, APP_TITLE);
      }

      const currentActive = await readActiveJson(testDir);
      setActiveWindow(currentActive);

      const windowsSet = new Set<string>();
      if (currentActive) {
        windowsSet.add(currentActive);
      }

      for await (const entry of (testDir as any).values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.md')) {
          try {
            const fileHandle = entry as FileSystemFileHandle;
            const file = await fileHandle.getFile();
            const text = await file.text();
            const { data } = parseFrontmatter(text);
            if (data && data.windowTitle) {
              windowsSet.add(data.windowTitle);
            }
          } catch (e) {
            // ignore
          }
        }
      }

      setOpenWindows(Array.from(windowsSet));
      setStatusMessage('Loaded OPFS test data.');
    } catch (err: any) {
      console.error('Error refreshing windows:', err);
      setStatusMessage(`Error: ${err.message}`);
    }
  };

  useEffect(() => {
    const onFocusOrBlur = () => {
      checkAndSyncIframeFocus();
    };

    window.addEventListener('focus', onFocusOrBlur);
    window.addEventListener('blur', onFocusOrBlur);

    refreshWindows();
    const interval = setInterval(() => {
      checkAndSyncIframeFocus();
      refreshWindows();
    }, 1000);

    return () => {
      window.removeEventListener('focus', onFocusOrBlur);
      window.removeEventListener('blur', onFocusOrBlur);
      clearInterval(interval);
    };
  }, []);

  const handleSelectWindow = async (title: string) => {
    const testDir = await getOpfsTestDir();
    if (!testDir) return;
    try {
      await writeActiveJson(testDir, title);
      setActiveWindow(title);
      setStatusMessage(`Set active window to "${title}"`);
    } catch (err: any) {
      setStatusMessage(`Error setting active window: ${err.message}`);
    }
  };

  const handleCreateWindow = async (e: Event) => {
    e.preventDefault();
    const trimmed = newWindowName.trim();
    if (!trimmed) return;

    const testDir = await getOpfsTestDir();
    if (!testDir) return;

    try {
      await writeActiveJson(testDir, trimmed);
      setActiveWindow(trimmed);
      setNewWindowName('');
      setStatusMessage(`Opened window "${trimmed}"`);
      await refreshWindows();
    } catch (err: any) {
      setStatusMessage(`Error creating window: ${err.message}`);
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '1rem',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Test Mode (Mobile Friendly)</h1>

      {/* Main App iframe with 50% scale and 200% width/height */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>App Preview</h2>
        <div style={{
          width: '100%',
          height: '400px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <iframe
            ref={iframeRef}
            src="/?opfs"
            title="Main App OPFS Preview"
            style={{
              width: '200%',
              height: '200%',
              border: 'none',
              transform: 'scale(0.5)',
              transformOrigin: '0 0',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
        </div>
      </section>

      {/* Form to open a new window */}
      <section style={{
        backgroundColor: '#fff',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <h2 style={{ fontSize: '1.1rem', marginTop: 0, marginBottom: '0.75rem' }}>Open New Window</h2>
        <form onSubmit={handleCreateWindow} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={newWindowName}
            onInput={(e) => setNewWindowName((e.target as HTMLInputElement).value)}
            placeholder="e.g. Google Chrome - GitHub"
            style={{
              flex: 1,
              padding: '0.6rem 0.8rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '6px'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0.6rem 1.2rem',
              fontSize: '1rem',
              fontWeight: 600,
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Open
          </button>
        </form>
      </section>

      {/* List of open windows */}
      <section style={{
        backgroundColor: '#fff',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <h2 style={{ fontSize: '1.1rem', marginTop: 0, marginBottom: '0.75rem' }}>Open Windows</h2>
        {openWindows.length === 0 ? (
          <p style={{ color: '#6b7280', margin: 0, fontSize: '0.95rem' }}>No open windows registered yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {openWindows.map((winTitle) => {
              const isActive = winTitle === activeWindow;
              return (
                <li key={winTitle} style={{ marginBottom: '0.5rem' }}>
                  <button
                    onClick={() => handleSelectWindow(winTitle)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.75rem',
                      fontSize: '0.95rem',
                      borderRadius: '6px',
                      border: isActive ? '2px solid #2563eb' : '1px solid #d1d5db',
                      backgroundColor: isActive ? '#eff6ff' : '#f9fafb',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#1e40af' : '#374151',
                      cursor: 'pointer',
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ wordBreak: 'break-all' }}>{winTitle}</span>
                    {isActive && (
                      <span style={{
                        fontSize: '0.75rem',
                        backgroundColor: '#2563eb',
                        color: '#fff',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        marginLeft: '0.5rem',
                        whiteSpace: 'nowrap'
                      }}>
                        Active
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <footer style={{ fontSize: '0.85rem', color: '#6b7280' }}>
        Status: {statusMessage}
      </footer>
    </div>
  );
}
