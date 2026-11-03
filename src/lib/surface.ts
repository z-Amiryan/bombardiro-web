// The three page surfaces from the design (Night, Lime, Chalk).
export type Surface = 'night' | 'lime' | 'chalk';

/** theme-color per surface (DESIGN-NOTES.md). The same values as --c-night, --c-lime and --c-chalk. */
export const THEME_COLOR: Record<Surface, string> = {
  night: '#101418',
  lime: '#BFF747',
  chalk: '#EEF2E9',
};
