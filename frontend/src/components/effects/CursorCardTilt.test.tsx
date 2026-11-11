import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import CursorCardTilt from './CursorCardTilt';

vi.mock('@/contexts/ThemeContext', () => ({ useTheme: () => ({ theme: 'rose' }) }));

function mockMedia({ reduce }: { reduce: boolean }) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('pointer: fine') ? true : query.includes('prefers-reduced-motion') ? reduce : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

function addCard() {
  const card = document.createElement('div');
  card.className = 'card';
  card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 200, right: 200, bottom: 200, x: 0, y: 0 }) as DOMRect;
  document.body.appendChild(card);
  return card;
}

function move(target: Element, x: number, y: number) {
  target.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: x, clientY: y }));
}

// Two quick moves 100 px apart within 10 ms: speed 10 px/ms, well above the tilt threshold
function flick(card: Element, fromX = 10, toX = 110) {
  move(card, fromX, 50);
  vi.advanceTimersByTime(10);
  move(card, toX, 50);
}

const sparkCount = () => document.querySelectorAll('.cursor-spark').length;

describe('CursorCardTilt', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.documentElement.classList.remove('rose-force-motion');
    document.body.innerHTML = '';
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('tilts a card on a fast flick', () => {
    mockMedia({ reduce: false });
    render(<CursorCardTilt />);
    const card = addCard();
    flick(card);
    expect(card.style.transform).toContain('perspective(600px)');
  });

  it('does not tilt or spark under reduced motion, checked per event', () => {
    mockMedia({ reduce: true });
    render(<CursorCardTilt />);
    const card = addCard();
    flick(card);
    expect(card.style.transform).toBe('');
    expect(card.style.transition).toBe('');
    expect(sparkCount()).toBe(0);

    document.documentElement.classList.add('rose-force-motion');
    vi.advanceTimersByTime(50);
    flick(card, 10, 110);
    expect(card.style.transform).toContain('perspective(600px)');
  });

  it('resets an active tilt when motion becomes disallowed', () => {
    mockMedia({ reduce: true });
    document.documentElement.classList.add('rose-force-motion');
    render(<CursorCardTilt />);
    const card = addCard();
    flick(card);
    expect(card.style.transform).toContain('perspective(600px)');

    document.documentElement.classList.remove('rose-force-motion');
    vi.advanceTimersByTime(50);
    move(card, 120, 50);
    expect(card.style.transform).toBe('');
  });
});
