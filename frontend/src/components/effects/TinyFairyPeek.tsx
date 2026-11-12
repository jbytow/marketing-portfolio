import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import FxPortal from './FxPortal';
import { useSparkTrail } from './sparkLayer';
import fairySprite from '@/assets/effects/fairy-facing-left.webp';

export const TINY_FAIRY_PEEK_TRIGGER_EVENT = 'rose-tiny-fairy-peek-trigger';

const MIN_INTERVAL_MS = 30 * 1000;
const MAX_INTERVAL_MS = 120 * 1000;
const PEEK_DURATION_MS = 2200;
const SPARK_TRAIL = {
  spread: 26,
  rise: { min: 12, range: 16 },
  size: { min: 0.55, range: 0.25 },
  duration: 0.55,
};

function randomInterval() {
  return MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS);
}

const EDGES = ['left', 'right'] as const;

// Peeking in from the left edge means moving rightward into the screen (facing right), and vice versa.
// The sprite faces left; the img is mirrored (not the wrapper, whose transform is animated).
const MIRROR_FOR_EDGE = { left: true, right: false } as const;

export default function TinyFairyPeek() {
  const { theme } = useTheme();
  const [peek, setPeek] = useState<{ id: number; edge: (typeof EDGES)[number]; top: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const counter = useRef(0);
  const fairyElRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (theme !== 'rose') return;

    function triggerPeek() {
      const edge = EDGES[Math.floor(Math.random() * EDGES.length)];
      const top = 20 + Math.random() * 55;
      const id = ++counter.current;
      setPeek({ id, edge, top });
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setPeek(null), PEEK_DURATION_MS);
    }

    function schedule() {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        triggerPeek();
        schedule();
      }, randomInterval());
    }

    schedule();
    window.addEventListener(TINY_FAIRY_PEEK_TRIGGER_EVENT, triggerPeek);
    return () => {
      clearTimeout(timer.current);
      clearTimeout(hideTimer.current);
      setPeek(null);
      window.removeEventListener(TINY_FAIRY_PEEK_TRIGGER_EVENT, triggerPeek);
    };
  }, [theme]);

  useSparkTrail(fairyElRef, peek != null, SPARK_TRAIL);

  if (!peek) return null;

  return (
    <FxPortal>
      <div
        key={peek.id}
        ref={fairyElRef}
        className={`tiny-fairy-peek tiny-fairy-peek-${peek.edge}`}
        style={{ top: `${peek.top}vh` }}
        aria-hidden="true"
      >
        <img src={fairySprite} alt="" className={MIRROR_FOR_EDGE[peek.edge] ? '-scale-x-100' : undefined} />
      </div>
    </FxPortal>
  );
}
