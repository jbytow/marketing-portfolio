import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import MagicCursor from './MagicCursor';

vi.mock('@/contexts/ThemeContext', () => ({ useTheme: () => ({ theme: 'rose' }) }));

function mockPointer(fine: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('pointer: fine') && fine,
    media: query,
  })) as unknown as typeof window.matchMedia;
}

const wand = () => document.querySelector<HTMLElement>('.magic-cursor')!;
const moveMouse = () => window.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 50 }));

describe('MagicCursor wand visibility', () => {
  beforeEach(() => {
    mockPointer(true);
  });
  afterEach(() => {
    cleanup();
  });

  it('hides the wand when the pointer leaves the window and shows it on the next move', () => {
    render(<MagicCursor />);
    moveMouse();
    document.documentElement.dispatchEvent(new MouseEvent('mouseleave'));
    expect(wand().style.opacity).toBe('0');
    moveMouse();
    expect(wand().style.opacity).toBe('');
  });

  it('hides the wand when the pointer enters an iframe', () => {
    render(<MagicCursor />);
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    frame.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    expect(wand().style.opacity).toBe('0');
    moveMouse();
    expect(wand().style.opacity).toBe('');
    frame.remove();
  });

  it('keeps the wand visible when the pointer enters an ordinary element', () => {
    render(<MagicCursor />);
    const div = document.createElement('div');
    document.body.appendChild(div);
    div.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    expect(wand().style.opacity).toBe('');
    div.remove();
  });

  it('hides the wand when the window loses focus', () => {
    render(<MagicCursor />);
    window.dispatchEvent(new Event('blur'));
    expect(wand().style.opacity).toBe('0');
  });

  it('removes every listener it added on unmount', () => {
    const targets: EventTarget[] = [window, document, document.documentElement];
    const added: [EventTarget, string, unknown][] = [];
    const removed: [EventTarget, string, unknown][] = [];
    targets.forEach((target) => {
      const add = target.addEventListener.bind(target);
      const remove = target.removeEventListener.bind(target);
      vi.spyOn(target, 'addEventListener').mockImplementation((type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) => {
        added.push([target, type, listener]);
        add(type, listener, options);
      });
      vi.spyOn(target, 'removeEventListener').mockImplementation((type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) => {
        removed.push([target, type, listener]);
        remove(type, listener, options);
      });
    });
    const { unmount } = render(<MagicCursor />);
    const own = added.filter(([, type]) => ['mousemove', 'mouseover', 'mouseleave', 'blur'].includes(type));
    expect(own.length).toBe(4);
    unmount();
    own.forEach((entry) => expect(removed).toContainEqual(entry));
    vi.restoreAllMocks();
  });

  it('does not render the wand, or load its image, without a fine pointer', () => {
    mockPointer(false);
    render(<MagicCursor />);
    expect(document.querySelector('.magic-cursor')).toBeNull();
    expect(document.querySelector('.magic-cursor img')).toBeNull();
    expect(document.documentElement.classList.contains('magic-cursor-active')).toBe(false);
  });

  it('hides the system cursor only after the wand image has loaded', () => {
    const { unmount } = render(<MagicCursor />);
    expect(document.documentElement.classList.contains('magic-cursor-active')).toBe(false);
    fireEvent.load(document.querySelector('.magic-cursor img')!);
    expect(document.documentElement.classList.contains('magic-cursor-active')).toBe(true);
    unmount();
    expect(document.documentElement.classList.contains('magic-cursor-active')).toBe(false);
  });
});
