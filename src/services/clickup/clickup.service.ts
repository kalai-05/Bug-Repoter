import { clickUpApi } from './clickup.api';
import { driveService } from '../drive/drive.service';
import { ClickUpError, DriveUploadError, PRIORITY_MAP } from '../../types';
import { notifyUploadComplete, notifyUploadFailed } from '../../utils/notifications.utils';
import type {
  BugReport,
  BugReportResult,
  ClickUpConfig,
  ClickUpWorkspace,
  ClickUpSpace,
  ClickUpFolder,
  ClickUpList,
  ClickUpTag,
  ClickUpMember,
} from '../../types';
import { dataUrlToBlob, buildScreenshotFilename } from '../../utils/format.utils';
import { getStorageItem, setStorageItem } from '../../utils/storage.utils';

class ClickUpService {
  // ─── Token validation ────────────────────────────────────────────────────

  /**
   * Verify the API token by calling /team.
   * Returns the list of accessible workspaces on success.
   * Throws ClickUpError('INVALID_TOKEN', …) on 401/403.
   */
  async validateToken(token: string): Promise<ClickUpWorkspace[]> {
    clickUpApi.setToken(token);
    const { teams } = await clickUpApi.getWorkspaces();
    return teams;
  }

  // ─── Hierarchy fetch ─────────────────────────────────────────────────────

  async fetchSpaces(token: string, workspaceId: string): Promise<ClickUpSpace[]> {
    clickUpApi.setToken(token);
    const { spaces } = await clickUpApi.getSpaces(workspaceId);
    return spaces;
  }

  async fetchFolders(token: string, spaceId: string): Promise<ClickUpFolder[]> {
    clickUpApi.setToken(token);
    const { folders } = await clickUpApi.getFolders(spaceId);
    return folders;
  }

  async fetchListsInFolder(token: string, folderId: string): Promise<ClickUpList[]> {
    clickUpApi.setToken(token);
    const { lists } = await clickUpApi.getListsInFolder(folderId);
    return lists;
  }

  async fetchFolderlessLists(token: string, spaceId: string): Promise<ClickUpList[]> {
    clickUpApi.setToken(token);
    const { lists } = await clickUpApi.getFolderlessLists(spaceId);
    return lists;
  }

  async fetchAllLists(
    token: string,
    spaceId: string,
  ): Promise<{ list: ClickUpList; folderName?: string }[]> {
    clickUpApi.setToken(token);

    const [{ lists: folderless }, { folders }] = await Promise.all([
      clickUpApi.getFolderlessLists(spaceId),
      clickUpApi.getFolders(spaceId),
    ]);

    const folderLists = await Promise.all(
      folders.map(async (folder) => {
        const { lists } = await clickUpApi.getListsInFolder(folder.id);
        return lists.map((list) => ({ list, folderName: folder.name }));
      }),
    );

    return [
      ...folderless.map((list) => ({ list })),
      ...folderLists.flat(),
    ];
  }

  // ─── Tags & Members ─────────────────────────────────────────────────────

  async fetchSpaceTags(token: string, spaceId: string): Promise<ClickUpTag[]> {
    clickUpApi.setToken(token);
    const { tags } = await clickUpApi.getSpaceTags(spaceId);
    return tags;
  }

  async fetchListMembers(token: string, listId: string): Promise<ClickUpMember[]> {
    clickUpApi.setToken(token);
    const { members } = await clickUpApi.getListMembers(listId);
    return members;
  }

  // ─── Selection storage ───────────────────────────────────────────────────

  async saveSelection(config: ClickUpConfig): Promise<void> {
    await setStorageItem('clickupConfig', config);
  }

  async loadSelection(): Promise<ClickUpConfig | undefined> {
    return getStorageItem('clickupConfig');
  }

  // ─── Bug report submission ───────────────────────────────────────────────

