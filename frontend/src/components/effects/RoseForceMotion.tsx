import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { queryKeys } from '@/lib/queryKeys';

// Toggles a class the reduced-motion CSS block checks for, so an admin can
// force the decorative Rose effects to show even when the visitor's
// browser/OS requests prefers-reduced-motion.
export default function RoseForceMotion() {
  const { language } = useLanguage();
  const { data } = useQuery({
    queryKey: queryKeys.settings(language),
    queryFn: () => settingsApi.get(),
  });

  const forceMotion = data?.data?.roseForceMotion ?? false;

  useEffect(() => {
    document.documentElement.classList.toggle('rose-force-motion', forceMotion);
    return () => {
      document.documentElement.classList.remove('rose-force-motion');
    };
  }, [forceMotion]);

  return null;
}
