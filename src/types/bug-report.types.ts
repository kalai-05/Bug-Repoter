export type BugPriority = 'urgent' | 'high' | 'normal' | 'low';

export type BugType = 'ui' | 'functional' | 'performance' | 'security' | 'crash' | 'other';

export type BugStatus = 'idle' | 'capturing' | 'submitting' | 'success' | 'error';

export interface BugReport {
  title: string;
  /** Brief one-paragraph summary of the bug. */
  description: string;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
  priority: BugPriority;
  bugType: BugType;
  pageUrl: string;
  pageTitle: string;
  userAgent: string;
  screenshot: string | null;
  screenshotDriveUrl: string | null;
  timestamp: string;
  tags: string[];
  assignees: number[];
  environmentInfo: import('./environment.types').EnvironmentInfo | null;
  createdBy?: string;
}

export interface BugReportFormState {
  title: string;
  /** Bug Summary — brief description shown at the top of the ticket. */
  description: string;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
  priority: BugPriority;
  bugType: BugType;
  /** Selected ClickUp tag names */
  tags: string[];
  /** Selected ClickUp user IDs */
  assignees: number[];
}

export interface BugReportResult {
  taskId: string;
  taskUrl: string;
  createdAt: string;
  /** Public URL of the screenshot (Drive share link or null if attached directly). */
  screenshotUrl: string | null;
}

export interface PageMetadata {
  url: string;
  title: string;
  userAgent: string;
}
