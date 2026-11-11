import { Toaster } from 'react-hot-toast';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemedToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: theme === 'rose'
          ? { background: '#fff5f4', color: '#2d1a1a', border: '1px solid rgba(115, 25, 27, 0.2)' }
          : theme === 'light'
          ? { background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0' }
          : { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
      }}
    />
  );
}
