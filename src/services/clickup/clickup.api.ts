import type {
  ClickUpTask,
  ClickUpSpace,
  ClickUpFolder,
  ClickUpList,
  ClickUpWorkspace,
  ClickUpTag,
  ClickUpMember,
  CreateTaskPayload,
  ClickUpApiError,
} from '../../types';
import { ClickUpError } from '../../types';

const BASE_URL = 'https://api.clickup.com/api/v2';

class ClickUpApiClient {
  private token = '';

  setToken(token: string): void {
    this.token = token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    if (!this.token) {
      throw new ClickUpError('NOT_CONFIGURED', 'ClickUp API token not set');
    }

    let response: Response;
    try {
      response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
          Authorization: this.token,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
    } catch (err) {
      throw new ClickUpError('NETWORK_ERROR', `Network error: ${String(err)}`);
    }

    if (!response.ok) {
      let apiError: ClickUpApiError = { err: 'Unknown error', ECODE: 'UNKNOWN' };
      try {
        apiError = await response.json() as ClickUpApiError;
      } catch { /* ignore JSON parse failure */ }
      throw ClickUpError.fromHttpStatus(response.status, apiError);
    }

    return response.json() as Promise<T>;
  }

  // ─── Hierarchy ──────────────────────────────────────────────────────────

  async getWorkspaces(): Promise<{ teams: ClickUpWorkspace[] }> {
    return this.request('/team');
  }

  async getSpaces(workspaceId: string): Promise<{ spaces: ClickUpSpace[] }> {
    return this.request(`/team/${workspaceId}/space?archived=false`);
  }

  async getFolders(spaceId: string): Promise<{ folders: ClickUpFolder[] }> {
    return this.request(`/space/${spaceId}/folder?archived=false`);
  }

  /** Lists that belong to a specific folder. */
  async getListsInFolder(folderId: string): Promise<{ lists: ClickUpList[] }> {
    return this.request(`/folder/${folderId}/list?archived=false`);
  }

  /** Lists that sit directly in a space (no folder). */
  async getFolderlessLists(spaceId: string): Promise<{ lists: ClickUpList[] }> {
    return this.request(`/space/${spaceId}/list?archived=false`);
  }

  // ─── Tags & Members ─────────────────────────────────────────────────────

  async getSpaceTags(spaceId: string): Promise<{ tags: ClickUpTag[] }> {
    return this.request(`/space/${spaceId}/tag`);
  }

  async getListMembers(listId: string): Promise<{ members: ClickUpMember[] }> {
    return this.request(`/list/${listId}/member`);
  }

  // ─── Tasks ──────────────────────────────────────────────────────────────

  async createTask(listId: string, payload: CreateTaskPayload): Promise<ClickUpTask> {
    return this.request(`/list/${listId}/task`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async uploadAttachment(taskId: string, blob: Blob, filename: string): Promise<void> {
    if (!this.token) {
      throw new ClickUpError('NOT_CONFIGURED', 'ClickUp API token not set');
    }

    const formData = new FormData();
    formData.append('attachment', blob, filename);

    let response: Response;
    try {
      response = await fetch(`${BASE_URL}/task/${taskId}/attachment`, {
        method: 'POST',
        headers: { Authorization: this.token },
        body: formData,
      });
    } catch (err) {
      throw new ClickUpError('NETWORK_ERROR', `Network error uploading attachment: ${String(err)}`);
    }

    if (!response.ok) {
      let apiError: ClickUpApiError = { err: 'Attachment upload failed', ECODE: 'UNKNOWN' };
      try {
        apiError = await response.json() as ClickUpApiError;
      } catch { /* ignore */ }
      throw ClickUpError.fromHttpStatus(response.status, apiError);
    }
  }
}

export const clickUpApi = new ClickUpApiClient();
