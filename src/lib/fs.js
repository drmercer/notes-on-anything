/**
 * IndexedDB and Web File System API Helpers
 */

const DB_NAME = 'NotesOnAnythingDB';
const STORE_NAME = 'handles';
const HANDLE_KEY = 'notesDirectory';

/**
 * Open IndexedDB store
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
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
 * @returns {Promise<FileSystemDirectoryHandle|null>}
 */
export async function getSavedDirectoryHandle() {
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
 * @param {FileSystemDirectoryHandle} handle
 */
export async function saveDirectoryHandle(handle) {
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
 * @param {FileSystemHandle} handle
 * @param {boolean} readWrite
 * @returns {Promise<boolean>}
 */
export async function verifyPermission(handle, readWrite = true) {
  if (!handle) return false;
  const options = { mode: readWrite ? 'readwrite' : 'read' };
  if ((await handle.queryPermission(options)) === 'granted') {
    return true;
  }
  if ((await handle.requestPermission(options)) === 'granted') {
    return true;
  }
  return false;
}

/**
 * Reads text content from a FileHandle
 * @param {FileSystemFileHandle} fileHandle
 * @returns {Promise<string>}
 */
export async function readTextFile(fileHandle) {
  const file = await fileHandle.getFile();
  return await file.text();
}

/**
 * Writes text content to a FileHandle
 * @param {FileSystemFileHandle} fileHandle
 * @param {string} content
 */
export async function writeTextFile(fileHandle, content) {
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}
