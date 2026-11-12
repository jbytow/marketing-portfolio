import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import i18n from '@/i18n/index';
import MidnightRose from './MidnightRose';

vi.mock('@/contexts/ThemeContext', () => ({ useTheme: () => ({ theme: 'rose' }) }));

describe('MidnightRose', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('en');
  });
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 11, 23, 30));
  });
  afterEach(async () => {
    cleanup();
    vi.useRealTimers();
    await i18n.changeLanguage('en');
  });

  it('shows the translated banner late at night', async () => {
    render(<MidnightRose />);
    expect(screen.getByText('🌙 Late night marketing magic detected')).toBeTruthy();
    await act(() => i18n.changeLanguage('pl'));
    expect(screen.getByText('🌙 Wykryto nocną magię marketingu')).toBeTruthy();
  });

  it('does not stamp an unused class on <html>', () => {
    render(<MidnightRose />);
    expect(document.documentElement.classList.contains('rose-midnight')).toBe(false);
  });

  it('renders nothing in the daytime', () => {
    vi.setSystemTime(new Date(2026, 10, 11, 12, 0));
    const { container } = render(<MidnightRose />);
    expect(container.querySelector('.rose-midnight-moon')).toBeNull();
  });
});
