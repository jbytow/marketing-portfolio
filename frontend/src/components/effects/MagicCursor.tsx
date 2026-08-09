import { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { spawnSpark } from './sparkLayer';
import wandImg from '@/assets/effects/magic-cursor-wand.png';

const TRAIL_MIN_DISTANCE = 28; // px moved before another trailing spark is allowed
const TRAIL_MIN_INTERVAL_MS = 60;

export default function MagicCursor() {
  const { theme } = useTheme();
  const cursorRef = useRef<HTMLDivElement>(null);
  const frame = useRef<number>();
  const pos = useRef({ x: -100, y: -100 });
  const lastSparkPos = useRef({ x: -1000, y: -1000 });
  const lastSparkTime = useRef(0);

  useEffect(() => {
    if (theme !== 'rose') return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    document.documentElement.classList.add('magic-cursor-active');

    function handleMove(e: MouseEvent) {
      pos.current = { x: e.clientX, y: e.clientY };
      if (frame.current == null) {
        frame.current = requestAnimationFrame(() => {
          if (cursorRef.current) {
            cursorRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
          }
          frame.current = undefined;
        });
      }

      const now = performance.now();
      const dist = Math.hypot(e.clientX - lastSparkPos.current.x, e.clientY - lastSparkPos.current.y);
      if (dist > TRAIL_MIN_DISTANCE && now - lastSparkTime.current > TRAIL_MIN_INTERVAL_MS) {
        lastSparkPos.current = { x: e.clientX, y: e.clientY };
        lastSparkTime.current = now;
        spawnSpark(e.clientX, e.clientY, {
          dx: (Math.random() - 0.5) * 20,
          dy: 10 + Math.random() * 16,
          fontSize: 0.55 + Math.random() * 0.25,
          duration: 0.5,
        });
      }
    }

    window.addEventListener('mousemove', handleMove);
    return () => {
      document.documentElement.classList.remove('magic-cursor-active');
      window.removeEventListener('mousemove', handleMove);
      if (frame.current != null) cancelAnimationFrame(frame.current);
    };
  }, [theme]);

  if (theme !== 'rose') return null;

  return (
    <div ref={cursorRef} className="magic-cursor" aria-hidden="true">
      <img src={wandImg} alt="" />
    </div>
  );
}
