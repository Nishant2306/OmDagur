import { useState, useEffect, useRef } from "react";
import { T, useTheme, embedUrl, watchUrl } from "../theme";
import { Thumb, PlayGlyph, usePrefersReducedMotion, useIsMobile, postToPlayer as post, useYouTubeController, startListening } from "../shared";

const fmtTime = (s) => {
  if (!s || !isFinite(s)) return "0:00";
  const total = Math.floor(s), h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60), sec = total % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
};

/* Always-on transport controls for the active player.
   YouTube's own bar hides itself and only returns on mouse movement inside
   the iframe - which never happens here, because the video slides under a
   stationary cursor rather than the cursor moving onto it. */
function PlayerBar({ yt, t, mode, watchHref, isMob }) {
  const pct = yt.duration ? Math.min(100, (yt.time / yt.duration) * 100) : 0;

  const btn = (extra = {}) => ({
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    border: `1px solid ${t.border}`, background: "transparent",
    color: t.textMuted, cursor: "pointer", borderRadius: 40,
    transition: "all .2s ease", padding: 0, lineHeight: 1,
    fontFamily: "'Space Mono', monospace", fontSize: 11,
    ...extra,
  });
  const hoverOn = (e) => { e.currentTarget.style.color = t.accent; e.currentTarget.style.borderColor = `rgba(${t.accentRgb},.55)`; };
  const hoverOff = (e) => { e.currentTarget.style.color = t.textMuted; e.currentTarget.style.borderColor = t.border; };

  const seekFromClick = (e) => {
    if (!yt.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    yt.seekTo(((e.clientX - r.left) / r.width) * yt.duration);
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: isMob ? 8 : 12,
      padding: isMob ? "8px 12px" : "9px 16px", borderRadius: 40,
      background: mode === "dark" ? "rgba(12,12,12,.82)" : "rgba(255,255,255,.7)",
      backdropFilter: "blur(14px)",
      border: `1px solid ${t.border}`,
      boxShadow: `0 10px 34px ${t.shadow}`,
      pointerEvents: "auto",
      width: "100%",
    }}>
      <button onClick={() => yt.nudge(-10)} aria-label="Back 10 seconds"
        style={btn({ width: 32, height: 32, fontSize: 10 })}
        onMouseEnter={hoverOn} onMouseLeave={hoverOff}>-10</button>

      <button onClick={yt.toggle} aria-label={yt.playing ? "Pause" : "Play"}
        style={btn({
          width: 40, height: 40, background: t.accent, border: "none",
          color: t.onAccent, fontSize: 15, flexShrink: 0,
        })}>
        {yt.playing
          ? <span style={{ letterSpacing: 1, fontWeight: 700 }}>❚❚</span>
          : <PlayGlyph size={13} color={mode === "dark" ? "#050505" : "#fff"} />}
      </button>

      <button onClick={() => yt.nudge(10)} aria-label="Forward 10 seconds"
        style={btn({ width: 32, height: 32, fontSize: 10 })}
        onMouseEnter={hoverOn} onMouseLeave={hoverOff}>+10</button>

      {/* progress - click anywhere to seek */}
      <div
        onClick={seekFromClick}
        role="slider" aria-label="Seek" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} tabIndex={0}
        style={{ flex: 1, height: 16, display: "flex", alignItems: "center", cursor: "pointer", minWidth: 40 }}
      >
        <div style={{ position: "relative", width: "100%", height: 4, borderRadius: 3, background: t.border }}>
          <div style={{ position: "absolute", inset: 0, width: `${pct}%`, background: t.accent, borderRadius: 3 }} />
          <div style={{
            position: "absolute", top: "50%", left: `${pct}%`,
            transform: "translate(-50%,-50%)", width: 10, height: 10,
            borderRadius: "50%", background: t.accent,
          }} />
        </div>
      </div>

      {!isMob && (
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: t.textFaint, whiteSpace: "nowrap" }}>
          {fmtTime(yt.time)} / {fmtTime(yt.duration)}
        </span>
      )}

      <button onClick={() => (yt.muted ? yt.unMute() : yt.mute())}
        aria-label={yt.muted ? "Unmute" : "Mute"}
        style={btn({
          width: 32, height: 32, fontSize: 13,
          color: yt.muted ? t.textMuted : t.accent,
          borderColor: yt.muted ? t.border : `rgba(${t.accentRgb},.55)`,
        })}>{yt.muted ? "🔇" : "🔊"}</button>

      <a href={watchHref} target="_blank" rel="noopener noreferrer" aria-label="Watch on YouTube"
        style={{ ...btn({ width: 32, height: 32, fontSize: 12, textDecoration: "none" }) }}
        onMouseEnter={hoverOn} onMouseLeave={hoverOff}>↗</a>
    </div>
  );
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* Scroll distance allotted to each item, in vh. Higher = the stack advances
   more slowly, giving each embed time to load before it's scrolled past. */
