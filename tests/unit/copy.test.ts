import { describe, expect, it } from 'vitest';
import { copyFor } from '../../src/lib/copy';
import { LANGS } from '../../src/lib/routes';

describe('copy', () => {
  it('loads each language’s own file', () => {
    for (const lang of LANGS) expect(copyFor(lang).lang).toBe(lang);
  });

  it('has a title and description for every core page in every language', () => {
    for (const lang of LANGS) {
      for (const page of Object.values(copyFor(lang).pages)) {
        expect(page.meta.title.length).toBeGreaterThan(0);
        expect(page.meta.description.length).toBeGreaterThan(0);
      }
    }
  });
});
