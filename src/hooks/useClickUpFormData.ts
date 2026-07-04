import { useState, useEffect } from 'react';
import { clickUpService } from '../services/clickup/clickup.service';
import { getStorageItem } from '../utils/storage.utils';
import type { ClickUpTag, ClickUpMember } from '../types';

export interface ClickUpFormData {
  tags: ClickUpTag[];
  members: ClickUpMember[];
  isLoading: boolean;
}

export function useClickUpFormData(enabled = true): ClickUpFormData {
  const [tags, setTags] = useState<ClickUpTag[]>([]);
  const [members, setMembers] = useState<ClickUpMember[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    void (async () => {
      const config = await getStorageItem('clickupConfig');
      if (!config?.apiToken || !config.spaceId || !config.listId) {
        setIsLoading(false);
        return;
      }

      const [fetchedTags, fetchedMembers] = await Promise.allSettled([
        clickUpService.fetchSpaceTags(config.apiToken, config.spaceId),
        clickUpService.fetchListMembers(config.apiToken, config.listId),
      ]);

      if (fetchedTags.status === 'fulfilled') setTags(fetchedTags.value);
      if (fetchedMembers.status === 'fulfilled') setMembers(fetchedMembers.value);
      setIsLoading(false);
    })();
  }, []);

  return { tags, members, isLoading };
}
