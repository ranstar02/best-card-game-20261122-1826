// Lantern Pact — the game itself: state, turns, tricks and Pacts.
// One duel: 20 HP each, five-card hands, a rotating Court suit, three
// once-a-game Pacts. The Warden answers every play with a readable heuristic.

import { HAND_SIZE, START_HP } from './config.js';
import { aiChooseFollow, aiChooseLead, aiWantsEmber, aiWantsVeil } from './ai.js';
import { buildDeck, courtSuitFor, effectiveValue, shuffle, trickDamage, trickWinner } from './deck.js';
import { createAudio } from './audio.js';
import { createInput } from './input.js';
import { render } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);
const audio = createAudio();
const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') || '1') || 1;
const shot = params.get('shot');
const shotMode = shot === 'start' || shot === 'play' || shot === 'win' || shot === 'loss';

export const game = {
  screen: 'title',
  playerHp: START_HP,
  aiHp: START_HP,
  playerHand: [],
  aiHand: [],
  deck: [],
  discard: [],
  deckCount: 0,
  courtSuit: 0,
  trickNumber: 0,
  tricksWon: { player: 0, ai: 0 },
  leader: 'player',
  playerCard: null,
  aiCard: null,
  phase: 'lead', // lead | follow | resolve | over
  pacts: { player: { mirror: true, ember: true, veil: true }, ai: { mirror: false, ember: true, veil: true } },
  log: [],
  message: 'Light the lantern to begin.',
  flash: null,
  canPlay: false,
  canUsePact: false,
  hoverCard: null,
  muted: false,
  busy: false, // true while the Warden is "thinking" (a short timer)
};

function say(line) {
  game.log.push(line);
  if (game.log.length > 40) game.log.shift();
}

function drawUp(hand) {
  while (hand.length < HAND_SIZE && game.deck.length > 0) {
    hand.push(game.deck.pop());
  }
  if (game.deck.length === 0 && game.discard.length > 0) {
    game.deck = shuffle(game.discard.splice(0), seed + game.trickNumber);
    drawUp(hand);
  }
  game.deckCount = game.deck.length;
}

function newGame() {
  game.deck = shuffle(buildDeck(), seed);
  game.discard = [];
  game.playerHp = START_HP;
  game.aiHp = START_HP;
  game.playerHand = [];
  game.aiHand = [];
  game.trickNumber = 0;
  game.courtSuit = courtSuitFor(0);
  game.tricksWon = { player: 0, ai: 0 };
  game.leader = 'player';
  game.playerCard = null;
  game.aiCard = null;
  game.phase = 'lead';
  game.pacts = { player: { mirror: true, ember: true, veil: true }, ai: { mirror: false, ember: true, veil: true } };
  game.log = ['The lanterns are lit. You lead the first trick.'];
  game.flash = null;
  game.busy = false;
  drawUp(game.playerHand);
  drawUp(game.aiHand);
  game.screen = 'play';
  game.canPlay = true;
  game.canUsePact = true;
  game.message = 'Your lead — play a card, or spend a Pact.';
  audio.deal();
}

function endIfDead() {
  if (game.aiHp <= 0) {
    game.screen = 'win';
    game.phase = 'over';
    game.canPlay = false;
    game.canUsePact = false;
    game.message = 'The lantern is yours.';
    audio.win();
    return true;
  }
  if (game.playerHp <= 0) {
    game.screen = 'loss';
    game.phase = 'over';
    game.canPlay = false;
    game.canUsePact = false;
    game.message = 'The flame goes out.';
    audio.lose();
    return true;
  }
  return false;
}

function afterTrick() {
  game.discard.push(game.playerCard, game.aiCard);
  game.playerCard = null;
  game.aiCard = null;
  game.trickNumber += 1;
  game.courtSuit = courtSuitFor(game.trickNumber);
  drawUp(game.playerHand);
  drawUp(game.aiHand);
  if (endIfDead()) return;
  game.phase = 'lead';
  game.canPlay = game.leader === 'player';
  game.canUsePact = game.leader === 'player';
  game.flash = null;
  if (game.leader === 'player') {
    game.message = 'Your lead — play a card, or spend a Pact.';
  } else {
    game.message = 'The Warden leads…';
    game.busy = true;
    setTimeout(aiLead, 700);
  }
}

