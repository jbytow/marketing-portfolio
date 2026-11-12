import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import i18n from '@/i18n/index';
import Home from './Home';

const getSettings = vi.hoisted(() => vi.fn());
const getPosts = vi.hoisted(() => vi.fn());
vi.mock('@/services/api', () => ({
  settingsApi: { get: getSettings },
  postsApi: { getAll: getPosts },
}));
vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ language: 'en' }),
}));
vi.mock('@/components/LoadingSpinner', () => ({
  default: () => <div role="status">loading</div>,
}));

const settingsOk = {
  success: true,
  data: { heroTitle: 'Hello Hero', heroSubtitle: 'Sub', statsItems: [], metaDescription: 'm' },
};

function renderHome() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <HelmetProvider>
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

describe('Home', () => {
  beforeAll(async () => {
    // jsdom has no IntersectionObserver, which framer-motion whileInView needs
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );
    await i18n.changeLanguage('en');
  });
  afterEach(() => {
    cleanup();
    getSettings.mockReset();
    getPosts.mockReset();
  });

  it('shows the load error with retry instead of an empty hero when settings fail', async () => {
    getSettings.mockRejectedValueOnce(new Error('network'));
    getSettings.mockResolvedValueOnce(settingsOk);
    getPosts.mockResolvedValue({ success: true, data: [] });
    renderHome();

    const retry = await screen.findByRole('button', { name: i18n.t('common.retry') });
    expect(screen.getByText(i18n.t('common.loadError'))).toBeTruthy();

    fireEvent.click(retry);
    await waitFor(() => expect(getSettings).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('Hello Hero')).toBeTruthy();
    expect(screen.queryByText(i18n.t('common.loadError'))).toBeNull();
  });

  it('keeps the spinner while settings are pending', () => {
    getSettings.mockReturnValue(new Promise(() => {}));
    getPosts.mockReturnValue(new Promise(() => {}));
    renderHome();

    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.queryByText(i18n.t('common.loadError'))).toBeNull();
  });

  it('renders the hero text when settings load', async () => {
    getSettings.mockResolvedValue(settingsOk);
    getPosts.mockResolvedValue({ success: true, data: [] });
    renderHome();

    expect(await screen.findByText('Hello Hero')).toBeTruthy();
    expect(screen.queryByText(i18n.t('common.loadError'))).toBeNull();
  });

  it('shows the error block only in the posts section when posts fail, keeping the hero', async () => {
    getSettings.mockResolvedValue(settingsOk);
    getPosts.mockRejectedValueOnce(new Error('network'));
    getPosts.mockResolvedValueOnce({
      success: true,
      data: [{ id: 'p1', slug: 'p-1', title: 'First post', excerpt: 'e', categoryLabel: 'Cat', featuredImage: null }],
    });
    renderHome();

    expect(await screen.findByText('Hello Hero')).toBeTruthy();
    const retry = await screen.findByRole('button', { name: i18n.t('common.retry') });
    expect(screen.getAllByText(i18n.t('common.loadError'))).toHaveLength(1);

    fireEvent.click(retry);
    expect(await screen.findByText('First post')).toBeTruthy();
    expect(screen.queryByText(i18n.t('common.loadError'))).toBeNull();
  });
});
