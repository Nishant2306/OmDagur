import { useState, useEffect, useRef } from "react";
import { T, useTheme } from "../theme";
import { usePrefersReducedMotion } from "../shared";

/* ─────────────────────────────────────────────
   Split-flap departure board, sitting under the hero.

   Replaces the old two-band marquee: a filled yellow slab with black
   text on a diagonal reads as hazard tape, which is not the association
   a comedian wants. Here gold is an accent on a dark board instead.

   Edit BOARD_WORDS to change what he's bookable for. Keep each one at
   or under CELLS characters or it gets clipped.
   ───────────────────────────────────────────── */
const BOARD_WORDS = [
  "OFFICE PARTIES",
  "COLLEGE FESTS",
  "CORPORATE DOS",
  "SANGEET NIGHTS",
  "HOUSE PARTIES",
  "BRAND COLLABS",
  "OPEN MICS",
];

const CELLS = 14;
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ&  ";
const TICK_MS = 45;      // how fast the flaps churn
const HOLD_MS = 4200;    // how long a word rests before the next one

/* Centre the word across the board, like a real destination row. */
const pad = (w) => {
  const spare = Math.max(0, CELLS - w.length);
  const left = Math.floor(spare / 2);
  return (" ".repeat(left) + w + " ".repeat(spare - left)).slice(0, CELLS);
};

/* Each cell settles a little later than the one before it, so the word
   resolves left to right the way a real board does. */
const SETTLE_AT = Array.from({ length: CELLS }, (_, i) => 6 + i * 2);
const MAX_FRAMES = Math.max(...SETTLE_AT);

export default function FlapBoard() {
  const { mode } = useTheme();
  const t = T[mode];
  const reduced = usePrefersReducedMotion();

  const [chars, setChars] = useState(() => pad(BOARD_WORDS[0]).split(""));
  const [frame, setFrame] = useState(MAX_FRAMES + 1); // start settled
  const wordIdx = useRef(0);
  const timers = useRef([]);

  useEffect(() => {
    if (reduced) return;                     // static board, no churn
    const clearAll = () => { timers.current.forEach(clearInterval); timers.current.forEach(clearTimeout); timers.current = []; };

    const flapTo = (word) => {
      const target = pad(word).split("");
      let f = 0;
      const iv = setInterval(() => {
        f += 1;
        setFrame(f);
        setChars(() =>
          target.map((ch, i) =>
            f >= SETTLE_AT[i] ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          )
        );
        if (f > MAX_FRAMES) clearInterval(iv);
      }, TICK_MS);
      timers.current.push(iv);
    };

    const cycle = setInterval(() => {
      wordIdx.current = (wordIdx.current + 1) % BOARD_WORDS.length;
      flapTo(BOARD_WORDS[wordIdx.current]);
    }, HOLD_MS);
    timers.current.push(cycle);

    return clearAll;
  }, [reduced]);

  const cellDark = "#111111";

  return (
    <section className="flap-band" aria-labelledby="flap-title">
      <style>{`
        /* No panel, no card - this is a divider between the hero and the
           showcase, not a feature of its own. Just content on the page. */
        .flap-band {
          position: relative; z-index: 3;
          padding: clamp(46px, 8vw, 96px) 20px;
          display: flex; justify-content: center;
        }
        .flap-outer, .flap-stage {
          display: flex; flex-direction: column; align-items: center;
          gap: clamp(16px, 2.6vw, 22px);
        }
        .flap-top {
          display: inline-flex; align-items: center; gap: 9px;
          font-family: 'Space Mono', ui-monospace, monospace;
          font-size: 10px; letter-spacing: .32em; text-transform: uppercase;
          color: ${t.accent}; opacity: .75;
        }
        .flap-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #3ddc84;
          animation: flapBlink 1.8s ease-in-out infinite;
        }
        @keyframes flapBlink { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
        .flap-row { display: flex; gap: clamp(2px, .55vw, 5px); }
        .flap-cell {
          width: clamp(17px, 4.1vw, 34px);
          height: clamp(25px, 5.9vw, 48px);
          border-radius: 4px;
          background: ${cellDark};
          border: 1px solid rgba(255,255,255,.09);
          color: #F4F1E6;
          display: grid; place-items: center;
          font-family: 'Space Mono', ui-monospace, monospace;
          font-weight: 700;
          font-size: clamp(11px, 2.6vw, 21px);
          position: relative; overflow: hidden;
          box-shadow: inset 0 -6px 12px rgba(0,0,0,.45);
        }
        /* the hinge line down the middle of every flap */
        .flap-cell::after {
          content: ''; position: absolute; left: 0; right: 0; top: 50%;
          height: 1px; background: rgba(0,0,0,.6);
        }
        .flap-cell.churn {
          animation: flapChurn ${TICK_MS * 2}ms linear infinite;
          color: ${t.accent};
        }
        @keyframes flapChurn {
          0%   { transform: scaleY(1); }
          50%  { transform: scaleY(.68); }
          100% { transform: scaleY(1); }
        }

        /* Understated on purpose - a filled button here would make the
           divider look like a section again. */
        .flap-cta {
          display: inline-flex; align-items: center; gap: 9px;
          padding: 10px 22px; border-radius: 50px;
          background: transparent; color: ${t.accent};
          border: 1px solid rgba(${t.accentRgb},.4);
          text-decoration: none;
          font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px;
          transition: background .3s ease, border-color .3s ease;
          white-space: nowrap;
        }
        .flap-cta:hover { background: rgba(${t.accentRgb},.1); border-color: ${t.accent}; }
        .flap-cta .arrow { transition: transform .3s ease; }
        .flap-cta:hover .arrow { transform: translateX(4px); }

        @media (prefers-reduced-motion: reduce) {
          .flap-cell.churn, .flap-dot { animation: none; }
        }
      `}</style>

      <div className="flap-outer">
        <div className="flap-top" id="flap-title">
          <i className="flap-dot" /> Now booking
        </div>

        <div className="flap-stage">
          {/* The board is a picture of text; give assistive tech the plain list. */}
          <div className="flap-row" role="img" aria-label={`Now booking: ${BOARD_WORDS.join(", ")}`}>
            {chars.map((c, i) => (
              <span
                key={i}
                aria-hidden="true"
                className={`flap-cell${!reduced && frame < SETTLE_AT[i] ? " churn" : ""}`}
              >{c === " " ? " " : c}</span>
            ))}
          </div>

          <a className="flap-cta" href="#book">
            Invite me to perform <span className="arrow" aria-hidden="true">→</span>
          </a>

        </div>
      </div>
    </section>
  );
}
