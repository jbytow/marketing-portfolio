import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const TRACK_WINDOW_MS = 1200;
const MIN_ANGLE = Math.PI * 2 * 0.85; // ~306°, close to a full loop
const MIN_SIZE = 50; // minimum bounding box (px) so tiny jitter doesn't trigger it
const MIN_POINTS = 8;
const COOLDOWN_MS = 3000;
const EFFECT_DURATION_MS = 1600;
const SPARK_COUNT = 8;

interface Point {
  x: number;
  y: number;
  t: number;
}

export default function CursorSpell() {
  const { theme } = useTheme();
  const points = useRef<Point[]>([]);
  const cooldownUntil = useRef(0);
  const [effect, setEffect] = useState<{ id: number; x: number; y: number } | null>(null);
  const counter = useRef(0);

  useEffect(() => {
    if (theme !== 'rose') return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    function handleMove(e: MouseEvent) {
      const now = performance.now();
      points.current.push({ x: e.clientX, y: e.clientY, t: now });
      points.current = points.current.filter((p) => now - p.t < TRACK_WINDOW_MS);

      if (now < cooldownUntil.current) return;
      if (points.current.length < MIN_POINTS) return;

      const xs = points.current.map((p) => p.x);
      const ys = points.current.map((p) => p.y);
      const width = Math.max(...xs) - Math.min(...xs);
      const height = Math.max(...ys) - Math.min(...ys);
      if (width < MIN_SIZE || height < MIN_SIZE) return;

      const cx = xs.reduce((a, b) => a + b, 0) / xs.length;
      const cy = ys.reduce((a, b) => a + b, 0) / ys.length;

      let totalAngle = 0;
      for (let i = 1; i < points.current.length; i++) {
        const a1 = Math.atan2(points.current[i - 1].y - cy, points.current[i - 1].x - cx);
        const a2 = Math.atan2(points.current[i].y - cy, points.current[i].x - cx);
        let delta = a2 - a1;
        while (delta > Math.PI) delta -= Math.PI * 2;
        while (delta < -Math.PI) delta += Math.PI * 2;
        totalAngle += delta;
      }

      if (Math.abs(totalAngle) >= MIN_ANGLE) {
        cooldownUntil.current = now + COOLDOWN_MS;
        points.current = [];
        const id = ++counter.current;
        setEffect({ id, x: e.clientX, y: e.clientY });
        setTimeout(() => setEffect(null), EFFECT_DURATION_MS);
      }
    }

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [theme]);

  if (!effect) return null;

  return (
    <>
      <div className="cursor-spell-page-glow" aria-hidden="true" />
      <div className="cursor-spell-fx" style={{ left: effect.x, top: effect.y }} aria-hidden="true">
        <span className="cursor-spell-glow" />
        {Array.from({ length: SPARK_COUNT }).map((_, i) => (
          <span
            key={i}
            className="cursor-spell-spark"
            style={{ '--spell-angle': `${(360 / SPARK_COUNT) * i}deg` } as CSSProperties}
          >
            ✨
          </span>
        ))}
        <span className="cursor-spell-text">✨ Campaignus Maximus ✨</span>
      </div>
    </>
  );
}
