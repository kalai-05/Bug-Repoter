import type { BugPriority } from '../../types';

export interface LinearConfig {
  apiKey: string;
  /** Team key from the URL (e.g. "BUG" from /settings/teams/BUG) or UUID */
  teamId: string;
}

export interface LinearIssueResult {
  id: string;
  identifier: string;
  url: string;
}

const LINEAR_PRIORITY: Record<BugPriority, number> = {
  urgent: 1,
  high: 2,
  normal: 3,
  low: 4,
};

const GQL_ENDPOINT = 'https://api.linear.app/graphql';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface TeamNode { id: string; key: string; }
interface TeamsResponse {
  data?: { teams?: { nodes?: TeamNode[] } };
  errors?: Array<{ message: string }>;
}

/** Accepts a team key (e.g. "BUG") OR a UUID and always returns the UUID. */
async function resolveTeamId(apiKey: string, teamKeyOrId: string): Promise<string> {
  if (UUID_RE.test(teamKeyOrId.trim())) return teamKeyOrId.trim();

  const res = await fetch(GQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: apiKey },
    body: JSON.stringify({ query: '{ teams { nodes { id key } } }' }),
  });

  if (!res.ok) throw new Error(`Linear API error (${res.status})`);

  const json = await res.json() as TeamsResponse;
  if (json.errors?.[0]) throw new Error(json.errors[0].message);

  const nodes = json.data?.teams?.nodes ?? [];
  const match = nodes.find(
    (t) => t.key.toLowerCase() === teamKeyOrId.trim().toLowerCase(),
  );

  if (!match) {
    throw new Error(
      `Team "${teamKeyOrId}" not found. Check your Team Key in Linear → Settings → Teams.`,
    );
  }

  return match.id;
}

const CREATE_ISSUE_MUTATION = `
  mutation IssueCreate($input: IssueCreateInput!) {
    issueCreate(input: $input) {
      success
      issue { id identifier url }
    }
  }
`;

interface CreateResponse {
  data?: { issueCreate?: { success: boolean; issue?: LinearIssueResult } };
  errors?: Array<{ message: string }>;
}

export async function createLinearIssue(
  config: LinearConfig,
  fields: {
    title: string;
    description: string;
    priority: BugPriority;
  },
): Promise<LinearIssueResult> {
  const teamId = await resolveTeamId(config.apiKey, config.teamId);

  const response = await fetch(GQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: config.apiKey },
    body: JSON.stringify({
      query: CREATE_ISSUE_MUTATION,
      variables: {
        input: {
          teamId,
          title: fields.title,
          description: fields.description,
          priority: LINEAR_PRIORITY[fields.priority],
        },
      },
    }),
  });

  if (!response.ok) throw new Error(`Linear API error (${response.status})`);

  const json = await response.json() as CreateResponse;
  if (json.errors?.[0]) throw new Error(json.errors[0].message);

  const issue = json.data?.issueCreate?.issue;
  if (!issue) throw new Error('Linear did not return an issue. Check your Team Key.');

  return issue;
}
