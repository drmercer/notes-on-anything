import { useState, useEffect, useRef } from 'preact/hooks';
import {
  getSavedDirectoryHandle,
  saveDirectoryHandle,
  queryPermission,
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
import { isWebFSSupported } from '../lib/browserSupport';
import { LandingPage } from './LandingPage';
import { MarkdownEditor } from './MarkdownEditor';

export function NotesApp() {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [savedHandle, setSavedHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [dirName, setDirName] = useState<string>('');
  const [activeTitle, setActiveTitle] = useState<string>('');
  const [activeNoteFile, setActiveNoteFile] = useState<FileSystemFileHandle | null>(null);
  const [activeFileName, setActiveFileName] = useState<string>('');
  const [noteContent, setNoteContent] = useState<string>('');
  const [frontmatterData, setFrontmatterData] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<string>('Please select a notes directory.');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const activeTitleRef = useRef<string>(activeTitle);
  activeTitleRef.current = activeTitle;

  const activeNoteFileRef = useRef<FileSystemFileHandle | null>(activeNoteFile);
  activeNoteFileRef.current = activeNoteFile;

  const activeFileNameRef = useRef<string>(activeFileName);
  activeFileNameRef.current = activeFileName;

  const noteContentRef = useRef<string>(noteContent);
  noteContentRef.current = noteContent;

  const frontmatterDataRef = useRef<Record<string, string>>(frontmatterData);
  frontmatterDataRef.current = frontmatterData;

  const hasUnsavedChangesRef = useRef<boolean>(false);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveActiveNoteImmediately = async (contentToSave?: string) => {
    if (!activeNoteFileRef.current) return;
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
    const textToWrite = contentToSave !== undefined ? contentToSave : noteContentRef.current;
    const fullText = stringifyFrontmatter(frontmatterDataRef.current, textToWrite);
    try {
      setIsSaving(true);
      await writeTextFile(activeNoteFileRef.current, fullText);
      setIsSaving(false);
      hasUnsavedChangesRef.current = false;
      setStatusMessage(`Saved ${activeFileNameRef.current} automatically.`);
    } catch (err: any) {
      console.error('Error auto-saving note:', err);
      setIsSaving(false);
      setStatusMessage(`Error auto-saving note: ${err.message}`);
    }
  };

  const handleMarkdownChange = (newMarkdown: string) => {
    noteContentRef.current = newMarkdown;
    setNoteContent(newMarkdown);
    setIsSaving(true);
    hasUnsavedChangesRef.current = true;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      saveActiveNoteImmediately(newMarkdown);
    }, 500);
  };

  useEffect(() => {
    const handleFlush = () => {
      if (hasUnsavedChangesRef.current && activeNoteFileRef.current) {
        saveActiveNoteImmediately();
      }
    };

    window.addEventListener('beforeunload', handleFlush);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleFlush();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleFlush);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      handleFlush();
    };
  }, []);

  useEffect(() => {
    if (!isWebFSSupported()) {
      setIsSupported(false);
      return;
    }

    (async () => {
      const saved = await getSavedDirectoryHandle();
      if (saved) {
        const hasPerm = await queryPermission(saved, true);
        if (hasPerm) {
          setDirHandle(saved);
          setDirName(saved.name);
          setStatusMessage(`Connected to notes directory: "${saved.name}"`);
        } else {
          setSavedHandle(saved);
        }
      }
    })();
  }, []);

  const handleOpenSavedDirectory = async () => {
    if (!savedHandle) return;
    try {
      const hasPerm = await verifyPermission(savedHandle, true);
      if (hasPerm) {
        setDirHandle(savedHandle);
        setDirName(savedHandle.name);
        setStatusMessage(`Connected to notes directory: "${savedHandle.name}"`);
        setSavedHandle(null);
        setPermissionError(null);
      } else {
        setPermissionError('Permission was not granted for the folder. Please re-select or try again.');
      }
    } catch (err: any) {
      console.error('Error opening saved folder:', err);
      setPermissionError(`Error opening directory: ${err.message}`);
    }
  };

  const handleSelectDirectory = async () => {
    try {
      if (!isWebFSSupported()) {
        setIsSupported(false);
        return;
      }
      const searchParams = new URLSearchParams(window.location.search);
      let handle: FileSystemDirectoryHandle;
      if (searchParams.has('opfs')) {
        const root = await navigator.storage.getDirectory();
        handle = await root.getDirectoryHandle('test', { create: true });
      } else {
        handle = await (window as unknown as { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker();
      }
      await saveDirectoryHandle(handle);
      setDirHandle(handle);
      setDirName(handle.name);
      setSavedHandle(null);
      setPermissionError(null);
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

      if (hasUnsavedChangesRef.current && activeNoteFileRef.current) {
        await saveActiveNoteImmediately();
      } else if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }

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
          setIsSaving(false);
          hasUnsavedChangesRef.current = false;
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
          setIsSaving(false);
          hasUnsavedChangesRef.current = false;
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

  if (!dirHandle) {
    return (
      <LandingPage
        isSupported={isSupported}
        savedFolderName={savedHandle ? savedHandle.name : null}
        onOpenFolder={handleSelectDirectory}
        onOpenSavedFolder={handleOpenSavedDirectory}
        errorMessage={permissionError}
      />
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
            Change Folder
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
          </label>
          {activeNoteFile && (
            <div style={{ fontSize: '0.85rem', color: isSaving ? '#d97706' : '#16a34a', fontWeight: 'bold' }}>
              {isSaving ? 'Saving...' : 'Autosaved'}
            </div>
          )}
        </div>

        <MarkdownEditor
          activeNoteKey={activeFileName}
          defaultValue={noteContent}
          onChange={handleMarkdownChange}
          placeholder={dirHandle ? 'Select a window to start editing notes...' : 'Open notes directory to get started.'}
        />
      </main>

      <footer style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
        Status: {statusMessage}
      </footer>
    </div>
  );
}
