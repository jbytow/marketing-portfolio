import { describe, expect, it } from 'vitest';
import en from '@/i18n/en.json';
import pl from '@/i18n/pl.json';

type Tree = { [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ''): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>((acc, [key, value]) => {
    if (typeof value === 'string') acc[`${prefix}${key}`] = value;
    else Object.assign(acc, flatten(value, `${prefix}${key}.`));
    return acc;
  }, {});
}

const enFlat = flatten(en as Tree);
const plFlat = flatten(pl as Tree);

const sources = import.meta.glob<string>(['/src/**/*.{ts,tsx}', '!/src/**/*.test.{ts,tsx}'], {
  query: '?raw',
  import: 'default',
  eager: true,
});

// t('a.b'), i18n.t('a.b'), t(`a.${x}`) and labelKey: 'a.b' (nav tables resolved later through t(item.labelKey))
const KEY_PATTERN = /(?:\bt\(\s*|\blabelKey:\s*)(['"`])([^'"`]+?)\1/g;

function usedKeys(): { file: string; key: string }[] {
  return Object.entries(sources).flatMap(([file, code]) =>
    Array.from(code.matchAll(KEY_PATTERN), (match) => ({ file, key: match[2] }))
  );
}

function resolves(key: string): boolean {
  const dynamicAt = key.indexOf('${');
  if (dynamicAt === -1) return key in enFlat;
  const prefix = key.slice(0, dynamicAt);
  return Object.keys(enFlat).some((existing) => existing.startsWith(prefix));
}

// A quoted literal also covers keys picked by a ternary or kept in a nav table, which KEY_PATTERN does not see
function isQuotedIn(code: string, key: string): boolean {
  return ['"', "'", '`'].some((quote) => code.includes(`${quote}${key}${quote}`));
}

// Keys whose consumers land in later audit packages (frontend-P5 AdminLogin, frontend-P7 Rose effects); drop each entry once its t() call exists
const PENDING_CONSUMERS = new Set(['admin.auth.oauthFailed', 'rose.kpiBlessing', 'rose.midnightBanner']);

describe('i18n resources', () => {
  it('en.json and pl.json have identical keys', () => {
    expect(Object.keys(plFlat).sort()).toEqual(Object.keys(enFlat).sort());
  });

  it('has no empty translation', () => {
    const empty = [...Object.entries(enFlat), ...Object.entries(plFlat)]
      .filter(([, value]) => value.trim() === '')
      .map(([key]) => key);
    expect(empty).toEqual([]);
  });

  it('defines every key used in src', () => {
    const used = usedKeys();
    expect(used.length).toBeGreaterThan(50);
    const missing = used.filter(({ key }) => !resolves(key)).map(({ file, key }) => `${file}: ${key}`);
    expect(missing).toEqual([]);
  });

  it('has no key that no source file references', () => {
    const code = Object.values(sources).join('\n');
    const dynamicPrefixes = usedKeys()
      .map(({ key }) => key)
      .filter((key) => key.includes('${'))
      .map((key) => key.slice(0, key.indexOf('${')));
    const unused = Object.keys(enFlat).filter(
      (key) =>
        !PENDING_CONSUMERS.has(key) &&
        !dynamicPrefixes.some((prefix) => key.startsWith(prefix)) &&
        !isQuotedIn(code, key)
    );
    expect(unused).toEqual([]);
  });

  it('does not copy English into Polish for the strings added with the a11y and public-page keys', () => {
    const mustDiffer = Object.keys(enFlat).filter(
      (key) => /^(a11y|errors|notFound|media|theme)\./.test(key) && key !== 'a11y.menu'
    );
    const copied = mustDiffer.filter((key) => plFlat[key] === enFlat[key]);
    expect(copied).toEqual([]);
  });
});
