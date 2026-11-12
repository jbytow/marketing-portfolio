import { describe, expect, it } from 'vitest';
import en from '@/i18n/en.json';
import pl from '@/i18n/pl.json';

type Tree = { [key: string]: string | Tree };

function flattenKeys(tree: Tree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === 'string' ? [`${prefix}${key}`] : flattenKeys(value, `${prefix}${key}.`)
  );
}

describe('test harness', () => {
  it('en.json and pl.json define the same translation keys', () => {
    const enKeys = flattenKeys(en as Tree).sort();
    const plKeys = flattenKeys(pl as Tree).sort();

    expect(enKeys.length).toBeGreaterThan(0);
    expect(plKeys).toEqual(enKeys);
  });
});
