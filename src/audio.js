/* ═══════════════════════════════════════════════════════════
   Loader sound - synthesised live with the Web Audio API.
   No mp3 file, no download weight, no licensing to worry about.

   The cue: three taps on a mic capsule, then a room full of people
   applauding, then a soft chord as the spotlight blows out.

   On the autoplay problem: browsers refuse to start audio until the
   user has interacted with the page, and a synthetic event does not
   count - user activation must come from a real input event. So the
   cue arms itself and fires on the visitor's FIRST genuine gesture,
   whatever that is (a click anywhere, a tap, a key press). Nobody
   has to click a "sound on" button; whatever they were going to do
   anyway triggers it.
   ═══════════════════════════════════════════════════════════ */

const AC = typeof window !== "undefined" ? (window.AudioContext || window.webkitAudioContext) : null;

/* Don't ambush someone with applause if their first click comes a minute
   in - only auto-fire while the arrival is still "the arrival". */
const ARM_WINDOW_MS = 20000;

/* Created inside the entry screen's tap handler. Making the AudioContext
   during the gesture itself is the strongest guarantee it starts in the
   "running" state, rather than relying on sticky activation surviving until
   the loader mounts a moment later. */
let primedCtx = null;
export function primeAudio() {
  if (!AC) return null;
  if (!primedCtx || primedCtx.state === "closed") {
    try { primedCtx = new AC(); } catch { return null; }
  }
  primedCtx.resume().catch(() => {});
  return primedCtx;
}

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
  tg.gain.exponentialRampToValueAtTime(0.5 * gain, at + 0.008);
  tg.gain.exponentialRampToValueAtTime(0.0001, at + 0.26);
  thump.connect(tg).connect(out);
  thump.start(at); thump.stop(at + 0.28);

  const click = ctx.createBufferSource();
  click.buffer = getNoise(ctx);
  click.playbackRate.value = 1.4;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass"; hp.frequency.value = 1800;
  const cg = ctx.createGain();
  cg.gain.setValueAtTime(0.18 * gain, at);
  cg.gain.exponentialRampToValueAtTime(0.0001, at + 0.045);
  click.connect(hp).connect(cg).connect(out);
  click.start(at); click.stop(at + 0.05);
}

/* One pair of hands. Short filtered noise burst with a fast decay. */
function clap(ctx, out, at, gain) {
  const src = ctx.createBufferSource();
  src.buffer = getNoise(ctx);
  src.playbackRate.value = 0.8 + Math.random() * 0.8;

  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1200 + Math.random() * 2200;
  bp.Q.value = 0.7 + Math.random() * 1.1;

  const hp = ctx.createBiquadFilter();
  hp.type = "highpass"; hp.frequency.value = 600;

  const g = ctx.createGain();
  const decay = 0.035 + Math.random() * 0.055;
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), at + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, at + decay);

  src.connect(bp).connect(hp).connect(g).connect(out);
  src.start(at); src.stop(at + decay + 0.02);
}

/* A room applauding: many individual claps scattered in time over a soft
   bed of room noise. Discrete claps are what make it read as people
   rather than as hiss. */
function applause(ctx, out, at, dur = 1.6) {
  // low bed - the blurred far half of the room
  const bed = ctx.createBufferSource();
  bed.buffer = getNoise(ctx);
  bed.loop = true;
  const bedBp = ctx.createBiquadFilter();
  bedBp.type = "bandpass";
  bedBp.frequency.setValueAtTime(700, at);
  bedBp.frequency.linearRampToValueAtTime(1800, at + dur * 0.5);
  bedBp.Q.value = 0.5;
  const bedG = ctx.createGain();
  bedG.gain.setValueAtTime(0.0001, at);
  bedG.gain.linearRampToValueAtTime(0.05, at + dur * 0.35);
  bedG.gain.linearRampToValueAtTime(0.028, at + dur * 0.72);
  bedG.gain.linearRampToValueAtTime(0.0001, at + dur);
  bed.connect(bedBp).connect(bedG).connect(out);
  bed.start(at); bed.stop(at + dur + 0.05);

  // individual claps, density swelling then easing off
  const COUNT = 190;
  for (let i = 0; i < COUNT; i++) {
    const p = i / COUNT;
    // bunch them toward the first half so it arrives as a burst
    const when = at + Math.pow(Math.random(), 0.62) * dur;
    const envelope = Math.sin(Math.min(1, (when - at) / dur) * Math.PI); // fade in/out
    const g = (0.05 + Math.random() * 0.1) * envelope;
    if (g > 0.004) clap(ctx, out, when, g);
    void p;
  }
}

/* Soft triad as the spotlight blows out. */
function blowOut(ctx, out, at) {
  [523.25, 783.99, 1046.5].forEach((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = i === 2 ? "triangle" : "sine";
    o.frequency.value = f;
    const start = at + i * 0.035;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(0.1 - i * 0.025, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.85);
    o.connect(g).connect(out);
    o.start(start); o.stop(start + 0.9);
  });
}

/**
 * Builds the audio graph, plays the cue if the browser allows it, and
 * otherwise arms it to fire on the visitor's first real interaction.
 * Returns a handle, or null when Web Audio is unavailable.
 */
export function playLoaderCue({ withBlowOut = true } = {}) {
  if (!AC) return null;

  let ctx;
  if (primedCtx && primedCtx.state !== "closed") {
    ctx = primedCtx;              // already unlocked by the entry tap
  } else {
    try { ctx = new AC(); } catch { return null; }
  }

  const master = ctx.createGain();
  master.gain.value = 0.4;              // deliberately restrained
  const comp = ctx.createDynamicsCompressor();
  master.connect(comp).connect(ctx.destination);

  const schedule = () => {
    const t0 = ctx.currentTime + 0.06;
    micTap(ctx, master, t0 + 0.00, 1.0);
    micTap(ctx, master, t0 + 0.30, 0.8);
    micTap(ctx, master, t0 + 0.58, 1.0);
    applause(ctx, master, t0 + 0.82, 1.7);
    if (withBlowOut) blowOut(ctx, master, t0 + 1.75);
  };

  let scheduled = false;
  const runOnce = () => { if (!scheduled) { scheduled = true; schedule(); } };

  const armedAt = Date.now();
  let cleanup = () => {};

  const fire = () => {
    if (scheduled) { cleanup(); return; }
    if (Date.now() - armedAt > ARM_WINDOW_MS) { cleanup(); return; }
    ctx.resume().then(runOnce).catch(() => {});
    cleanup();
  };

  // Try immediately - works for repeat visitors whose browser has granted
  // this origin autoplay, and anywhere the policy is relaxed.
  if (ctx.state === "running") {
    runOnce();
  } else {
    ctx.resume().then(() => { if (ctx.state === "running") runOnce(); }).catch(() => {});
    // These are the events that actually confer user activation.
    const GESTURES = ["pointerdown", "mousedown", "touchstart", "keydown", "click"];
    GESTURES.forEach((g) => window.addEventListener(g, fire, { once: true, passive: true, capture: true }));
    cleanup = () => GESTURES.forEach((g) => window.removeEventListener(g, fire, { capture: true }));
    setTimeout(cleanup, ARM_WINDOW_MS);
  }

  return {
    ctx,
    get blocked() { return ctx.state !== "running"; },
    get played() { return scheduled; },
    unlock: () => ctx.resume().then(() => { runOnce(); return true; }).catch(() => false),
    stop: () => {
      cleanup();
      try {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
        setTimeout(() => ctx.close().catch(() => {}), 800);
      } catch { /* context already gone */ }
    },
  };
}
