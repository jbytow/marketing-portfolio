import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
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

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <motion.main
        className="flex-grow pt-16 md:pt-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Outlet />
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
    </div>
  );
}
