import { useTheme } from '@/contexts/ThemeContext';
import { MIDNIGHT_ROSE_TEST_EVENT } from './MidnightRose';

// TESTING ONLY — manual 20s preview of Midnight Rose. Remove once confirmed.
export default function MidnightRoseTestButton() {
  const { theme } = useTheme();

  if (theme !== 'rose') return null;

  return (
    <button
      onClick={() => window.dispatchEvent(new Event(MIDNIGHT_ROSE_TEST_EVENT))}
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 px-3 py-2 rounded-full text-sm font-medium shadow-lg select-none enchant-button"
      aria-label="Test Midnight Rose"
      title="🌙 Test Midnight Rose"
    >
      🌙 Test Midnight Rose
    </button>
  );
}
