import axios, { type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// axios.create() copies axios.defaults, so the stub adapter must be installed before api.ts is imported.
let seen: InternalAxiosRequestConfig[] = [];
let respondWith401 = false;
const stubAdapter: AxiosAdapter = async (config) => {
  seen.push(config);
  if (respondWith401) {
    const response = { data: {}, status: 401, statusText: 'Unauthorized', headers: {}, config };
    throw new axios.AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, response);
  }
  return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
};

let api: typeof import('./api');

beforeAll(async () => {
  axios.defaults.adapter = stubAdapter;
  api = await import('./api');
  await import('@/i18n/index');
});

beforeEach(() => {
  seen = [];
  respondWith401 = false;
  localStorage.clear();
});

describe('Accept-Language header', () => {
  it('follows the language pushed by the provider', async () => {
    api.setApiLanguage('pl');
    await api.postsApi.getAll();
    expect(seen[0].headers['Accept-Language']).toBe('pl');

    api.setApiLanguage('en');
    await api.postsApi.getAll();
    expect(seen[1].headers['Accept-Language']).toBe('en');
  });

  it('ignores localStorage written by another tab', async () => {
    api.setApiLanguage('en');
    localStorage.setItem('language', 'pl');
    await api.settingsApi.get();
    expect(seen[0].headers['Accept-Language']).toBe('en');
  });
});

describe('LanguageProvider and the API header', () => {
  const renderLanguage = async (stored?: string) => {
    if (stored) localStorage.setItem('language', stored);
    const { LanguageProvider, useLanguage } = await import('@/contexts/LanguageContext');
    const { createElement } = await import('react');
    const { act, renderHook } = await import('@testing-library/react');
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(LanguageProvider, null, children);
    return { act, ...renderHook(() => useLanguage(), { wrapper }) };
  };

  it('sets the header before any child effect can fire a request', async () => {
    api.setApiLanguage('en');
    localStorage.setItem('language', 'pl');
    const { LanguageProvider } = await import('@/contexts/LanguageContext');
    const { createElement, useEffect } = await import('react');
    const { render } = await import('@testing-library/react');
    // Child effects run before the parent's, which is when TanStack queries fire
    const Child = () => {
      useEffect(() => {
        void api.postsApi.getAll();
      }, []);
      return null;
    };
    render(createElement(LanguageProvider, null, createElement(Child)));
    await vi.waitFor(() => expect(seen).toHaveLength(1));
    expect(seen[0].headers['Accept-Language']).toBe('pl');
  });

  it('updates the header synchronously when toggleLanguage switches either way', async () => {
    api.setApiLanguage('en');
    const { act, result } = await renderLanguage('en');

    await act(async () => {
      result.current.toggleLanguage();
      await api.postsApi.getAll();
    });
    expect(seen[seen.length - 1].headers['Accept-Language']).toBe('pl');

    await act(async () => {
      result.current.toggleLanguage();
      await api.postsApi.getAll();
    });
    expect(seen[seen.length - 1].headers['Accept-Language']).toBe('en');
  });
});

describe('request timeout', () => {
  it('applies a 30 s default timeout', async () => {
    await api.contactApi.submit({ name: 'a', email: 'a@b.c', subject: 's', message: 'hi' });
    expect(seen[0].timeout).toBe(30000);
  });

  it('disables the timeout for media uploads', async () => {
    await api.adminMediaApi.upload(new File(['x'], 'x.png', { type: 'image/png' }));
    expect(seen[0].timeout).toBe(0);
  });
});

describe('expired session (401)', () => {
  const onExpired = vi.fn();

  beforeEach(() => {
    onExpired.mockClear();
    window.addEventListener('auth:expired', onExpired);
    respondWith401 = true;
  });
  afterEach(() => window.removeEventListener('auth:expired', onExpired));

  it('announces the expiry instead of navigating away from an admin form', async () => {
    window.history.pushState({}, '', '/admin/posts/new');
    await expect(api.adminPostsApi.getAll()).rejects.toMatchObject({ response: { status: 401 } });
    expect(onExpired).toHaveBeenCalledTimes(1);
    expect(window.location.pathname).toBe('/admin/posts/new');
  });

  it('does not announce a failed initial /admin/auth/me check', async () => {
    window.history.pushState({}, '', '/admin');
    await expect(api.authApi.getCurrentUser()).rejects.toBeTruthy();
    expect(onExpired).not.toHaveBeenCalled();
  });

  it.each(['/', '/blog', '/admin/login'])('stays silent on %s', async (path) => {
    window.history.pushState({}, '', path);
    await expect(api.adminPostsApi.getAll()).rejects.toBeTruthy();
    expect(onExpired).not.toHaveBeenCalled();
  });

  it('keeps other error statuses out of the expiry flow', async () => {
    respondWith401 = false;
    window.history.pushState({}, '', '/admin/posts');
    await api.adminPostsApi.getAll();
    expect(onExpired).not.toHaveBeenCalled();
  });
});
