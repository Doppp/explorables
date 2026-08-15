export interface StorageReadResult {
  value: string | null;
  available: boolean;
}

export function readBrowserStorage(key: string): StorageReadResult {
  try {
    return { value: window.localStorage.getItem(key), available: true };
  } catch {
    return { value: null, available: false };
  }
}

export function writeBrowserStorage(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeBrowserStorage(key: string): boolean {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
