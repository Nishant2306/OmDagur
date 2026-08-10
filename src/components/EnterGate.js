import { useState, useEffect, useRef } from "react";
import { primeAudio } from "../audio";
import { usePrefersReducedMotion, useBodyScrollLock } from "../shared";

/* ═══════════════════════════════════════════════════════════
   The one-tap entry screen: closed theatre curtains that sweep
   apart to reveal the loader behind them.

   It exists for one reason - browsers will not play audible sound
   until the visitor has genuinely interacted with the page. This
   turns that unavoidable tap into part of the show rather than a
   "click here for sound" chore, and guarantees the mic-check cue
   lands every single time.

   The AudioContext is created inside the tap handler itself
   (primeAudio), which is the strongest possible guarantee it is
   already unlocked by the time the loader schedules its cue.
   ═══════════════════════════════════════════════════════════ */

const OPEN_MS = 950;       // curtain travel
const UNMOUNT_MS = 1250;   // when this screen removes itself
const SCALLOPS = 15;
const BULBS = 26;

export default function EnterGate({ onEnter, onFinished }) {
  const reduced = usePrefersReducedMotion();
  const [opening, setOpening] = useState(false);
  const [hover, setHover] = useState(false);
  const doneRef = useRef(false);
  const timers = useRef([]);

  useBodyScrollLock(true);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const open = () => {
    if (doneRef.current) return;
    doneRef.current = true;

    // Must happen synchronously inside the gesture.
    primeAudio();

    setOpening(true);

    /* The loader mounts in the same tick as the tap, not on a delay. Waiting
       meant the curtains opened onto the gate's own empty backdrop for a
       beat before the spotlight appeared. Starting it now means the beam is
       already swinging in - and the mic taps already sounding - behind the
       curtains as they part. */
    onEnter();

    if (reduced) { onFinished(); return; }
    // This screen only removes itself once the sweep has finished; unmounting
    // earlier would cut the animation off partway through.
    timers.current.push(setTimeout(() => onFinished(), UNMOUNT_MS));
  };

  const onKey = (e) => {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); open(); }
  };

  return (
    <div
      className={`gate${opening ? " gate-open" : ""}`}
      role="button"
      tabIndex={0}
      aria-label="Tap to start the show"
      onClick={open}
      onKeyDown={onKey}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <style>{`
        /* The root is transparent so that once the curtains travel away, what
           shows through is the LOADER behind them - not this screen. An opaque
           root here was why the sweep revealed an empty black stage. */
        .gate {
          position: fixed; inset: 0; z-index: 100000;
          background: transparent;
          cursor: pointer; overflow: hidden;
          -webkit-tap-highlight-color: transparent;
        }
        .gate-open { pointer-events: none; }

        /* Solid ground before the tap - the curtains overlap to cover the
           viewport, and this sits behind them as insurance. It clears quickly
           on tap so the spotlight can read through the widening gap. */
        .gate-backdrop {
          position: absolute; inset: 0; background: #070305;
          transition: opacity 320ms ease;
        }
        .gate-open .gate-backdrop { opacity: 0; }

        /* warm light bleeding through the seam before it opens */
        .gate-bleed {
          position: absolute; left: 50%; top: 0; bottom: 0; width: 34vw;
          transform: translateX(-50%);
          background: radial-gradient(ellipse at 50% 62%, rgba(255,214,120,.30), rgba(255,180,60,.07) 42%, transparent 70%);
          opacity: .55; transition: opacity 420ms ease;
        }
        .gate-open .gate-bleed { opacity: 0; }

        /* ── curtains ──
           Black velvet whose folds catch gold light, rather than the red a
           theatre curtain defaults to - the site is gold on black, and red
           read as a foreign colour sitting on top of it. */
        .gate-curtain {
          position: absolute; top: 0; bottom: 0; width: 52%;
          background:
            repeating-linear-gradient(90deg,
              rgba(0,0,0,.86) 0px,
              rgba(255,196,60,.045) 20px,
              rgba(255,215,110,.17) 43px,
              rgba(255,196,60,.045) 66px,
              rgba(0,0,0,.86) 96px),
            repeating-linear-gradient(90deg,
              rgba(255,225,150,.05) 0px,
              rgba(0,0,0,0) 9px,
              rgba(0,0,0,.30) 19px),
            linear-gradient(180deg, #1C1509 0%, #120D05 44%, #070502 100%);
          box-shadow: inset 0 -90px 130px rgba(0,0,0,.85), inset 0 40px 90px rgba(0,0,0,.55);
          transition: transform ${OPEN_MS}ms cubic-bezier(.66,0,.2,1);
          will-change: transform;
        }

        /* gold trim running down the parting edge */
        .gate-curtain::before {
          content: ''; position: absolute; top: 0; bottom: 0; width: 2px; z-index: 2;
          background: linear-gradient(180deg,
            rgba(255,215,0,.15), rgba(255,215,0,.85) 22%, rgba(255,215,0,.7) 70%, rgba(255,215,0,.15));
          box-shadow: 0 0 22px rgba(255,215,0,.55);
        }
        .gate-left::before  { right: 0; }
        .gate-right::before { left: 0; }
        .gate-left  { left: 0;  transform-origin: left center; }
        .gate-right { right: 0; transform-origin: right center; }

        /* a hint that they're openable */
        .gate-hover .gate-left  { transform: translateX(-2.2%); }
        .gate-hover .gate-right { transform: translateX(2.2%); }

        .gate-open .gate-left  { transform: translateX(-101%) scaleX(1.12); }
        .gate-open .gate-right { transform: translateX(101%) scaleX(1.12); }

        /* soft inner edge where the two halves meet */
        .gate-curtain::after {
          content: ''; position: absolute; top: 0; bottom: 0; width: 90px;
          pointer-events: none;
        }
        .gate-left::after  { right: 0; background: linear-gradient(270deg, rgba(0,0,0,.85), transparent); }
        .gate-right::after { left: 0;  background: linear-gradient(90deg, rgba(0,0,0,.85), transparent); }

        /* ── valance (the swag across the top) ── */
        .gate-valance {
          position: absolute; top: 0; left: 0; right: 0; z-index: 4;
          transition: transform ${OPEN_MS}ms cubic-bezier(.66,0,.2,1);
          will-change: transform;
        }
        .gate-open .gate-valance { transform: translateY(-112%); }
        .gate-valance-body {
          height: clamp(38px, 7vh, 68px);
          background:
            repeating-linear-gradient(90deg,
              rgba(0,0,0,.6) 0px, rgba(255,215,110,.05) 18px, rgba(255,215,110,.13) 36px, rgba(0,0,0,.6) 62px),
            linear-gradient(180deg, #241B0A, #0E0A03);
          box-shadow: 0 10px 26px rgba(0,0,0,.7);
        }
        .gate-scallops { display: flex; margin-top: -1px; }
        .gate-scallops i {
          flex: 1; height: clamp(20px, 3.4vh, 34px);
          border-radius: 0 0 60% 60%;
          background: linear-gradient(180deg, #1F1708, #0B0803);
          box-shadow: inset 0 -7px 13px rgba(0,0,0,.6), inset 0 2px 0 rgba(255,215,0,.22);
        }
        .gate-bulbs {
          position: absolute; left: 3%; right: 3%;
          top: calc(clamp(38px, 7vh, 68px) + clamp(20px, 3.4vh, 34px) - 4px);
          display: flex; justify-content: space-between;
        }
        .gate-bulbs i {
          width: 7px; height: 7px; border-radius: 50%;
          background: rgba(255,205,90,.28);
          animation: gateChase 1.6s linear infinite;
        }
        @keyframes gateChase {
          0%, 72% { background: rgba(255,205,90,.25); box-shadow: none; }
          10%     { background: #FFE9A8; box-shadow: 0 0 12px rgba(255,205,90,.95); }
        }

        /* ── centre call to action ── */
        .gate-cta {
          position: absolute; inset: 0; z-index: 6;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 18px; text-align: center; padding: 0 24px;
          transition: opacity 420ms ease, transform 620ms cubic-bezier(.66,0,.2,1);
        }
        .gate-open .gate-cta { opacity: 0; transform: scale(1.08); }

        .gate-eyebrow {
          font-family: 'Space Mono', ui-monospace, monospace;
          font-size: clamp(9px, 1.5vw, 11px); letter-spacing: .46em;
          text-transform: uppercase; color: rgba(255,214,120,.75);
        }
        .gate-name {
          font-family: 'Syne', system-ui, sans-serif; font-weight: 800;
          font-size: clamp(38px, 8.5vw, 96px); line-height: .92;
          letter-spacing: -.03em; text-transform: uppercase;
          color: #FFF6E2; text-shadow: 0 6px 40px rgba(0,0,0,.7);
        }
        .gate-tap {
          position: relative; margin-top: 6px;
          display: inline-flex; align-items: center; gap: 12px;
          padding: 15px 34px; border-radius: 60px;
          border: 1px solid rgba(255,214,120,.5);
          background: rgba(255,214,120,.08);
          backdrop-filter: blur(4px);
          font-family: 'DM Sans', system-ui, sans-serif;
          font-weight: 700; font-size: clamp(13px, 2vw, 16px);
          letter-spacing: .04em; color: #FFE9B8;
        }
        .gate-tap::before {
          content: ''; position: absolute; inset: -1px; border-radius: 60px;
          border: 1px solid rgba(255,214,120,.5);
          animation: gatePulse 2.1s ease-out infinite;
        }
        @keyframes gatePulse {
          0%   { transform: scale(1); opacity: .8; }
          70%  { transform: scale(1.22); opacity: 0; }
          100% { transform: scale(1.22); opacity: 0; }
        }
        .gate-sound {
          font-family: 'Space Mono', ui-monospace, monospace;
          font-size: clamp(9px, 1.4vw, 11px); letter-spacing: .3em;
          text-transform: uppercase; color: rgba(255,255,255,.42);
        }

        .gate-vignette {
          position: absolute; inset: 0; z-index: 5; pointer-events: none;
          background: radial-gradient(ellipse at 50% 48%, transparent 34%, rgba(0,0,0,.72) 100%);
          transition: opacity 420ms ease;
        }
        /* must clear too, or it keeps darkening the loader once revealed */
        .gate-open .gate-vignette { opacity: 0; }

        @media (prefers-reduced-motion: reduce) {
          .gate-curtain, .gate-valance { transition: none; }
          .gate-bulbs i, .gate-tap::before { animation: none; }
          .gate-open { opacity: 0; transition: opacity .25s ease; }
        }
      `}</style>

      <div className={hover && !opening ? "gate-hover" : ""} style={{ position: "absolute", inset: 0 }}>
        <div className="gate-backdrop" />
        <div className="gate-bleed" />
        <div className="gate-curtain gate-left" />
        <div className="gate-curtain gate-right" />

        <div className="gate-valance">
          <div className="gate-valance-body" />
          <div className="gate-scallops">
            {Array.from({ length: SCALLOPS }, (_, i) => <i key={i} />)}
          </div>
        </div>
        <div className="gate-bulbs">
          {Array.from({ length: BULBS }, (_, i) => (
            <i key={i} style={{ animationDelay: `${i * 0.06}s` }} />
          ))}
        </div>

        <div className="gate-vignette" />

        <div className="gate-cta">
          <span className="gate-eyebrow">Live stand-up</span>
          <span className="gate-name">Om Dagur</span>
          <span className="gate-tap">
            <span aria-hidden="true">🎬</span> Tap to start the show
          </span>
          <span className="gate-sound">Best with sound on 🔊</span>
        </div>
      </div>
    </div>
  );
}
