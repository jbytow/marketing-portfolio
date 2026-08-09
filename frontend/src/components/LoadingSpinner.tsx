import { clsx } from 'clsx';
import { Flower2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export default function LoadingSpinner({ size = 'md', fullScreen = false }: LoadingSpinnerProps) {
  const { theme } = useTheme();

  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const iconSizes = { sm: 20, md: 32, lg: 48 };

  const spinner =
    theme === 'rose' ? (
      <Flower2
        size={iconSizes[size]}
        className="animate-spin"
        style={{ color: '#73191B', filter: 'drop-shadow(0 0 6px rgba(201, 168, 76, 0.6))' }}
      />
    ) : (
      <div
        className={clsx(
          'animate-spin rounded-full border-primary-500 border-t-transparent',
          sizeClasses[size]
        )}
      />
    );

  if (fullScreen) {
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
