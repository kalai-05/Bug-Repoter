import { getLocalItem, setLocalItem } from '../utils/storage.utils';
import type { HistoryEntry } from '../types/history.types';

const HISTORY_KEY = 'bugHistory';
const MAX_ENTRIES = 50;

class HistoryService {
  async getAll(): Promise<HistoryEntry[]> {
    return (await getLocalItem<HistoryEntry[]>(HISTORY_KEY)) ?? [];
  }

  async addEntry(entry: HistoryEntry): Promise<void> {
    const existing = await this.getAll();
    const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
    await setLocalItem(HISTORY_KEY, updated);
  }

  async deleteEntry(id: string): Promise<void> {
    const existing = await this.getAll();
    await setLocalItem(HISTORY_KEY, existing.filter((e) => e.id !== id));
  }

  async deleteAll(): Promise<void> {
    await setLocalItem(HISTORY_KEY, []);
  }
}

export const historyService = new HistoryService();
