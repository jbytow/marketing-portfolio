import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, act } from '@testing-library/react';
import i18n from '@/i18n/index';
import EnchantButton from './EnchantButton';
import MakePrettierButton from './MakePrettierButton';
import { TINY_FAIRY_PEEK_TRIGGER_EVENT } from './TinyFairyPeek';
import { ROSE_EXPLOSION_EVENT } from './RoseExplosion';

vi.mock('@/contexts/ThemeContext', () => ({ useTheme: () => ({ theme: 'rose' }) }));
const toastMock = vi.hoisted(() => vi.fn());
vi.mock('react-hot-toast', () => ({ default: toastMock }));

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

describe('Enchant and Make it prettier buttons', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('en');
  });
  beforeEach(() => {
    vi.useFakeTimers();
    toastMock.mockClear();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    document.body.className = '';
    document.documentElement.className = '';
  });

  it('Enchant ignores a second click while the levitate effect is running', () => {
    const peeks = vi.fn();
    window.addEventListener(TINY_FAIRY_PEEK_TRIGGER_EVENT, peeks);
    render(<EnchantButton />);
    const button = screen.getByRole('button', { name: 'Enchant' });
    fireEvent.click(button);
    advance(600);
    fireEvent.click(button);
    expect(peeks).toHaveBeenCalledTimes(1);
    advance(500);
    expect(document.body.classList.contains('page-levitate')).toBe(false);
    window.removeEventListener(TINY_FAIRY_PEEK_TRIGGER_EVENT, peeks);
  });

  it('Make it prettier ignores a second click while the mode is active and toasts once', () => {
    const explosions = vi.fn();
    window.addEventListener(ROSE_EXPLOSION_EVENT, explosions);
    render(<MakePrettierButton />);
    const button = screen.getByRole('button', { name: 'Make it prettier' });
    fireEvent.click(button);
    advance(1000);
    fireEvent.click(button);
    expect(explosions).toHaveBeenCalledTimes(1);
    advance(2100);
    expect(document.documentElement.classList.contains('prettier-mode')).toBe(false);
    expect(toastMock).toHaveBeenCalledTimes(1);
    window.removeEventListener(ROSE_EXPLOSION_EVENT, explosions);
  });

  it('cleans up pending effects on unmount', () => {
    const { unmount } = render(<MakePrettierButton />);
    fireEvent.click(screen.getByRole('button', { name: 'Make it prettier' }));
    unmount();
    expect(document.documentElement.classList.contains('prettier-mode')).toBe(false);
    advance(3100);
    expect(toastMock).not.toHaveBeenCalled();
  });
});
