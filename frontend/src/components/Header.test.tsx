import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import i18n from '@/i18n/index';
import Header from './Header';

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ language: 'en', toggleLanguage: vi.fn() }),
}));
vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: vi.fn() }),
}));
vi.mock('@/lib/useSiteSettings', () => ({ useSiteSettings: () => ({ data: undefined }) }));

let navigate: ReturnType<typeof useNavigate>;
function Probe() {
  navigate = useNavigate();
  return null;
}

function renderHeader(initialEntry = '/') {
  render(
    <MemoryRouter initialEntries={['/start', initialEntry]} initialIndex={1}>
      <Header />
      <Routes>
        <Route path="*" element={<Probe />} />
      </Routes>
    </MemoryRouter>
  );
}

function toggle() {
  return screen.getByRole('button', { name: i18n.t('a11y.menu') });
}

describe('Header mobile menu', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('en');
  });
  afterEach(cleanup);
  beforeAll(() => {
    window.scrollTo = vi.fn();
  });

  it('opens and closes with the toggle and keeps aria-expanded in sync', () => {
    renderHeader();
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(toggle());
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(toggle());
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
  });

  it('closes when the route changes without a click in the menu (back button, programmatic)', () => {
    renderHeader('/about');
    fireEvent.click(toggle());
    expect(toggle().getAttribute('aria-expanded')).toBe('true');

    act(() => navigate('/projects'));
    expect(toggle().getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(toggle());
    act(() => navigate(-1));
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
  });

  it('closes when the logo is clicked even if the path does not change', () => {
    renderHeader('/');
    fireEvent.click(toggle());
    fireEvent.click(screen.getByRole('link', { name: 'Portfolio' }));
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
  });

  it('closes on Escape and returns focus to the toggle', () => {
    renderHeader();
    fireEvent.click(toggle());
    expect(document.activeElement).not.toBe(toggle());

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(toggle());
  });

  it('does not steal focus on Escape while the menu is closed', () => {
    renderHeader();
    const other = screen.getByRole('link', { name: 'Portfolio' });
    other.focus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.activeElement).toBe(other);
  });
});
