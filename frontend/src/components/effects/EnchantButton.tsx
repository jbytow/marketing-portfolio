import { useTheme } from '@/contexts/ThemeContext';

const LEVITATE_DURATION_MS = 1000;

export default function EnchantButton() {
  const { theme } = useTheme();

  if (theme !== 'rose') return null;

  function handleClick() {
    document.body.classList.add('page-levitate');
    setTimeout(() => document.body.classList.remove('page-levitate'), LEVITATE_DURATION_MS);
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-5 left-5 z-40 px-3 py-2 rounded-full text-sm font-medium shadow-lg select-none enchant-button"
      aria-label="Enchant"
      title="✨ Enchant"
    >
      ✨ Enchant
    </button>
  );
}
