import type { GoogleUser } from '../../types/auth.types';
import type { Platform } from '../../types/chrome.types';

interface HeaderProps {
  onSettingsClick?: () => void;
  onHistoryClick?: () => void;
  showingHistory?: boolean;
  user?: GoogleUser | null;
  platform?: Platform;
}

const PLATFORM_LABEL: Record<Platform, string> = {
  clickup: 'ClickUp',
  jira: 'Jira',
  linear: 'Linear',
};

function BrandLogo() {
  return (
    <div
      className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 shadow-md overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #5B40F5 0%, #9E28D4 100%)' }}
    >
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        {/* Antennae */}
        <path d="M 11 9.5 C 10 7.5 9 5.5 8 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="7.8" cy="3.2" r="1.2" fill="white"/>
        <path d="M 17 9.5 C 18 7.5 19 5.5 20 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="20.2" cy="3.2" r="1.2" fill="white"/>
        {/* Head dome */}
        <ellipse cx="14" cy="10.8" rx="5" ry="4" fill="white"/>
        {/* Camera body */}
        <rect x="5.5" y="13.5" width="17" height="11" rx="3.8" fill="white"/>
        {/* Viewfinder bump */}
        <rect x="18" y="12.8" width="3.2" height="1.6" rx="0.8" fill="white"/>
        {/* Lens ring */}
        <circle cx="14" cy="19" r="5.2" fill="white"/>
        {/* Lens glass */}
        <circle cx="14" cy="19" r="4.2" fill="#2D0E8C"/>
        <circle cx="12.3" cy="17.4" r="1.1" fill="white" opacity="0.45"/>
        {/* Legs */}
        <path d="M 5.8 15.5 C 3.8 14.8 2.2 14.2 0.5 13.6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M 5.6 19.5 C 3.6 19.6 2 19.7 0.2 19.8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M 22.2 15.5 C 24.2 14.8 25.8 14.2 27.5 13.6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M 22.4 19.5 C 24.4 19.6 26 19.7 27.8 19.8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      {/* Red recording dot */}
      <div
        className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-[1.5px] border-white"
        style={{ background: '#EF2020' }}
      />
    </div>
  );
}

export function Header({ onSettingsClick, onHistoryClick, showingHistory, user, platform }: HeaderProps) {
  return (
    <header className="popup-header shadow-lg">
      <BrandLogo />

      {/* Title */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white leading-tight tracking-wide">
          Bug Reporter
        </p>
        <p className="text-2xs font-medium tracking-wide flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {platform ? (
            <>
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.5)' }}
              />
              {PLATFORM_LABEL[platform]}
            </>
          ) : (
            'Bug Tracking'
          )}
        </p>
      </div>

      {/* User avatar */}
      {user && (
        <div
          className="relative w-7 h-7 rounded-full overflow-hidden ring-2 shrink-0 bg-white/20"
          style={{ boxShadow: '0 0 0 2px rgba(255,255,255,0.3)' }}
          title={`${user.name}\n${user.email}`}
        >
          {user.picture && (
            <img
              src={user.picture}
              alt={user.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          )}
          <span
            className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white -z-10 select-none"
            aria-hidden="true"
          >
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* History button */}
      {onHistoryClick && (
        <button
          type="button"
          onClick={onHistoryClick}
          className={['icon-btn', showingHistory ? 'bg-white/20' : ''].join(' ').trim()}
          aria-label={showingHistory ? 'Back to report form' : 'View history'}
          title={showingHistory ? 'Back to form' : 'Previous tickets'}
        >
          {showingHistory ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          )}
        </button>
      )}

      {/* Settings button */}
      {onSettingsClick && (
        <button
          type="button"
          onClick={onSettingsClick}
          className="icon-btn"
          aria-label="Open settings"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      )}
    </header>
  );
}
