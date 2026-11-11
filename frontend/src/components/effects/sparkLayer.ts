import { useEffect } from 'react';

let layer: HTMLDivElement | null = null;

function getSparkLayer() {
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'cursor-spark-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
  }
  return layer;
}

interface SparkOptions {
  emoji?: string;
  dx: number;
  dy: number;
  fontSize?: number;
  duration?: number;
}

// Evaluated per call: RoseForceMotion toggles .rose-force-motion asynchronously after the settings load.
export function roseMotionAllowed() {
  return (
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('rose-force-motion')
  );
}

export function spawnSpark(x: number, y: number, opts: SparkOptions) {
  if (!roseMotionAllowed()) return;
  const el = document.createElement('span');
  el.className = 'cursor-spark';
  el.textContent = opts.emoji ?? '✨';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.setProperty('--spark-dx', `${opts.dx}px`);
  el.style.setProperty('--spark-dy', `${opts.dy}px`);
  if (opts.fontSize) el.style.fontSize = `${opts.fontSize}rem`;
  if (opts.duration) el.style.animationDuration = `${opts.duration}s`;
  getSparkLayer().appendChild(el);
  el.addEventListener('animationend', () => el.remove());
  // Safety net: animationend never fires when the layer is hidden or the tab is throttled
  setTimeout(() => el.remove(), (opts.duration ?? 0.6) * 1000 + 200);
}

const TRAIL_INTERVAL_MS = 110;

interface SparkTrailOptions {
  spread: number; // horizontal drift is +/- spread / 2 px
  rise: { min: number; range: number }; // downward drift in px
  size: { min: number; range: number }; // font size in rem
  duration: number;
}

// Emits sparks from the centre of a moving fairy element while `active`.
export function useSparkTrail(
  elRef: { current: HTMLElement | null },
  active: boolean,
  { spread, rise, size, duration }: SparkTrailOptions
) {
  useEffect(() => {
    if (!active) return;

    let lastSparkTime = 0;
    let frame = 0;

    function tick() {
      const el = elRef.current;
      const now = performance.now();
      if (el && now - lastSparkTime > TRAIL_INTERVAL_MS && roseMotionAllowed()) {
        lastSparkTime = now;
        const rect = el.getBoundingClientRect();
        spawnSpark(rect.left + rect.width / 2, rect.top + rect.height / 2, {
          dx: (Math.random() - 0.5) * spread,
          dy: rise.min + Math.random() * rise.range,
          fontSize: size.min + Math.random() * size.range,
          duration,
        });
      }
      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [elRef, active, spread, rise, size, duration]);
}
