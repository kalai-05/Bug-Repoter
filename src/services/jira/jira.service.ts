import { createJiraIssue, uploadJiraAttachment } from './jira.api';
import { driveService } from '../drive/drive.service';
import { DriveUploadError } from '../../types';
import { notifyUploadComplete, notifyUploadFailed } from '../../utils/notifications.utils';
import { dataUrlToBlob, buildScreenshotFilename } from '../../utils/format.utils';
import { getStorageItem } from '../../utils/storage.utils';
import type { BugReport, BugReportResult } from '../../types';

class JiraService {
  async submitBugReport(report: BugReport): Promise<BugReportResult> {
    const config = await getStorageItem('jiraConfig');
    if (!config?.baseUrl || !config.email || !config.apiToken || !config.projectKey) {
      throw new Error('Jira is not configured. Open Settings to add your credentials.');
    }

    // ── 1. Try Drive upload for each screenshot ──────────────────────────
    const driveUrls: string[] = [];
    let attachToIssue = false;

    for (let i = 0; i < report.screenshots.length; i++) {
      const dataUrl = report.screenshots[i];
      if (!dataUrl) continue;
      try {
        const driveResult = await driveService.uploadScreenshot(dataUrl, report.pageTitle);
        driveUrls.push(driveResult.publicUrl);
        notifyUploadComplete(driveResult.fileName);
      } catch (err) {
        attachToIssue = true;
        if (!(err instanceof DriveUploadError && err.code === 'NOT_AUTHENTICATED')) {
          notifyUploadFailed(err instanceof DriveUploadError ? err.userMessage : undefined);
        }
        break;
      }
    }

    // ── 2. Build plain-text description ──────────────────────────────────
    const lines: string[] = [];

    if (report.description.trim()) {
      lines.push('== Bug Summary ==', report.description.trim(), '');
    }
    if (report.stepsToReproduce.trim()) {
      lines.push('== Steps to Reproduce ==', report.stepsToReproduce.trim(), '');
    }
    if (report.expectedResult.trim()) {
      lines.push('== Expected Result ==', report.expectedResult.trim(), '');
    }
    if (report.actualResult.trim()) {
      lines.push('== Actual Result ==', report.actualResult.trim(), '');
    }

    const env = report.environmentInfo;
    const envParts: string[] = [];
    if (env?.url ?? report.pageUrl) envParts.push(`URL: ${env?.url ?? report.pageUrl}`);
    if (env) {
      envParts.push(
        `Browser: ${env.browserName} ${env.browserVersion}`,
        `OS: ${env.os}`,
        `Resolution: ${env.screenResolution}`,
      );
    }
    if (envParts.length > 0) {
      lines.push('== Environment ==', ...envParts, '');
    }

    if (driveUrls.length > 0) {
      lines.push('== Screenshots ==', ...driveUrls.map((url, i) => driveUrls.length > 1 ? `${i + 1}. ${url}` : url), '');
    } else if (attachToIssue) {
      lines.push('== Screenshots ==', `${report.screenshots.length > 1 ? `${report.screenshots.length} screenshots` : 'Screenshot'} attached to this issue.`, '');
    }

    if (report.createdBy) lines.push(`Created by: ${report.createdBy}`);
    lines.push(`Date: ${new Date(report.timestamp).toLocaleString()}`);

    // ── 3. Create issue ──────────────────────────────────────────────────
    const issue = await createJiraIssue(config, {
      summary: report.title,
      description: lines.join('\n'),
      priority: report.priority,
      labels: report.tags,
    });

    const taskUrl = `${config.baseUrl.replace(/\/$/, '')}/browse/${issue.key}`;

    // ── 4. Attach screenshots ────────────────────────────────────────────
    if (attachToIssue && report.screenshots.length > 0) {
      for (let i = 0; i < report.screenshots.length; i++) {
        const dataUrl = report.screenshots[i];
        if (!dataUrl) continue;
        try {
          const blob = dataUrlToBlob(dataUrl);
          const filename = buildScreenshotFilename(report.pageTitle, report.screenshots.length > 1 ? i + 1 : undefined);
          await uploadJiraAttachment(config, issue.key, blob, filename);
        } catch {
          // Non-fatal
        }
      }
    }

    return {
      taskId: issue.key,
      taskUrl,
      createdAt: new Date().toISOString(),
      screenshotUrl: driveUrls[0] ?? null,
    };
  }
}

export const jiraService = new JiraService();
