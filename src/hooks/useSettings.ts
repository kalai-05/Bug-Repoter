import { useCallback, useEffect, useState } from 'react';
import { getStorageItem, setStorageItem, clearStorage } from '../utils/storage.utils';

/* ── Types ──────────────────────────────────────────────────── */

export interface SettingsFormState {
  clickupApiToken: string;
  clickupWorkspaceId: string;
  clickupSpaceId: string;
  clickupFolderId: string;
  clickupListId: string;
  googleClientId: string;
  googleDriveFolderId: string;
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
  save: () => Promise<void>;
  clearAll: () => Promise<void>;
}

/* ── Constants ──────────────────────────────────────────────── */

const EMPTY: SettingsFormState = {
  clickupApiToken: '',
  clickupWorkspaceId: '',
  clickupSpaceId: '',
  clickupFolderId: '',
  clickupListId: '',
  googleClientId: '',
  googleDriveFolderId: '',
};

/* ── Validation ─────────────────────────────────────────────── */

function validate(f: SettingsFormState): SettingsValidationErrors {
  const e: SettingsValidationErrors = {};

  // ClickUp API Token
  if (!f.clickupApiToken.trim()) {
    e.clickupApiToken = 'API token is required';
  } else if (/\s/.test(f.clickupApiToken)) {
    e.clickupApiToken = 'Token must not contain spaces';
  } else if (f.clickupApiToken.trim().length < 10) {
    e.clickupApiToken = 'Token looks too short — check your ClickUp API token';
  }

  // Workspace ID
  if (!f.clickupWorkspaceId.trim()) {
    e.clickupWorkspaceId = 'Workspace ID is required';
  } else if (!/^\d+$/.test(f.clickupWorkspaceId.trim())) {
    e.clickupWorkspaceId = 'Must be a numeric ClickUp ID';
  }

  // Space ID
  if (!f.clickupSpaceId.trim()) {
    e.clickupSpaceId = 'Space ID is required';
  } else if (!/^\d+$/.test(f.clickupSpaceId.trim())) {
    e.clickupSpaceId = 'Must be a numeric ClickUp ID';
  }

  // Folder ID — optional, validate only when filled
  if (f.clickupFolderId.trim() && !/^\d+$/.test(f.clickupFolderId.trim())) {
    e.clickupFolderId = 'Must be a numeric ClickUp ID';
  }

  // List ID
  if (!f.clickupListId.trim()) {
    e.clickupListId = 'List ID is required';
  } else if (!/^\d+$/.test(f.clickupListId.trim())) {
    e.clickupListId = 'Must be a numeric ClickUp ID';
  }

  // Google Client ID — optional, validate format when filled
  if (
    f.googleClientId.trim() &&
    !f.googleClientId.trim().endsWith('.apps.googleusercontent.com')
  ) {
    e.googleClientId = 'Must end with .apps.googleusercontent.com';
  }

  // Drive Folder ID — no format constraint, but trim whitespace check
  if (f.googleDriveFolderId && f.googleDriveFolderId !== f.googleDriveFolderId.trim()) {
    e.googleDriveFolderId = 'Must not contain leading or trailing spaces';
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

  // Load existing settings on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [clickup, drive] = await Promise.all([
          getStorageItem('clickupConfig'),
          getStorageItem('driveConfig'),
        ]);

        const loaded: SettingsFormState = {
          clickupApiToken: clickup?.apiToken ?? '',
          clickupWorkspaceId: clickup?.workspaceId ?? '',
          clickupSpaceId: clickup?.spaceId ?? '',
          clickupFolderId: clickup?.folderId ?? '',
          clickupListId: clickup?.listId ?? '',
          googleClientId: drive?.clientId ?? '',
          googleDriveFolderId: drive?.folderId ?? '',
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
    // Clear per-field error on change
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
      const saves: Promise<void>[] = [
        setStorageItem('clickupConfig', {
          apiToken: form.clickupApiToken.trim(),
          workspaceId: form.clickupWorkspaceId.trim(),
          spaceId: form.clickupSpaceId.trim(),
          folderId: form.clickupFolderId.trim(),
          listId: form.clickupListId.trim(),
        }),
        setStorageItem('driveConfig', {
          clientId: form.googleClientId.trim(),
          folderId: form.googleDriveFolderId.trim() || null,
        }),
      ];

      await Promise.all(saves);

      const saved = { ...form };
      setSavedForm(saved);
      setStatus('saved');

      // Auto-clear success status after 4 seconds
      setTimeout(() => setStatus((s) => (s === 'saved' ? 'idle' : s)), 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save settings';
      setSaveError(msg);
      setStatus('error');
    }
  }, [form]);

  const clearAll = useCallback(async () => {
    await clearStorage();
    setForm(EMPTY);
    setSavedForm(EMPTY);
    setErrors({});
    setStatus('idle');
    setSaveError(null);
  }, []);

  return { form, errors, status, saveError, isDirty, updateField, save, clearAll };
}
