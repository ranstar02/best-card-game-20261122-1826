// Lantern Pact — sound, synthesised live with WebAudio.
// No audio files: every cue is a few oscillators shaped in code.

export function createAudio() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // One short tone: frequency slide, quick fade, done.
  function tone(freq, dur, type, vol, slideTo) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + dur);
    gain.gain.setValueAtTime(vol || 0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  function chord(freqs, dur, type, vol) {
    freqs.forEach((f, i) => {
      setTimeout(() => tone(f, dur, type, vol), i * 30);
    });
  }

  return {
    unlock() {
      ensure();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    isMuted() {
      return muted;
    },
    click() {
      tone(660, 0.07, 'triangle', 0.08);
    },
    deal() {
      tone(420, 0.09, 'triangle', 0.09, 560);
    },
    playCard() {
      tone(300, 0.12, 'sawtooth', 0.06, 520);
      tone(180, 0.1, 'sine', 0.1, 240);
    },
    trickWin() {
      chord([523, 659, 784], 0.22, 'triangle', 0.1);
    },
    trickLose() {
      chord([392, 330, 262], 0.25, 'triangle', 0.09);
    },
    pact() {
      tone(880, 0.3, 'sine', 0.1, 1760);
      tone(1320, 0.2, 'sine', 0.05, 660);
    },
    win() {
      chord([523, 659, 784, 1047, 1319], 0.4, 'triangle', 0.11);
    },
    lose() {
      chord([330, 294, 262, 196], 0.45, 'sawtooth', 0.06);
    },
  };
}
