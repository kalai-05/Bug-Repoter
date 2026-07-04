import type { ScreenshotResult, SerializedScreenshotError } from './screenshot.types';

export interface ChromeMessage<T = unknown> {
  type: MessageType;
  payload?: T | undefined;
}

export interface ChromeMessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  /** Human-readable error string */
  error?: string;
  /** Typed error payload — populated when the error has structured context */
  errorDetail?: SerializedScreenshotError;
}

export type MessageType =
  | 'CAPTURE_SCREENSHOT'
  | 'GET_PAGE_METADATA'
  | 'OPEN_OPTIONS'
  | 'PING';

/** The full result returned when a screenshot succeeds */
export type CaptureScreenshotResponse = ScreenshotResult;

export interface PageMetadataResponse {
  url: string;
  title: string;
  userAgent: string;
}

export type Platform = 'clickup' | 'jira' | 'linear';

export interface StorageData {
  platform?: Platform;
  clickupConfig?: {
    apiToken: string;
    workspaceId: string;
    spaceId: string;
    /** Optional — lists can live directly inside a space */
    folderId: string;
    listId: string;
    defaultStatus?: string;
  };
  jiraConfig?: {
    baseUrl: string;
    email: string;
    apiToken: string;
    projectKey: string;
  };
  linearConfig?: {
    apiKey: string;
    teamId: string;
  };
  driveConfig?: {
    folderId: string | null;
  };
  recentReports?: Array<{
    taskId: string;
    taskUrl: string;
    title: string;
    createdAt: string;
  }>;
  /** Persisted Google profile. The access token is NOT stored here; Chrome's identity service manages it. */
  googleUser?: {
    sub: string;
    name: string;
    email: string;
    picture: string;
  };
}
