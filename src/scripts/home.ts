// Home: the clock pill, the pinned screen on wide screens, the match clock where CSS scroll timelines aren't
// supported, and the whistle. Runs once; does no work on scroll unless the CSS clock is unavailable.

const home = document.querySelector<HTMLElement>('.home');
const beats = [...document.querySelectorAll<HTMLElement>('.beat')];
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

if (home && beats.length === 4) {
  // While the turn fills the middle of the screen, show the clock pill and the top bar; hide them as soon as
  // the word band reaches the bottom of the screen, where the pill sits.
  const turn = document.getElementById('turn');
  const band = document.querySelector<HTMLElement>('[data-wall]');
  let turnInView = false;
  let bandAtBottom = false;
  const sync = () => home.toggleAttribute('data-in-turn', turnInView && !bandAtBottom);
  if (turn) {
    new IntersectionObserver(
      ([entry]) => {
        turnInView = Boolean(entry?.isIntersecting);
        sync();
      },
      { rootMargin: '-40% 0px -40% 0px' },
    ).observe(turn);
  }
  if (band) {
    new IntersectionObserver(
      ([entry]) => {
        bandAtBottom = Boolean(entry?.isIntersecting);
        sync();
      },
      { rootMargin: '-85% 0px 0px 0px' },
    ).observe(band);
  }

  // Wide screens: the beat crossing the middle of the screen shows its screen in the pinned frame.
  const screens = [...document.querySelectorAll<HTMLElement>('[data-pinned] [data-beat]')];
  const show = (n: number) => {
    for (const s of screens) {
      const beat = Number(s.dataset.beat);
      s.dataset.state = beat === n ? 'on' : beat < n ? 'before' : 'after';
    }
  };
  const beatObserver = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) show(beats.indexOf(e.target as HTMLElement) + 1);
    },
    { rootMargin: '-50% 0px -50% 0px' },
  );
  beats.forEach((b) => beatObserver.observe(b));

  // The match clock, where the CSS scroll timeline can't run it (see components/home/clock.css). Same anchors.
  const cssClock =
    CSS.supports('animation-timeline', '--x') && CSS.supports('timeline-scope', '--x') && CSS.supports('top', 'mod(3px, 2px)');
  if (!cssClock && CSS.supports('top', 'round(1.5px, 1px)') && !reduce.matches) {
    const scopes = [...document.querySelectorAll<HTMLElement>('.clock-scope')];
    const s3 = Number(home.dataset.s3 ?? 7);
    let ranges: Array<[number, number]> = [];
    const measure = () => {
      const vh = innerHeight;
      const box = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return { top: r.top + scrollY, bottom: r.bottom + scrollY };
      };
      const [b1, b2, b3] = beats.slice(0, 3).map(box);
      if (!b1 || !b2 || !b3) return;
      ranges = [
        [b1.top - vh, b1.bottom - vh / 2],
        [b2.top - vh / 2, b2.bottom - vh / 2],
        [b3.top - vh / 2, b3.bottom - vh / 2],
      ];
    };
    const progress = (y: number, [start, end]: [number, number]) => Math.min(1, Math.max(0, (y - start) / (end - start)));
    let last = '';
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = scrollY;
      const [a = 0, b = 0, c = 0] = ranges.map((r) => progress(y, r));
      const t = (60 - 20 * a - (40 - s3) * b - s3 * c).toFixed(3);
      if (t === last) return;
      last = t;
      for (const el of scopes) el.style.setProperty('--t', t);
    };
    home.style.setProperty('--clock-live', '1');
    measure();
    update();
    addEventListener('scroll', () => (frame ||= requestAnimationFrame(update)), { passive: true });
    new ResizeObserver(() => {
      measure();
      update();
    }).observe(document.body);
  }

  // The whistle: off until pressed; blows when the last beat reaches the middle of the screen (00:00).
  const whistle = document.querySelector<HTMLButtonElement>('[data-whistle]');
  let audio: HTMLAudioElement | null = null;
  const label = whistle?.querySelector<HTMLElement>('[data-whistle-label]');
  whistle?.addEventListener('click', () => {
    const on = !whistle.hasAttribute('data-on');
    whistle.toggleAttribute('data-on', on);
    if (label) label.textContent = (on ? whistle.dataset.labelOn : whistle.dataset.labelOff) ?? '';
    if (on && !audio && whistle.dataset.src) {
      audio = new Audio(whistle.dataset.src);
      audio.preload = 'auto';
      // Safari lets an element play with sound later only if it first played inside a tap: start it muted
      // here, then rewind and unmute.
      const unlocking = audio;
      unlocking.muted = true;
      unlocking
        .play()
        .then(() => {
          unlocking.pause();
          unlocking.currentTime = 0;
          unlocking.muted = false;
        })
        .catch(() => undefined);
    }
  });
  const last = beats[3];
  if (last) {
    new IntersectionObserver(
      ([entry]) => {
        // Entering from below means the clock just ran out.
        if (entry?.isIntersecting && entry.boundingClientRect.top > 0 && whistle?.hasAttribute('data-on')) {
          audio?.play().catch(() => undefined);
        }
      },
      { rootMargin: '0px 0px -50% 0px' },
    ).observe(last);
  }
}
