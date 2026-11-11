import { render, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '@/i18n/index';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { ThemeProvider, useTheme } from './ThemeContext';
import indexHtml from '../../index.html?raw';

// Blocked storage (privacy modes, sandboxed iframes) throws SecurityError on access.
const blockStorage = () => {
  const blocked = () => {
    throw new DOMException('The operation is insecure.', 'SecurityError');
  };
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);
};

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('ThemeProvider with blocked storage', () => {
  const wrapper = ({ children }: { children: ReactNode }) => <ThemeProvider>{children}</ThemeProvider>;

  it('renders and falls back to rose', () => {
    blockStorage();
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('rose');
  });

  it('does not throw when persisting a theme change', () => {
    blockStorage();
    const { result, rerender } = renderHook(() => useTheme(), { wrapper });
    expect(() => {
      result.current.setTheme('dark');
      rerender();
    }).not.toThrow();
    expect(result.current.theme).toBe('dark');
  });
});

describe('ThemeProvider with working storage', () => {
  const wrapper = ({ children }: { children: ReactNode }) => <ThemeProvider>{children}</ThemeProvider>;

  it('restores a saved theme', () => {
    localStorage.setItem('theme', 'dark');
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('dark');
  });

  it('ignores an unknown saved value', () => {
    localStorage.setItem('theme', 'light');
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('rose');
  });
});

describe('index.html', () => {
  // ThemeProvider applies the theme in an effect, after the first paint; a static attribute avoids a dark flash
  it('paints the default theme before React mounts', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }: { children: ReactNode }) => <ThemeProvider>{children}</ThemeProvider>,
    });
    const page = new DOMParser().parseFromString(indexHtml, 'text/html');
    expect(page.documentElement.getAttribute('data-theme')).toBe(result.current.theme);
    expect(page.documentElement.getAttribute('data-theme')).toBe(document.documentElement.getAttribute('data-theme'));
  });
});

describe('LanguageProvider with blocked storage', () => {
  // The language detector probes storage once at init and then guards itself; here init already ran with working storage.
  beforeEach(() => {
    vi.spyOn(i18n, 'changeLanguage').mockResolvedValue(i18n.t);
  });

  it('renders and falls back to en', () => {
    blockStorage();
    const wrapper = ({ children }: { children: ReactNode }) => <LanguageProvider>{children}</LanguageProvider>;
    const { result } = renderHook(() => useLanguage(), { wrapper });
    expect(result.current.language).toBe('en');
  });

  it('mounts its children', () => {
    blockStorage();
    const { getByText } = render(
      <LanguageProvider>
        <p>child</p>
      </LanguageProvider>
    );
    expect(getByText('child')).toBeTruthy();
  });
});
