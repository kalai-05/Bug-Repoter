import type { GoogleUser } from '../../types/auth.types';

interface HeaderProps {
  onSettingsClick?: () => void;
  onHistoryClick?: () => void;
  showingHistory?: boolean;
  user?: GoogleUser | null;
}

export function Header({ onSettingsClick, onHistoryClick, showingHistory, user }: HeaderProps) {
  return (
    <header className="popup-header shadow-md">
      {/* Brand icon */}
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 shrink-0">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white leading-tight tracking-wide">
          Bug Reporter
        </p>
        <p className="text-2xs text-white/60 font-medium tracking-wide">ClickUp Integration</p>
      </div>

      {/* User avatar — visible only when signed into Google */}
      {user && (
        <div
          className="relative w-7 h-7 rounded-full overflow-hidden ring-2 ring-white/40 shrink-0 bg-white/20"
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
          {/* Initials fallback rendered behind the image */}
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
          className={['icon-btn', showingHistory ? 'bg-white/25' : ''].join(' ').trim()}
          aria-label={showingHistory ? 'Back to report form' : 'View history'}
          title={showingHistory ? 'Back to form' : 'Previous tickets'}
        >
          {showingHistory ? (
            /* Back arrow when history is open */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          ) : (
            /* Clock icon */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      )}
    </header>
  );
}
