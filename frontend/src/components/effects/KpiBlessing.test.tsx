import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import i18n from '@/i18n/index';
import KpiBlessing, { KPI_BLESS_ALL_EVENT } from './KpiBlessing';

vi.mock('@/contexts/ThemeContext', () => ({ useTheme: () => ({ theme: 'rose' }) }));

function mockReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduce : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

const bless = () => act(() => void window.dispatchEvent(new Event(KPI_BLESS_ALL_EVENT)));

describe('KpiBlessing', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('en');
  });
  beforeEach(() => {
    vi.useFakeTimers();
    document.documentElement.classList.remove('rose-force-motion');
  });
  afterEach(async () => {
    cleanup();
    vi.useRealTimers();
    await i18n.changeLanguage('en');
  });

  it('shows the translated caption', async () => {
    mockReducedMotion(false);
    render(<KpiBlessing>42</KpiBlessing>);
    bless();
    expect(screen.getByText('✨ The numbers have been blessed ✨')).toBeTruthy();
    await act(() => i18n.changeLanguage('pl'));
    expect(screen.getByText('✨ Liczby zostały pobłogosławione ✨')).toBeTruthy();
  });

  it('floats and scales the caption when motion is allowed', () => {
    mockReducedMotion(false);
    render(<KpiBlessing>42</KpiBlessing>);
    bless();
    expect(screen.getByText(/blessed/).style.transform).toContain('scale');
  });

  it('shows the caption without y/scale motion under reduced motion', () => {
    mockReducedMotion(true);
    render(<KpiBlessing>42</KpiBlessing>);
    bless();
    const caption = screen.getByText(/blessed/);
    expect(caption.style.transform).toBe('');
  });
});
