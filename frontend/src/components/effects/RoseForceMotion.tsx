import { useEffect } from 'react';
import { useSiteSettings } from '@/lib/useSiteSettings';

// Toggles a class the reduced-motion CSS block checks for, so an admin can
// force the decorative Rose effects to show even when the visitor's
// browser/OS requests prefers-reduced-motion.
export default function RoseForceMotion() {
  const { data } = useSiteSettings();

  const forceMotion = data?.data?.roseForceMotion ?? false;

  useEffect(() => {
    document.documentElement.classList.toggle('rose-force-motion', forceMotion);
    return () => {
      document.documentElement.classList.remove('rose-force-motion');
    };
  }, [forceMotion]);

  return null;
}
