import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';

const CHECK_INTERVAL_MS = 60000;
const BANNER_DURATION_MS = 5000;

function isLateNight(date = new Date()) {
  const h = date.getHours();
  return h >= 22 || h < 5;
}

export default function MidnightRose() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [midnight, setMidnight] = useState(() => isLateNight());
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setMidnight(isLateNight()), CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const active = theme === 'rose' && midnight;

  useEffect(() => {
    if (active) {
      setShowBanner(true);
      const timeout = setTimeout(() => setShowBanner(false), BANNER_DURATION_MS);
      return () => clearTimeout(timeout);
    }
    setShowBanner(false);
  }, [active]);

  if (!active) return null;

  return (
    <>
      <span className="rose-midnight-moon" aria-hidden="true">🌙</span>
      {showBanner && <div className="rose-midnight-chip">{t('rose.midnightBanner')}</div>}
    </>
  );
}
