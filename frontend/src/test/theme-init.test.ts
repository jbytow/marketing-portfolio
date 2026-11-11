import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// The inline script in index.html must apply the saved theme before React mounts, so neither
// Rose nor Dark users see the other theme flash on a full page load.
function runThemeInit() {
  const html = readFileSync(resolve(__dirname, '../../index.html'), 'utf8');
  const match = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!match) throw new Error('index.html has no inline theme script');
  document.documentElement.removeAttribute('data-theme');
  new Function(match[1])();
  return document.documentElement.getAttribute('data-theme');
}

describe('theme bootstrap in index.html', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('paints Rose for a first-time visitor', () => {
    expect(runThemeInit()).toBe('rose');
  });

  it('paints Rose for a visitor who chose Rose', () => {
    localStorage.setItem('theme', 'rose');
    expect(runThemeInit()).toBe('rose');
  });

  it('leaves the Dark theme (no data-theme attribute) for a visitor who chose Dark', () => {
    localStorage.setItem('theme', 'dark');
    expect(runThemeInit()).toBeNull();
  });

  it('falls back to Rose for an unknown stored value', () => {
    localStorage.setItem('theme', 'light');
    expect(runThemeInit()).toBe('rose');
  });
});
