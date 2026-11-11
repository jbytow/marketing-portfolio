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
    document.querySelectorAll('.card, .cursor-spark').forEach((n) => n.remove());
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

  it('spawns bounce sparks at most once per 60 ms while still tilting on every event', () => {
    mockMedia({ reduce: false });
    render(<CursorCardTilt />);
    const card = addCard();
    flick(card, 10, 110);
    expect(sparkCount()).toBe(2);
    const firstTransform = card.style.transform;
    vi.advanceTimersByTime(10);
    move(card, 190, 50);
    vi.advanceTimersByTime(10);
    move(card, 20, 50);
    expect(sparkCount()).toBe(2);
    expect(card.style.transform).not.toBe(firstTransform);
    vi.advanceTimersByTime(60);
    move(card, 190, 50);
    expect(sparkCount()).toBe(4);
  });

  it('removes the inline transition after a tilted card settles so hover transitions work again', () => {
    mockMedia({ reduce: false });
    render(<CursorCardTilt />);
    const card = addCard();
    flick(card);
    expect(card.style.transition).toContain('transform');
    vi.advanceTimersByTime(400); // reset delay
    expect(card.style.transform).toBe('');
    expect(card.style.transition).toContain('0.4s');
    vi.advanceTimersByTime(400);
    expect(card.style.transition).toBe('');
  });

  it('never writes inline styles on a card that was only hovered slowly', () => {
    mockMedia({ reduce: false });
    render(<CursorCardTilt />);
    const card = addCard();
    move(card, 10, 50);
    vi.advanceTimersByTime(1000);
    move(card, 20, 50);
    move(document.body, 400, 400);
    vi.advanceTimersByTime(1000);
    expect(card.getAttribute('style')).toBeNull();
  });

  it('releases the previous card, transition included, when the pointer moves to another card', () => {
    mockMedia({ reduce: false });
    render(<CursorCardTilt />);
    const first = addCard();
    const second = addCard();
    flick(first);
    vi.advanceTimersByTime(20);
    move(second, 50, 50);
    expect(first.style.transform).toBe('');
    vi.advanceTimersByTime(400);
    expect(first.style.transition).toBe('');
  });
});
