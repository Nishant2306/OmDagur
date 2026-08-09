import { useState } from "react";
import { T, useTheme, embedUrl, watchUrl } from "../theme";
import { Reveal, Thumb, PlayGlyph } from "../shared";

const FILTERS = [
  { id: "all", label: "Everything" },
  { id: "video", label: "Full Videos" },
  { id: "short", label: "Shorts" },
];

function GalleryCard({ item, index, t, mode }) {
  const [playing, setPlaying] = useState(false);
  const [hov, setHov] = useState(false);
  const isShort = item.kind === "short";

  // The span class must sit on the grid's direct child — that's this Reveal,
  // not the card inside it.
  return (
    <Reveal
      delay={Math.min(index * 0.08, 0.4)}
      className={isShort ? "gal-card-short" : "gal-card-video"}
      style={{ height: "100%" }}
    >
      <div
        className="gal-card"
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          borderRadius: 20, overflow: "hidden", height: "100%",
          background: t.surface,
          border: `1px solid ${hov ? t.cardBorderHover : t.cardBorder}`,
          transform: hov ? "translateY(-6px)" : "translateY(0)",
          boxShadow: hov ? `0 30px 70px rgba(${t.accentRgb},0.14)` : `0 10px 34px ${t.shadow}`,
          transition: "all .5s cubic-bezier(.22,1,.36,1)",
          display: "flex", flexDirection: "column",
        }}
      >
        <div className={`gal-media ${isShort ? "gal-media-short" : "gal-media-video"}`} style={{ position: "relative", width: "100%", background: t.playBg, overflow: "hidden" }}>
          {playing ? (
            <iframe
              title={item.title}
              src={embedUrl(item, { autoplay: true, mute: false })}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <button
              onClick={() => setPlaying(true)}
              aria-label={`Play ${item.title}`}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", padding: 0, border: "none", background: "none", cursor: "pointer" }}
            >
              <div style={{ position: "absolute", inset: 0, transform: hov ? "scale(1.06)" : "scale(1)", transition: "transform .7s cubic-bezier(.22,1,.36,1)" }}>
                <Thumb item={item} />
              </div>
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgba(0,0,0,.15) 0%, rgba(0,0,0,.15) 45%, rgba(0,0,0,.72) 100%)` }} />
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: `translate(-50%,-50%) scale(${hov ? 1.12 : 1})`,
                width: 68, height: 68, borderRadius: "50%",
                background: `rgba(${t.accentRgb},.94)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 40px rgba(${t.accentRgb},.45)`,
                transition: "transform .4s cubic-bezier(.22,1,.36,1)",
              }}>
                <PlayGlyph size={22} color={mode === "dark" ? "#050505" : "#fff"} />
              </div>
              <span style={{
                position: "absolute", top: 14, left: 14,
                fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: ".2em",
                textTransform: "uppercase", color: "#fff",
                background: "rgba(0,0,0,.55)", backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,.18)",
                borderRadius: 30, padding: "5px 11px",
              }}>{isShort ? "Short" : "Full Video"}</span>
            </button>
          )}

          {/* opens YouTube in a new tab */}
          <a
            href={watchUrl(item)} target="_blank" rel="noopener noreferrer"
            title="Open on YouTube in a new tab"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute", top: 12, right: 12, zIndex: 3,
              width: 34, height: 34, borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,.55)", backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,.18)",
              color: "#fff", textDecoration: "none", fontSize: 14, transition: "all .3s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = t.accent; e.currentTarget.style.color = mode === "dark" ? "#050505" : "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,.55)"; e.currentTarget.style.color = "#fff"; }}
          >↗</a>
        </div>

        <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 19, color: t.text, margin: 0, lineHeight: 1.2 }}>{item.title}</h3>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: t.textMuted, margin: 0 }}>{item.subtitle}</p>
          <div style={{ display: "flex", gap: 16, marginTop: "auto", paddingTop: 12, flexWrap: "wrap" }}>
            {!playing && (
              <button
                onClick={() => setPlaying(true)}
                style={{
                  background: "none", border: "none", padding: 0, cursor: "pointer",
                  color: t.accent, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
                }}
              >▶ Play here</button>
            )}
            <a
              href={watchUrl(item)} target="_blank" rel="noopener noreferrer"
              style={{ color: t.textMuted, textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, transition: "color .3s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = t.accent; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = t.textMuted; }}
            >Watch on YouTube ↗</a>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export default function Gallery({ items }) {
  const { mode } = useTheme();
  const t = T[mode];
  const [filter, setFilter] = useState("all");

  const shown = filter === "all" ? items : items.filter((i) => i.kind === filter);

  return (
    <section id="gallery" style={{ padding: "110px 24px 100px", maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 2 }}>
      <style>{`
        .gal-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 24px; align-items: stretch; }
        .gal-card-video { grid-column: span 3; }
        .gal-card-short { grid-column: span 2; }
        .gal-media-video { aspect-ratio: 16 / 9; }
        .gal-media-short { aspect-ratio: 9 / 16; }
        @media (max-width: 1040px) {
          .gal-card-video { grid-column: span 6; }
          .gal-card-short { grid-column: span 3; }
          .gal-media-short { aspect-ratio: 3 / 4; }
        }
        @media (max-width: 620px) {
          .gal-grid { gap: 18px; }
          .gal-card-video, .gal-card-short { grid-column: span 6; }
          .gal-media-short { aspect-ratio: 4 / 3; }
        }
      `}</style>

      <Reveal>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div className="section-label">The Gallery</div>
          <h2 className="section-title" style={{ marginBottom: 14 }}>
            Every <span style={{ color: t.accent }}>bit</span>, one place
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: t.textFaint, maxWidth: 460, margin: "0 auto", lineHeight: 1.6 }}>
            Hit play to watch right here, or pop it open on YouTube in a new tab.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 40, flexWrap: "wrap" }}>
          {FILTERS.map((f) => {
            const on = filter === f.id;
            const count = f.id === "all" ? items.length : items.filter((i) => i.kind === f.id).length;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  padding: "10px 20px", borderRadius: 40, cursor: "pointer",
                  border: `1px solid ${on ? `rgba(${t.accentRgb},.55)` : t.border}`,
                  background: on ? `rgba(${t.accentRgb},.12)` : "transparent",
                  color: on ? t.accent : t.textMuted,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
                  transition: "all .3s ease", display: "inline-flex", alignItems: "center", gap: 8,
                }}
              >
                {f.label}
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, opacity: .6 }}>{count}</span>
              </button>
            );
          })}
        </div>
      </Reveal>

      <div className="gal-grid">
        {shown.map((item, i) => (
          <GalleryCard key={item.id} item={item} index={i} t={t} mode={mode} />
        ))}
      </div>
    </section>
  );
}
