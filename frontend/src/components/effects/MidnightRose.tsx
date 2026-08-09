import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export const MIDNIGHT_ROSE_TEST_EVENT = 'rose-midnight-test';

const CHECK_INTERVAL_MS = 60000;
const BANNER_DURATION_MS = 5000;
const TEST_OVERRIDE_MS = 20000;

function isLateNight(date = new Date()) {
  const h = date.getHours();
  return h >= 22 || h < 5;
}

export default function MidnightRose() {
  const { theme } = useTheme();
  const [midnight, setMidnight] = useState(() => isLateNight());
  const [testOverride, setTestOverride] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setMidnight(isLateNight()), CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleTest() {
      setTestOverride(true);
      setTimeout(() => setTestOverride(false), TEST_OVERRIDE_MS);
    }
    window.addEventListener(MIDNIGHT_ROSE_TEST_EVENT, handleTest);
    return () => window.removeEventListener(MIDNIGHT_ROSE_TEST_EVENT, handleTest);
  }, []);

  const active = theme === 'rose' && (midnight || testOverride);

  useEffect(() => {
    document.documentElement.classList.toggle('rose-midnight', active);
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
      <div className="rose-midnight-overlay" aria-hidden="true">
        <span className="rose-midnight-moon rose-midnight-moon-1">🌙</span>
        <span className="rose-midnight-moon rose-midnight-moon-2">🌙</span>
      </div>
      {showBanner && <div className="rose-midnight-banner">🌙 Late night marketing magic detected</div>}
    </>
  );
}
