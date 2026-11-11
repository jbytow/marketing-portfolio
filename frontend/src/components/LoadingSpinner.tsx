import { useEffect, useState } from 'react';
import { Flower2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

// Full-screen spinners wait this long so fast loads do not flash an overlay
const FULL_SCREEN_DELAY_MS = 200;

interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

export default function LoadingSpinner({ fullScreen = false }: LoadingSpinnerProps) {
  const { theme } = useTheme();
  const [delayElapsed, setDelayElapsed] = useState(!fullScreen);

  useEffect(() => {
    if (!fullScreen) return;
    const timer = setTimeout(() => setDelayElapsed(true), FULL_SCREEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [fullScreen]);

  const spinner =
    theme === 'rose' ? (
      <Flower2
        size={32}
        className="animate-spin"
        style={{ color: '#73191B', filter: 'drop-shadow(0 0 6px rgba(201, 168, 76, 0.6))' }}
      />
    ) : (
      <div
        className="animate-spin rounded-full w-8 h-8 border-[3px] border-primary-500 border-t-transparent"
      />
    );

  if (fullScreen) {
    if (!delayElapsed) return null;
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-dark-900 z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  );
}
