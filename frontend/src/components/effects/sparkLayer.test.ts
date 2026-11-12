import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { roseMotionAllowed, spawnSpark } from './sparkLayer';

function mockReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduce : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

const sparkCount = () => document.querySelectorAll('.cursor-spark').length;

describe('rose motion policy for sparks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.documentElement.classList.remove('rose-force-motion');
    document.querySelectorAll('.cursor-spark').forEach((n) => n.remove());
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows motion when the visitor has no reduced-motion preference', () => {
    mockReducedMotion(false);
    expect(roseMotionAllowed()).toBe(true);
  });

  it('blocks motion under reduced motion unless the admin forces it, evaluated per call', () => {
    mockReducedMotion(true);
    expect(roseMotionAllowed()).toBe(false);
    document.documentElement.classList.add('rose-force-motion');
    expect(roseMotionAllowed()).toBe(true);
    document.documentElement.classList.remove('rose-force-motion');
    expect(roseMotionAllowed()).toBe(false);
  });

  it('appends no spark node under reduced motion', () => {
    mockReducedMotion(true);
    spawnSpark(10, 10, { dx: 1, dy: 1 });
    expect(sparkCount()).toBe(0);
  });

  it('removes a spark whose animationend never fires after duration + 200 ms', () => {
    mockReducedMotion(false);
    spawnSpark(10, 10, { dx: 1, dy: 1, duration: 0.5 });
    expect(sparkCount()).toBe(1);
    vi.advanceTimersByTime(699);
    expect(sparkCount()).toBe(1);
    vi.advanceTimersByTime(2);
    expect(sparkCount()).toBe(0);
  });

  it('falls back to the default 0.6 s duration for the safety net', () => {
    mockReducedMotion(false);
    spawnSpark(10, 10, { dx: 1, dy: 1 });
    vi.advanceTimersByTime(801);
    expect(sparkCount()).toBe(0);
  });
});
