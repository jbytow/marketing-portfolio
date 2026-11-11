import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <motion.main
        className="flex-grow pt-16 md:pt-20"
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
  );
}
