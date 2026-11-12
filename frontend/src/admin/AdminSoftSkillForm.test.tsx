import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import i18n from '@/i18n/index';
import AdminSoftSkillForm from './AdminSoftSkillForm';

vi.mock('@/services/api', () => ({
  adminSoftSkillsApi: { getById: vi.fn(), create: vi.fn(), update: vi.fn() },
  adminSkillCategoriesApi: { getAll: vi.fn().mockResolvedValue({ success: true, data: [] }) },
}));

function renderForm() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/admin/soft-skills/new']}>
        <Routes>
          <Route path="/admin/soft-skills/new" element={<AdminSoftSkillForm />} />
          <Route path="/admin/soft-skills" element={<div>skills list</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('AdminSoftSkillForm unsaved changes', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('en');
  });
  beforeEach(() => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const cancel = () => fireEvent.click(screen.getByRole('button', { name: i18n.t('common.cancel') }));

  it('leaves without asking while nothing was typed', () => {
    renderForm();
    cancel();
    expect(window.confirm).not.toHaveBeenCalled();
    expect(screen.getByText('skills list')).toBeTruthy();
  });

  it('asks before Cancel once a field changed and stays when declined', () => {
    renderForm();
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'Empathy' } });
    cancel();
    expect(window.confirm).toHaveBeenCalledWith(i18n.t('admin.unsaved.confirmLeave'));
    expect(screen.queryByText('skills list')).toBeNull();
  });

  it('leaves after the admin confirms', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderForm();
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'Empathy' } });
    cancel();
    expect(screen.getByText('skills list')).toBeTruthy();
  });

  it('stops asking once the typed text is reverted to the original', () => {
    renderForm();
    const field = screen.getAllByRole('textbox')[0];
    fireEvent.change(field, { target: { value: 'E' } });
    fireEvent.change(field, { target: { value: '' } });
    cancel();
    expect(window.confirm).not.toHaveBeenCalled();
  });
});
