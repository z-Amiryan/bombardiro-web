// The lime word wall: tap a word to score it (both copies of a drifting row stay in step), a goal counter
// announced politely, a Pause control (WCAG 2.2.2), and rows paused while off screen.

for (const wall of document.querySelectorAll<HTMLElement>('[data-wall]')) {
  const count = wall.querySelector<HTMLElement>('[data-count]');
  const label = wall.querySelector<HTMLElement>('[data-count-label]');
  const pause = wall.querySelector<HTMLButtonElement>('[data-pause]');
  const plurals = JSON.parse(wall.querySelector('[data-plurals]')?.textContent ?? '{}') as Record<string, string>;
  const rules = new Intl.PluralRules(document.documentElement.lang);
  const scored = new Set<string>();

  // The words in the visible copy of each row become toggle buttons; the drifting duplicate stays hidden and
  // only mirrors the scored look (data-scored).
  for (const w of wall.querySelectorAll<HTMLElement>('.word[data-key]')) {
    if (w.closest('[aria-hidden="true"]')) continue;
    w.setAttribute('role', 'button');
    w.setAttribute('aria-pressed', 'false');
    w.tabIndex = 0;
  }

  const toggle = (word: HTMLElement) => {
    const key = word.dataset.key ?? '';
    const on = !scored.has(key);
    if (on) scored.add(key);
    else scored.delete(key);
    for (const w of wall.querySelectorAll<HTMLElement>(`.word[data-key="${CSS.escape(key)}"]`)) {
      w.toggleAttribute('data-scored', on);
      if (w.hasAttribute('role')) w.setAttribute('aria-pressed', String(on));
    }
    if (count) count.textContent = String(scored.size).padStart(2, '0');
    if (label) label.textContent = plurals[rules.select(scored.size)] ?? plurals.other ?? '';
  };

  wall.addEventListener('click', (event) => {
    const word = (event.target as Element).closest<HTMLElement>('.word[data-key]');
    if (word) toggle(word);
  });

  wall.addEventListener('keydown', (event) => {
    const word = (event.target as Element).closest<HTMLElement>('.word[role="button"]');
    if (!word || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    toggle(word);
  });

  // A row stands still while keyboard focus is in it, and scrolls natively to the focused word. A tap or click
  // also focuses the word, but isn't :focus-visible, so the row keeps drifting under the pointer.
  wall.addEventListener('focusin', (e) => {
    const word = e.target as HTMLElement;
    const row = word.closest('.row');
    if (!row || !word.matches(':focus-visible')) return;
    row.setAttribute('data-focus', '');
    // The row only becomes scrollable now, after the browser's own focus scrolling, so bring the word in.
    word.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
  });
  wall.addEventListener('focusout', (e) => {
    const row = (e.target as Element).closest<HTMLElement>('.row');
    if (!row || row.contains(e.relatedTarget as Node | null)) return;
    row.removeAttribute('data-focus');
    // Back to the loop's start, where the drift picks up again.
    row.scrollLeft = 0;
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
