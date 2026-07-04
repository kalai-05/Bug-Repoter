import type { BugPriority } from '../../types';

export interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
}

export interface JiraIssueResult {
  id: string;
  key: string;
}

const JIRA_PRIORITY: Record<BugPriority, string> = {
  urgent: 'Highest',
  high: 'High',
  normal: 'Medium',
  low: 'Low',
};

function basicAuth(email: string, token: string): string {
  return 'Basic ' + btoa(`${email}:${token}`);
}

function baseUrl(config: JiraConfig): string {
  return config.baseUrl.replace(/\/$/, '');
}

export async function createJiraIssue(
  config: JiraConfig,
  fields: {
    summary: string;
    description: string;
    priority: BugPriority;
    labels: string[];
  },
): Promise<JiraIssueResult> {
  const response = await fetch(`${baseUrl(config)}/rest/api/2/issue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: basicAuth(config.email, config.apiToken),
    },
    body: JSON.stringify({
      fields: {
        project: { key: config.projectKey },
        summary: fields.summary,
        description: fields.description,
        issuetype: { name: 'Bug' },
        priority: { name: JIRA_PRIORITY[fields.priority] },
        ...(fields.labels.length > 0 ? { labels: fields.labels } : {}),
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as {
      errorMessages?: string[];
      errors?: Record<string, string>;
    };
    const msg =
      err.errorMessages?.[0] ??
      Object.values(err.errors ?? {})[0] ??
      `Jira error (${response.status})`;
    throw new Error(msg);
  }

  return response.json() as Promise<JiraIssueResult>;
}

export async function uploadJiraAttachment(
  config: JiraConfig,
  issueKey: string,
  blob: Blob,
  filename: string,
): Promise<void> {
  const form = new FormData();
  form.append('file', blob, filename);

  await fetch(`${baseUrl(config)}/rest/api/2/issue/${issueKey}/attachments`, {
    method: 'POST',
    headers: {
      Authorization: basicAuth(config.email, config.apiToken),
      'X-Atlassian-Token': 'no-check',
    },
    body: form,
  });
}
