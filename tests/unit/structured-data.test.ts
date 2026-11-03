import { describe, expect, it } from 'vitest';
import { APP_STORE_URL, INSTAGRAM_URL, TIKTOK_URL } from '../../src/config/site';
import { LANGS } from '../../src/lib/routes';
import { app, breadcrumbs, graph, organization, website } from '../../src/lib/structured-data';

describe('structured data', () => {
  it('describes the organisation with its logo, email and socials', () => {
    const org = organization('en');
    expect(org).toMatchObject({ '@type': 'Organization', name: 'Bombardiro', url: 'https://bombardiro.app/', email: 'bombardiro.dev@gmail.com' });
    expect(org.sameAs).toEqual([INSTAGRAM_URL, TIKTOK_URL]);
  });

  it('leaves Instagram out on Russian pages', () => {
    expect(organization('ru').sameAs).toEqual([TIKTOK_URL]);
  });

  it('describes the app as the spec asks, in every language', () => {
    for (const lang of LANGS) {
      expect(app(lang)).toMatchObject({
        '@type': ['VideoGame', 'MobileApplication'],
        operatingSystem: 'iOS',
        applicationCategory: 'GameApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        inLanguage: ['en', 'ru', 'hy'],
        installUrl: APP_STORE_URL,
      });
    }
  });

  it('never claims a rating or review', () => {
    const json = graph([organization('en'), website('en'), app('en')]);
    expect(json).not.toMatch(/aggregateRating|"review"|FAQPage/);
  });

  it('numbers breadcrumb items from 1 with absolute URLs', () => {
    expect(breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Words', path: '/words/' }])).toEqual({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bombardiro.app/' },
        { '@type': 'ListItem', position: 2, name: 'Words', item: 'https://bombardiro.app/words/' },
      ],
    });
  });

  it('escapes "<" so data can never close the script element', () => {
    expect(graph([{ name: '</script><b>' }])).not.toContain('</script>');
  });
});
