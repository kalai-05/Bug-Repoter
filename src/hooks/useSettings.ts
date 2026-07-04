import { useCallback, useEffect, useState } from 'react';
import { getStorageItem, setStorageItem, clearStorage } from '../utils/storage.utils';
import type { Platform } from '../types/chrome.types';

/* ── Types ──────────────────────────────────────────────────── */

export interface SettingsFormState {
  platform: Platform;
  // ClickUp
  clickupApiToken: string;
  clickupWorkspaceId: string;
  clickupSpaceId: string;
  clickupFolderId: string;
  clickupListId: string;
  // Jira
  jiraBaseUrl: string;
  jiraEmail: string;
  jiraApiToken: string;
  jiraProjectKey: string;
  // Linear
  linearApiKey: string;
  linearTeamId: string;
}

export type SettingsValidationErrors = Partial<Record<keyof SettingsFormState, string>>;

export type SettingsSaveStatus = 'loading' | 'idle' | 'saving' | 'saved' | 'error';

export interface UseSettingsReturn {
  form: SettingsFormState;
  errors: SettingsValidationErrors;
  status: SettingsSaveStatus;
  saveError: string | null;
  isDirty: boolean;
  updateField: (field: keyof SettingsFormState, value: string) => void;
  switchPlatform: (p: Platform) => Promise<void>;
  save: () => Promise<void>;
  clearAll: () => Promise<void>;
}

/* ── Constants ──────────────────────────────────────────────── */

const EMPTY: SettingsFormState = {
  platform: 'clickup',
  clickupApiToken: '',
  clickupWorkspaceId: '',
  clickupSpaceId: '',
  clickupFolderId: '',
  clickupListId: '',
  jiraBaseUrl: '',
  jiraEmail: '',
  jiraApiToken: '',
  jiraProjectKey: '',
  linearApiKey: '',
  linearTeamId: '',
};

/* ── Validation ─────────────────────────────────────────────── */

function validate(f: SettingsFormState): SettingsValidationErrors {
  const e: SettingsValidationErrors = {};

  if (f.platform === 'clickup') {
    if (!f.clickupApiToken.trim()) {
      e.clickupApiToken = 'API token is required';
    } else if (/\s/.test(f.clickupApiToken)) {
      e.clickupApiToken = 'Token must not contain spaces';
    } else if (f.clickupApiToken.trim().length < 10) {
      e.clickupApiToken = 'Token looks too short — check your ClickUp API token';
    }

    if (!f.clickupWorkspaceId.trim()) {
      e.clickupWorkspaceId = 'Workspace ID is required';
    } else if (!/^\d+$/.test(f.clickupWorkspaceId.trim())) {
      e.clickupWorkspaceId = 'Must be a numeric ClickUp ID';
    }

    if (!f.clickupSpaceId.trim()) {
      e.clickupSpaceId = 'Space ID is required';
    } else if (!/^\d+$/.test(f.clickupSpaceId.trim())) {
      e.clickupSpaceId = 'Must be a numeric ClickUp ID';
    }

    if (f.clickupFolderId.trim() && !/^\d+$/.test(f.clickupFolderId.trim())) {
      e.clickupFolderId = 'Must be a numeric ClickUp ID';
    }

    if (!f.clickupListId.trim()) {
      e.clickupListId = 'List ID is required';
    } else if (!/^\d+$/.test(f.clickupListId.trim())) {
      e.clickupListId = 'Must be a numeric ClickUp ID';
    }
  }

  if (f.platform === 'jira') {
    if (!f.jiraBaseUrl.trim()) {
      e.jiraBaseUrl = 'Jira base URL is required';
    } else if (!/^https?:\/\//i.test(f.jiraBaseUrl.trim())) {
      e.jiraBaseUrl = 'Must start with https://';
    }

    if (!f.jiraEmail.trim()) {
      e.jiraEmail = 'Email is required';
    } else if (!f.jiraEmail.includes('@')) {
      e.jiraEmail = 'Enter a valid email address';
    }

    if (!f.jiraApiToken.trim()) {
      e.jiraApiToken = 'API token is required';
    } else if (f.jiraApiToken.trim().length < 8) {
      e.jiraApiToken = 'Token looks too short';
    }

    if (!f.jiraProjectKey.trim()) {
      e.jiraProjectKey = 'Project key is required';
    } else if (!/^[A-Z][A-Z0-9_]+$/i.test(f.jiraProjectKey.trim())) {
      e.jiraProjectKey = 'Use your project key (e.g. BUG, ENG)';
    }
  }

  if (f.platform === 'linear') {
    if (!f.linearApiKey.trim()) {
      e.linearApiKey = 'API key is required';
    } else if (f.linearApiKey.trim().length < 10) {
      e.linearApiKey = 'API key looks too short';
    }

    if (!f.linearTeamId.trim()) {
      e.linearTeamId = 'Team ID is required';
    }
  }

  return e;
}

