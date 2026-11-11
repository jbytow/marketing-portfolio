import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import i18n from '@/i18n/index';
import Contact from '@/pages/Contact';
import { contactApi } from '@/services/api';

vi.mock('@/services/api', () => ({
  contactApi: { submit: vi.fn() },
}));
vi.mock('@/lib/useSiteSettings', () => ({
  useSiteSettings: () => ({ data: { data: { socialLinks: {} } }, isLoading: false }),
}));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));

function renderContact() {
  return render(
    <HelmetProvider>
      <Contact />
    </HelmetProvider>
  );
}

describe('Contact honeypot', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('en');
  });
  beforeEach(() => {
    vi.mocked(contactApi.submit).mockResolvedValue({ success: true, message: '', data: undefined });
  });
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('submits an empty website field together with the visible fields', async () => {
    renderContact();
    fireEvent.change(screen.getByLabelText('Your Name'), { target: { value: 'Ada' } });
    fireEvent.change(screen.getByLabelText('Your Email'), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Hello' } });
    fireEvent.change(screen.getByLabelText('Your Message'), { target: { value: 'A message' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => expect(contactApi.submit).toHaveBeenCalledTimes(1));
    expect(contactApi.submit).toHaveBeenCalledWith({
      name: 'Ada',
      email: 'ada@example.com',
      subject: 'Hello',
      message: 'A message',
      website: '',
    });
  });

  it('keeps the trap out of keyboard and assistive technology reach but still in the DOM', () => {
    const { container } = renderContact();
    const trap = container.querySelector<HTMLInputElement>('input[name="website"]');

    expect(trap).not.toBeNull();
    expect(trap!.tabIndex).toBe(-1);
    expect(trap!.getAttribute('autocomplete')).toBe('off');
    expect(trap!.closest('[aria-hidden="true"]')).not.toBeNull();
    // display:none is skipped by many bots, so the field is moved off-screen instead
    const wrapperStyle = trap!.closest<HTMLElement>('[aria-hidden="true"]')!.style;
    expect(wrapperStyle.position).toBe('absolute');
    expect(wrapperStyle.left).toBe('-9999px');
    expect(wrapperStyle.display).not.toBe('none');
  });

  it('labels the trap in the active language', async () => {
    const { container } = renderContact();
    expect(container.textContent).toContain('Leave this field empty');
    await i18n.changeLanguage('pl');
    expect(container.textContent).toContain('Zostaw to pole puste');
    await i18n.changeLanguage('en');
  });
});
