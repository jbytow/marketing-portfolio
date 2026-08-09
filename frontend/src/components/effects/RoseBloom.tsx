import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const BLOOM_DURATION_MS = 900;

export default function RoseBloom() {
  const { theme } = useTheme();
  const prevTheme = useRef(theme);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (theme === 'rose' && prevTheme.current !== 'rose') {
      setShow(true);
      const timeout = setTimeout(() => setShow(false), BLOOM_DURATION_MS);
      prevTheme.current = theme;
      return () => clearTimeout(timeout);
    }
    prevTheme.current = theme;
  }, [theme]);

  if (!show) return null;

  return <div className="rose-bloom-overlay" aria-hidden="true" />;
}
