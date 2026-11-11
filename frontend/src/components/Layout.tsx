import { Outlet, useLocation } from 'react-router-dom';
import { motion, MotionConfig } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import Footer from './Footer';
import ErrorBoundary from './ErrorBoundary';
import FairyDust from './effects/FairyDust';
import RoseBloom from './effects/RoseBloom';
import RoseExplosion from './effects/RoseExplosion';
import EnchantButton from './effects/EnchantButton';
import IdleFairy from './effects/IdleFairy';
import MagicCursor from './effects/MagicCursor';
import CursorSpell from './effects/CursorSpell';
import CursorCardTilt from './effects/CursorCardTilt';
import MidnightRose from './effects/MidnightRose';
import TinyFairyPeek from './effects/TinyFairyPeek';
import MakePrettierButton from './effects/MakePrettierButton';
import RoseForceMotion from './effects/RoseForceMotion';
import { useSiteSettings } from '@/lib/useSiteSettings';

export default function Layout() {
  const location = useLocation();
  const { t } = useTranslation();
  const { data: settings } = useSiteSettings();
  const forceMotion = settings?.data?.roseForceMotion ?? false;

  // 'user' honours prefers-reduced-motion; the admin's force-motion setting overrides it,
  // matching the CSS gate in index.css.
  return (
    <MotionConfig reducedMotion={forceMotion ? 'never' : 'user'}>
      <div className="min-h-screen flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] btn-primary"
        >
          {t('a11y.skipToContent')}
        </a>
        <Header />
        <motion.main
          id="main"
          tabIndex={-1}
          className="flex-grow pt-16 md:pt-20 focus:outline-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Keyed by path so a page crash keeps the header and footer and clears on navigation */}
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </motion.main>
        <Footer />
        <FairyDust />
        <RoseBloom />
        <RoseExplosion />
        <EnchantButton />
        <IdleFairy />
        <MagicCursor />
        <CursorSpell />
        <CursorCardTilt />
        <MidnightRose />
        <TinyFairyPeek />
        <MakePrettierButton />
        <RoseForceMotion />
      </div>
    </MotionConfig>
  );
}
