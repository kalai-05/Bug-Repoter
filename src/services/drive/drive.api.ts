import type { DriveFile, DriveApiError } from '../../types';
import { DriveUploadError } from '../../types';

const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';
const FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const FILE_FIELDS = 'id,name,mimeType,webViewLink,webContentLink,createdTime,size';

class DriveApiClient {
  private accessToken = '';

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  private get headers(): Record<string, string> {
    if (!this.accessToken) {
      throw new DriveUploadError('NOT_AUTHENTICATED', 'No Drive access token set');
    }
    return { Authorization: `Bearer ${this.accessToken}` };
  }

  private async parseError(res: Response, context: string): Promise<DriveUploadError> {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json() as DriveApiError;
      detail = body.error.message;
    } catch { /* ignore JSON parse failure — use status code as detail */ }

    const code =
      res.status === 401 || res.status === 403 ? 'NOT_AUTHENTICATED' : 'UPLOAD_FAILED';
    return new DriveUploadError(code, `${context}: ${detail}`);
  }

  async uploadFile(blob: Blob, name: string, parentFolderId?: string): Promise<DriveFile> {
    const metadata: Record<string, unknown> = { name, mimeType: 'image/png' };
    if (parentFolderId) metadata['parents'] = [parentFolderId];

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob, name);

    const res = await fetch(
      `${UPLOAD_URL}?uploadType=multipart&fields=${FILE_FIELDS}`,
      { method: 'POST', headers: this.headers, body: form },
    );

    if (!res.ok) throw await this.parseError(res, 'Upload');
    return res.json() as Promise<DriveFile>;
  }

  async makeFilePublic(fileId: string): Promise<void> {
    const res = await fetch(`${FILES_URL}/${fileId}/permissions`, {
      method: 'POST',
      headers: { ...this.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'reader', type: 'anyone' }),
    });

    if (!res.ok) {
      const err = await this.parseError(res, 'Set permissions');
      throw new DriveUploadError('PERMISSION_FAILED', err.message);
    }
  }

  /**
   * Search for a folder by exact name under the given parent (or root if omitted).
   * Returns the folder ID if found, null otherwise.
   */
  async findFolder(name: string, parentId?: string): Promise<string | null> {
    const escapedName = name.replace(/'/g, "\\'");
    const parentClause = parentId ? ` and '${parentId}' in parents` : '';
    const q = `name='${escapedName}' and mimeType='application/vnd.google-apps.folder' and trashed=false${parentClause}`;

    const url = `${FILES_URL}?q=${encodeURIComponent(q)}&fields=files(id)&pageSize=1`;
    const res = await fetch(url, { headers: this.headers });

    if (!res.ok) return null; // Non-fatal — fall through to creation
    const data = await res.json() as { files: Array<{ id: string }> };
    return data.files[0]?.id ?? null;
  }

  /** Create a Drive folder and return its ID. */
  async createFolder(name: string, parentId?: string): Promise<string> {
    const body: Record<string, unknown> = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
    };
    if (parentId) body['parents'] = [parentId];

    const res = await fetch(`${FILES_URL}?fields=id`, {
      method: 'POST',
      headers: { ...this.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await this.parseError(res, 'Create folder');
      throw new DriveUploadError('FOLDER_CREATION_FAILED', err.message);
    }

    const data = await res.json() as { id: string };
    return data.id;
  }
}

export const driveApi = new DriveApiClient();
