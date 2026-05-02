'use client';

import { useTheme } from '@/components/ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 rounded-none border border-mist-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 hover:border-mist-300 dark:border-ink-700 dark:bg-ink-800 dark:text-mist-100"
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? (
        <span className="flex items-center gap-2">
          <SunIcon /> Light
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <MoonIcon /> Dark
        </span>
      )}
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4.5V2m0 20v-2.5M4.5 12H2m20 0h-2.5M6.4 6.4l-1.8-1.8m16.8 16.8-1.8-1.8M6.4 17.6l-1.8 1.8m16.8-16.8-1.8 1.8M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
