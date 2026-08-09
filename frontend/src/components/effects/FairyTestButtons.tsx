import { useTheme } from '@/contexts/ThemeContext';
import { TINY_FAIRY_TEST_EVENT } from './TinyFairyPeek';
import { IDLE_FAIRY_TEST_EVENT } from './IdleFairy';

export default function FairyTestButtons() {
  const { theme } = useTheme();

  if (theme !== 'rose') return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
      <button
        onClick={() => window.dispatchEvent(new Event(IDLE_FAIRY_TEST_EVENT))}
        className="px-3 py-2 rounded-full text-sm font-medium shadow-lg select-none enchant-button"
        aria-label="Test idle fairy flight"
        title="🧚 Test flight"
      >
        🧚 Test flight
      </button>
      <button
        onClick={() => window.dispatchEvent(new Event(TINY_FAIRY_TEST_EVENT))}
        className="px-3 py-2 rounded-full text-sm font-medium shadow-lg select-none enchant-button"
        aria-label="Test tiny fairy peek"
        title="🧚 Test peek"
      >
        🧚 Test peek
      </button>
    </div>
  );
}
