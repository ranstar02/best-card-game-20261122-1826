// Lantern Pact — everything the eye sees, drawn on one canvas.
// Suits are colour AND shape: Flame (red flame), Tide (blue drop),
// Leaf (green leaf), Stone (grey diamond). No text-only suits anywhere.

import { PACTS, SUITS, VIEW_H, VIEW_W } from './config.js';

const CARD_W = 112;
const CARD_H = 156;
const SMALL_W = 84;
const SMALL_H = 118;

// Animated positions: each card id glides toward its target every frame.
const positions = new Map();
function glide(id, tx, ty, speed) {
  const cur = positions.get(id) || { x: tx, y: ty };
  const k = speed == null ? 0.22 : speed;
  cur.x += (tx - cur.x) * k;
  cur.y += (ty - cur.y) * k;
  positions.set(id, cur);
  return cur;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawFlame(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.bezierCurveTo(x + s * 0.85, y - s * 0.25, x + s * 0.55, y + s * 0.55, x, y + s * 0.7);
  ctx.bezierCurveTo(x - s * 0.55, y + s * 0.55, x - s * 0.85, y - s * 0.25, x, y - s);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.25);
  ctx.bezierCurveTo(x + s * 0.35, y + s * 0.1, x + s * 0.2, y + s * 0.45, x, y + s * 0.5);
  ctx.bezierCurveTo(x - s * 0.2, y + s * 0.45, x - s * 0.35, y + s * 0.1, x, y - s * 0.25);
  ctx.fill();
}

