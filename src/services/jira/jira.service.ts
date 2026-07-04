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

    // ── 1. Try Drive upload ──────────────────────────────────────────────
    let screenshotUrl: string | null = null;
    let attachToIssue = false;

    if (report.screenshot) {
      try {
        const driveResult = await driveService.uploadScreenshot(report.screenshot, report.pageTitle);
        screenshotUrl = driveResult.publicUrl;
        notifyUploadComplete(driveResult.fileName);
      } catch (err) {
        attachToIssue = true;
        if (!(err instanceof DriveUploadError && err.code === 'NOT_AUTHENTICATED')) {
          notifyUploadFailed(err instanceof DriveUploadError ? err.userMessage : undefined);
        }
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

    if (screenshotUrl) {
      lines.push('== Screenshot ==', screenshotUrl, '');
    } else if (attachToIssue) {
      lines.push('== Screenshot ==', 'Attached to this issue.', '');
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

    // ── 4. Attach screenshot ─────────────────────────────────────────────
    if (report.screenshot && attachToIssue) {
      try {
        const blob = dataUrlToBlob(report.screenshot);
        const filename = buildScreenshotFilename(report.pageTitle);
        await uploadJiraAttachment(config, issue.key, blob, filename);
      } catch {
        // Non-fatal
      }
    }

    return {
      taskId: issue.key,
      taskUrl,
      createdAt: new Date().toISOString(),
      screenshotUrl,
    };
  }
}

export const jiraService = new JiraService();
