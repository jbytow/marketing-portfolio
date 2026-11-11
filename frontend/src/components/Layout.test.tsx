import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import Layout from './Layout';

// Header, footer and the rose effects are irrelevant to scroll handling and need their own providers
vi.mock('./Header', () => ({ default: () => null }));
vi.mock('./Footer', () => ({ default: () => null }));
vi.mock('./effects/FairyDust', () => ({ default: () => null }));
vi.mock('./effects/RoseBloom', () => ({ default: () => null }));
vi.mock('./effects/RoseExplosion', () => ({ default: () => null }));
vi.mock('./effects/EnchantButton', () => ({ default: () => null }));
vi.mock('./effects/IdleFairy', () => ({ default: () => null }));
vi.mock('./effects/MagicCursor', () => ({ default: () => null }));
vi.mock('./effects/CursorSpell', () => ({ default: () => null }));
vi.mock('./effects/CursorCardTilt', () => ({ default: () => null }));
vi.mock('./effects/MidnightRose', () => ({ default: () => null }));
vi.mock('./effects/TinyFairyPeek', () => ({ default: () => null }));
vi.mock('./effects/MakePrettierButton', () => ({ default: () => null }));
vi.mock('./effects/RoseForceMotion', () => ({ default: () => null }));
vi.mock('@/lib/useSiteSettings', () => ({ useSiteSettings: () => ({ data: undefined }) }));

let navigate: ReturnType<typeof useNavigate>;
function Page() {
  navigate = useNavigate();
  return <p>page</p>;
}

function renderLayout(initialEntry = '/list') {
  return render(
    <MemoryRouter initialEntries={['/start', initialEntry]} initialIndex={1}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="*" element={<Page />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('Layout scroll handling', () => {
  const scrollTo = vi.fn();

  beforeEach(() => {
    window.scrollTo = scrollTo;
  });
  afterEach(() => {
    cleanup();
    scrollTo.mockReset();
  });

  it('does not scroll on the first render', () => {
    renderLayout();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('scrolls to the top once when navigating to another path', () => {
    renderLayout();
    act(() => navigate('/detail'));

    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
  });

  it('scrolls to the top when a path is replaced', () => {
    renderLayout();
    act(() => navigate('/detail', { replace: true }));
    expect(scrollTo).toHaveBeenCalledTimes(1);
  });

  it('leaves the position alone on back and forward', () => {
    renderLayout();
    act(() => navigate('/detail'));
    scrollTo.mockClear();

    act(() => navigate(-1));
    expect(screen.getByText('page')).toBeTruthy();
    expect(scrollTo).not.toHaveBeenCalled();

    act(() => navigate(1));
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('keeps the position when only the search params change', () => {
    renderLayout();
    act(() => navigate('/list?hashtag=seo'));
    act(() => navigate('/list?hashtag=ads'));
    act(() => navigate('/list', { replace: true }));

    expect(scrollTo).not.toHaveBeenCalled();
  });
});
