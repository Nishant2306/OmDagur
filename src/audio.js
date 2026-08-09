/* ═══════════════════════════════════════════════════════════
   Loader sound - synthesised live with the Web Audio API.
   No mp3 file, no download weight, no licensing to worry about.

   The cue is a "mic check": three taps on a mic capsule, then a
   crowd swell, then a bright chord on the spotlight blow-out.
   ═══════════════════════════════════════════════════════════ */

const AC = typeof window !== "undefined" ? (window.AudioContext || window.webkitAudioContext) : null;

let noiseBuffer = null;
function getNoise(ctx) {
  if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) return noiseBuffer;
  const len = ctx.sampleRate * 3;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  noiseBuffer = buf;
  return buf;
}

/* One knuckle-tap on the mic: a pitched thump plus a transient click. */
function micTap(ctx, out, at, gain = 1) {
  const thump = ctx.createOscillator();
  const tg = ctx.createGain();
  thump.type = "sine";
  thump.frequency.setValueAtTime(150, at);
  thump.frequency.exponentialRampToValueAtTime(46, at + 0.16);
  tg.gain.setValueAtTime(0.0001, at);
  tg.gain.exponentialRampToValueAtTime(0.9 * gain, at + 0.008);
  tg.gain.exponentialRampToValueAtTime(0.0001, at + 0.28);
  thump.connect(tg).connect(out);
  thump.start(at); thump.stop(at + 0.3);

  const click = ctx.createBufferSource();
  click.buffer = getNoise(ctx);
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass"; hp.frequency.value = 1600;
  const cg = ctx.createGain();
  cg.gain.setValueAtTime(0.35 * gain, at);
  cg.gain.exponentialRampToValueAtTime(0.0001, at + 0.05);
  click.connect(hp).connect(cg).connect(out);
  click.start(at); click.stop(at + 0.06);
}

/* Crowd swell - filtered noise with a wobbling band, roughly "applause". */
function crowdSwell(ctx, out, at, dur = 1.5) {
  const src = ctx.createBufferSource();
  src.buffer = getNoise(ctx);
  src.loop = true;

  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 0.8;
  bp.frequency.setValueAtTime(420, at);
  bp.frequency.exponentialRampToValueAtTime(2400, at + dur * 0.7);

  // Slow amplitude wobble so it reads as many hands, not a hiss.
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = "sine"; lfo.frequency.value = 11;
  lfoGain.gain.value = 0.06;

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.linearRampToValueAtTime(0.16, at + dur * 0.65);
  g.gain.linearRampToValueAtTime(0.0001, at + dur);

  lfo.connect(lfoGain).connect(g.gain);
  src.connect(bp).connect(g).connect(out);
  src.start(at); src.stop(at + dur + 0.05);
  lfo.start(at); lfo.stop(at + dur + 0.05);
}

/* Bright triad on the blow-out. */
function blowOut(ctx, out, at) {
  [523.25, 783.99, 1046.5].forEach((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = i === 2 ? "triangle" : "sine";
    o.frequency.value = f;
    const start = at + i * 0.035;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(0.22 - i * 0.05, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);
    o.connect(g).connect(out);
    o.start(start); o.stop(start + 0.95);
  });
}

/**
 * Builds the audio graph and schedules the whole cue.
 * Returns a handle, or null when Web Audio is unavailable.
 *
 * `blocked` is true when the browser suspended the context because the
 * user hasn't interacted with the page yet - the UI shows an unmute
 * button in that case and calls `unlock()` on click.
 */
export function playLoaderCue() {
  if (!AC) return null;

  let ctx;
  try { ctx = new AC(); } catch { return null; }

  const master = ctx.createGain();
  master.gain.value = 0.55;
  const comp = ctx.createDynamicsCompressor();
  master.connect(comp).connect(ctx.destination);

  const schedule = () => {
    const t0 = ctx.currentTime + 0.06;
    micTap(ctx, master, t0 + 0.00, 1.0);
    micTap(ctx, master, t0 + 0.30, 0.85);
    micTap(ctx, master, t0 + 0.58, 1.0);
    crowdSwell(ctx, master, t0 + 0.80, 1.45);
    blowOut(ctx, master, t0 + 1.72);
  };

  let scheduled = false;
  const runOnce = () => { if (!scheduled) { scheduled = true; schedule(); } };

  // Chrome/Safari start the context "suspended" until a user gesture.
  if (ctx.state === "running") runOnce();

  return {
    ctx,
    get blocked() { return ctx.state !== "running"; },
    unlock: () =>
      ctx.resume().then(() => { runOnce(); return true; }).catch(() => false),
    stop: () => {
      try {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
        setTimeout(() => ctx.close().catch(() => {}), 600);
      } catch { /* context already gone */ }
    },
  };
}
