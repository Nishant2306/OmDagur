import { useState, useEffect, useRef } from "react";
import { playLoaderCue } from "../audio";
import { usePrefersReducedMotion } from "../shared";

const NAME = "OM DAGUR";

/* Timeline in ms — kept in sync with the audio cue in ../audio.js
   and with the percentages in the keyframes below (of TOTAL). */
const TOTAL = 2000;
const TYPE_START = 780;
const TYPE_STEP = 78;
const BLOWOUT = 1780;
const UNMOUNT = 2260;

export default function Loader({ onDone }) {
  const reduced = usePrefersReducedMotion();
  const [typed, setTyped] = useState(0);
  const [blown, setBlown] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const audioRef = useRef(null);
  const timers = useRef([]);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    timers.current.forEach(clearTimeout);
    if (audioRef.current) audioRef.current.stop();
    setExiting(true);
    setTimeout(() => onDone(), 420);
  };

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Captured so cleanup doesn't read a ref that may have been swapped out.
    const pending = timers.current;

    // Reduced-motion: short, static, silent.
    if (reduced) {
      const t = setTimeout(finish, 600);
      pending.push(t);
      return () => { clearTimeout(t); document.body.style.overflow = prevOverflow; };
    }

    audioRef.current = playLoaderCue();
    if (audioRef.current && audioRef.current.blocked) setNeedsTap(true);

    const add = (fn, ms) => pending.push(setTimeout(fn, ms));

    for (let i = 1; i <= NAME.length; i++) add(() => setTyped(i), TYPE_START + i * TYPE_STEP);
    add(() => setBlown(true), BLOWOUT);
    add(finish, UNMOUNT);

    const onKey = (e) => { if (e.key === "Escape" || e.key === "Enter") finish(); };
    window.addEventListener("keydown", onKey);

    return () => {
      pending.forEach(clearTimeout);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const unmute = async () => {
    if (!audioRef.current) return;
    const ok = await audioRef.current.unlock();
    if (ok) setNeedsTap(false);
  };

  return (
    <div className={`ldr-root${exiting ? " ldr-exit" : ""}`} role="status" aria-label="Loading Om Dagur">
      <style>{`
        .ldr-root {
          position: fixed; inset: 0; z-index: 99999;
          background: #050505; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          transition: opacity .42s ease, visibility .42s ease;
        }
        .ldr-exit { opacity: 0; visibility: hidden; pointer-events: none; }

        .ldr-stage {
          position: relative; width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          animation: ldrShake ${TOTAL}ms linear both;
        }

        /* Cone of light, hinged at the top so it can swing in. */
        .ldr-beam {
          position: absolute; top: -12%; left: 50%;
          width: 78vmin; height: 96vmin;
          margin-left: -39vmin;
          transform-origin: 50% 0%;
          clip-path: polygon(43% 0%, 57% 0%, 100% 100%, 0% 100%);
          background: linear-gradient(to bottom,
            rgba(255,215,0,0.34) 0%,
            rgba(255,200,0,0.14) 45%,
            rgba(255,180,0,0.02) 100%);
          filter: blur(6px);
          animation: ldrBeam ${TOTAL}ms cubic-bezier(.3,.9,.3,1) both;
        }
        .ldr-glare {
          position: absolute; top: -12%; left: 50%; margin-left: -12vmin;
          width: 24vmin; height: 24vmin; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,235,150,.75), rgba(255,215,0,0) 70%);
          filter: blur(8px);
          animation: ldrBeam ${TOTAL}ms cubic-bezier(.3,.9,.3,1) both;
        }

        /* Pool of light on the stage floor. */
        .ldr-pool {
          position: absolute; bottom: 14%; left: 50%;
          width: 62vmin; height: 15vmin; margin-left: -31vmin;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(255,215,0,.30), rgba(255,215,0,.05) 55%, transparent 72%);
          filter: blur(4px);
          animation: ldrPool ${TOTAL}ms ease-out both;
        }

        .ldr-mic {
          position: relative; z-index: 3;
          height: min(46vh, 320px); width: auto;
          margin-bottom: 6vh;
          animation: ldrMic ${TOTAL}ms ease-out both;
        }

        .ldr-caption {
          position: absolute; z-index: 4; left: 0; right: 0;
          bottom: 16%; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
        }
        .ldr-name {
          font-family: 'Syne', system-ui, sans-serif; font-weight: 800;
          font-size: clamp(30px, 6.5vw, 74px);
          letter-spacing: .16em; color: #FAFAF9;
          text-shadow: 0 0 34px rgba(255,215,0,.55);
          display: flex; align-items: center; min-height: 1.1em;
        }
        .ldr-cursor {
          display: inline-block; width: .07em; height: .95em;
          background: #FFD700; margin-left: .09em;
          animation: ldrBlink .5s steps(1) infinite;
        }
        .ldr-sub {
          font-family: 'Space Mono', ui-monospace, monospace;
          font-size: clamp(9px, 1.5vw, 12px); letter-spacing: .42em;
          text-transform: uppercase; color: rgba(255,215,0,.62);
          animation: ldrFade 900ms ease-out both;
        }

        .ldr-mote {
          position: absolute; border-radius: 50%;
          background: rgba(255,235,160,.85);
          filter: blur(.4px);
          animation: ldrMote linear infinite;
        }

        /* White blow-out that hands off to the page. */
        .ldr-flash {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(circle at 50% 42%, #fff8dc 0%, rgba(255,215,0,.55) 30%, transparent 72%);
          opacity: 0; transform: scale(.35);
        }
        .ldr-flash.on { animation: ldrFlash 520ms cubic-bezier(.2,.7,.3,1) forwards; }

        .ldr-btn {
          position: absolute; z-index: 6; bottom: 26px;
          font-family: 'Space Mono', ui-monospace, monospace;
          font-size: 11px; letter-spacing: .18em; text-transform: uppercase;
          background: transparent; cursor: pointer; color: rgba(255,255,255,.45);
          border: 1px solid rgba(255,255,255,.16); border-radius: 40px;
          padding: 9px 18px; transition: all .25s ease;
        }
        .ldr-btn:hover { color: #FFD700; border-color: rgba(255,215,0,.5); }
        .ldr-skip { right: 26px; }
        .ldr-sound {
          left: 26px; color: #FFD700; border-color: rgba(255,215,0,.45);
          animation: ldrPulse 1.3s ease-in-out infinite;
        }

        @keyframes ldrBeam {
          0%   { transform: rotate(-42deg) scaleY(.6); opacity: 0; }
          3%   { opacity: .25; }
          7%   { opacity: .95; }
          16%  { transform: rotate(5deg) scaleY(1); opacity: .9; }
          18%  { opacity: .3; }                       /* tap 2 flicker */
          22%  { opacity: .95; }
          31%  { opacity: .35; }                      /* tap 3 flicker */
          35%  { transform: rotate(0deg) scaleY(1); opacity: 1; }
          86%  { transform: rotate(0deg) scaleY(1); opacity: 1; }
          100% { transform: rotate(0deg) scaleY(1.3); opacity: 0; }
        }
        @keyframes ldrPool {
          0%, 5% { opacity: 0; transform: scale(.2); }
          20%    { opacity: .7; transform: scale(.95); }
          35%    { opacity: 1; transform: scale(1); }
          86%    { opacity: 1; transform: scale(1); }
          100%   { opacity: 0; transform: scale(1.6); }
        }
        @keyframes ldrMic {
          0%, 4% { opacity: 0; transform: translateY(26px) scale(.94); }
          20%    { opacity: 1; transform: translateY(0) scale(1); }
          86%    { opacity: 1; transform: translateY(0) scale(1); }
          100%   { opacity: 0; transform: translateY(-18px) scale(1.12); }
        }
        @keyframes ldrShake {
          0%, 2%, 100% { transform: translate(0, 0); }
          3%   { transform: translate(0, 3px); }   /* tap 1 */
          5%   { transform: translate(0, 0); }
          18%  { transform: translate(0, 2px); }   /* tap 2 */
          20%  { transform: translate(0, 0); }
          32%  { transform: translate(0, 3px); }   /* tap 3 */
          34%  { transform: translate(0, 0); }
        }
        @keyframes ldrFlash {
          0%   { opacity: 0; transform: scale(.35); }
          40%  { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0; transform: scale(2.4); }
        }
        @keyframes ldrMote {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          15%  { opacity: .8; }
          85%  { opacity: .5; }
          100% { transform: translateY(-46vmin) translateX(6vmin); opacity: 0; }
        }
        @keyframes ldrBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        @keyframes ldrFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ldrPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,215,0,.35); }
          60%      { box-shadow: 0 0 0 12px rgba(255,215,0,0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .ldr-beam, .ldr-glare, .ldr-pool, .ldr-mic, .ldr-stage, .ldr-mote { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      <div className="ldr-stage">
        <div className="ldr-beam" />
        <div className="ldr-glare" />
        <div className="ldr-pool" />

        {/* Dust drifting through the beam */}
        {!reduced && [...Array(9)].map((_, i) => (
          <div key={i} className="ldr-mote" style={{
            width: 2 + (i % 3), height: 2 + (i % 3),
            left: `${40 + ((i * 7) % 22)}%`,
            bottom: `${18 + ((i * 11) % 26)}%`,
            animationDuration: `${4 + (i % 4)}s`,
            animationDelay: `${i * 0.32}s`,
          }} />
        ))}

        {/* Mic on a stand, in silhouette with a rim of stage light */}
        <svg className="ldr-mic" viewBox="0 0 120 268" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="ldrRim" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFD700" stopOpacity=".95" />
              <stop offset="42%" stopColor="#FFD700" stopOpacity=".18" />
              <stop offset="100%" stopColor="#FF8C00" stopOpacity=".5" />
            </linearGradient>
          </defs>
          <g stroke="url(#ldrRim)" strokeWidth="2" fill="#080808" strokeLinecap="round">
            <rect x="46" y="10" width="28" height="52" rx="14" />
            <path d="M50 22h20M50 30h20M50 38h20M50 46h20" strokeWidth="1.2" opacity=".55" />
            <path d="M38 52a22 22 0 0 0 44 0" fill="none" strokeWidth="2.4" />
            <rect x="56.5" y="62" width="7" height="26" rx="3" />
            <rect x="57" y="86" width="6" height="136" rx="3" />
            <path d="M52 118h16" strokeWidth="3" />
            <ellipse cx="60" cy="228" rx="15" ry="4.5" />
            <path d="M60 222v6M60 228l-26 22M60 228l26 22M60 228v24" strokeWidth="2.6" fill="none" />
            <ellipse cx="60" cy="252" rx="42" ry="7" fill="none" strokeOpacity=".35" />
          </g>
        </svg>

        <div className="ldr-caption">
          <div className="ldr-name">
            {NAME.slice(0, reduced ? NAME.length : typed)}
            {!reduced && typed < NAME.length && <span className="ldr-cursor" />}
          </div>
          <div className="ldr-sub">mic check … 1, 2</div>
        </div>
      </div>

      <div className={`ldr-flash${blown ? " on" : ""}`} />

      {needsTap && (
        <button className="ldr-btn ldr-sound" onClick={unmute} aria-label="Turn sound on">
          🔊 sound
        </button>
      )}
      <button className="ldr-btn ldr-skip" onClick={finish}>skip</button>
    </div>
  );
}
