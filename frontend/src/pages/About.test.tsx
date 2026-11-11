import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import i18n from '@/i18n/index';
import About from './About';

const getSettings = vi.hoisted(() => vi.fn());
const getInterests = vi.hoisted(() => vi.fn());
vi.mock('@/services/api', () => ({
  settingsApi: { get: getSettings },
  interestsApi: { getAll: getInterests },
}));
vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ language: 'en' }),
}));
vi.mock('@/components/LoadingSpinner', () => ({
  default: () => <div role="status">loading</div>,
}));

const settingsOk = {
  success: true,
  data: { aboutText: 'I write campaigns.', aboutTags: ['SEO'], profileImage: null },
};

function renderAbout() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <HelmetProvider>
      <QueryClientProvider client={client}>
        <About />
      </QueryClientProvider>
    </HelmetProvider>
  );
}

describe('About', () => {
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
    getInterests.mockReset();
  });

  it('shows the load error with retry instead of the placeholder text when settings fail', async () => {
    getSettings.mockRejectedValueOnce(new Error('network'));
    getSettings.mockResolvedValueOnce(settingsOk);
    getInterests.mockResolvedValue({ success: true, data: [] });
    renderAbout();

    const retry = await screen.findByRole('button', { name: i18n.t('common.retry') });
    expect(screen.getByText(i18n.t('common.loadError'))).toBeTruthy();

    fireEvent.click(retry);
    await waitFor(() => expect(getSettings).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('I write campaigns.')).toBeTruthy();
    expect(screen.queryByText(i18n.t('common.loadError'))).toBeNull();
  });

  it('keeps the spinner while settings are pending', () => {
    getSettings.mockReturnValue(new Promise(() => {}));
    getInterests.mockReturnValue(new Promise(() => {}));
    renderAbout();

    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.queryByText(i18n.t('common.loadError'))).toBeNull();
  });

  it('renders the about text and tags when settings load', async () => {
    getSettings.mockResolvedValue(settingsOk);
    getInterests.mockResolvedValue({ success: true, data: [] });
    renderAbout();

    expect(await screen.findByText('I write campaigns.')).toBeTruthy();
    expect(screen.getByText('SEO')).toBeTruthy();
    expect(screen.queryByText(i18n.t('common.loadError'))).toBeNull();
  });
});
