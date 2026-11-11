import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import i18n from '@/i18n/index';
import App from './App';

// Only the routing table is under test: the shell, auth and admin screens are replaced by stubs
vi.mock('./components/Layout', () => ({
  default: () => (
    <div data-testid="public-layout">
      <Outlet />
    </div>
  ),
}));
const auth = vi.hoisted(() => ({ isAuthenticated: true }));
vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    isAuthenticated: auth.isAuthenticated,
    isLoading: false,
    user: { isAdmin: auth.isAuthenticated },
  }),
}));
vi.mock('./admin/AdminLayout', () => ({
  default: () => (
    <div data-testid="admin-layout">
      <Outlet />
    </div>
  ),
}));
vi.mock('./pages/About', () => ({ default: () => <h1>About stub</h1> }));
vi.mock('./admin/AdminDashboard', () => ({ default: () => <h1>Dashboard stub</h1> }));
vi.mock('./admin/AdminLogin', () => ({ default: () => <h1>Login stub</h1> }));
vi.mock('./admin/AdminPostPreview', () => ({ default: () => <h1>Post preview stub</h1> }));
vi.mock('./admin/AdminNewsletterPreview', () => ({ default: () => <h1>Newsletter preview stub</h1> }));

function renderAt(path: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe('catch-all routes', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('en');
  });
  afterEach(cleanup);

  it('shows the not-found page inside the public layout with a way back home', async () => {
    renderAt('/nie-ma-takiej-strony');

    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeTruthy();
    expect(screen.getByTestId('public-layout')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Back to the home page' }).getAttribute('href')).toBe('/');
  });

  it('shows the not-found page for unknown nested public paths', async () => {
    renderAt('/projects/a/b/c');
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeTruthy();
  });

  it('asks robots not to index the not-found page', async () => {
    renderAt('/nie-ma-takiej-strony');
    await screen.findByRole('heading', { name: 'Page not found' });
    await waitFor(() =>
      expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex')
    );
  });

  it('redirects unknown admin paths to the admin dashboard', async () => {
    renderAt('/admin/nie-ma');

    expect(await screen.findByRole('heading', { name: 'Dashboard stub' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Page not found' })).toBeNull();
  });

  it('still routes known public paths to their pages', async () => {
    renderAt('/about');

    expect(await screen.findByRole('heading', { name: 'About stub' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Page not found' })).toBeNull();
  });
});

describe('draft preview routes', () => {
  const previews = [
    ['/admin/posts/p1/preview', 'Post preview stub'],
    ['/admin/newsletters/n1/preview', 'Newsletter preview stub'],
  ];

  beforeAll(async () => {
    await i18n.changeLanguage('en');
  });
  afterEach(() => {
    cleanup();
    auth.isAuthenticated = true;
  });

  it.each(previews)('routes %s to the preview page inside the admin layout', async (path, heading) => {
    renderAt(path);

    expect(await screen.findByRole('heading', { name: heading })).toBeTruthy();
    expect(screen.getByTestId('admin-layout')).toBeTruthy();
  });

  it.each(previews)('sends %s to the login page when not authenticated', async (path, heading) => {
    auth.isAuthenticated = false;
    renderAt(path);

    expect(await screen.findByRole('heading', { name: 'Login stub' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: heading })).toBeNull();
  });
});