function drawDrop(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.bezierCurveTo(x + s * 0.8, y - s * 0.1, x + s * 0.6, y + s * 0.7, x, y + s * 0.7);
  ctx.bezierCurveTo(x - s * 0.6, y + s * 0.7, x - s * 0.8, y - s * 0.1, x, y - s);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.ellipse(x - s * 0.25, y + s * 0.1, s * 0.16, s * 0.3, -0.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawLeaf(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.bezierCurveTo(x + s * 0.9, y - s * 0.4, x + s * 0.9, y + s * 0.6, x, y + s * 0.85);
  ctx.bezierCurveTo(x - s * 0.9, y + s * 0.6, x - s * 0.9, y - s * 0.4, x, y - s);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.8);
  ctx.lineTo(x, y + s * 0.7);
  ctx.stroke();
}

function drawDiamond(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.lineTo(x + s * 0.7, y);
  ctx.lineTo(x, y + s);
  ctx.lineTo(x - s * 0.7, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.55);
  ctx.lineTo(x + s * 0.32, y - s * 0.1);
  ctx.lineTo(x, y + s * 0.35);
  ctx.lineTo(x - s * 0.32, y - s * 0.1);
  ctx.closePath();
  ctx.fill();
}

export function drawSuitShape(ctx, shape, x, y, size, color) {
  if (shape === 'flame') drawFlame(ctx, x, y, size, color);
  else if (shape === 'drop') drawDrop(ctx, x, y, size, color);
  else if (shape === 'leaf') drawLeaf(ctx, x, y, size, color);
  else drawDiamond(ctx, x, y, size, color);
}

function drawTable(ctx) {
  const bg = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  bg.addColorStop(0, '#171021');
  bg.addColorStop(0.55, '#241527');
  bg.addColorStop(1, '#120d18');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // Warm candle glow over the middle of the table.
  const glow = ctx.createRadialGradient(640, 380, 40, 640, 380, 520);
  glow.addColorStop(0, 'rgba(255,166,66,0.20)');
  glow.addColorStop(0.6, 'rgba(255,120,40,0.06)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // Felt table.
  ctx.fillStyle = '#1d3a2a';
  ctx.beginPath();
  ctx.ellipse(640, 420, 560, 300, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(212,175,105,0.5)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(640, 420, 520, 268, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawHpBar(ctx, x, y, w, hp, max, label, color) {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  roundRect(ctx, x, y, w, 26, 13);
  ctx.fill();
  const frac = Math.max(0, hp / max);
  const grad = ctx.createLinearGradient(x, y, x + w, y);
  grad.addColorStop(0, color);
  grad.addColorStop(1, '#ffd166');
  ctx.fillStyle = grad;
  if (frac > 0) {
    roundRect(ctx, x + 3, y + 3, (w - 6) * frac, 20, 10);
    ctx.fill();
  }
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${label}  ${hp} / ${max} HP`, x + 10, y + 14);
}

function drawCardFace(ctx, card, x, y, w, h, opts) {
  const suit = SUITS[card.suit];
  const court = opts && opts.court;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = '#f7efdd';
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.restore();
  ctx.lineWidth = court ? 4 : 2;
  ctx.strokeStyle = court ? '#d4af69' : suit.dark;
  roundRect(ctx, x, y, w, h, 12);
  ctx.stroke();
  if (court) {
    ctx.fillStyle = '#8a6d1f';
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('COURT +2', x + w / 2, y + 16);
  }
  // Corner value + shape.
  ctx.fillStyle = suit.color;
  ctx.font = `bold ${Math.round(w * 0.34)}px Georgia, serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(String(card.value), x + 10, y + (court ? 20 : 8));
  drawSuitShape(ctx, suit.shape, x + 22, y + h * 0.30, w * 0.13, suit.color);
  // Centre: big suit shape.
  drawSuitShape(ctx, suit.shape, x + w / 2, y + h * 0.56, w * 0.26, suit.color);
  // Suit name under the shape.
  ctx.fillStyle = suit.dark;
  ctx.font = `bold ${Math.round(w * 0.13)}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillText(suit.name.toUpperCase(), x + w / 2, y + h - 22);
  if (opts && opts.glow) {
    ctx.strokeStyle = 'rgba(255,209,102,0.95)';
    ctx.lineWidth = 4;
    roundRect(ctx, x - 3, y - 3, w + 6, h + 6, 14);
    ctx.stroke();
  }
}

function drawCardBack(ctx, x, y, w, h) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#2a1b3d';
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#d4af69';
  ctx.lineWidth = 2;
  roundRect(ctx, x + 5, y + 5, w - 10, h - 10, 9);
  ctx.stroke();
  drawFlame(ctx, x + w / 2, y + h / 2 - 6, Math.min(w, h) * 0.2, '#f97316');
  ctx.fillStyle = '#d4af69';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('PACT', x + w / 2, y + h - 16);
}

function drawButton(ctx, input, x, y, w, h, label, id, data) {
  ctx.fillStyle = '#8a6d1f';
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.fillStyle = '#f7efdd';
  roundRect(ctx, x + 2, y + 2, w - 4, h - 4, 8);
  ctx.fill();
  ctx.fillStyle = '#3a2410';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, y + h / 2 + 1);
  input.zone(x, y, w, h, id, data);
}

function drawPactToken(ctx, input, pact, x, y, used, enabled, id) {
  const w = 150;
  const h = 64;
  ctx.fillStyle = used ? 'rgba(60,50,70,0.7)' : pact.dark;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = enabled && !used ? '#ffd166' : 'rgba(255,255,255,0.25)';
  ctx.lineWidth = enabled && !used ? 3 : 1;
  roundRect(ctx, x, y, w, h, 10);
  ctx.stroke();
  ctx.fillStyle = used ? '#8a8494' : '#fff';
  ctx.font = 'bold 17px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(pact.name, x + 14, y + 22);
  ctx.font = '13px Georgia, serif';
  ctx.fillStyle = used ? '#6d6678' : '#ffe9c9';
  ctx.fillText(used ? 'Spent' : pact.desc, x + 14, y + 45);
  if (!used) input.zone(x, y, w, h, id, { pact: pact.key });
}

function drawLog(ctx, g) {
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  roundRect(ctx, 1000, 120, 250, 300, 12);
  ctx.fill();
  ctx.fillStyle = '#d4af69';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('COURT LOG', 1016, 134);
  ctx.font = '14px Georgia, serif';
  ctx.fillStyle = '#f0e6d2';
  const lines = g.log.slice(-12);
  lines.forEach((line, i) => {
    ctx.fillText(line, 1016, 160 + i * 21, 222);
  });
}

export function render(ctx, input, g) {
  input.beginFrame();
  drawTable(ctx);

  if (g.screen === 'title') {
    renderTitle(ctx, input, g);
    return;
  }
  if (g.screen === 'win' || g.screen === 'loss') {
    renderTable(ctx, input, g);
    renderEnd(ctx, input, g);
    return;
  }
  renderTable(ctx, input, g);
}

function renderTitle(ctx, input, g) {
  // Two lanterns flanking the title, clear of the lettering.
  drawFlame(ctx, 235, 205, 42, '#f97316');
  drawFlame(ctx, 1045, 205, 42, '#f97316');
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('THE EMBER COURT PRESENTS', 640, 120);
  ctx.fillStyle = '#f7efdd';
  ctx.font = 'bold 92px Georgia, serif';
  ctx.fillText('LANTERN PACT', 640, 230);
  ctx.fillStyle = '#e8b4b8';
  ctx.font = 'italic 28px Georgia, serif';
  ctx.fillText('A duel of tricks, flame and patience', 640, 285);
  // Rules card.
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  roundRect(ctx, 340, 330, 600, 210, 14);
  ctx.fill();
  ctx.strokeStyle = '#d4af69';
  ctx.lineWidth = 2;
  roundRect(ctx, 340, 330, 600, 210, 14);
  ctx.stroke();
  ctx.fillStyle = '#f0e6d2';
  ctx.font = '19px Georgia, serif';
  ctx.textAlign = 'left';
  const rules = [
    '•  Both duelists start at 20 HP. First to 0 loses.',
    '•  Each trick, play one card — higher value wins the trick',
    '    and burns the loser for the difference.',
    '•  The Court suit of the trick gains +2. It rotates each round.',
    '•  Three Pacts, once a game each: Mirror, Ember, Veil.',
    '•  Beat the Warden of the Last Lantern. Keep your flame lit.',
  ];
  rules.forEach((line, i) => ctx.fillText(line, 370, 362 + i * 28));
  drawButton(ctx, input, 490, 580, 300, 64, 'LIGHT THE LANTERN', 'start');
  ctx.fillStyle = '#b9a8c9';
  ctx.font = '16px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Click a card to play it  •  Keys 1–5 play a hand card  •  M mutes sound', 640, 680);
  ctx.fillStyle = '#8a8494';
  ctx.font = '14px Georgia, serif';
  ctx.fillText('An original card duel — no decks borrowed, no faces copied.', 640, 716);
}

function renderTable(ctx, input, g) {
  const court = SUITS[g.courtSuit];
  // --- Top: the Warden ---
  ctx.fillStyle = '#f0e6d2';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('WARDEN OF THE LAST LANTERN', 40, 34);
  drawHpBar(ctx, 40, 52, 300, g.aiHp, 20, 'HP', '#e5484d');
  ctx.fillStyle = '#d4af69';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Tricks won: ${g.tricksWon.ai}`, 360, 66);
  // Warden hand: face-down backs, fanned.
  const aiN = g.aiHand.length;
  const aiStartX = 640 - ((aiN * (SMALL_W + 10)) / 2);
  g.aiHand.forEach((card, i) => {
    const x = aiStartX + i * (SMALL_W + 10);
    const y = 96;
    const p = glide(`ai-${card.id}`, x, y);
    drawCardBack(ctx, p.x, p.y, SMALL_W, SMALL_H);
  });
  // --- Court banner ---
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  roundRect(ctx, 470, 226, 340, 52, 12);
  ctx.fill();
  ctx.strokeStyle = court.color;
  ctx.lineWidth = 2;
  roundRect(ctx, 470, 226, 340, 52, 12);
  ctx.stroke();
  drawSuitShape(ctx, court.shape, 500, 252, 15, court.color);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 19px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(`COURT: ${court.name}  +2`, 524, 253);
  ctx.fillStyle = '#ffd166';
  ctx.font = '16px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText(`Trick ${g.trickNumber + 1}`, 796, 253);
  // --- Trick area: the two played cards ---
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  roundRect(ctx, 430, 300, 150, 190, 12);
  ctx.fill();
  roundRect(ctx, 700, 300, 150, 190, 12);
  ctx.fill();
  ctx.fillStyle = '#cbbf9f';
  ctx.font = '15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('WARDEN', 775, 316);
  ctx.fillText('YOU', 505, 316);
  if (g.aiCard) {
    const p = glide(`played-ai-${g.aiCard.id}`, 714, 330);
    drawCardFace(ctx, g.aiCard, p.x, p.y, 122, 166, { court: g.aiCard.suit === g.courtSuit });
  }
  if (g.playerCard) {
    const p = glide(`played-you-${g.playerCard.id}`, 444, 330);
    drawCardFace(ctx, g.playerCard, p.x, p.y, 122, 166, { court: g.playerCard.suit === g.courtSuit });
  }
  // Trick result flash.
  if (g.flash) {
    ctx.fillStyle = g.flash === 'player' ? 'rgba(47,174,110,0.9)' : g.flash === 'ai' ? 'rgba(229,72,77,0.9)' : 'rgba(212,175,105,0.9)';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.textAlign = 'center';
    const text = g.flash === 'player' ? 'YOU TAKE THE TRICK' : g.flash === 'ai' ? 'WARDEN TAKES THE TRICK' : 'A TIED TRICK';
    ctx.fillText(text, 640, 530);
  }
  // --- Bottom: the player ---
  drawHpBar(ctx, 40, 560, 300, g.playerHp, 20, 'HP', '#2fae6e');
  ctx.fillStyle = '#d4af69';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Tricks won: ${g.tricksWon.player}`, 360, 574);
  ctx.fillStyle = '#f0e6d2';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText('YOU — KEEPER OF THE PACT', 40, 544);
  // Deck count.
  ctx.fillStyle = '#cbbf9f';
  ctx.font = '16px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText(`Deck: ${g.deckCount} cards`, 1240, 574);
  // Pact tokens: a vertical stack at the left of the trick area, clear of
  // the player's hand (the hand starts at y 620).
  ctx.fillStyle = '#d4af69';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('PACTS — ONCE A GAME', 40, 292);
  const pactKeys = ['mirror', 'ember', 'veil'];
  pactKeys.forEach((key, i) => {
    const pact = PACTS[key];
    const used = !g.pacts.player[key];
    const enabled = g.screen === 'play' && !used && g.canUsePact;
    drawPactToken(ctx, input, pact, 40, 304 + i * 76, used, enabled, 'pact');
  });
  // Player hand.
  const n = g.playerHand.length;
  const startX = 640 - ((n * (CARD_W + 14) - 14) / 2);
  g.playerHand.forEach((card, i) => {
    const x = startX + i * (CARD_W + 14);
    const y = 620;
    const p = glide(`you-${card.id}`, x, y);
    const playable = g.screen === 'play' && g.canPlay;
    drawCardFace(ctx, card, p.x, p.y, CARD_W, CARD_H, {
      court: card.suit === g.courtSuit,
      glow: playable && g.hoverCard === card.id,
    });
    if (playable) input.zone(p.x, p.y, CARD_W, CARD_H, 'card', { cardId: card.id });
  });
  // Hint line.
  ctx.fillStyle = '#ffe9c9';
  ctx.font = 'italic 18px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(g.message, 640, 600);
  // Sound + restart buttons, top right.
  drawButton(ctx, input, 1120, 24, 120, 40, g.muted ? 'SOUND OFF' : 'SOUND ON', 'mute');
  drawButton(ctx, input, 1120, 72, 120, 40, 'RESTART', 'restart');
  drawLog(ctx, g);
}

function renderEnd(ctx, input, g) {
  const won = g.screen === 'win';
  ctx.fillStyle = 'rgba(10,6,14,0.72)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = won ? '#ffd166' : '#e5484d';
  ctx.font = 'bold 64px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(won ? 'THE LANTERN IS YOURS' : 'THE FLAME GOES OUT', 640, 300);
  ctx.fillStyle = '#f0e6d2';
  ctx.font = 'italic 24px Georgia, serif';
  ctx.fillText(
    won ? 'The Warden bows. The Ember Court is yours to keep.' : 'The Warden keeps the last lantern — for now.',
    640,
    350,
  );
  ctx.font = '20px Georgia, serif';
  ctx.fillText(
    `Final HP — You ${Math.max(0, g.playerHp)} · Warden ${Math.max(0, g.aiHp)}   •   Tricks — You ${g.tricksWon.player} · Warden ${g.tricksWon.ai}   •   ${g.trickNumber} tricks played`,
    640,
    400,
  );
  drawButton(ctx, input, 490, 450, 300, 64, 'DUEL AGAIN', 'restart');
}
