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
vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({ isAuthenticated: true, isLoading: false, user: { isAdmin: true } }),
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
