/**
 * IndexedDB and Web File System API Helpers
 */

const DB_NAME = 'NotesOnAnythingDB';
const STORE_NAME = 'handles';
const HANDLE_KEY = 'notesDirectory';

/**
 * Open IndexedDB store
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Gets saved directory handle from IndexedDB
 */
export async function getSavedDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(HANDLE_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Error getting saved directory handle:', err);
    return null;
  }
}

/**
 * Saves directory handle to IndexedDB
 */
export async function saveDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(handle, HANDLE_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Error saving directory handle:', err);
  }
}

/**
 * Verifies or requests permission for FileSystemHandle
 */
export async function verifyPermission(handle: FileSystemHandle, readWrite: boolean = true): Promise<boolean> {
  if (!handle) return false;
  const handleWithPerms = handle as unknown as {
    queryPermission: (options?: { mode?: 'read' | 'readwrite' }) => Promise<string>;
    requestPermission: (options?: { mode?: 'read' | 'readwrite' }) => Promise<string>;
  };
  const options = { mode: (readWrite ? 'readwrite' : 'read') as 'read' | 'readwrite' };
  if (typeof handleWithPerms.queryPermission === 'function') {
    if ((await handleWithPerms.queryPermission(options)) === 'granted') {
      return true;
    }
  }
  if (typeof handleWithPerms.requestPermission === 'function') {
    if ((await handleWithPerms.requestPermission(options)) === 'granted') {
      return true;
    }
  }
  return false;
}

/**
 * Reads text content from a FileHandle
 */
export async function readTextFile(fileHandle: FileSystemFileHandle): Promise<string> {
  const file = await fileHandle.getFile();
  return await file.text();
}

/**
 * Writes text content to a FileHandle
 */
export async function writeTextFile(fileHandle: FileSystemFileHandle, content: string): Promise<void> {
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}
