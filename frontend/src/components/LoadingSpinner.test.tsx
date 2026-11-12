import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

let theme = 'dark';
vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({ theme }),
}));

const SPINNER_SELECTOR = '.animate-spin';

describe('LoadingSpinner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    theme = 'dark';
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('renders nothing for the first 200 ms in full-screen mode, then the spinner', () => {
    const { container } = render(<LoadingSpinner fullScreen />);
    expect(container.querySelector(SPINNER_SELECTOR)).toBeNull();

    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(container.querySelector(SPINNER_SELECTOR)).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(container.querySelector(SPINNER_SELECTOR)).not.toBeNull();
    expect(container.firstElementChild?.className).toContain('fixed');
  });

  it('keeps the rose petal variant after the delay', () => {
    theme = 'rose';
    const { container } = render(<LoadingSpinner fullScreen />);
    expect(container.querySelector('svg')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(container.querySelector('svg.animate-spin')).not.toBeNull();
  });

  it('renders the inline spinner immediately', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector(SPINNER_SELECTOR)).not.toBeNull();
  });

  it('clears the timer on unmount so nothing updates afterwards', () => {
    const { unmount } = render(<LoadingSpinner fullScreen />);
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
