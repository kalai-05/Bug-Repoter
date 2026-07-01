import type { StorageData } from '../types';

type StorageKey = keyof StorageData;

export async function getStorageItem<K extends StorageKey>(
  key: K,
): Promise<StorageData[K] | undefined> {
  const result = await chrome.storage.sync.get(key);
  return result[key] as StorageData[K] | undefined;
}

export async function setStorageItem<K extends StorageKey>(
  key: K,
  value: StorageData[K],
): Promise<void> {
  await chrome.storage.sync.set({ [key]: value });
}

export async function removeStorageItem(key: StorageKey): Promise<void> {
  await chrome.storage.sync.remove(key);
}

export async function getAllStorage(): Promise<StorageData> {
  return chrome.storage.sync.get(null) as Promise<StorageData>;
}

export async function clearStorage(): Promise<void> {
  await chrome.storage.sync.clear();
}

export async function getLocalItem<T>(key: string): Promise<T | undefined> {
  const result = await chrome.storage.local.get(key);
  return result[key] as T | undefined;
}

export async function setLocalItem<T>(key: string, value: T): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}