function resolveTrick() {
  game.phase = 'resolve';
  game.canPlay = false;
  game.canUsePact = false;
  const winner = trickWinner(game.playerCard, game.aiCard, game.courtSuit);
  const dmg = trickDamage(game.playerCard, game.aiCard, game.courtSuit);
  const pEff = effectiveValue(game.playerCard, game.courtSuit);
  const aEff = effectiveValue(game.aiCard, game.courtSuit);
  if (winner === 'player') {
    game.aiHp -= dmg;
    game.tricksWon.player += 1;
    game.leader = 'player';
    game.flash = 'player';
    say(`Trick ${game.trickNumber + 1} — You take it, ${pEff} over ${aEff} (−${dmg} HP).`);
    audio.trickWin();
  } else if (winner === 'ai') {
    game.playerHp -= dmg;
    game.tricksWon.ai += 1;
    game.leader = 'ai';
    game.flash = 'ai';
    say(`Trick ${game.trickNumber + 1} — Warden takes it, ${aEff} over ${pEff} (−${dmg} HP).`);
    audio.trickLose();
  } else {
    game.flash = 'tie';
    say(`Trick ${game.trickNumber + 1} — Tied at ${pEff}. No damage.`);
    audio.click();
  }
  setTimeout(afterTrick, 1400);
}

// The Warden leads a trick.
function aiLead() {
  if (game.screen !== 'play' || game.phase !== 'lead' || game.leader !== 'ai') return;
  game.busy = false;
  // Ember first, when it is hurting.
  if (game.pacts.ai.ember && aiWantsEmber(game.aiHp, game.playerHp)) {
    game.pacts.ai.ember = false;
    game.playerHp -= 3;
    say('The Warden burns an Ember Pact — 3 damage, no trick.');
    audio.pact();
    if (endIfDead()) return;
    game.leader = 'player';
    game.phase = 'lead';
    game.canPlay = true;
    game.canUsePact = true;
    game.message = 'Your lead — play a card, or spend a Pact.';
    return;
  }
  const card = aiChooseLead(game.aiHand, game.courtSuit);
  game.aiHand = game.aiHand.filter((c) => c.id !== card.id);
  game.aiCard = card;
  game.phase = 'follow';
  game.canPlay = true;
  game.canUsePact = true;
  game.message = `The Warden leads ${card.value} ${['Flame', 'Tide', 'Leaf', 'Stone'][card.suit]} — answer it.`;
  audio.playCard();
}

// The Warden answers the player's lead.
function aiFollow() {
  if (game.screen !== 'play' || game.phase !== 'follow' || game.leader !== 'player') return;
  game.busy = false;
  // Veil a lead it cannot beat when the hit would be heavy.
  if (game.pacts.ai.veil && aiWantsVeil(game.playerCard, game.aiHand, game.courtSuit)) {
    game.pacts.ai.veil = false;
    say('The Warden veils your card — the trick dissolves, no damage.');
    audio.pact();
    game.discard.push(game.playerCard);
    game.playerCard = null;
    game.aiCard = null;
    game.trickNumber += 1;
    game.courtSuit = courtSuitFor(game.trickNumber);
    drawUp(game.playerHand);
    drawUp(game.aiHand);
    game.phase = 'lead';
    game.leader = 'ai';
    game.canPlay = false;
    game.canUsePact = false;
    game.message = 'The Warden leads…';
    game.busy = true;
    setTimeout(aiLead, 700);
    return;
  }
  const card = aiChooseFollow(game.aiHand, game.playerCard, game.courtSuit);
  game.aiHand = game.aiHand.filter((c) => c.id !== card.id);
  game.aiCard = card;
  audio.playCard();
  resolveTrick();
}

