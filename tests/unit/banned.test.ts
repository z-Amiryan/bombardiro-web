import { describe, expect, it } from 'vitest';
import { findBanned } from '../../scripts/lib/banned.mjs';

describe('findBanned', () => {
  it('allows the independence denials, never the claim', () => {
    expect(findBanned("It isn't affiliated with or endorsed by any club, player, league or federation.")).toBeNull();
    expect(findBanned("Bombardiro isn't affiliated with, endorsed by or sponsored by any club.")).toBeNull();
    expect(findBanned('Bombardiro is endorsed by top clubs.')).toBe('endorsed');
  });

  it('catches claims in all three scripts, at the start of a sentence too', () => {
    expect(findBanned('Official app.')).toBe('Official');
    expect(findBanned('Официальная игра.')).toBe('Официальн');
    expect(findBanned('Պաշտոնական խաղ է։')).toBe('Պաշտոնական');
    expect(findBanned('Երեխաների համար է։')).toBe('Երեխաների համար');
  });

  it('leaves ordinary words alone', () => {
    expect(findBanned('Кто лучший бомбардир?')).toBeNull();
    expect(findBanned('The best-known players.')).toBeNull();
  });
});
