import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { roseMotionAllowed } from './sparkLayer';

export const KPI_BLESS_ALL_EVENT = 'rose-kpi-bless-all';

const BLESS_CHANCE = 0.02;
const BLESS_DURATION_MS = 1200;

interface KpiBlessingProps {
  children: ReactNode;
  className?: string;
}

export default function KpiBlessing({ children, className }: KpiBlessingProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [blessed, setBlessed] = useState(false);
  const blessTimer = useRef<ReturnType<typeof setTimeout>>();

  const startBlessing = useCallback(() => {
    setBlessed(true);
    clearTimeout(blessTimer.current);
    blessTimer.current = setTimeout(() => setBlessed(false), BLESS_DURATION_MS);
  }, []);

  function handleClick() {
    if (theme !== 'rose' || blessed) return;
    if (Math.random() < BLESS_CHANCE) startBlessing();
  }

  useEffect(() => {
    if (theme !== 'rose') return;
    window.addEventListener(KPI_BLESS_ALL_EVENT, startBlessing);
    return () => window.removeEventListener(KPI_BLESS_ALL_EVENT, startBlessing);
  }, [theme, startBlessing]);

  useEffect(() => () => clearTimeout(blessTimer.current), []);

  const motionAllowed = roseMotionAllowed();

  return (
    <div className="relative" onClick={handleClick}>
      <div className={clsx(className, theme === 'rose' && 'cursor-pointer', blessed && 'kpi-blessed-glow')}>
        {children}
      </div>
      <AnimatePresence>
        {blessed && (
          <motion.div
            initial={motionAllowed ? { opacity: 0, y: 0, scale: 0.8 } : { opacity: 0 }}
            animate={motionAllowed ? { opacity: 1, y: -28, scale: 1 } : { opacity: 1 }}
            exit={motionAllowed ? { opacity: 0, y: -44 } : { opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute left-1/2 -translate-x-1/2 -top-2 whitespace-nowrap text-xs font-medium text-[#C9A84C] pointer-events-none z-30"
          >
            {t('rose.kpiBlessing')}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
