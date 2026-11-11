import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import i18n from '@/i18n/index';
import MediaCarousel from '@/components/MediaCarousel';
import { Media, MediaType } from '@/types';

function image(n: number): Media {
  return {
    id: `m${n}`,
    postId: null,
    type: MediaType.IMAGE,
    filename: null,
    originalName: null,
    mimeType: null,
    size: null,
    url: `/img/${n}.jpg`,
    altText: `Image ${n}`,
    altTextEn: `Image ${n}`,
    altTextPl: `Obraz ${n}`,
    displayOrder: n,
    videoUrl: null,
    createdAt: '2026-01-01T00:00:00Z',
  };
}

describe('MediaCarousel', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('en');
  });
  afterEach(cleanup);

  it('keeps rendering when the media list shrinks below the current slide', () => {
    const { rerender } = render(<MediaCarousel media={[image(1), image(2), image(3)]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 3' }));

    expect(() => rerender(<MediaCarousel media={[image(1)]} />)).not.toThrow();
    expect(screen.getByAltText('Image 1')).toBeTruthy();
  });

  it('shows the last remaining slide after the list shrinks to two items', () => {
    const { rerender } = render(<MediaCarousel media={[image(1), image(2), image(3)]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 3' }));
    rerender(<MediaCarousel media={[image(1), image(2)]} />);

    expect(screen.getAllByAltText('Image 2').length).toBeGreaterThan(0);
  });

  it('labels the controls in the active language', async () => {
    await i18n.changeLanguage('pl');
    render(<MediaCarousel media={[image(1), image(2)]} />);

    expect(screen.getByRole('button', { name: 'Przejdź do slajdu 2' })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Poprzedni' }).length).toBe(1);
    await i18n.changeLanguage('en');
  });
});
