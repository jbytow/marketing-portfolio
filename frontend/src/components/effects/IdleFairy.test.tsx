import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import IdleFairy from './IdleFairy';

vi.mock('@/contexts/ThemeContext', () => ({ useTheme: () => ({ theme: 'rose' }) }));

describe('IdleFairy', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.matchMedia = vi.fn().mockImplementation(() => ({ matches: false })) as unknown as typeof window.matchMedia;
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it.each([
    [0, 'flies right, sprite mirrored', true],
    [0.3, 'flies left, sprite as drawn', false],
  ])('after 30 s idle (random %s) %s', (random, _label, mirrored) => {
    vi.spyOn(Math, 'random').mockReturnValue(random);
    render(<IdleFairy />);
    act(() => void vi.advanceTimersByTime(30000));
    const img = document.querySelector('.idle-fairy img')!;
    expect(img.classList.contains('-scale-x-100')).toBe(mirrored);
    expect(document.querySelector('.idle-fairy')!.classList.contains('-scale-x-100')).toBe(false);
  });
});
