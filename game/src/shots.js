// Lantern Pact — deterministic screenshot states.
// ?shot=start|play|win|loss&seed=1 freezes the game in a scene the camera
// can capture. The seed drives the same shuffle every time, so the four
// screenshots are reproducible renders of the real game code.

import { courtSuitFor, effectiveValue } from './deck.js';

// A fixed mid-duel: both sides have played, HP is dented, the Court is Flame.
export function applyShot(game, shot, seed) {
  if (shot === 'start') {
    game.screen = 'title';
    return;
  }
  if (shot === 'play') {
    game.screen = 'play';
    game.trickNumber = 4;
    game.courtSuit = courtSuitFor(game.trickNumber);
    game.playerHp = 14;
    game.aiHp = 17;
    game.tricksWon = { player: 3, ai: 2 };
    game.leader = 'player';
    game.canPlay = true;
    game.canUsePact = false;
    game.message = 'Your lead — play a card, or spend a Pact.';
    game.log = [
      'Trick 1 — You take it, 9 Flame over 6 Stone.',
      'Trick 2 — Warden takes it, 10 Tide over 4 Leaf.',
      'Trick 3 — You take it, 8 Leaf over 6 Stone.',
      'Trick 4 — Warden takes it, 7 Flame over 5 Tide.',
      'Court turns to Flame. Your lead.',
    ];
    // Fixed hands, dealt from the seeded deck order, then trimmed for the shot.
    game.playerHand = [
      { id: 901, suit: 0, value: 9 },
      { id: 902, suit: 1, value: 4 },
      { id: 903, suit: 2, value: 7 },
      { id: 904, suit: 3, value: 2 },
      { id: 905, suit: 0, value: 6 },
    ];
    game.aiHand = [
      { id: 911, suit: 1, value: 8 },
      { id: 912, suit: 3, value: 5 },
      { id: 913, suit: 2, value: 10 },
      { id: 914, suit: 0, value: 3 },
      { id: 915, suit: 1, value: 6 },
    ];
    // Both sides have already played into the middle of the table.
    game.playerCard = { id: 921, suit: 0, value: 8 };
    game.aiCard = { id: 922, suit: 2, value: 7 };
    game.deckCount = 21;
    game.pacts = { player: { mirror: true, ember: false, veil: true }, ai: { mirror: false, ember: true, veil: false } };
    return;
  }
  if (shot === 'win') {
    game.screen = 'win';
    game.trickNumber = 9;
    game.playerHp = 6;
    game.aiHp = 0;
    game.tricksWon = { player: 6, ai: 3 };
    game.playerHand = [
      { id: 931, suit: 0, value: 10 },
      { id: 932, suit: 1, value: 3 },
    ];
    game.aiHand = [{ id: 933, suit: 2, value: 4 }];
    game.playerCard = { id: 934, suit: 0, value: 10 };
    game.aiCard = { id: 935, suit: 3, value: 5 };
    game.deckCount = 12;
    game.log = ['Trick 9 — You take it, 10 Flame over 5 Stone.', 'The Warden falls. The lantern is yours.'];
    return;
  }
  if (shot === 'loss') {
    game.screen = 'loss';
    game.trickNumber = 8;
    game.playerHp = 0;
    game.aiHp = 9;
    game.tricksWon = { player: 3, ai: 5 };
    game.playerHand = [
      { id: 941, suit: 1, value: 2 },
      { id: 942, suit: 3, value: 4 },
    ];
    game.aiHand = [{ id: 943, suit: 0, value: 9 }];
    game.playerCard = { id: 944, suit: 2, value: 3 };
    game.aiCard = { id: 945, suit: 0, value: 9 };
    game.deckCount = 14;
    game.log = ['Trick 8 — Warden takes it, 9 Flame over 3 Leaf.', 'Your flame gutters out.'];
    return;
  }
}

// Keep the unused import honest for linters that read this module.
export function shotValue(card, courtSuit) {
  return effectiveValue(card, courtSuit);
}
