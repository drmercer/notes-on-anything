import { useState, useEffect, useRef } from 'preact/hooks';
import {
  getSavedDirectoryHandle,
  saveDirectoryHandle,
  verifyPermission,
  readTextFile,
  writeTextFile
} from '../lib/fs';
import {
  parseFrontmatter,
  stringifyFrontmatter,
  generateNoteFilename
} from '../lib/frontmatter';
import { openPictureInPicture } from '../lib/pip';
import { isWebFSSupported, sendToDesktop } from '../lib/browserSupport';

export function NotesApp() {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [dirName, setDirName] = useState<string>('');
  const [activeTitle, setActiveTitle] = useState<string>('');
  const [activeNoteFile, setActiveNoteFile] = useState<FileSystemFileHandle | null>(null);
  const [activeFileName, setActiveFileName] = useState<string>('');
  const [noteContent, setNoteContent] = useState<string>('');
  const [frontmatterData, setFrontmatterData] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<string>('Please select a notes directory.');
  const [isSaved, setIsSaved] = useState<boolean>(true);

  const activeTitleRef = useRef<string>(activeTitle);
  activeTitleRef.current = activeTitle;

  const activeNoteFileRef = useRef<FileSystemFileHandle | null>(activeNoteFile);
  activeNoteFileRef.current = activeNoteFile;

  const noteContentRef = useRef<string>(noteContent);
  noteContentRef.current = noteContent;

  const frontmatterDataRef = useRef<Record<string, string>>(frontmatterData);
  frontmatterDataRef.current = frontmatterData;

  useEffect(() => {
    if (!isWebFSSupported()) {
      setIsSupported(false);
      return;
    }

    (async () => {
      const savedHandle = await getSavedDirectoryHandle();
      if (savedHandle) {
        const hasPerm = await verifyPermission(savedHandle, true);
        if (hasPerm) {
          setDirHandle(savedHandle);
          setDirName(savedHandle.name);
          setStatusMessage(`Connected to notes directory: "${savedHandle.name}"`);
        } else {
          setStatusMessage('Permission denied for saved notes directory. Please re-select folder.');
        }
      }
    })();
  }, []);

  const handleSelectDirectory = async () => {
    try {
      if (!isWebFSSupported()) {
        setIsSupported(false);
        return;
      }
      const handle = await (window as unknown as { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker();
      await saveDirectoryHandle(handle);
      setDirHandle(handle);
      setDirName(handle.name);
      setStatusMessage(`Connected to notes directory: "${handle.name}"`);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error selecting directory:', err);
        setStatusMessage(`Error opening directory: ${err.message}`);
      }
    }
  };

  useEffect(() => {
    if (!dirHandle) return;

    let isSubscribed = true;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    const checkActiveJson = async () => {
      try {
        let activeJsonHandle: FileSystemFileHandle | null = null;
        try {
          activeJsonHandle = await dirHandle.getFileHandle('active.json');
        } catch (e) {
          return;
        }

        const jsonText = await readTextFile(activeJsonHandle);
        let parsed: { title?: string } | null = null;
        try {
          parsed = JSON.parse(jsonText);
        } catch (e) {
          return;
        }

        const title = parsed?.title ?? '';
        if (title !== activeTitleRef.current) {
          if (!isSubscribed) return;
          setActiveTitle(title);
          await resolveNoteForTitle(title);
        }
      } catch (err) {
        console.error('Error checking active.json:', err);
      }
    };

    const resolveNoteForTitle = async (title: string) => {
      if (!dirHandle) return;

      try {
        let matchedFileHandle: FileSystemFileHandle | null = null;
        let matchedFileName = '';
        let matchedFrontmatter: Record<string, string> = {};
        let matchedBody = '';

        for await (const entry of (dirHandle as any).values()) {
          if (entry.kind === 'file' && entry.name.endsWith('.md')) {
            try {
              const fileText = await readTextFile(entry as FileSystemFileHandle);
              const { data, content } = parseFrontmatter(fileText);
              if (data && data.windowTitle === title) {
                matchedFileHandle = entry as FileSystemFileHandle;
                matchedFileName = entry.name;
                matchedFrontmatter = data;
                matchedBody = content;
                break;
              }
            } catch (e) {
              // ignore file read error
            }
          }
        }

        if (matchedFileHandle) {
          setActiveNoteFile(matchedFileHandle);
          setActiveFileName(matchedFileName);
          setFrontmatterData(matchedFrontmatter);
          setNoteContent(matchedBody);
          setIsSaved(true);
          setStatusMessage(`Active note: ${matchedFileName}`);
        } else if (title) {
          const newFileName = generateNoteFilename();
          const newFrontmatter = { windowTitle: title };
          const initialContent = stringifyFrontmatter(newFrontmatter, `# Note for ${title}\n\n`);

          const newFileHandle = await dirHandle.getFileHandle(newFileName, { create: true });
          await writeTextFile(newFileHandle, initialContent);

          const { data, content } = parseFrontmatter(initialContent);

          setActiveNoteFile(newFileHandle);
          setActiveFileName(newFileName);
          setFrontmatterData(data);
          setNoteContent(content);
          setIsSaved(true);
          setStatusMessage(`Created new note: ${newFileName}`);
        }
      } catch (err: any) {
        console.error('Error resolving note for title:', err);
        setStatusMessage(`Error finding note: ${err.message}`);
      }
    };

    let observer: any = null;
    if ('FileSystemObserver' in window) {
      try {
        observer = new (window as any).FileSystemObserver(async () => {
          checkActiveJson();
        });
        observer.observe(dirHandle);
      } catch (e) {
        observer = null;
      }
    }

    pollInterval = setInterval(checkActiveJson, 1000);
    checkActiveJson();

    return () => {
      isSubscribed = false;
      if (pollInterval) clearInterval(pollInterval);
      if (observer) observer.disconnect();
    };
  }, [dirHandle]);

  const handleContentChange = (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    setNoteContent(target.value);
    setIsSaved(false);
  };

  const handleSaveNote = async () => {
    if (!activeNoteFile) return;

    try {
      const fullText = stringifyFrontmatter(frontmatterDataRef.current, noteContentRef.current);
      await writeTextFile(activeNoteFile, fullText);
      setIsSaved(true);
      setStatusMessage(`Saved ${activeFileName} successfully.`);
    } catch (err: any) {
      console.error('Error saving note:', err);
      setStatusMessage(`Error saving note: ${err.message}`);
    }
  };

  if (!isSupported) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        boxSizing: 'border-box',
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif',
        backgroundColor: '#f8f9fa',
        color: '#212529'
      }}>
        <div style={{
          maxWidth: '500px',
          backgroundColor: '#ffffff',
          padding: '2.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e9ecef'
        }}>
          <h1 style={{ marginTop: 0, fontSize: '1.75rem', color: '#d9534f' }}>
            Browser Not Supported
          </h1>
          <p style={{ fontSize: '1rem', lineHeight: '1.5', color: '#495057', marginBottom: '1.5rem' }}>
            <strong>Notes on Anything</strong> requires the Web File System Access API to access and edit notes directly on your local disk.
            Your current browser or device does not support this feature. Please open this app in a desktop browser such as Chrome, Edge, or Opera on Windows, macOS, or Linux.
          </p>
          <button
            onClick={() => sendToDesktop()}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#ffffff',
              backgroundColor: '#0275d8',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            Send to Desktop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Notes on Anything</h1>
          <span style={{ fontSize: '0.85rem', color: '#666' }}>
            {dirName ? `Notes directory: ${dirName}` : 'No directory opened'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleSelectDirectory} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
            {dirHandle ? 'Change Folder' : 'Open Notes Folder'}
          </button>
          <button onClick={() => openPictureInPicture()} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
            Open Pop-up
          </button>
        </div>
      </header>

      <section style={{ backgroundColor: '#f5f5f5', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
        <strong style={{ display: 'block', fontSize: '0.85rem', color: '#555', marginBottom: '0.25rem' }}>
          ACTIVE WINDOW TITLE:
        </strong>
        <div style={{ fontSize: '1rem', fontWeight: 'bold', wordBreak: 'break-all' }}>
          {activeTitle || '(No window title detected yet)'}
        </div>
      </section>

      <main>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label style={{ fontWeight: 'bold' }}>
            {activeFileName ? `Note: ${activeFileName}` : 'Editor'}
            {!isSaved && <span style={{ color: '#d9534f', marginLeft: '0.5rem' }}>(Unsaved changes)</span>}
          </label>
          {activeNoteFile && (
            <button onClick={handleSaveNote} style={{ padding: '0.4rem 0.8rem', cursor: 'pointer' }}>
              Save
            </button>
          )}
        </div>

        <textarea
          value={noteContent}
          onInput={handleContentChange}
          placeholder={dirHandle ? 'Select a window to start editing notes...' : 'Open notes directory to get started.'}
          style={{
            width: '100%',
            height: '350px',
            fontFamily: 'monospace, sans-serif',
            fontSize: '1rem',
            padding: '0.75rem',
            boxSizing: 'border-box',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
      </main>

      <footer style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
        Status: {statusMessage}
      </footer>
    </div>
  );
}
