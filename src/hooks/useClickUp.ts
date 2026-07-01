import { useState, useEffect, useCallback } from 'react';
import { clickUpService } from '../services/clickup/clickup.service';
import { ClickUpError } from '../types';
import type { ClickUpConfig, ClickUpWorkspace, ClickUpSpace, ClickUpFolder, ClickUpList } from '../types';

interface UseClickUpReturn {
  config: ClickUpConfig | null;
  workspaces: ClickUpWorkspace[];
  spaces: ClickUpSpace[];
  folders: ClickUpFolder[];
  lists: ClickUpList[];
  isValidating: boolean;
  isLoading: boolean;
  error: string | null;
  /** Validate the token and populate workspaces in one call. */
  validateToken: (token: string) => Promise<ClickUpWorkspace[]>;
  loadSpaces: (token: string, workspaceId: string) => Promise<void>;
  loadFolders: (token: string, spaceId: string) => Promise<void>;
  /** Load lists inside a folder. Pass an empty string to load folderless lists. */
  loadLists: (token: string, spaceId: string, folderId?: string) => Promise<void>;
  saveConfig: (config: ClickUpConfig) => Promise<void>;
  clearError: () => void;
}

export function useClickUp(): UseClickUpReturn {
  const [config, setConfig] = useState<ClickUpConfig | null>(null);
  const [workspaces, setWorkspaces] = useState<ClickUpWorkspace[]>([]);
  const [spaces, setSpaces] = useState<ClickUpSpace[]>([]);
  const [folders, setFolders] = useState<ClickUpFolder[]>([]);
  const [lists, setLists] = useState<ClickUpList[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void clickUpService.loadSelection().then((stored) => {
      if (stored) setConfig(stored);
    });
  }, []);

  const toErrorMessage = (err: unknown): string => {
    if (err instanceof ClickUpError) return err.userMessage;
    if (err instanceof Error) return err.message;
    return 'An unexpected error occurred';
  };

  const validateToken = useCallback(async (token: string): Promise<ClickUpWorkspace[]> => {
    setIsValidating(true);
    setError(null);
    try {
      const teams = await clickUpService.validateToken(token);
      setWorkspaces(teams);
      return teams;
    } catch (err) {
      setError(toErrorMessage(err));
      throw err;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const loadSpaces = useCallback(async (token: string, workspaceId: string) => {
    setIsLoading(true);
    setError(null);
    setSpaces([]);
    setFolders([]);
    setLists([]);
    try {
      const fetched = await clickUpService.fetchSpaces(token, workspaceId);
      setSpaces(fetched);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFolders = useCallback(async (token: string, spaceId: string) => {
    setIsLoading(true);
    setError(null);
    setFolders([]);
    setLists([]);
    try {
      const fetched = await clickUpService.fetchFolders(token, spaceId);
      setFolders(fetched);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadLists = useCallback(async (token: string, spaceId: string, folderId?: string) => {
    setIsLoading(true);
    setError(null);
    setLists([]);
    try {
      const fetched = folderId
        ? await clickUpService.fetchListsInFolder(token, folderId)
        : await clickUpService.fetchFolderlessLists(token, spaceId);
      setLists(fetched);
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveConfig = useCallback(async (newConfig: ClickUpConfig) => {
    await clickUpService.saveSelection(newConfig);
    setConfig(newConfig);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    config,
    workspaces,
    spaces,
    folders,
    lists,
    isValidating,
    isLoading,
    error,
    validateToken,
    loadSpaces,
    loadFolders,
    loadLists,
    saveConfig,
    clearError,
  };
}
