import { useState, useEffect, useCallback, useMemo } from 'react';
import { historyService } from '../services/history.service';
import type { HistoryEntry, SortOrder } from '../types/history.types';

export interface UseHistoryReturn {
  isLoading: boolean;
  totalCount: number;
  displayEntries: HistoryEntry[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortOrder: SortOrder;
  setSortOrder: (o: SortOrder) => void;
  deleteEntry: (id: string) => Promise<void>;
  deleteAll: () => Promise<void>;
}

export function useHistory(): UseHistoryReturn {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  useEffect(() => {
    void historyService.getAll().then((all) => {
      setEntries(all);
      setIsLoading(false);
    });
  }, []);

  const displayEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let result = q
      ? entries.filter((e) => e.title.toLowerCase().includes(q))
      : entries;

    if (sortOrder === 'oldest') {
      result = [...result].reverse();
    }

    return result;
  }, [entries, searchQuery, sortOrder]);

  const deleteEntry = useCallback(async (id: string) => {
    await historyService.deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const deleteAll = useCallback(async () => {
    await historyService.deleteAll();
    setEntries([]);
  }, []);

  return {
    isLoading,
    totalCount: entries.length,
    displayEntries,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    deleteEntry,
    deleteAll,
  };
}
