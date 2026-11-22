// Lantern Pact — the Warden's brain.
// A readable heuristic, not a black box: it saves its high cards, answers
// with the cheapest card that still wins, and spends a Pact only when it is
// behind. A player who watches it can count what it has left.

import { COURT_BONUS } from './config.js';
import { effectiveValue } from './deck.js';

function byValue(a, b) {
  return a.value - b.value;
}

// Leading a trick: open low when the hand is weak so the big cards survive,
// open mid when the hand is strong to press the advantage.
export function aiChooseLead(hand, courtSuit) {
  const sorted = [...hand].sort(byValue);
  const boosted = sorted.filter((c) => c.suit === courtSuit);
  const top = sorted[sorted.length - 1];
  // A Court card in hand is worth leading: +2 makes even a middling card bite.
  if (boosted.length > 0 && boosted[0].value + COURT_BONUS >= 7) {
    return boosted[0];
  }
  // Strong hand: lead the second-highest, keep the ace of the hand for later.
  if (top && top.value >= 8 && sorted.length > 1) {
    return sorted[sorted.length - 2];
  }
  // Weak hand: bleed the lowest card and wait for a better trick.
  return sorted[0];
}

// Answering a lead: win as cheaply as possible, otherwise sacrifice the worst.
export function aiChooseFollow(hand, leadCard, courtSuit) {
  const lead = effectiveValue(leadCard, courtSuit);
  const sorted = [...hand].sort(byValue);
  const winners = sorted.filter((c) => effectiveValue(c, courtSuit) > lead);
  if (winners.length > 0) return winners[0]; // cheapest winning card
  return sorted[0]; // cannot win: throw away the lowest card
}

// The Warden burns its Ember when it is hurting and the player is ahead.
export function aiWantsEmber(aiHp, playerHp) {
  return aiHp <= 9 && playerHp > aiHp;
}

// The Warden veils a lead it cannot beat when the lead is a heavy hit.
export function aiWantsVeil(leadCard, hand, courtSuit) {
  const lead = effectiveValue(leadCard, courtSuit);
  const best = hand.reduce((m, c) => Math.max(m, effectiveValue(c, courtSuit)), 0);
  return lead >= 9 && best <= lead;
}
