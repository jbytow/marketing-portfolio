import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import i18n from '@/i18n/index';
import AdminLayout from './AdminLayout';
import { useUnsavedChanges } from './hooks/useUnsavedChanges';

const logout = vi.hoisted(() => vi.fn());
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Admin', email: 'a@b.c' }, logout }),
}));
vi.mock('@/services/api', () => ({ AUTH_EXPIRED_EVENT: 'auth:expired' }));

function Form({ dirty }: { dirty: boolean }) {
  useUnsavedChanges(dirty);
  return <div>form page</div>;
}

function renderLayout(dirty: boolean) {
  render(
    <MemoryRouter initialEntries={['/admin/soft-skills/new']}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<div>dashboard page</div>} />
          <Route path="media" element={<div>media page</div>} />
          <Route path="soft-skills/new" element={<Form dirty={dirty} />} />
        </Route>
        <Route path="/" element={<div>public site</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AdminLayout leaving a form with unsaved changes', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('en');
  });
  beforeEach(() => {
    logout.mockClear();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const menu = () => screen.getByRole('link', { name: i18n.t('admin.media.title') });
  const backToSite = () => screen.getByText('Admin Panel');
  const logoutButton = () => screen.getByRole('button', { name: i18n.t('admin.auth.logout') });

  it('asks on a menu click while dirty and stays when declined', () => {
    renderLayout(true);
    fireEvent.click(menu());
    expect(window.confirm).toHaveBeenCalledWith(i18n.t('admin.unsaved.confirmLeave'));
    expect(screen.getByText('form page')).toBeTruthy();
    expect(screen.queryByText('media page')).toBeNull();
  });

  it('navigates on a menu click after the admin confirms', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderLayout(true);
    fireEvent.click(menu());
    expect(screen.getByText('media page')).toBeTruthy();
  });

  it('navigates without asking while the form is clean', () => {
    renderLayout(false);
    fireEvent.click(menu());
    expect(window.confirm).not.toHaveBeenCalled();
    expect(screen.getByText('media page')).toBeTruthy();
  });

  it('stops asking once the dirty form was left', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderLayout(true);
    fireEvent.click(menu());
    (window.confirm as ReturnType<typeof vi.fn>).mockClear();
    fireEvent.click(screen.getByRole('link', { name: i18n.t('admin.dashboard.title') }));
    expect(window.confirm).not.toHaveBeenCalled();
  });

  it('guards back to site', () => {
    renderLayout(true);
    fireEvent.click(backToSite());
    expect(window.confirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('public site')).toBeNull();
  });

  it('guards logout', () => {
    renderLayout(true);
    fireEvent.click(logoutButton());
    expect(window.confirm).toHaveBeenCalledTimes(1);
    expect(logout).not.toHaveBeenCalled();
  });

  it('logs out and returns to the site without asking while clean', () => {
    renderLayout(false);
    fireEvent.click(backToSite());
    expect(screen.getByText('public site')).toBeTruthy();
    cleanup();
    renderLayout(false);
    fireEvent.click(logoutButton());
    expect(logout).toHaveBeenCalledTimes(1);
    expect(window.confirm).not.toHaveBeenCalled();
  });
});
