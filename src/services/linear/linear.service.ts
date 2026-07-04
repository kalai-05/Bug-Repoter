import { createLinearIssue } from './linear.api';
import { driveService } from '../drive/drive.service';
import { DriveUploadError } from '../../types';
import { notifyUploadComplete, notifyUploadFailed } from '../../utils/notifications.utils';
import { getStorageItem } from '../../utils/storage.utils';
import type { BugReport, BugReportResult } from '../../types';

class LinearService {
  async submitBugReport(report: BugReport): Promise<BugReportResult> {
    const config = await getStorageItem('linearConfig');
    if (!config?.apiKey || !config.teamId) {
      throw new Error('Linear is not configured. Open Settings to add your credentials.');
    }

    // ── 1. Try Drive upload ──────────────────────────────────────────────
    let screenshotUrl: string | null = null;

    if (report.screenshot) {
      try {
        const driveResult = await driveService.uploadScreenshot(report.screenshot, report.pageTitle);
        screenshotUrl = driveResult.publicUrl;
        notifyUploadComplete(driveResult.fileName);
      } catch (err) {
        if (!(err instanceof DriveUploadError && err.code === 'NOT_AUTHENTICATED')) {
          notifyUploadFailed(err instanceof DriveUploadError ? err.userMessage : undefined);
        }
      }
    }

    // ── 2. Build markdown description ────────────────────────────────────
    const parts: string[] = [];

    if (report.description.trim()) {
      parts.push(`## Bug Summary\n\n${report.description.trim()}`);
    }
    if (report.stepsToReproduce.trim()) {
      parts.push(`## Steps to Reproduce\n\n${report.stepsToReproduce.trim()}`);
    }
    if (report.expectedResult.trim()) {
      parts.push(`## Expected Result\n\n${report.expectedResult.trim()}`);
    }
    if (report.actualResult.trim()) {
      parts.push(`## Actual Result\n\n${report.actualResult.trim()}`);
    }

    const env = report.environmentInfo;
    const envLines: string[] = [];
    if (env?.url ?? report.pageUrl) envLines.push(`- **URL:** ${env?.url ?? report.pageUrl}`);
    if (env) {
      envLines.push(
        `- **Browser:** ${env.browserName} ${env.browserVersion}`,
        `- **OS:** ${env.os}`,
        `- **Resolution:** ${env.screenResolution}`,
      );
    }
    if (envLines.length > 0) {
      parts.push(`## Environment\n\n${envLines.join('\n')}`);
    }

    if (screenshotUrl) {
      parts.push(`## Screenshot\n\n![Screenshot](${screenshotUrl})`);
    }

    const meta: string[] = [];
    if (report.createdBy) meta.push(`**Reported by:** ${report.createdBy}`);
    meta.push(`**Date:** ${new Date(report.timestamp).toLocaleString()}`);
    parts.push(meta.join('  \n'));

    // ── 3. Create issue ──────────────────────────────────────────────────
    const issue = await createLinearIssue(config, {
      title: report.title,
      description: parts.join('\n\n---\n\n'),
      priority: report.priority,
    });

    return {
      taskId: issue.identifier,
      taskUrl: issue.url,
      createdAt: new Date().toISOString(),
      screenshotUrl,
    };
  }
}

export const linearService = new LinearService();
