import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import {
  getSavedDirectoryHandle,
  saveDirectoryHandle,
  verifyPermission,
  readTextFile,
  writeTextFile
} from '../lib/fs.js';
import {
  parseFrontmatter,
  stringifyFrontmatter,
  generateNoteFilename
} from '../lib/frontmatter.js';
import { openPictureInPicture } from '../lib/pip.js';

export function NotesApp() {
  const [dirHandle, setDirHandle] = useState(null);
  const [dirName, setDirName] = useState('');
  const [activeTitle, setActiveTitle] = useState('');
  const [activeNoteFile, setActiveNoteFile] = useState(null);
  const [activeFileName, setActiveFileName] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [frontmatterData, setFrontmatterData] = useState({});
  const [statusMessage, setStatusMessage] = useState('Please select a notes directory.');
  const [isSaved, setIsSaved] = useState(true);

  const activeTitleRef = useRef(activeTitle);
  activeTitleRef.current = activeTitle;

  const activeNoteFileRef = useRef(activeNoteFile);
  activeNoteFileRef.current = activeNoteFile;

  const noteContentRef = useRef(noteContent);
  noteContentRef.current = noteContent;

  const frontmatterDataRef = useRef(frontmatterData);
  frontmatterDataRef.current = frontmatterData;

  // On mount: try loading saved directory handle
  useEffect(() => {
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

  // Open directory picker
  const handleSelectDirectory = async () => {
    try {
      if (!('showDirectoryPicker' in window)) {
        alert('Web File System Access API is not supported in this browser.');
        return;
      }
      const handle = await window.showDirectoryPicker();
      await saveDirectoryHandle(handle);
      setDirHandle(handle);
      setDirName(handle.name);
      setStatusMessage(`Connected to notes directory: "${handle.name}"`);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error selecting directory:', err);
        setStatusMessage(`Error opening directory: ${err.message}`);
      }
    }
  };

  // Watch active.json and search / auto-create notes
  useEffect(() => {
    if (!dirHandle) return;

    let isSubscribed = true;
    let pollInterval = null;

    const checkActiveJson = async () => {
      try {
        let activeJsonHandle = null;
        try {
          activeJsonHandle = await dirHandle.getFileHandle('active.json');
        } catch (e) {
          // File not found yet in directory
          return;
        }

        const jsonText = await readTextFile(activeJsonHandle);
        let parsed = null;
        try {
          parsed = JSON.parse(jsonText);
        } catch (e) {
          return; // invalid json or in progress of writing
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

    // Helper to search or create note matching title
    const resolveNoteForTitle = async (title) => {
      if (!dirHandle) return;

      try {
        let matchedFileHandle = null;
        let matchedFileName = '';
        let matchedFrontmatter = {};
        let matchedBody = '';

        // Iterate over entries in the directory
        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file' && entry.name.endsWith('.md')) {
            try {
              const fileText = await readTextFile(entry);
              const { data, content } = parseFrontmatter(fileText);
              if (data && data.windowTitle === title) {
                matchedFileHandle = entry;
                matchedFileName = entry.name;
                matchedFrontmatter = data;
                matchedBody = content;
                break;
              }
            } catch (e) {
              // error reading individual file
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
          // No matching file found; create a new markdown file
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
      } catch (err) {
        console.error('Error resolving note for title:', err);
        setStatusMessage(`Error finding note: ${err.message}`);
      }
    };

    // Try using FileSystemObserver API if available, else poll active.json every 1 second
    let observer = null;
    if ('FileSystemObserver' in window) {
      try {
        observer = new window.FileSystemObserver(async () => {
          checkActiveJson();
        });
        observer.observe(dirHandle);
      } catch (e) {
        observer = null;
      }
    }

    // Fallback polling
    pollInterval = setInterval(checkActiveJson, 1000);
    checkActiveJson();

    return () => {
      isSubscribed = false;
      if (pollInterval) clearInterval(pollInterval);
      if (observer) observer.disconnect();
    };
  }, [dirHandle]);

  // Handle note editor content change
  const handleContentChange = (e) => {
    setNoteContent(e.target.value);
    setIsSaved(false);
  };

  // Save current note back to disk
  const handleSaveNote = async () => {
    if (!activeNoteFile) return;

    try {
      const fullText = stringifyFrontmatter(frontmatterDataRef.current, noteContentRef.current);
      await writeTextFile(activeNoteFile, fullText);
      setIsSaved(true);
      setStatusMessage(`Saved ${activeFileName} successfully.`);
    } catch (err) {
      console.error('Error saving note:', err);
      setStatusMessage(`Error saving note: ${err.message}`);
    }
  };

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
