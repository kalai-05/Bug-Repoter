import { useEffect, useState } from 'react';
import type { EnvironmentInfo } from '../types/environment.types';

function detectBrowser(): { name: string; version: string } {
  const ua = navigator.userAgent;
  // Order matters: Edge and Opera both include "Chrome/" in their UA
  if (/Edg\/(\d+)/.test(ua)) {
    return { name: 'Microsoft Edge', version: ua.match(/Edg\/(\d+)/)?.[1] ?? '' };
  }
  if (/OPR\/(\d+)/.test(ua)) {
    return { name: 'Opera', version: ua.match(/OPR\/(\d+)/)?.[1] ?? '' };
  }
  if (/Chrome\/(\d+)/.test(ua)) {
    return { name: 'Google Chrome', version: ua.match(/Chrome\/(\d+)/)?.[1] ?? '' };
  }
  if (/Firefox\/(\d+)/.test(ua)) {
    return { name: 'Mozilla Firefox', version: ua.match(/Firefox\/(\d+)/)?.[1] ?? '' };
  }
  if (/Version\/(\d+).*Safari/.test(ua)) {
    return { name: 'Safari', version: ua.match(/Version\/(\d+)/)?.[1] ?? '' };
  }
  return { name: 'Unknown', version: '' };
}

function detectOS(): string {
  const ua = navigator.userAgent;
  if (/Windows NT 10\.0/.test(ua)) return 'Windows 10/11';
  if (/Windows NT 6\.3/.test(ua)) return 'Windows 8.1';
  if (/Windows NT 6\.1/.test(ua)) return 'Windows 7';
  if (/Windows/.test(ua)) return 'Windows';
  if (/Mac OS X ([\d_]+)/.test(ua)) {
    const ver = ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.') ?? '';
    return `macOS ${ver}`;
  }
  if (/Android (\d+)/.test(ua)) {
    return `Android ${ua.match(/Android (\d+)/)?.[1] ?? ''}`;
  }
  if (/Linux/.test(ua)) return 'Linux';
  return 'Unknown OS';
}

export interface UseEnvironmentReturn {
  info: EnvironmentInfo | null;
  isLoading: boolean;
}

export function useEnvironment(): UseEnvironmentReturn {
  const [info, setInfo] = useState<EnvironmentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const { name: browserName, version: browserVersion } = detectBrowser();

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      setInfo({
        url: tab?.url ?? '',
        pageTitle: tab?.title ?? '',
        browserName,
        browserVersion,
        os: detectOS(),
        screenResolution: `${window.screen.width} × ${window.screen.height}`,
        date: now.toLocaleDateString(undefined, {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        time: now.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      setIsLoading(false);
    });
  }, []);

  return { info, isLoading };
}
