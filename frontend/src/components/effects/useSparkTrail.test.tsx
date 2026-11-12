import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSparkTrail } from './sparkLayer';

const OPTIONS = { spread: 30, rise: { min: 14, range: 18 }, size: { min: 0.6, range: 0.3 }, duration: 0.6 };

let frames: FrameRequestCallback[] = [];
let now = 0;

function runFrame(atMs: number) {
  now = atMs;
  const queued = frames;
  frames = [];
  queued.forEach((cb) => cb(atMs));
}

function setReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduce : false,
  })) as unknown as typeof window.matchMedia;
}

function fairyElement() {
  const el = document.createElement('div');
  el.getBoundingClientRect = vi.fn(() => ({ left: 100, top: 200, width: 40, height: 20 }) as DOMRect);
  return el;
}

const sparks = () => Array.from(document.querySelectorAll<HTMLElement>('.cursor-spark'));

describe('useSparkTrail', () => {
  beforeEach(() => {
    frames = [];
    now = 0;
    document.documentElement.classList.remove('rose-force-motion');
    document.querySelectorAll('.cursor-spark').forEach((n) => n.remove());
    setReducedMotion(false);
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb));
    vi.stubGlobal('cancelAnimationFrame', () => {
      frames = [];
    });
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('emits a spark from the element centre with the configured spread, rise, size and duration', () => {
    const el = fairyElement();
    renderHook(() => useSparkTrail({ current: el }, true, OPTIONS));
    runFrame(200);
    const [spark] = sparks();
    expect(sparks()).toHaveLength(1);
    expect(spark.style.left).toBe('120px');
    expect(spark.style.top).toBe('210px');
    expect(spark.style.getPropertyValue('--spark-dx')).toBe('0px');
    expect(spark.style.getPropertyValue('--spark-dy')).toBe('23px');
    expect(spark.style.fontSize).toBe('0.75rem');
    expect(spark.style.animationDuration).toBe('0.6s');
  });

  it('throttles to one spark per 110 ms', () => {
    renderHook(() => useSparkTrail({ current: fairyElement() }, true, OPTIONS));
    runFrame(200);
    runFrame(260);
    runFrame(300);
    expect(sparks()).toHaveLength(1);
    runFrame(320);
    expect(sparks()).toHaveLength(2);
  });

  it('does nothing while inactive and stops on cleanup', () => {
    const { rerender, unmount } = renderHook(({ active }) => useSparkTrail({ current: fairyElement() }, active, OPTIONS), {
      initialProps: { active: false },
    });
    expect(frames).toHaveLength(0);
    rerender({ active: true });
    expect(frames).toHaveLength(1);
    unmount();
    expect(frames).toHaveLength(0);
  });

  it('skips layout reads and sparks under reduced motion', () => {
    setReducedMotion(true);
    const el = fairyElement();
    renderHook(() => useSparkTrail({ current: el }, true, OPTIONS));
    runFrame(200);
    expect(el.getBoundingClientRect).not.toHaveBeenCalled();
    expect(sparks()).toHaveLength(0);
  });
});
