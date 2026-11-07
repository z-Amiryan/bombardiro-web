// The lime word wall: tap a word to score it (both copies of a drifting row stay in step), a goal counter
// announced politely, a Pause control (WCAG 2.2.2), and rows paused while off screen.

for (const wall of document.querySelectorAll<HTMLElement>('[data-wall]')) {
  const count = wall.querySelector<HTMLElement>('[data-count]');
  const label = wall.querySelector<HTMLElement>('[data-count-label]');
  const pause = wall.querySelector<HTMLButtonElement>('[data-pause]');
  const plurals = JSON.parse(wall.querySelector('[data-plurals]')?.textContent ?? '{}') as Record<string, string>;
  const rules = new Intl.PluralRules(document.documentElement.lang);
  const scored = new Set<string>();

  wall.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button[data-key]');
    if (!button) return;
    const key = button.dataset.key ?? '';
    const on = !scored.has(key);
    if (on) scored.add(key);
    else scored.delete(key);
    for (const b of wall.querySelectorAll<HTMLButtonElement>(`button[data-key="${CSS.escape(key)}"]`)) {
      b.setAttribute('aria-pressed', String(on));
    }
    if (count) count.textContent = String(scored.size).padStart(2, '0');
    if (label) label.textContent = plurals[rules.select(scored.size)] ?? plurals.other ?? '';
  });

  pause?.addEventListener('click', () => {
    const paused = !wall.hasAttribute('data-paused');
    wall.toggleAttribute('data-paused', paused);
    pause.textContent = (paused ? pause.dataset.labelPlay : pause.dataset.labelPause) ?? '';
  });

  new IntersectionObserver(([entry]) => {
    wall.toggleAttribute('data-offscreen', !entry?.isIntersecting);
  }).observe(wall);
}