function playCard(cardId) {
  if (!game.canPlay || game.busy) return;
  const card = game.playerHand.find((c) => c.id === cardId);
  if (!card) return;
  game.playerHand = game.playerHand.filter((c) => c.id !== cardId);
  game.playerCard = card;
  audio.playCard();
  if (game.phase === 'lead') {
    game.phase = 'follow';
    game.canPlay = false;
    game.canUsePact = false;
    game.message = 'The Warden answers…';
    game.busy = true;
    setTimeout(aiFollow, 700);
  } else if (game.phase === 'follow') {
    resolveTrick();
  }
}

// Mirror: answer the Warden's lead with a card of equal value — a tie.
// Veil: cancel the Warden's lead outright — the trick dissolves.
// Ember: 3 damage at once, on your lead, no trick played.
function usePact(key) {
  if (!game.canUsePact || game.busy || !game.pacts.player[key]) return;
  if (key === 'ember') {
    if (game.phase !== 'lead') {
      game.message = 'Ember burns on your lead — play it before the trick opens.';
      return;
    }
    game.pacts.player.ember = false;
    game.aiHp -= 3;
    say('You burn an Ember Pact — 3 damage, no trick.');
    audio.pact();
    if (endIfDead()) return;
    game.leader = 'ai';
    game.phase = 'lead';
    game.canPlay = false;
    game.canUsePact = false;
    game.message = 'The Warden leads…';
    game.busy = true;
    setTimeout(aiLead, 700);
    return;
  }
  if (game.phase !== 'follow' || !game.aiCard) {
    game.message = 'Mirror and Veil answer a card — wait for the Warden to lead.';
    return;
  }
  if (key === 'mirror') {
    game.pacts.player.mirror = false;
    // A mirror card is played into the trick with the Warden's own value.
    game.playerCard = { id: 10000 + game.trickNumber, suit: game.aiCard.suit, value: game.aiCard.value, mirror: true };
    say('You raise the Mirror Pact — your card matches the Warden’s.');
    audio.pact();
    resolveTrick();
    return;
  }
  if (key === 'veil') {
    game.pacts.player.veil = false;
    say('You veil the Warden’s card — the trick dissolves, no damage.');
    audio.pact();
    game.discard.push(game.aiCard);
    game.aiCard = null;
    game.playerCard = null;
    game.trickNumber += 1;
    game.courtSuit = courtSuitFor(game.trickNumber);
    drawUp(game.playerHand);
    drawUp(game.aiHand);
    game.phase = 'lead';
    game.leader = 'player';
    game.canPlay = true;
    game.canUsePact = true;
    game.message = 'Your lead — play a card, or spend a Pact.';
  }
}

input.onClick((id, data) => {
  audio.unlock();
  if (id === 'start' || id === 'restart') {
    audio.click();
    newGame();
    return;
  }
  if (id === 'mute') {
    game.muted = audio.toggleMute();
    return;
  }
  if (id === 'card' && data) {
    playCard(data.cardId);
    return;
  }
  if (id === 'pact' && data) {
    usePact(data.pact);
  }
});

input.onKey((key) => {
  audio.unlock();
  if (key === 'Enter' && game.screen === 'title') {
    newGame();
    return;
  }
  if (key === 'm' || key === 'M') {
    game.muted = audio.toggleMute();
    return;
  }
  if (key === 'r' || key === 'R') {
    if (game.screen !== 'title') newGame();
    return;
  }
  const n = Number(key);
  if (n >= 1 && n <= game.playerHand.length) {
    playCard(game.playerHand[n - 1].id);
  }
});

// Hover glow follows the mouse over the player's hand.
canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
  const n = game.playerHand.length;
  const startX = 640 - ((n * (112 + 14) - 14) / 2);
  game.hoverCard = null;
  game.playerHand.forEach((card, i) => {
    const cx = startX + i * (112 + 14);
    if (x >= cx && x <= cx + 112 && y >= 620 && y <= 620 + 156) game.hoverCard = card.id;
  });
});

// Boot: a fresh table, or a frozen scene for the camera.
if (shotMode) {
  newGame();
  applyShot(game, shot, seed);
  game.canPlay = shot === 'play';
  game.canUsePact = false;
  game.busy = false;
} else {
  game.screen = 'title';
}

// Test hook: lets an automated play-test read the live state (harmless in play).
window.__lantern = game;

function frame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  render(ctx, input, game);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
