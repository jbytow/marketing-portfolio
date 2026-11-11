import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import TinyFairyPeek, { TINY_FAIRY_PEEK_TRIGGER_EVENT } from './TinyFairyPeek';

const themeState = vi.hoisted(() => ({ theme: 'rose' }));
vi.mock('@/contexts/ThemeContext', () => ({ useTheme: () => ({ theme: themeState.theme }) }));

const peekCount = () => document.querySelectorAll('.tiny-fairy-peek').length;
const trigger = () => act(() => void window.dispatchEvent(new Event(TINY_FAIRY_PEEK_TRIGGER_EVENT)));
const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

describe('TinyFairyPeek', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    themeState.theme = 'rose';
    window.matchMedia = vi.fn().mockImplementation(() => ({ matches: false })) as unknown as typeof window.matchMedia;
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('shows a peek for its full duration after a trigger', () => {
    render(<TinyFairyPeek />);
    trigger();
    expect(peekCount()).toBe(1);
    advance(2100);
    expect(peekCount()).toBe(1);
    advance(200);
    expect(peekCount()).toBe(0);
  });

  it('does not let the first trigger cut a second overlapping peek short', () => {
    render(<TinyFairyPeek />);
    trigger();
    advance(2000);
    trigger();
    advance(500);
    expect(peekCount()).toBe(1);
    advance(1800);
    expect(peekCount()).toBe(0);
  });

  it('clears an active peek when the theme leaves rose', () => {
    const { rerender } = render(<TinyFairyPeek />);
    trigger();
    expect(peekCount()).toBe(1);
    themeState.theme = 'dark';
    rerender(<TinyFairyPeek />);
    expect(peekCount()).toBe(0);
  });

  it.each([
    [0, 'left', true],
    [0.9, 'right', false],
  ])('mirrors the shared sprite only when peeking from the left edge (random %s -> %s)', (random, edge, mirrored) => {
    vi.spyOn(Math, 'random').mockReturnValue(random);
    render(<TinyFairyPeek />);
    trigger();
    expect(document.querySelector(`.tiny-fairy-peek-${edge}`)).not.toBeNull();
    expect(document.querySelector('.tiny-fairy-peek img')!.classList.contains('-scale-x-100')).toBe(mirrored);
    expect(document.querySelector('.tiny-fairy-peek')!.classList.contains('-scale-x-100')).toBe(false);
    vi.restoreAllMocks();
  });
});
