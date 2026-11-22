// Lantern Pact — shared constants and tiny helpers.
// No library, no network: every number the game needs lives here.

export const VIEW_W = 1280;
export const VIEW_H = 800;

export const START_HP = 20;
export const HAND_SIZE = 5;
export const DECK_VALUES = 10; // values 1..10 in each suit
export const COURT_BONUS = 2; // a Court-suit card gains +2 in its trick
export const EMBER_DAMAGE = 3; // Ember Pact: flat damage, no trick

// Suits are told apart by colour AND shape, never by text alone.
export const SUITS = [
  { key: 'flame', name: 'Flame', color: '#e5484d', dark: '#7e1a20', light: '#ff9a86', shape: 'flame' },
  { key: 'tide', name: 'Tide', color: '#3e7bfa', dark: '#1c4c9e', light: '#8dbcff', shape: 'drop' },
  { key: 'leaf', name: 'Leaf', color: '#2fae6e', dark: '#145c39', light: '#7ed6a5', shape: 'leaf' },
  { key: 'stone', name: 'Stone', color: '#8b95a1', dark: '#4b545f', light: '#cdd5de', shape: 'diamond' },
];

export const PACTS = {
  mirror: { key: 'mirror', name: 'Mirror', desc: 'Match the rival card', color: '#c084fc', dark: '#6b21a8' },
  ember: { key: 'ember', name: 'Ember', desc: 'Burn 3 HP at once', color: '#f97316', dark: '#9a3412' },
  veil: { key: 'veil', name: 'Veil', desc: 'Cancel the rival card', color: '#38bdf8', dark: '#075985' },
};

// Deterministic RNG so ?seed=1 screenshots always look the same.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}
