import { useEffect, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useTheme } from '@/contexts/ThemeContext';

export const KPI_BLESS_ALL_EVENT = 'rose-kpi-bless-all';

const BLESS_CHANCE = 0.02;
const BLESS_DURATION_MS = 1200;

interface KpiBlessingProps {
  children: ReactNode;
  className?: string;
}

export default function KpiBlessing({ children, className }: KpiBlessingProps) {
  const { theme } = useTheme();
  const [blessed, setBlessed] = useState(false);

  function handleClick() {
    if (theme !== 'rose' || blessed) return;
    if (Math.random() < BLESS_CHANCE) {
      setBlessed(true);
      setTimeout(() => setBlessed(false), BLESS_DURATION_MS);
    }
  }

  useEffect(() => {
    if (theme !== 'rose') return;
    function handleBlessAll() {
      setBlessed(true);
      setTimeout(() => setBlessed(false), BLESS_DURATION_MS);
    }
    window.addEventListener(KPI_BLESS_ALL_EVENT, handleBlessAll);
    return () => window.removeEventListener(KPI_BLESS_ALL_EVENT, handleBlessAll);
  }, [theme]);

  return (
    <div className="relative" onClick={handleClick}>
      <div className={clsx(className, theme === 'rose' && 'cursor-pointer', blessed && 'kpi-blessed-glow')}>
        {children}
      </div>
      <AnimatePresence>
        {blessed && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -28, scale: 1 }}
            exit={{ opacity: 0, y: -44 }}
            transition={{ duration: 0.5 }}
            className="absolute left-1/2 -translate-x-1/2 -top-2 whitespace-nowrap text-xs font-medium text-[#C9A84C] pointer-events-none z-30"
          >
            ✨ The numbers have been blessed ✨
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
