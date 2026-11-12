import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import RoseExplosion, { ROSE_EXPLOSION_EVENT } from './RoseExplosion';

const petalCount = () => document.querySelectorAll('.rose-petal').length;
const explode = () => act(() => void window.dispatchEvent(new Event(ROSE_EXPLOSION_EVENT)));
const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

describe('RoseExplosion', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('keeps the slowest petal (3.0 s + 0.4 s delay) until its animation ends', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9999);
    render(<RoseExplosion />);
    explode();
    advance(3300);
    expect(petalCount()).toBeGreaterThan(0);
    advance(300);
    expect(petalCount()).toBe(0);
  });

  it('removes quick petals as soon as their animation ends', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    render(<RoseExplosion />);
    explode();
    advance(1500);
    expect(petalCount()).toBeGreaterThan(0);
    advance(300);
    expect(petalCount()).toBe(0);
  });

  it('does not let the first explosion timer wipe a second explosion', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    render(<RoseExplosion />);
    explode();
    advance(1500);
    explode();
    advance(1300);
    expect(petalCount()).toBeGreaterThan(0);
    advance(500);
    expect(petalCount()).toBe(0);
  });
});
