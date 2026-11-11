import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Visitors' IPs must not go to Google Fonts: the four families are served from the app's own assets
const read = (relative: string) => readFileSync(resolve(__dirname, '../..', relative), 'utf8');
const html = read('index.html');
const indexCss = read('src/styles/index.css');
const fontsCss = read('src/styles/fonts.css');

interface Face {
  family: string;
  weight: string;
  display: string;
  src: string;
  range: string;
}

const faces: Face[] = Array.from(fontsCss.matchAll(/@font-face\s*\{([^}]*)\}/g), ([, body]) => {
  const get = (property: string) => body.match(new RegExp(`${property}: *([^;]+);`))?.[1].trim() ?? '';
  return {
    family: get('font-family').replace(/['"]/g, ''),
    weight: get('font-weight'),
    display: get('font-display'),
    src: body.match(/url\(['"]?([^'")]+)['"]?\)/)?.[1] ?? '',
    range: get('unicode-range'),
  };
});

const facesOf = (family: string) => faces.filter((face) => face.family === family);

describe('index.html', () => {
  it('does not load anything from Google Fonts', () => {
    expect(html).not.toMatch(/fonts\.googleapis|fonts\.gstatic/);
    expect(html).not.toMatch(/rel="preconnect"/);
  });
});

describe('fonts.css', () => {
  it('is imported by index.css before the Tailwind layers', () => {
    const importAt = indexCss.search(/@import\s+['"]\.\/fonts\.css['"]/);
    expect(importAt).toBeGreaterThanOrEqual(0);
    expect(importAt).toBeLessThan(indexCss.indexOf('@tailwind base'));
  });

  it('declares only local WOFF2 files that exist', () => {
    expect(fontsCss).not.toMatch(/https?:\/\//);
    expect(faces.length).toBeGreaterThan(0);
    for (const face of faces) {
      const file = resolve(__dirname, '../styles', face.src);
      expect(existsSync(file), face.src).toBe(true);
      expect(readFileSync(file).subarray(0, 4).toString('latin1'), face.src).toBe('wOF2');
    }
  });

  it('uses font-display swap and a unicode-range on every face', () => {
    for (const face of faces) {
      expect(face.display, face.src).toBe('swap');
      expect(face.range, face.src).toMatch(/^U\+/);
    }
  });

  it('declares Poppins 400-800 in latin and latin-ext', () => {
    const poppins = facesOf('Poppins');
    for (const weight of ['400', '500', '600', '700', '800']) {
      expect(poppins.filter((face) => face.weight === weight), weight).toHaveLength(2);
    }
  });

  it('declares Inter as a variable range covering 300-700 in latin and latin-ext', () => {
    const inter = facesOf('Inter');
    expect(inter).toHaveLength(2);
    for (const face of inter) expect(face.weight).toBe('300 700');
  });

  it('declares Henny Penny and Eagle Lake at weight 400', () => {
    expect(facesOf('Henny Penny').map((face) => face.weight)).toEqual(['400']);
    const eagleLake = facesOf('Eagle Lake');
    expect(eagleLake.length).toBeGreaterThan(0);
    for (const face of eagleLake) expect(face.weight).toBe('400');
  });

  it('keeps the display font fallback chain in index.css', () => {
    expect(indexCss).toContain("'Henny Penny', 'Eagle Lake', 'Poppins'");
  });
});

describe('font licences', () => {
  it('names all four families and the SIL Open Font License', () => {
    const licences = read('src/assets/fonts/LICENSES.md');
    for (const family of ['Inter', 'Poppins', 'Henny Penny', 'Eagle Lake']) expect(licences).toContain(family);
    expect(licences).toContain('SIL Open Font License');
  });
});