/* ── Hook ───────────────────────────────────────────────────── */

export function useSettings(): UseSettingsReturn {
  const [form, setForm] = useState<SettingsFormState>(EMPTY);
  const [savedForm, setSavedForm] = useState<SettingsFormState>(EMPTY);
  const [errors, setErrors] = useState<SettingsValidationErrors>({});
  const [status, setStatus] = useState<SettingsSaveStatus>('loading');
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [platform, clickup, jira, linear] = await Promise.all([
          getStorageItem('platform'),
          getStorageItem('clickupConfig'),
          getStorageItem('jiraConfig'),
          getStorageItem('linearConfig'),
        ]);

        const loaded: SettingsFormState = {
          platform: platform ?? 'clickup',
          clickupApiToken: clickup?.apiToken ?? '',
          clickupWorkspaceId: clickup?.workspaceId ?? '',
          clickupSpaceId: clickup?.spaceId ?? '',
          clickupFolderId: clickup?.folderId ?? '',
          clickupListId: clickup?.listId ?? '',
          jiraBaseUrl: jira?.baseUrl ?? '',
          jiraEmail: jira?.email ?? '',
          jiraApiToken: jira?.apiToken ?? '',
          jiraProjectKey: jira?.projectKey ?? '',
          linearApiKey: linear?.apiKey ?? '',
          linearTeamId: linear?.teamId ?? '',
        };

        setForm(loaded);
        setSavedForm(loaded);
        setStatus('idle');
      } catch {
        setStatus('error');
        setSaveError('Failed to load existing settings');
      }
    };

    void load();
  }, []);

  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm);

  const updateField = useCallback((field: keyof SettingsFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const save = useCallback(async () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setStatus('saving');
    setSaveError(null);
    setErrors({});

    try {
      await setStorageItem('platform', form.platform);

      if (form.platform === 'clickup') {
        await setStorageItem('clickupConfig', {
          apiToken: form.clickupApiToken.trim(),
          workspaceId: form.clickupWorkspaceId.trim(),
          spaceId: form.clickupSpaceId.trim(),
          folderId: form.clickupFolderId.trim(),
          listId: form.clickupListId.trim(),
        });
      }

      if (form.platform === 'jira') {
        await setStorageItem('jiraConfig', {
          baseUrl: form.jiraBaseUrl.trim().replace(/\/$/, ''),
          email: form.jiraEmail.trim(),
          apiToken: form.jiraApiToken.trim(),
          projectKey: form.jiraProjectKey.trim().toUpperCase(),
        });
      }

      if (form.platform === 'linear') {
        await setStorageItem('linearConfig', {
          apiKey: form.linearApiKey.trim(),
          teamId: form.linearTeamId.trim(),
        });
      }

      const saved = { ...form };
      setSavedForm(saved);
      setStatus('saved');
      setTimeout(() => setStatus((s) => (s === 'saved' ? 'idle' : s)), 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save settings';
      setSaveError(msg);
      setStatus('error');
    }
  }, [form]);

  /** Switch the active platform immediately — no full-save needed. */
  const switchPlatform = useCallback(async (p: Platform) => {
    setForm((prev) => ({ ...prev, platform: p }));
    setSavedForm((prev) => ({ ...prev, platform: p }));
    setErrors({});
    await setStorageItem('platform', p);
  }, []);

  const clearAll = useCallback(async () => {
    await clearStorage();
    setForm(EMPTY);
    setSavedForm(EMPTY);
    setErrors({});
    setStatus('idle');
    setSaveError(null);
  }, []);

  return { form, errors, status, saveError, isDirty, updateField, switchPlatform, save, clearAll };
}
