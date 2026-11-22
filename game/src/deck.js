// Lantern Pact — the deck, the Court suit and trick maths.
// A card is { id, suit, value }. Pact cards are not in the deck:
// they live in each side's pact pouch (see main.js).

import { COURT_BONUS, DECK_VALUES, SUITS, mulberry32 } from './config.js';

let nextId = 1;

export function makeCard(suit, value) {
  return { id: nextId++, suit, value };
}

export function buildDeck() {
  const deck = [];
  for (let suit = 0; suit < SUITS.length; suit++) {
    for (let value = 1; value <= DECK_VALUES; value++) {
      deck.push(makeCard(suit, value));
    }
  }
  return deck;
}

// Fisher-Yates with a seeded RNG, so a fixed seed deals a fixed game.
export function shuffle(deck, seed) {
  const rng = mulberry32(seed);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = deck[i];
    deck[i] = deck[j];
    deck[j] = tmp;
  }
  return deck;
}

// The Court suit rotates every trick: Flame, Tide, Leaf, Stone, Flame...
export function courtSuitFor(trickNumber) {
  return trickNumber % SUITS.length;
}

// A card's fighting value in this trick: +2 while its suit holds the Court.
export function effectiveValue(card, courtSuit) {
  if (!card) return 0;
  return card.value + (card.suit === courtSuit ? COURT_BONUS : 0);
}

// Compare two played cards. Returns 'player', 'ai' or 'tie'.
export function trickWinner(playerCard, aiCard, courtSuit) {
  const p = effectiveValue(playerCard, courtSuit);
  const a = effectiveValue(aiCard, courtSuit);
  if (p > a) return 'player';
  if (a > p) return 'ai';
  return 'tie';
}

// Damage the trick loser takes: the gap between the two values, at least 1
// when a card actually wins (a tie deals nothing).
export function trickDamage(playerCard, aiCard, courtSuit) {
  const p = effectiveValue(playerCard, courtSuit);
  const a = effectiveValue(aiCard, courtSuit);
  return Math.abs(p - a);
}

export function suitName(suit) {
  return SUITS[suit].name;
}