const STEP_VH = 135;

/* ── Device shells ───────────────────────────────────────── */

function PhoneShell({ t, active, children }) {
  return (
    <div style={{
      position: "relative",
      aspectRatio: "9 / 16",
      height: "min(64vh, 600px)",
      borderRadius: 44,
      background: t.deviceShell,
      border: `2px solid ${active ? `rgba(${t.accentRgb},0.55)` : t.deviceEdge}`,
      padding: 9,
      transition: "border-color .5s ease, box-shadow .5s ease",
      boxShadow: active
        ? `0 0 90px rgba(${t.accentRgb},0.28), 0 40px 90px ${t.shadowStrong}`
        : `0 20px 50px ${t.shadow}`,
    }}>
      <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", width: 92, height: 24, borderRadius: 14, background: t.deviceShell, zIndex: 4, pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: -3, top: "22%", width: 3, height: 34, borderRadius: 2, background: t.deviceEdge }} />
      <div style={{ position: "absolute", left: -3, top: "32%", width: 3, height: 54, borderRadius: 2, background: t.deviceEdge }} />
      <div style={{ position: "absolute", right: -3, top: "26%", width: 3, height: 62, borderRadius: 2, background: t.deviceEdge }} />
      <div style={{ width: "100%", height: "100%", borderRadius: 36, overflow: "hidden", background: "#000", position: "relative" }}>
        {children}
      </div>
    </div>
  );
}

