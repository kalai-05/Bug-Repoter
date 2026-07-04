import { clickUpService } from './clickup/clickup.service';
import { jiraService } from './jira/jira.service';
import { linearService } from './linear/linear.service';
import { getStorageItem } from '../utils/storage.utils';
import type { BugReport, BugReportResult } from '../types';

class ReporterService {
  async submitBugReport(report: BugReport): Promise<BugReportResult> {
    const platform = (await getStorageItem('platform')) ?? 'clickup';
    switch (platform) {
      case 'jira':
        return jiraService.submitBugReport(report);
      case 'linear':
        return linearService.submitBugReport(report);
      default:
        return clickUpService.submitBugReport(report);
    }
  }
}

export const reporterService = new ReporterService();
