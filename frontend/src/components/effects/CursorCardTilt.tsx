import { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { roseMotionAllowed, spawnSpark } from './sparkLayer';

const SPEED_THRESHOLD = 0.9; // px/ms — only "fast" movement tilts the card
const MAX_TILT_DEG = 7;
const RESET_DELAY_MS = 400;
const SPARK_MIN_INTERVAL_MS = 60; // same throttle as MagicCursor

function spawnSparkBounce(x: number, y: number, awayFromCenter: number) {
  for (let i = 0; i < 2; i++) {
    const dx = (awayFromCenter > 0 ? -1 : 1) * (20 + Math.random() * 30) * (i === 0 ? 1 : -1);
    const dy = -20 - Math.random() * 20;
    spawnSpark(x, y, { dx, dy });
  }
}

export default function CursorCardTilt() {
  const { theme } = useTheme();
  const lastPoint = useRef<{ x: number; y: number; t: number } | null>(null);
  const activeEl = useRef<HTMLElement | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>();
  const lastSparkTime = useRef(-Infinity);

  useEffect(() => {
    if (theme !== 'rose') return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const tilted = new WeakSet<HTMLElement>();

    // Only tilted cards carry inline styles; the inline transition would otherwise override
    // the card's own transition-all and freeze its hover transitions, so it is cleared once settled.
    function releaseTilt(el: HTMLElement) {
      if (!tilted.delete(el)) return;
      el.style.transition = 'transform 0.4s ease';
      el.style.transform = '';
      setTimeout(() => {
        if (!tilted.has(el)) el.style.transition = '';
      }, RESET_DELAY_MS);
    }

    function resetActive() {
      if (activeEl.current) {
        releaseTilt(activeEl.current);
        activeEl.current = null;
      }
    }

    function handleMove(e: MouseEvent) {
      if (!roseMotionAllowed()) {
        clearTimeout(resetTimer.current);
        resetActive();
        return;
      }

      const now = performance.now();
      const prev = lastPoint.current;
      lastPoint.current = { x: e.clientX, y: e.clientY, t: now };

      const card = (e.target as HTMLElement | null)?.closest<HTMLElement>('.card, .card-hover');

      if (!card) {
        if (activeEl.current) {
          clearTimeout(resetTimer.current);
          resetTimer.current = setTimeout(resetActive, RESET_DELAY_MS);
        }
        return;
      }

      if (activeEl.current && activeEl.current !== card) {
        releaseTilt(activeEl.current);
      }
      activeEl.current = card;
      clearTimeout(resetTimer.current);

      if (!prev) return;
      const dt = now - prev.t;
      if (dt <= 0) return;
      const dist = Math.hypot(e.clientX - prev.x, e.clientY - prev.y);
      const speed = dist / dt;
      if (speed < SPEED_THRESHOLD) return;

      const rect = card.getBoundingClientRect();
      const offsetX = (e.clientX - rect.left) / rect.width - 0.5;
      const offsetY = (e.clientY - rect.top) / rect.height - 0.5;
      const rotateY = offsetX * MAX_TILT_DEG * 2;
      const rotateX = -offsetY * MAX_TILT_DEG * 2;

      tilted.add(card);
      card.style.transition = 'transform 0.15s ease-out';
      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

      if (now - lastSparkTime.current >= SPARK_MIN_INTERVAL_MS) {
        lastSparkTime.current = now;
        spawnSparkBounce(e.clientX, e.clientY, offsetX);
      }

      resetTimer.current = setTimeout(resetActive, RESET_DELAY_MS);
    }

    document.addEventListener('mousemove', handleMove);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      clearTimeout(resetTimer.current);
      resetActive();
    };
  }, [theme]);

  return null;
}