function LaptopShell({ t, active, children }) {
  return (
    // width is capped by viewport height too, so the lid never overflows the stage
    <div style={{ width: "min(88vw, 1200px, 112vh)", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{
        position: "relative", width: "100%", aspectRatio: "16 / 10",
        borderRadius: "16px 16px 5px 5px",
        background: t.deviceShell,
        border: `2px solid ${active ? `rgba(${t.accentRgb},0.5)` : t.deviceEdge}`,
        padding: "16px 14px",
        transition: "border-color .5s ease, box-shadow .5s ease",
        boxShadow: active
          ? `0 0 90px rgba(${t.accentRgb},0.24), 0 40px 90px ${t.shadowStrong}`
          : `0 20px 50px ${t.shadow}`,
      }}>
        <div style={{ position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", width: 6, height: 6, borderRadius: "50%", background: t.deviceEdge }} />
        <div style={{ width: "100%", height: "100%", borderRadius: 5, overflow: "hidden", background: "#000", position: "relative" }}>
          {children}
        </div>
      </div>
      <div style={{
        width: "112%", height: 15,
        background: `linear-gradient(180deg, ${t.deviceShell}, ${t.deviceBase})`,
        borderRadius: "0 0 14px 14px",
        clipPath: "polygon(1.5% 0, 98.5% 0, 100% 100%, 0 100%)",
        display: "flex", justifyContent: "center", alignItems: "flex-start",
        boxShadow: `0 16px 30px ${t.shadow}`,
      }}>
        <div style={{ width: 92, height: 5, borderRadius: "0 0 6px 6px", background: t.deviceEdge }} />
      </div>
    </div>
  );
}

/* ── One item on the stage ───────────────────────────────── */

function Stagepiece({ item, offset, isActive, isPlaying, onPlayRef, onPlayerLoad, t, mode, yt, isMob }) {
  const a = Math.abs(offset);
  // Nothing beyond the immediate neighbours needs to exist.
  if (a > 1.25) return null;

  /* Vertical travel: the outgoing item rises and shrinks away, the incoming
     one climbs from below and grows into place. */
  const y = offset * 74;                       // vh
  const scale = Math.max(0.42, 1 - a * 0.44);
  const opacity = clamp(1 - a * 1.05, 0, 1);

  const Shell = item.kind === "short" ? PhoneShell : LaptopShell;

  return (
    <div
      style={{
        position: "absolute", top: "50%", left: "50%",
        transform: `translate(-50%, -50%) translateY(${y}vh) scale(${scale})`,
        opacity,
        zIndex: 60 - Math.round(a * 10),
        willChange: "transform, opacity",
        /* Driven by the index, not by how close the scroll happens to have
           landed. Gating on a distance threshold meant the centred item was
           often still pointer-events:none, so YouTube's controls never
           appeared on hover and clicks did nothing. */
        pointerEvents: isActive ? "auto" : "none",
      }}
    >
      {/* Controls live INSIDE this transformed wrapper, so they travel and
          scale with the device instead of sitting at a fixed spot on the
          stage while the video slides away from them. */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <Shell t={t} active={isActive}>
        {isPlaying ? (
          <iframe
            ref={onPlayRef}
            title={item.title}
            /* Always mute=1 in the URL: browsers only allow autoplay when
               muted. Sound is then turned on via postMessage, which also
               means toggling it never reloads the embed. */
            src={embedUrl(item, { autoplay: true, mute: true })}
            onLoad={(e) => {
              // Every fresh iframe needs its own handshake, or the controls
              // sit frozen on the previous player's last reported time.
              startListening(e.currentTarget);
              post(e.currentTarget, "unMute");
              onPlayerLoad();
            }}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <>
            <Thumb item={item} style={{ opacity: 0.55 }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.35)" }}>
              <div style={{
                width: 62, height: 62, borderRadius: "50%",
                background: `rgba(${t.accentRgb},.9)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 34px rgba(${t.accentRgb},.45)`,
              }}>
                <PlayGlyph size={20} color={mode === "dark" ? "#050505" : "#fff"} />
              </div>
            </div>
          </>
        )}
      </Shell>
        {isPlaying && yt && (
          <div style={{ width: "min(100%, 560px)" }}>
            <PlayerBar yt={yt} t={t} mode={mode} isMob={isMob} watchHref={watchUrl(item)} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── The showcase ────────────────────────────────────────── */

export default function ScrollShowcase({ items, galleryHref = "#/gallery" }) {
  const { mode } = useTheme();
  const t = T[mode];
  const reduced = usePrefersReducedMotion();
  const isMob = useIsMobile();
  const sectionRef = useRef(null);
  const frameRefs = useRef({});
  const activeFrameRef = useRef(null);
  const settleTimer = useRef(null);

  const [raw, setRaw] = useState(0);
  const [playing, setPlaying] = useState(-1);
  // Whether the sticky stage is the thing you're actually looking at.
  const [onStage, setOnStage] = useState(false);

  const N = items.length;
  const active = Math.round(raw);
  const progress = N > 1 ? raw / (N - 1) : 1;

  useEffect(() => {
    let ticking = false;
    const measure = () => {
      ticking = false;
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const p = clamp(-rect.top / scrollable, 0, 1);
      setRaw(p * (N - 1));
      /* Tracked here rather than derived from `raw`, because `raw` is clamped:
         once you scroll past the end it stays pinned at N-1, so nothing
         changed and the last video kept playing off-screen. */
      const mid = window.innerHeight * 0.5;
      setOnStage(rect.top < mid && rect.bottom > mid);
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(measure); } };
    const onVisible = () => { if (!document.hidden) { ticking = false; measure(); } };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [N]);

  /* Only mount an iframe once the stack has settled on an item, so a fast
     scroll doesn't spin up five embeds. */
  useEffect(() => {
    if (reduced || !onStage) return;
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => setPlaying(active), 260);
    return () => clearTimeout(settleTimer.current);
  }, [active, onStage, reduced]);

  /* Scrolling past the section PAUSES rather than unmounts. Unmounting also
     threw away your position, so coming back to a video you were halfway
     through restarted it from zero. */
  useEffect(() => {
    const el = frameRefs.current[playing];
    if (!el) return;
    post(el, onStage ? "playVideo" : "pauseVideo");
  }, [onStage, playing]);

  /* Belt and braces: pause the outgoing player the moment the active item
     changes, before React gets round to unmounting its iframe. */
  useEffect(() => {
    Object.entries(frameRefs.current).forEach(([i, el]) => {
      if (el && Number(i) !== playing) post(el, "pauseVideo");
    });
  }, [playing]);

  /* Bumped whenever an iframe (re)loads. Folded into the controller's key so
     a remounted player resets the readout instead of inheriting stale values
     from the element it replaced. */
  const [playerNonce, setPlayerNonce] = useState(0);
  const yt = useYouTubeController(activeFrameRef, playing >= 0 ? `${playing}:${playerNonce}` : null);

  /* Sound on by default. A muted embed is the only kind browsers will
     autoplay, so it starts muted and is unmuted immediately - which the
     browser honours as soon as the visitor has interacted with the page
     at all. This listener catches that first interaction wherever it
     happens, so nobody has to hunt for a speaker button. */
  useEffect(() => {
    const unmuteNow = () => {
      const el = activeFrameRef.current;
      if (el) post(el, "unMute");
    };
    const G = ["pointerdown", "touchstart", "keydown"];
    G.forEach((g) => window.addEventListener(g, unmuteNow, { passive: true }));
    return () => G.forEach((g) => window.removeEventListener(g, unmuteNow));
  }, []);


  const jumpTo = (i) => {
    const el = sectionRef.current;
    if (!el || N < 2) return;
    const scrollable = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + (scrollable * i) / (N - 1), behavior: "smooth" });
  };

  const current = items[clamp(active, 0, N - 1)];
  const endish = progress > 0.84;

  const pill = {
    display: "inline-flex", alignItems: "center", gap: 7,
    padding: "7px 14px", borderRadius: 40, cursor: "pointer",
    fontFamily: "'Space Mono', monospace", fontSize: 10,
    letterSpacing: ".14em", textTransform: "uppercase",
    transition: "all .3s ease", textDecoration: "none",
    pointerEvents: "auto",
  };

  return (
    <section id="showcase" ref={sectionRef} style={{ position: "relative", zIndex: 2, height: `${N * STEP_VH}vh` }}>
      <div style={{
        position: "sticky", top: 0, height: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: "80vmin", height: "80vmin", borderRadius: "50%", pointerEvents: "none",
          background: `radial-gradient(circle, rgba(${t.accentRgb},0.07), transparent 68%)`,
        }} />

        {/* compact top label - leaves the stage free for the screen */}
        <div style={{
          position: "absolute", top: "clamp(72px, 9vh, 104px)", left: 0, right: 0,
          textAlign: "center", padding: "0 20px", zIndex: 70, pointerEvents: "none",
        }}>
          <div style={{
            fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: ".3em",
            textTransform: "uppercase", color: t.accent, opacity: .75, marginBottom: 5,
          }}>
            {String(active + 1).padStart(2, "0")} / {String(N).padStart(2, "0")} · {current.kind === "short" ? "Short" : "Full Video"}
          </div>
          <div style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: "clamp(17px, 2.4vw, 26px)", color: t.text, letterSpacing: "-0.02em",
          }}>{current.title}</div>
        </div>

        {items.map((item, i) => (
          <Stagepiece
            key={item.id}
            item={item}
            offset={i - raw}
            isActive={i === active}
            isPlaying={playing === i}
            yt={playing === i ? yt : null}
            isMob={isMob}
            onPlayerLoad={() => setPlayerNonce((n) => n + 1)}
            onPlayRef={(el) => {
              frameRefs.current[i] = el;
              if (playing === i) activeFrameRef.current = el;
            }}
            t={t} mode={mode}
          />
        ))}

        {/* bottom rail - wrapper ignores pointers so it can never sit on top
            of the player's control bar; only the controls themselves catch clicks */}
        <div style={{
          position: "absolute", bottom: "clamp(16px, 3vh, 34px)", left: 0, right: 0,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          zIndex: 70, padding: "0 20px", pointerEvents: "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ display: "flex", gap: 6, pointerEvents: "auto" }}>
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => jumpTo(i)}
                  aria-label={`Go to item ${i + 1}`}
                  style={{
                    width: i === active ? 34 : 12, height: 5, borderRadius: 3, border: "none",
                    cursor: "pointer", padding: 0,
                    background: i === active ? t.accent : t.textFaint,
                    transition: "all .45s cubic-bezier(.22,1,.36,1)",
                  }}
                />
              ))}
            </div>
            {playing < 0 && (
              <a
                href={watchUrl(current)} target="_blank" rel="noopener noreferrer"
                style={{ ...pill, border: `1px solid ${t.border}`, color: t.textMuted }}
                onMouseEnter={(e) => { e.currentTarget.style.color = t.accent; e.currentTarget.style.borderColor = `rgba(${t.accentRgb},.5)`; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = t.textMuted; e.currentTarget.style.borderColor = t.border; }}
              >YouTube ↗</a>
            )}
          </div>

          <div style={{ position: "relative", height: 48, width: "100%", display: "flex", justifyContent: "center" }}>
            <div style={{
              position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              opacity: progress < 0.1 ? 1 : 0, transition: "opacity .4s ease",
            }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: ".26em", color: t.textFaint, textTransform: "uppercase" }}>scroll</span>
              <span style={{ width: 1, height: 22, background: `linear-gradient(to bottom, ${t.accent}, transparent)`, animation: "float 2.4s ease-in-out infinite" }} />
            </div>

            {/* navigates to the gallery page in this same tab */}
            <a
              href={galleryHref}
              style={{
                position: "absolute",
                opacity: endish ? 1 : 0,
                transform: endish ? "translateY(0) scale(1)" : "translateY(18px) scale(.94)",
                pointerEvents: endish ? "auto" : "none",
                transition: "all .55s cubic-bezier(.22,1,.36,1)",
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: isMob ? "12px 22px" : "14px 30px", borderRadius: 50,
                background: t.accent, color: t.onAccent, textDecoration: "none",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                fontSize: isMob ? 13 : 14,
                boxShadow: `0 10px 40px rgba(${t.accentRgb},.35)`,
                whiteSpace: "nowrap",
              }}
            >
              See everything in the Gallery
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
