import { useRef, useEffect, useState } from "react";
import { T, useTheme } from "../theme";
import { usePrefersReducedMotion } from "../shared";

/* ─────────────────────────────────────────────
   Edit these two lists to change the ribbon.
   Row 1 = what he can be booked for (clickable → #book)
   Row 2 = the flavour of the act
   ───────────────────────────────────────────── */
const BOOKABLE = [
  { icon: "🎤", label: "Office Parties" },
  { icon: "🎓", label: "College Fests" },
  { icon: "🏢", label: "Corporate Events" },
  { icon: "💍", label: "Weddings & Sangeet" },
  { icon: "🎉", label: "Private Shows" },
  { icon: "🤝", label: "Brand Collabs" },
];

const FLAVOUR = ["Desi Struggles", "Punchlines", "Crowd Work", "Live On Stage", "Storytelling", "Hindi & Haryanvi"];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export default function Marquee() {
  const { mode } = useTheme();
  const t = T[mode];
  const reduced = usePrefersReducedMotion();

  const rowA = useRef(null);
  const rowB = useRef(null);
  const offA = useRef(0);
  const offB = useRef(0);
  const vel = useRef(0);
  const dir = useRef(1);
  const paused = useRef(false);
  const [hoverIdx, setHoverIdx] = useState(-1);

  useEffect(() => {
    if (reduced) return;

    let lastY = window.scrollY;
    let rafId;

    const onScroll = () => {
      const y = window.scrollY;
      const d = y - lastY;
      lastY = y;
      if (d !== 0) dir.current = d > 0 ? 1 : -1;
      // Cap so a flick of the wheel doesn't fling the text across the screen.
      vel.current = clamp(vel.current + Math.abs(d) * 0.9, 0, 46);
    };

    const tick = () => {
      vel.current *= 0.9; // decay back to the idle drift
      const boost = vel.current;
      const speedA = paused.current ? 0 : (1.1 + boost * 0.5) * dir.current;
      const speedB = paused.current ? 0 : (0.75 + boost * 0.36) * dir.current;

      const wrap = (ref, off) => {
        const el = ref.current;
        if (!el) return off;
        const half = el.scrollWidth / 2;
        if (half > 0) {
          if (off <= -half) off += half;
          if (off > 0) off -= half;
        }
        return off;
      };

      offA.current = wrap(rowA, offA.current - speedA);
      offB.current = wrap(rowB, offB.current + speedB);

      const skew = clamp(boost * 0.18, 0, 7) * dir.current;
      if (rowA.current) rowA.current.style.transform = `translate3d(${offA.current}px,0,0) skewX(${-skew}deg)`;
      if (rowB.current) rowB.current.style.transform = `translate3d(${offB.current}px,0,0) skewX(${skew}deg)`;

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    rafId = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [reduced]);

  const bookRow = (copy) => (
    <div style={{ display: "flex", alignItems: "center" }} aria-hidden={copy === 1}>
      {BOOKABLE.map((b, i) => {
        const key = `${copy}-${i}`;
        const hot = hoverIdx === key;
        return (
          <a
            key={key}
            href="#book"
            onMouseEnter={() => setHoverIdx(key)}
            onMouseLeave={() => setHoverIdx(-1)}
            tabIndex={copy === 1 ? -1 : 0}
            style={{
              display: "inline-flex", alignItems: "center", gap: 14,
              padding: "0 26px", textDecoration: "none", whiteSpace: "nowrap",
              color: hot ? t.bg : t.onAccent, opacity: hot ? 1 : 0.92,
              transition: "opacity .2s ease",
            }}
          >
            <span style={{ fontSize: "clamp(20px,2.4vw,34px)", lineHeight: 1 }}>{b.icon}</span>
            <span style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: "clamp(24px, 3.6vw, 52px)", textTransform: "uppercase",
              letterSpacing: "-0.02em",
              textDecoration: hot ? "underline" : "none",
              textUnderlineOffset: 8, textDecorationThickness: 2,
            }}>{b.label}</span>
            <span style={{
              fontFamily: "'Space Mono', monospace", fontSize: "clamp(9px,1vw,12px)",
              letterSpacing: ".2em", textTransform: "uppercase",
              border: `1px solid ${t.onAccent}`, borderRadius: 30, padding: "5px 12px",
              opacity: hot ? 1 : 0.5, transition: "opacity .25s ease",
            }}>Book →</span>
          </a>
        );
      })}
    </div>
  );

  const flavourRow = (copy) => (
    <div style={{ display: "flex", alignItems: "center" }} aria-hidden={copy === 1}>
      {FLAVOUR.map((f, i) => (
        <span key={`${copy}-${i}`} style={{ display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" }}>
          <span style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: "clamp(22px, 3.2vw, 46px)", textTransform: "uppercase",
            letterSpacing: "-0.02em", padding: "0 24px",
            color: "transparent", WebkitTextStroke: `1.5px ${t.accent}`,
          }}>{f}</span>
          <span style={{ color: t.accent, fontSize: "clamp(14px,1.8vw,24px)", opacity: 0.7, animation: "starSpin 9s linear infinite", display: "inline-block" }}>✦</span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className="ribbon"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
    >
      <style>{`
        .ribbon { position: relative; z-index: 3; padding: 54px 0 62px; overflow: hidden; }
        .ribbon-band { width: 116%; margin-left: -8%; position: relative; }
        .ribbon-track { display: flex; width: max-content; will-change: transform; }
        .ribbon-solid {
          transform: rotate(-2.4deg);
          background: ${t.accent};
          padding: 12px 0;
          box-shadow: 0 18px 50px rgba(${t.accentRgb},0.22);
        }
        .ribbon-outline {
          transform: rotate(2.2deg);
          margin-top: -14px;
          padding: 12px 0;
          background: ${t.bg};
          border-top: 1px solid rgba(${t.accentRgb},0.28);
          border-bottom: 1px solid rgba(${t.accentRgb},0.28);
        }
        /* fade the ends so words enter and leave instead of getting chopped */
        .ribbon::before, .ribbon::after {
          content: ''; position: absolute; top: 0; bottom: 0; width: 14vw; z-index: 5; pointer-events: none;
        }
        .ribbon::before { left: 0; background: linear-gradient(90deg, ${t.bg}, transparent); }
        .ribbon::after { right: 0; background: linear-gradient(270deg, ${t.bg}, transparent); }
        @media (max-width: 768px) {
          .ribbon { padding: 34px 0 40px; }
          .ribbon::before, .ribbon::after { width: 8vw; }
        }
      `}</style>

      <div className="ribbon-band ribbon-solid">
        <div className="ribbon-track" ref={rowA}>
          {bookRow(0)}
          {bookRow(1)}
        </div>
      </div>

      <div className="ribbon-band ribbon-outline">
        <div className="ribbon-track" ref={rowB}>
          {flavourRow(0)}
          {flavourRow(1)}
        </div>
      </div>
    </div>
  );
}
