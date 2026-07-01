export interface HistoryEntry {
  id: string;
  title: string;
  taskId: string;
  taskUrl: string;
  /** ClickUp epoch-ms string, e.g. "1688234567890" */
  createdAt: string;
  /** Google Drive public share URL, or null if Drive wasn't used */
  screenshotUrl: string | null;
  /** Compressed JPEG thumbnail data URL, or null if no screenshot */
  screenshotThumb: string | null;
}

export type SortOrder = 'newest' | 'oldest';
