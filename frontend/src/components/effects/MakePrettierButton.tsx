import toast from 'react-hot-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { ROSE_EXPLOSION_EVENT } from './RoseExplosion';
import { KPI_BLESS_ALL_EVENT } from './KpiBlessing';

const EFFECT_DURATION_MS = 3000;

export default function MakePrettierButton() {
  const { theme } = useTheme();

  if (theme !== 'rose') return null;

  function handleClick() {
    document.documentElement.classList.add('prettier-mode');
    window.dispatchEvent(new Event(ROSE_EXPLOSION_EVENT));
    window.dispatchEvent(new Event(KPI_BLESS_ALL_EVENT));
    setTimeout(() => {
      document.documentElement.classList.remove('prettier-mode');
      toast('Much better.');
    }, EFFECT_DURATION_MS);
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-5 right-5 z-40 px-3 py-2 rounded-full text-sm font-medium shadow-lg select-none prettier-button"
      aria-label="Make it prettier"
      title="🌈 Make it prettier"
    >
      🌈 Make it prettier
    </button>
  );
}
