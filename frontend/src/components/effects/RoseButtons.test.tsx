import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import i18n from '@/i18n/index';
import EnchantButton from '@/components/effects/EnchantButton';
import MakePrettierButton from '@/components/effects/MakePrettierButton';

vi.mock('@/contexts/ThemeContext', () => ({ useTheme: () => ({ theme: 'rose' }) }));

describe('Rose effect buttons', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('en');
  });
  afterEach(async () => {
    cleanup();
    await i18n.changeLanguage('en');
  });

  it.each([
    ['en', 'Enchant', 'Make it prettier'],
    ['pl', 'Zaczaruj', 'Upiększ to'],
  ])('names the buttons by their visible %s text (WCAG 2.5.3)', async (language, enchant, prettier) => {
    await i18n.changeLanguage(language);
    render(
      <>
        <EnchantButton />
        <MakePrettierButton />
      </>
    );

    expect(screen.getByRole('button', { name: enchant })).toBeTruthy();
    expect(screen.getByRole('button', { name: prettier })).toBeTruthy();
  });
});
