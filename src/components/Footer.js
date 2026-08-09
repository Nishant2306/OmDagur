import { useState, useRef, useLayoutEffect } from "react";
import { T, useTheme, CHANNELS } from "../theme";

const NAME = "OM DAGUR";
const CONFETTI = ["😂", "🎤", "✨", "🤣", "🎭", "💛", "🎉", "🔥", "😭", "🎪"];

const NAV = [
  { label: "Watch", href: "#showcase" },
  { label: "Gallery", href: "#gallery" },
  { label: "Channels", href: "#channels" },
  { label: "Book a Show", href: "#book" },
];

const FOLLOW = [
  { label: "Instagram", href: "https://www.instagram.com/omdagur1" },
  { label: "Threads", href: "https://www.threads.com/@omdagur1" },
  { label: "YouTube — Stand Up", href: "https://www.youtube.com/@omdagur1" },
  { label: "YouTube — Music", href: "https://www.youtube.com/@omdagur" },
];

export default function Footer() {
  const { mode } = useTheme();
  const t = T[mode];
  const [bursts, setBursts] = useState([]);
  const [hovered, setHovered] = useState(-1);
  const [tickles, setTickles] = useState(0);
  const idRef = useRef(0);

  /* The giant name is sized in vw, so at some widths it rendered wider than the
     footer and got cropped at both ends ("M DAGU"). Rather than guessing a font
     size, measure the text and scale it down to fit.

     The row is width:max-content so its offsetWidth is the true natural width —
     as a normal-width flex container the letters simply overflowed it, and
     scrollWidth ignored the overflow on the left, under-reporting the width. */
  const nameWrapRef = useRef(null);
  const nameRowRef = useRef(null);
  const [fit, setFit] = useState(1);

  useLayoutEffect(() => {
    const measure = () => {
      const wrap = nameWrapRef.current, row = nameRowRef.current;
      if (!wrap || !row) return;
      const avail = wrap.clientWidth - 20;          // room for the stroke width
      const natural = row.offsetWidth;              // layout metric: ignores transform
      setFit(natural > 0 && natural > avail ? avail / natural : 1);
    };
    measure();
    // ResizeObserver watches the box itself, so it also catches layout changes
    // that never fire a window resize event (zoom, scrollbar appearing, etc).
    let ro;
    if (typeof ResizeObserver !== "undefined" && nameWrapRef.current) {
      ro = new ResizeObserver(measure);
      ro.observe(nameWrapRef.current);
    }
    window.addEventListener("resize", measure);
    // Re-measure after the webfont swaps in — Syne is wider than the fallback.
    if (document.fonts?.ready) document.fonts.ready.then(measure).catch(() => {});
    return () => {
      window.removeEventListener("resize", measure);
      if (ro) ro.disconnect();
    };
  }, []);

  const burst = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const batch = [...Array(14)].map((_, i) => {
      const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.4;
      const dist = 90 + Math.random() * 130;
      return {
        id: idRef.current++,
        emoji: CONFETTI[Math.floor(Math.random() * CONFETTI.length)],
        x: cx, y: cy,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - 60,
        rot: (Math.random() - 0.5) * 520,
        size: 16 + Math.random() * 18,
      };
    });
    setBursts((b) => [...b, ...batch]);
    setTickles((n) => n + 1);
    const ids = new Set(batch.map((b) => b.id));
    setTimeout(() => setBursts((b) => b.filter((x) => !ids.has(x.id))), 1400);
  };

  const linkStyle = {
    display: "block", padding: "7px 0",
    fontFamily: "'DM Sans', sans-serif", fontSize: 14,
    color: t.textMuted, textDecoration: "none", transition: "all .25s ease", width: "fit-content",
  };
  const hoverIn = (e) => { e.currentTarget.style.color = t.accent; e.currentTarget.style.transform = "translateX(5px)"; };
  const hoverOut = (e) => { e.currentTarget.style.color = t.textMuted; e.currentTarget.style.transform = "translateX(0)"; };

  const colTitle = {
    fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: ".26em",
    textTransform: "uppercase", color: t.accent, opacity: .8, marginBottom: 14,
  };

  return (
    <footer style={{ position: "relative", zIndex: 2, marginTop: 40, borderTop: `1px solid ${t.border}`, overflow: "hidden" }}>
      <style>{`
        @keyframes ftPop {
          0%   { opacity: 0; transform: translate(0,0) scale(.4) rotate(0deg); }
          14%  { opacity: 1; transform: translate(calc(var(--dx) * .3), calc(var(--dy) * .45)) scale(1.15) rotate(calc(var(--rot) * .25)); }
          100% { opacity: 0; transform: translate(var(--dx), calc(var(--dy) + 190px)) scale(.7) rotate(var(--rot)); }
        }
        @keyframes ftBlip { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
        .ft-cols {
          display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr;
          gap: 40px; max-width: 1200px; margin: 0 auto;
          padding: 64px 24px 40px;
        }
        .ft-letter { display: inline-block; transition: transform .35s cubic-bezier(.22,1,.36,1), color .35s ease; }
        .ft-bottom {
          max-width: 1200px; margin: 0 auto; padding: 22px 24px 34px;
          display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;
        }
        @media (max-width: 900px) { .ft-cols { grid-template-columns: 1fr 1fr; gap: 32px; padding: 48px 24px 32px; } }
        @media (max-width: 560px) { .ft-cols { grid-template-columns: 1fr; } .ft-bottom { justify-content: center; text-align: center; } }
      `}</style>

      {/* columns */}
      <div className="ft-cols">
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 9,
            padding: "7px 15px", borderRadius: 40,
            background: `rgba(${t.accentRgb},.10)`, border: `1px solid rgba(${t.accentRgb},.28)`,
            marginBottom: 18,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#3ddc84", animation: "ftBlip 1.8s ease-in-out infinite" }} />
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: t.accent }}>
              Open for bookings
            </span>
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: t.textMuted, lineHeight: 1.75, maxWidth: 330, margin: 0 }}>
            I'm a stand-up comic turning desi struggles into punchlines. Got a stage, an office party or a fest? Let's talk.
          </p>
          <a href="#book" style={{
            display: "inline-flex", alignItems: "center", gap: 9, marginTop: 22,
            padding: "13px 26px", borderRadius: 50,
            background: t.accent, color: t.onAccent, textDecoration: "none",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14,
            boxShadow: `0 8px 26px rgba(${t.accentRgb},.28)`, transition: "transform .3s ease",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
          >🎫 Book a Show</a>
        </div>

        <div>
          <div style={colTitle}>Explore</div>
          {NAV.map((l) => (
            <a key={l.label} href={l.href} style={linkStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>{l.label}</a>
          ))}
        </div>

        <div>
          <div style={colTitle}>Follow</div>
          {FOLLOW.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={linkStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
              {l.label} <span style={{ opacity: .45, fontSize: 11 }}>↗</span>
            </a>
          ))}
        </div>

        <div>
          <div style={colTitle}>Subscribe</div>
          {CHANNELS.map((c) => (
            <a key={c.id} href={`${c.url}?sub_confirmation=1`} target="_blank" rel="noopener noreferrer" style={linkStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
              {c.icon} {c.label} <span style={{ opacity: .45, fontSize: 11 }}>↗</span>
            </a>
          ))}
          <a href={`mailto:omdagur1@gmail.com`} style={{ ...linkStyle, marginTop: 10 }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
            ✉️ omdagur1@gmail.com
          </a>
        </div>
      </div>

      {/* giant clickable name */}
      <div
        onClick={burst}
        title="go on, poke it"
        style={{ position: "relative", cursor: "pointer", userSelect: "none" }}
      >
        {/* Only the text is clipped — the emoji burst below must stay free to
            fly outside this box. */}
        <div
          ref={nameWrapRef}
          style={{ overflow: "hidden", display: "flex", justifyContent: "center", padding: "10px 10px 0" }}
        >
        <div
          ref={nameRowRef}
          onMouseLeave={() => setHovered(-1)}
          style={{
            display: "flex", alignItems: "flex-end",
            width: "max-content",
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: "clamp(44px, 13.5vw, 200px)", lineHeight: .9,
            letterSpacing: "-0.03em", whiteSpace: "nowrap",
            transform: `scale(${fit})`, transformOrigin: "50% 100%",
          }}
        >
          {NAME.split("").map((ch, i) => {
            const near = hovered >= 0 && Math.abs(hovered - i) <= 1;
            const isHot = hovered === i;
            return (
              <span
                key={i}
                className="ft-letter"
                onMouseEnter={() => setHovered(i)}
                style={{
                  color: isHot ? t.accent : "transparent",
                  WebkitTextStroke: `1.5px ${isHot ? t.accent : `rgba(${t.accentRgb},.35)`}`,
                  transform: near ? `translateY(${isHot ? -18 : -7}px)` : "translateY(0)",
                  minWidth: ch === " " ? "0.28em" : undefined,
                }}
              >{ch === " " ? " " : ch}</span>
            );
          })}
          </div>
        </div>

        {bursts.map((b) => (
          <span key={b.id} aria-hidden="true" style={{
            position: "absolute", left: b.x, top: b.y,
            fontSize: b.size, pointerEvents: "none", zIndex: 5,
            "--dx": `${b.dx}px`, "--dy": `${b.dy}px`, "--rot": `${b.rot}deg`,
            animation: "ftPop 1.4s cubic-bezier(.2,.7,.35,1) forwards",
          }}>{b.emoji}</span>
        ))}
      </div>

      {/* bottom bar */}
      <div className="ft-bottom">
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: t.textFaint }}>
          © {new Date().getFullYear()} Om Dagur — making India laugh, one joke at a time.
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: t.textFaint }}>
            {tickles > 0
              ? `${tickles} ${tickles === 1 ? "poke" : "pokes"} — keep going 👀`
              : "psst — click the big name"}
          </span>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "9px 16px", borderRadius: 40, cursor: "pointer",
              background: "transparent", border: `1px solid ${t.border}`, color: t.textMuted,
              fontFamily: "'Space Mono', monospace", fontSize: 10,
              letterSpacing: ".16em", textTransform: "uppercase", transition: "all .3s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textMuted; }}
          >↑ Back to top</button>
        </span>
      </div>
    </footer>
  );
}