  /**
   * Create a ClickUp task from a bug report.
   *
   * Screenshot flow:
   *  1. If a screenshot exists, try uploading it to Google Drive first.
   *  2. If Drive upload succeeds, the public URL is embedded in the description.
   *  3. If Drive is not configured or the upload fails, attach the PNG directly to the task.
   *
   * Returns BugReportResult on success; throws ClickUpError on failure.
   */
  async submitBugReport(report: BugReport): Promise<BugReportResult> {
    const config = await this.loadSelection();
    if (!config?.apiToken || !config.listId) {
      throw new ClickUpError('NOT_CONFIGURED', 'ClickUp is not configured. Open Settings to add your API token.');
    }

    clickUpApi.setToken(config.apiToken);

    // ── 1. Try Drive upload for each screenshot ──────────────────────────
    const driveUrls: string[] = [];
    let attachToTask = false;

    for (let i = 0; i < report.screenshots.length; i++) {
      const dataUrl = report.screenshots[i];
      if (!dataUrl) continue;
      try {
        const driveResult = await driveService.uploadScreenshot(dataUrl, report.pageTitle);
        driveUrls.push(driveResult.publicUrl);
        notifyUploadComplete(driveResult.fileName);
      } catch (uploadErr) {
        attachToTask = true;
        if (!(uploadErr instanceof DriveUploadError && uploadErr.code === 'NOT_AUTHENTICATED')) {
          notifyUploadFailed(
            uploadErr instanceof DriveUploadError ? uploadErr.userMessage : undefined,
          );
        }
        break;
      }
    }

    // ── 2. Create task ───────────────────────────────────────────────────
    const priority = PRIORITY_MAP[report.priority] ?? 3;

    const payload: import('../../types').CreateTaskPayload = {
      name: report.title,
      description: this.buildDescription(report, driveUrls, attachToTask),
      priority,
      tags: report.tags,
      ...(report.assignees.length > 0 ? { assignees: report.assignees } : {}),
    };

    if (config.defaultStatus) {
      payload.status = config.defaultStatus;
    }

    const task = await clickUpApi.createTask(config.listId, payload);

    // ── 3. Attach screenshots if Drive was unavailable ───────────────────
    if (attachToTask && report.screenshots.length > 0) {
      for (let i = 0; i < report.screenshots.length; i++) {
        const dataUrl = report.screenshots[i];
        if (!dataUrl) continue;
        try {
          const blob = dataUrlToBlob(dataUrl);
          const filename = buildScreenshotFilename(report.pageTitle, report.screenshots.length > 1 ? i + 1 : undefined);
          await clickUpApi.uploadAttachment(task.id, blob, filename);
        } catch {
          // Non-fatal — task was created successfully; attachment is best-effort
        }
      }
    }

    return {
      taskId: task.id,
      taskUrl: task.url,
      createdAt: task.date_created,
      screenshotUrl: driveUrls[0] ?? null,
    };
  }

  // ─── Description builder ─────────────────────────────────────────────────

  private buildDescription(
    report: BugReport,
    driveUrls: string[],
    attachedToTask: boolean,
  ): string {
    const env = report.environmentInfo;
    const sections: string[] = [];

    // ── Optional text sections — only include when filled ─────────────────
    if (report.description.trim()) {
      sections.push('## Bug Summary', report.description.trim());
    }

    if (report.stepsToReproduce.trim()) {
      sections.push('## Steps to Reproduce', report.stepsToReproduce.trim());
    }

    if (report.expectedResult.trim()) {
      sections.push('## Expected Result', report.expectedResult.trim());
    }

    if (report.actualResult.trim()) {
      sections.push('## Actual Result', report.actualResult.trim());
    }

    // ── Environment ───────────────────────────────────────────────────────
    const websiteUrl = env?.url || report.pageUrl;
    const envLines: string[] = ['## Environment'];

    if (websiteUrl) envLines.push(`- **URL:** ${websiteUrl}`);

    if (env) {
      envLines.push(
        `- **Browser:** ${env.browserName} ${env.browserVersion}`,
        `- **Operating System:** ${env.os}`,
        `- **Resolution:** ${env.screenResolution}`,
        `- **Timezone:** ${env.timezone}`,
      );
    }

    if (envLines.length > 1) {
      sections.push(envLines.join('\n'));
    }

    // ── Screenshot Links ──────────────────────────────────────────────────
    if (driveUrls.length > 0) {
      sections.push(
        '## Screenshots',
        driveUrls.map((url, i) => `${driveUrls.length > 1 ? `${i + 1}. ` : ''}${url}`).join('\n'),
      );
    } else if (attachedToTask) {
      sections.push(
        '## Screenshots',
        `_${report.screenshots.length > 1 ? `${report.screenshots.length} screenshots attached` : 'Screenshot attached'} directly to this task._`,
      );
    }

    // ── Reported By / Date ────────────────────────────────────────────────
    const reportedDate = env
      ? `${env.date} at ${env.time} (${env.timezone})`
      : new Date(report.timestamp).toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

    const metaLines = ['---'];
    if (report.createdBy) metaLines.push(`*Created by: ${report.createdBy}*`);
    metaLines.push(`*Date: ${reportedDate}*`);

    sections.push(metaLines.join('\n'));

    return sections.join('\n\n');
  }
}

export const clickUpService = new ClickUpService();
