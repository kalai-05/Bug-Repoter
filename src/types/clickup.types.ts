export interface ClickUpConfig {
  apiToken: string;
  workspaceId: string;
  spaceId: string;
  /** Empty string when the list lives directly in a space (folderless). */
  folderId: string;
  listId: string;
  /**
   * Status name to set on new tasks (must match a status in the target list).
   * Leave empty to use the list's default first status.
   * e.g. "Open", "To Do", "Bug"
   */
  defaultStatus?: string;
}

export interface ClickUpTask {
  id: string;
  name: string;
  description: string;
  status: ClickUpTaskStatus;
  priority: ClickUpPriority;
  url: string;
  date_created: string;
  date_updated: string;
}

export interface ClickUpTaskStatus {
  status: string;
  color: string;
  type: string;
}

export interface ClickUpPriority {
  id: string;
  priority: string;
  color: string;
  orderindex: string;
}

export interface ClickUpWorkspace {
  id: string;
  name: string;
  color: string;
  avatar: string | null;
}

export interface ClickUpSpace {
  id: string;
  name: string;
  private: boolean;
}

export interface ClickUpFolder {
  id: string;
  name: string;
  orderindex: number;
  space: { id: string; name: string };
}

export interface ClickUpList {
  id: string;
  name: string;
  task_count: number;
  /** Present when the list is inside a folder. */
  folder?: { id: string; name: string; hidden: boolean };
  space: { id: string; name: string };
}

export interface ClickUpTag {
  name: string;
  tag_fg: string;
  tag_bg: string;
}

export interface ClickUpMember {
  id: number;
  username: string;
  email: string;
  color: string;
  profilePicture: string | null;
}

export interface CreateTaskPayload {
  name: string;
  description: string;
  priority: number;
  tags: string[];
  assignees?: number[];
  /** ClickUp status name — must match a status in the target list. */
  status?: string;
  custom_fields?: ClickUpCustomField[];
}

export interface ClickUpCustomField {
  id: string;
  value: string | number | boolean;
}

export interface ClickUpApiError {
  err: string;
  ECODE: string;
}

export type ClickUpPriorityLevel = 1 | 2 | 3 | 4;

export const PRIORITY_MAP: Record<string, ClickUpPriorityLevel> = {
  urgent: 1,
  high: 2,
  normal: 3,
  low: 4,
} as const;

// ─── Typed error ─────────────────────────────────────────────

export type ClickUpErrorCode =
  | 'INVALID_TOKEN'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'NOT_CONFIGURED'
  | 'UNKNOWN';

export class ClickUpError extends Error {
  readonly code: ClickUpErrorCode;
  readonly httpStatus: number;

  constructor(code: ClickUpErrorCode, message: string, httpStatus = 0) {
    super(message);
    this.name = 'ClickUpError';
    this.code = code;
    this.httpStatus = httpStatus;
    Object.setPrototypeOf(this, ClickUpError.prototype);
  }

  static fromHttpStatus(status: number, apiError: ClickUpApiError): ClickUpError {
    const message = `[${apiError.ECODE}] ${apiError.err}`;
    if (status === 401 || status === 403) return new ClickUpError('INVALID_TOKEN', message, status);
    if (status === 404) return new ClickUpError('NOT_FOUND', message, status);
    if (status === 429) return new ClickUpError('RATE_LIMITED', message, status);
    return new ClickUpError('UNKNOWN', message, status);
  }

  get userMessage(): string {
    switch (this.code) {
      case 'INVALID_TOKEN':
        return 'Invalid or expired API token. Check your ClickUp settings.';
      case 'NOT_FOUND':
        return 'The requested ClickUp resource was not found.';
      case 'RATE_LIMITED':
        return 'Too many requests. Wait a moment then try again.';
      case 'NETWORK_ERROR':
        return 'Could not reach ClickUp. Check your internet connection.';
      case 'NOT_CONFIGURED':
        return 'ClickUp is not configured. Open Settings to add your API token.';
      default:
        return 'An unexpected ClickUp error occurred.';
    }
  }
}
