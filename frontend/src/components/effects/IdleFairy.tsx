import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import FxPortal from './FxPortal';
import { spawnSpark } from './sparkLayer';
import fairyFacingLeft from '@/assets/effects/fairy-facing-left.png';
import fairyFacingRight from '@/assets/effects/fairy-facing-right.png';

export const IDLE_FAIRY_TEST_EVENT = 'rose-idle-fairy-test';

const IDLE_THRESHOLD_MS = 30000;
const REPEAT_IDLE_MS = 45000;
const FLIGHT_DURATION_MS = 5000;
const SPARK_INTERVAL_MS = 110;
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
  const sparkleFrame = useRef<number>();

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

    function handleTest() {
      startFlight();
    }

    scheduleIdle(IDLE_THRESHOLD_MS);
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));
    window.addEventListener(IDLE_FAIRY_TEST_EVENT, handleTest);

    return () => {
      clearTimeout(idleTimer.current);
      clearTimeout(removeTimer.current);
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, handleActivity));
      window.removeEventListener(IDLE_FAIRY_TEST_EVENT, handleTest);
    };
  }, [theme]);

  useEffect(() => {
    if (!flight) return;

    let lastSparkTime = 0;

    function tick() {
      const el = fairyElRef.current;
      const now = performance.now();
      if (el && now - lastSparkTime > SPARK_INTERVAL_MS) {
        lastSparkTime = now;
        const rect = el.getBoundingClientRect();
        spawnSpark(rect.left + rect.width / 2, rect.top + rect.height / 2, {
          dx: (Math.random() - 0.5) * 30,
          dy: 14 + Math.random() * 18,
          fontSize: 0.6 + Math.random() * 0.3,
          duration: 0.6,
        });
      }
      sparkleFrame.current = requestAnimationFrame(tick);
    }

    sparkleFrame.current = requestAnimationFrame(tick);
    return () => {
      if (sparkleFrame.current != null) cancelAnimationFrame(sparkleFrame.current);
    };
  }, [flight]);

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
        <img src={flight.facing === 'left' ? fairyFacingLeft : fairyFacingRight} alt="" />
      </div>
    </FxPortal>
  );
}
