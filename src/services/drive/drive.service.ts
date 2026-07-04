import { driveApi } from './drive.api';
import { DriveUploadError } from '../../types';
import type { DriveUploadResult } from '../../types';
import { authService } from '../auth/auth.service';
import { dataUrlToBlob, buildScreenshotFilename } from '../../utils/format.utils';
import { getStorageItem, setStorageItem } from '../../utils/storage.utils';

/** Folder created automatically when no Drive Folder ID is configured. */
const AUTO_FOLDER_NAME = 'Bug Screenshots';

class DriveService {
  // ─── Public API ──────────────────────────────────────────────────────────

  /**
   * Upload a PNG screenshot to Google Drive.
   *
   * Flow:
   *  1. Acquire a silent token (Chrome identity cache).
   *  2. Find or create the target folder.
   *  3. Upload file + make it public.
   *  4. On any failure: force-refresh the token and retry once.
   *  5. Return { fileName, fileId, publicUrl, createdDate }.
   */
  async uploadScreenshot(dataUrl: string, pageTitle: string): Promise<DriveUploadResult> {
    const silentToken = await authService.getTokenSilent();
    if (!silentToken) {
      throw new DriveUploadError(
        'NOT_AUTHENTICATED',
        'No Google access token. Sign in via Settings → Google Account.',
      );
    }

    driveApi.setAccessToken(silentToken);

    try {
      return await this.doUpload(dataUrl, pageTitle);
    } catch (firstError) {
      // Retry once with a fresh token — covers silent-token expiry and transient failures
      try {
        await this.refreshToken(silentToken);
        return await this.doUpload(dataUrl, pageTitle);
      } catch (retryError) {
        // Surface the retry error (more recent); fall back to first if it's less informative
        throw retryError instanceof DriveUploadError
          ? retryError
          : firstError instanceof DriveUploadError
            ? firstError
            : new DriveUploadError('UPLOAD_FAILED', String(retryError));
      }
    }
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  private async doUpload(dataUrl: string, pageTitle: string): Promise<DriveUploadResult> {
    const blob = dataUrlToBlob(dataUrl);
    const fileName = buildScreenshotFilename(pageTitle);
    const folderId = await this.ensureFolder();

    const file = await driveApi.uploadFile(blob, fileName, folderId ?? undefined);
    await driveApi.makeFilePublic(file.id);

    return {
      fileName: file.name,
      fileId: file.id,
      publicUrl: `https://drive.google.com/file/d/${file.id}/view?usp=sharing`,
      createdDate: file.createdTime,
    };
  }

  /**
   * Resolve the folder ID to upload into.
   *
   * Priority:
   *  1. `driveConfig.folderId` from storage (explicitly set by the user).
   *  2. An existing "Bug Screenshots" folder found in Drive root.
   *  3. A newly created "Bug Screenshots" folder (ID cached for future uploads).
   */
  private async ensureFolder(): Promise<string | null> {
    const config = await getStorageItem('driveConfig');

    if (config?.folderId) return config.folderId;

    // Auto folder — find first, then create if absent
    let folderId: string | null = null;

    try {
      folderId = await driveApi.findFolder(AUTO_FOLDER_NAME);
    } catch {
      // Non-fatal: if search fails just try creating
    }

    if (!folderId) {
      folderId = await driveApi.createFolder(AUTO_FOLDER_NAME);
    }

    // Cache so subsequent uploads skip the search
    await setStorageItem('driveConfig', { folderId });

    return folderId;
  }

  /**
   * Remove the stale token from Chrome's identity cache and get a fresh one
   * interactively, then set it on the API client.
   */
  private async refreshToken(staleToken: string): Promise<void> {
    await new Promise<void>((resolve) => {
      chrome.identity.removeCachedAuthToken({ token: staleToken }, resolve);
    });

    const freshToken = await authService.getTokenInteractive();
    driveApi.setAccessToken(freshToken);
  }
}

export const driveService = new DriveService();
