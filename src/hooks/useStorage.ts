import { useState, useEffect, useCallback } from 'react';
import { getStorageItem, setStorageItem } from '../utils/storage.utils';
import type { StorageData } from '../types';

type StorageKey = keyof StorageData;

export function useStorage<K extends StorageKey>(
  key: K,
  defaultValue?: StorageData[K],
): [StorageData[K] | undefined, (value: StorageData[K]) => Promise<void>, boolean] {
  const [value, setValue] = useState<StorageData[K] | undefined>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void getStorageItem(key).then((stored) => {
      setValue(stored ?? defaultValue);
      setIsLoading(false);
    });
  }, [key, defaultValue]);

  const persist = useCallback(
    async (newValue: StorageData[K]) => {
      await setStorageItem(key, newValue);
      setValue(newValue);
    },
    [key],
  );

  return [value, persist, isLoading];
}
