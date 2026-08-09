import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import FxPortal from './FxPortal';
import { spawnSpark } from './sparkLayer';
import fairyFacingLeft from '@/assets/effects/fairy-facing-left.png';
import fairyFacingRight from '@/assets/effects/fairy-facing-right.png';

export const TINY_FAIRY_PEEK_TRIGGER_EVENT = 'rose-tiny-fairy-peek-trigger';

const MIN_INTERVAL_MS = 30 * 1000;
const MAX_INTERVAL_MS = 120 * 1000;
const PEEK_DURATION_MS = 2200;
const SPARK_INTERVAL_MS = 110;

function randomInterval() {
  return MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS);
}

const EDGES = ['left', 'right'] as const;

// Peeking in from the left edge means moving rightward into the screen (facing right), and vice versa.
const FACING_FOR_EDGE = { left: fairyFacingRight, right: fairyFacingLeft } as const;

export default function TinyFairyPeek() {
  const { theme } = useTheme();
  const [peek, setPeek] = useState<{ id: number; edge: (typeof EDGES)[number]; top: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const counter = useRef(0);
  const fairyElRef = useRef<HTMLDivElement | null>(null);
  const sparkleFrame = useRef<number>();

  useEffect(() => {
    if (theme !== 'rose') return;

    function triggerPeek() {
      const edge = EDGES[Math.floor(Math.random() * EDGES.length)];
      const top = 20 + Math.random() * 55;
      const id = ++counter.current;
      setPeek({ id, edge, top });
      setTimeout(() => setPeek(null), PEEK_DURATION_MS);
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
      window.removeEventListener(TINY_FAIRY_PEEK_TRIGGER_EVENT, triggerPeek);
    };
  }, [theme]);

  useEffect(() => {
    if (!peek) return;

    let lastSparkTime = 0;

    function tick() {
      const el = fairyElRef.current;
      const now = performance.now();
      if (el && now - lastSparkTime > SPARK_INTERVAL_MS) {
        lastSparkTime = now;
        const rect = el.getBoundingClientRect();
        spawnSpark(rect.left + rect.width / 2, rect.top + rect.height / 2, {
          dx: (Math.random() - 0.5) * 26,
          dy: 12 + Math.random() * 16,
          fontSize: 0.55 + Math.random() * 0.25,
          duration: 0.55,
        });
      }
      sparkleFrame.current = requestAnimationFrame(tick);
    }

    sparkleFrame.current = requestAnimationFrame(tick);
    return () => {
      if (sparkleFrame.current != null) cancelAnimationFrame(sparkleFrame.current);
    };
  }, [peek]);

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
        <img src={FACING_FOR_EDGE[peek.edge]} alt="" />
      </div>
    </FxPortal>
  );
}
