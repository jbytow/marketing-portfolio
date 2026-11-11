import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { ROSE_EXPLOSION_EVENT } from './RoseExplosion';
import { KPI_BLESS_ALL_EVENT } from './KpiBlessing';

const EFFECT_DURATION_MS = 3000;

export default function MakePrettierButton() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const effectTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(
    () => () => {
      clearTimeout(effectTimer.current);
      document.documentElement.classList.remove('prettier-mode');
    },
    []
  );

  if (theme !== 'rose') return null;

  function handleClick() {
    if (document.documentElement.classList.contains('prettier-mode')) return;
    document.documentElement.classList.add('prettier-mode');
    window.dispatchEvent(new Event(ROSE_EXPLOSION_EVENT));
    window.dispatchEvent(new Event(KPI_BLESS_ALL_EVENT));
    effectTimer.current = setTimeout(() => {
      document.documentElement.classList.remove('prettier-mode');
      toast(t('rose.prettierToast'));
    }, EFFECT_DURATION_MS);
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-5 right-5 z-40 px-3 py-2 rounded-full text-sm font-medium shadow-lg select-none prettier-button"
    >
      <span aria-hidden="true">🌈 </span>
      {t('rose.prettierButton')}
    </button>
  );
}
