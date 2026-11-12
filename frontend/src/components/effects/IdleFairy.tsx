import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import FxPortal from './FxPortal';
import { useSparkTrail } from './sparkLayer';
import fairySprite from '@/assets/effects/fairy-facing-left.webp';

const IDLE_THRESHOLD_MS = 30000;
const REPEAT_IDLE_MS = 45000;
const FLIGHT_DURATION_MS = 5000;
const SPARK_TRAIL = {
  spread: 30,
  rise: { min: 14, range: 18 },
  size: { min: 0.6, range: 0.3 },
  duration: 0.6,
};
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];

interface Point {
  x: number;
  y: number;
}

const CORNERS: Record<string, Point> = {
  'top-left': { x: 4, y: 10 },
  'top-right': { x: 92, y: 10 },
  'bottom-left': { x: 4, y: 85 },
  'bottom-right': { x: 92, y: 85 },
};

const PATHS: [string, string][] = [
  ['top-left', 'bottom-right'],
  ['top-right', 'bottom-left'],
  ['bottom-left', 'top-right'],
  ['bottom-right', 'top-left'],
];

interface Flight {
  id: number;
  from: Point;
  mid: Point;
  to: Point;
  facing: 'left' | 'right';
}

export default function IdleFairy() {
  const { theme } = useTheme();
  const [flight, setFlight] = useState<Flight | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>();
  const removeTimer = useRef<ReturnType<typeof setTimeout>>();
  const counter = useRef(0);
  const fairyElRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (theme !== 'rose') {
      setFlight(null);
      return;
    }

    function startFlight() {
      const [fromKey, toKey] = PATHS[Math.floor(Math.random() * PATHS.length)];
      const from = CORNERS[fromKey];
      const to = CORNERS[toKey];
      const mid: Point = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - 8 };
      const facing: 'left' | 'right' = to.x >= from.x ? 'right' : 'left';
      const id = ++counter.current;
      setFlight({ id, from, mid, to, facing });
      clearTimeout(removeTimer.current);
      removeTimer.current = setTimeout(() => setFlight(null), FLIGHT_DURATION_MS);
    }

    function scheduleIdle(delay: number) {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        startFlight();
        scheduleIdle(REPEAT_IDLE_MS);
      }, delay);
    }

    function handleActivity() {
      scheduleIdle(IDLE_THRESHOLD_MS);
    }

    scheduleIdle(IDLE_THRESHOLD_MS);
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));

    return () => {
      clearTimeout(idleTimer.current);
      clearTimeout(removeTimer.current);
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, handleActivity));
    };
  }, [theme]);

  useSparkTrail(fairyElRef, flight != null, SPARK_TRAIL);

  if (!flight) return null;

  return (
    <FxPortal>
      <div
        key={flight.id}
        ref={fairyElRef}
        className="idle-fairy"
        style={
          {
            '--fairy-from-x': `${flight.from.x}vw`,
            '--fairy-from-y': `${flight.from.y}vh`,
            '--fairy-mid-x': `${flight.mid.x}vw`,
            '--fairy-mid-y': `${flight.mid.y}vh`,
            '--fairy-to-x': `${flight.to.x}vw`,
            '--fairy-to-y': `${flight.to.y}vh`,
          } as CSSProperties
        }
        aria-hidden="true"
      >
        <img src={fairySprite} alt="" className={flight.facing === 'right' ? '-scale-x-100' : undefined} />
      </div>
    </FxPortal>
  );
}
