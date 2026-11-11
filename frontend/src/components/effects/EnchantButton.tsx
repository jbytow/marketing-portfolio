import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { TINY_FAIRY_PEEK_TRIGGER_EVENT } from './TinyFairyPeek';

const LEVITATE_DURATION_MS = 1000;

export default function EnchantButton() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const levitateTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(
    () => () => {
      clearTimeout(levitateTimer.current);
      document.body.classList.remove('page-levitate');
    },
    []
  );

  if (theme !== 'rose') return null;

  function handleClick() {
    if (document.body.classList.contains('page-levitate')) return;
    document.body.classList.add('page-levitate');
    levitateTimer.current = setTimeout(() => document.body.classList.remove('page-levitate'), LEVITATE_DURATION_MS);
    window.dispatchEvent(new Event(TINY_FAIRY_PEEK_TRIGGER_EVENT));
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-5 left-5 z-40 px-3 py-2 rounded-full text-sm font-medium shadow-lg select-none enchant-button"
    >
      <span aria-hidden="true">✨ </span>
      {t('rose.enchantButton')}
    </button>
  );
}
