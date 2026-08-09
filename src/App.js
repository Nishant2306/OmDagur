import { useState, useEffect, useCallback } from "react";
import { T, ThemeCtx, useTheme, MEDIA, CHANNELS, SOCIALS } from "./theme";
import { Reveal, GlitchText, useIsMobile } from "./shared";
import InteractiveBackground from "./components/InteractiveBackground";
import Loader from "./components/Loader";
import Marquee from "./components/Marquee";
import ScrollShowcase from "./components/ScrollShowcase";
import GalleryPage from "./components/GalleryPage";
import BookShow from "./components/BookShow";
import Footer from "./components/Footer";

const GALLERY_HASH = "#/gallery";

const NAV_ITEMS = [
  { label: "Watch", href: "#showcase" },
  { label: "Gallery", href: GALLERY_HASH, newTab: true },
  { label: "Channels", href: "#channels" },
  { label: "Book a Show", href: "#book" },
];

const isGalleryRoute = () =>
  typeof window !== "undefined" && window.location.hash.startsWith(GALLERY_HASH);

function HamburgerMenu() {
  const { mode } = useTheme(); const t = T[mode];
  const [open, setOpen] = useState(false);
  return (
    <div className="hamburger-wrap">
      <button onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open} style={{ width: 42, height: 42, borderRadius: 12, cursor: "pointer", border: `1px solid ${t.border}`, background: "transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: open ? 0 : 5, transition: "all 0.3s ease" }}>
        <span style={{ display: "block", width: 18, height: 2, background: t.accent, borderRadius: 2, transition: "all 0.3s ease", transform: open ? "rotate(45deg) translateY(1px)" : "rotate(0)" }} />
        {!open && <span style={{ display: "block", width: 18, height: 2, background: t.accent, borderRadius: 2 }} />}
        <span style={{ display: "block", width: 18, height: 2, background: t.accent, borderRadius: 2, transition: "all 0.3s ease", transform: open ? "rotate(-45deg) translateY(-1px)" : "rotate(0)" }} />
      </button>
      <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 8, background: t.navBg, backdropFilter: "blur(24px) saturate(1.5)", border: `1px solid ${t.border}`, borderRadius: 16, padding: open ? "12px 8px" : "0 8px", minWidth: 190, overflow: "hidden", maxHeight: open ? 320 : 0, opacity: open ? 1 : 0, transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)", pointerEvents: open ? "auto" : "none", boxShadow: open ? `0 16px 48px ${t.shadowStrong}` : "none" }}>
        {NAV_ITEMS.map((item, i) => (
          <a key={item.label} href={item.href} onClick={() => setOpen(false)}
            {...(item.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            style={{ display: "block", padding: "12px 16px", borderRadius: 10, color: t.textMuted, textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500, transition: "all 0.2s ease", opacity: open ? 1 : 0, transform: open ? "translateX(0)" : "translateX(20px)", transitionDelay: `${i * 0.05}s` }}
            onMouseEnter={(e) => { e.target.style.color = t.accent; e.target.style.background = t.surfaceHover; }}
            onMouseLeave={(e) => { e.target.style.color = t.textMuted; e.target.style.background = "transparent"; }}>
            {item.label}{item.newTab ? " ↗" : ""}
          </a>
        ))}
      </div>
    </div>
  );
}

function ChannelCard({ channel, index }) {
  const { mode } = useTheme(); const t = T[mode]; const [hov, setHov] = useState(false);
  return (
    <Reveal delay={index * 0.2} style={{ flex: "1 1 360px" }}>
      <a href={channel.url} target="_blank" rel="noopener noreferrer" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ display: "flex", alignItems: "center", gap: 24, padding: "28px 36px", borderRadius: 20, background: hov ? `rgba(${t.accentRgb},0.06)` : t.surface, border: `1px solid ${hov ? `rgba(${t.accentRgb},0.3)` : t.border}`, textDecoration: "none", transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)", transform: hov ? "translateX(8px)" : "translateX(0)", cursor: "pointer" }}>
        <span style={{ fontSize: 42, filter: hov ? "none" : "grayscale(0.5)", transition: "filter 0.3s" }}>{channel.icon}</span>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: hov ? t.accent : t.text, transition: "color 0.3s" }}>{channel.label}</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: t.textFaint, marginTop: 4 }}>{channel.sub}</div>
        </div>
        <span style={{ marginLeft: "auto", fontSize: 24, color: hov ? t.accent : t.textFaint, transition: "all 0.3s", transform: hov ? "translateX(4px)" : "translateX(0)" }}>→</span>
      </a>
    </Reveal>
  );
}

function SubscribeBtn({ channel }) {
  const [h, setH] = useState(false);
  return (
    <a href={`${channel.url}?sub_confirmation=1`} target="_blank" rel="noopener noreferrer" onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 28px", borderRadius: 50, background: h ? "#ff0000" : "rgba(255,0,0,0.85)", color: "#fff", textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, transition: "all 0.3s ease", transform: h ? "scale(1.05)" : "scale(1)", boxShadow: h ? "0 8px 30px rgba(255,0,0,0.4)" : "0 4px 15px rgba(255,0,0,0.2)" }}>
      <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true"><path d="M19.6 2.2C19.4.8 18.2.2 17 .1 14.5 0 10 0 10 0S5.5 0 3 .1C1.8.2.6.8.4 2.2.1 3.6 0 5 0 7s.1 3.4.4 4.8c.2 1.4 1.4 2 2.6 2.1C5.5 14 10 14 10 14s4.5 0 7-.1c1.2-.1 2.4-.7 2.6-2.1.3-1.4.4-2.8.4-4.8s-.1-3.4-.4-4.8z" fill="#fff" /><path d="M8 10l5.2-3L8 4v6z" fill="#ff0000" /></svg>
      Subscribe — {channel.label}
    </a>
  );
}

/* Global styles + ambient layers, shared by the site and the gallery page. */
function Chrome({ mode, children }) {
  const t = T[mode];
  return (
    <div style={{ background: t.bg, minHeight: "100vh", position: "relative", overflowX: "clip", transition: "background 0.5s ease", color: t.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        /* overflow-x: clip (not hidden) — "hidden" turns an ancestor into a
           scroll container, which silently breaks position:sticky used by
           the scroll showcase. "clip" crops overflow without that side effect. */
        html { scroll-behavior: smooth; overflow-x: clip; scroll-padding-top: 88px; }
        body { background: ${t.bg}; transition: background 0.5s ease; overflow-x: clip; }
        ::selection { background: ${t.selection}; color: ${t.text}; }
        html, body { scrollbar-width: thin; scrollbar-color: ${t.accent}50 transparent; }
        html::-webkit-scrollbar, body::-webkit-scrollbar { width: 6px; }
        html::-webkit-scrollbar-track, body::-webkit-scrollbar-track { background: transparent; }
        html::-webkit-scrollbar-thumb, body::-webkit-scrollbar-thumb { background: ${t.accent}40; border-radius: 3px; }
        div, section, iframe, canvas { scrollbar-width: none !important; }
        div::-webkit-scrollbar, section::-webkit-scrollbar, iframe::-webkit-scrollbar, canvas::-webkit-scrollbar { display: none !important; width: 0 !important; }
        textarea { scrollbar-width: thin !important; }

        button, input, select, textarea { font-family: inherit; }
        :focus-visible { outline: 2px solid ${t.accent}; outline-offset: 3px; border-radius: 4px; }

        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes gridShift { 0% { background-position: 0 0; } 100% { background-position: 60px 60px; } }
        @keyframes starSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        .section-label { font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: ${t.accent}; opacity: 0.7; margin-bottom: 16px; }
        .section-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(32px, 5vw, 56px); color: ${t.text}; line-height: 1.1; letter-spacing: -0.03em; }
        .desktop-nav { display: flex; gap: 32px; align-items: center; }
        .hamburger-wrap { display: none; position: relative; }

        @media (max-width: 768px) {
          .channels-grid { flex-direction: column !important; }
          .socials-row { flex-direction: column !important; align-items: stretch !important; }
          .desktop-nav { display: none !important; }
          .hamburger-wrap { display: block !important; }
          .hero-text-wrap { padding: 110px 20px 80px !important; align-items: center !important; text-align: center !important; max-width: 100% !important; margin: 0 auto !important; }
          .hero-ctas { justify-content: center !important; }
          .hero-socials { justify-content: center !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          * { animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>

      <InteractiveBackground />
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 1, background: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${t.scanline} 2px, ${t.scanline} 4px)` }} />
      {mode === "dark" && (<>
        <svg style={{ position: "fixed", width: 0, height: 0 }} aria-hidden="true"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter></svg>
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.03, pointerEvents: "none", zIndex: 9999, filter: "url(#noise)" }} />
      </>)}

      {children}
    </div>
  );
}

/* ═══ MAIN APP ═══ */
export default function OmDagurWebsite() {
  const [mode, setMode] = useState("dark");
  const [scrollY, setScrollY] = useState(0);
  const [route, setRoute] = useState(() => (isGalleryRoute() ? "gallery" : "home"));
  // The loader is for the front door only, not the gallery tab.
  const [showLoader, setShowLoader] = useState(() => !isGalleryRoute());
  const [loaded, setLoaded] = useState(() => isGalleryRoute());
  const [UnicornScene, setUnicornScene] = useState(null);
  const isMob = useIsMobile();
  const toggle = useCallback(() => setMode((m) => (m === "dark" ? "light" : "dark")), []);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    const onHash = () => setRoute(isGalleryRoute() ? "gallery" : "home");
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener("scroll", h);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  /* The WebGL hero scene is heavy — desktop only. */
  useEffect(() => {
    if (isMob || route !== "home" || UnicornScene) return;
    let cancelled = false;
    import("unicornstudio-react")
      .then((m) => { if (!cancelled) setUnicornScene(() => m.default); })
      .catch(() => console.warn("UnicornStudio not available"));
    return () => { cancelled = true; };
  }, [isMob, route, UnicornScene]);

  const t = T[mode];
  const showUnicorn = !isMob && UnicornScene;

  if (route === "gallery") {
    return (
      <ThemeCtx.Provider value={{ mode, toggle }}>
        <Chrome mode={mode}>
          <GalleryPage items={MEDIA} homeHref="#top" />
        </Chrome>
      </ThemeCtx.Provider>
    );
  }

  return (
    <ThemeCtx.Provider value={{ mode, toggle }}>
      {showLoader && <Loader onDone={() => { setShowLoader(false); setLoaded(true); }} />}

      <Chrome mode={mode}>
        {/* NAV */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 100, background: scrollY > 50 ? t.navBg : t.bg, backdropFilter: scrollY > 50 ? "blur(20px)" : "none", borderBottom: `1px solid ${t.border}`, transition: "all 0.5s ease" }}>
          <a href="#top" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: t.accent, letterSpacing: "-0.5px", textDecoration: "none" }}>OM.</a>
          <div className="desktop-nav">
            {NAV_ITEMS.map((item) => (
              <a key={item.label} href={item.href}
                {...(item.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                style={{ color: item.href === "#book" ? t.accent : t.textMuted, textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: item.href === "#book" ? 700 : 500, transition: "color 0.3s" }}
                onMouseEnter={(e) => { e.target.style.color = t.accent; }}
                onMouseLeave={(e) => { e.target.style.color = item.href === "#book" ? t.accent : t.textMuted; }}>
                {item.label}{item.newTab ? " ↗" : ""}
              </a>
            ))}
          </div>
          <HamburgerMenu />
        </nav>

        {/* ═══ HERO ═══ */}
        <section id="top" style={{ minHeight: "100vh", position: "relative", zIndex: 2, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 60, left: "-20%", right: 0, bottom: -60, zIndex: 0, height: "110%", width: "110%", overflow: "hidden" }}>
            {showUnicorn ? (
              <div style={{ width: "100%", height: "110%", overflow: "hidden" }}>
                <UnicornScene
                  projectId="ePWprKIOebQvMTdIGUrx"
                  width="90%"
                  height="95%"
                  scale={1}
                  dpi={1.5}
                  sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@2.1.4/dist/unicornStudio.umd.js"
                />
              </div>
            ) : (
              <div style={{ width: "100%", height: "100%", background: `radial-gradient(ellipse at 30% 50%, rgba(${t.accentRgb},0.10) 0%, transparent 60%)` }} />
            )}
          </div>

          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 180, background: `linear-gradient(to top, ${t.bg} 0%, ${t.bg} 30%, ${t.bg}f5 50%, ${t.bg}aa 70%, transparent 100%)`, zIndex: 3, pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 100, background: `linear-gradient(to bottom, ${t.bg}cc, transparent)`, zIndex: 3, pointerEvents: "none" }} />
          {!isMob && <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "55%", background: `linear-gradient(to left, ${t.bg}ee, ${t.bg}cc 30%, transparent 80%)`, zIndex: 2, pointerEvents: "none" }} />}
          <div style={{ position: "absolute", inset: 0, zIndex: 1, backgroundImage: `linear-gradient(rgba(${t.accentRgb},0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(${t.accentRgb},0.04) 1px, transparent 1px)`, backgroundSize: "60px 60px", animation: "gridShift 20s linear infinite", maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)", pointerEvents: "none" }} />

          <div className="hero-text-wrap" style={{ position: "relative", zIndex: 5, minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", padding: "120px 120px 80px", marginLeft: "auto", maxWidth: "55%" }}>
            <div style={{ maxWidth: 620 }}>
              <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(30px)", transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.15s" }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: "0.4em", color: t.accent, opacity: 0.7, textTransform: "uppercase", marginBottom: 20 }}>Stand Up Comedian</div>
              </div>
              <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(30px)", transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s" }}>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(52px, 7vw, 110px)", lineHeight: 0.9, letterSpacing: "-0.04em", textTransform: "uppercase", margin: 0, color: t.text }}>
                  <GlitchText text="OM" /><br />
                  <span style={{ color: t.accent }}><GlitchText text="DAGUR" /></span>
                </h1>
              </div>
              <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(30px)", transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.45s" }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, color: t.textMuted, maxWidth: 400, margin: "28px 0 0", lineHeight: 1.7, fontStyle: "italic" }}>I turn desi struggles into stand-up comedy.</p>
              </div>
              <div className="hero-ctas" style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(30px)", transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s", display: "flex", gap: 14, marginTop: 36, flexWrap: "wrap" }}>
                <a href="#showcase" style={{ padding: "14px 32px", borderRadius: 50, background: t.accent, color: t.onAccent, textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, transition: "all 0.3s", boxShadow: `0 4px 20px rgba(${t.accentRgb},0.3)`, display: "inline-flex", alignItems: "center", gap: 8 }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 30px rgba(${t.accentRgb},0.4)`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 20px rgba(${t.accentRgb},0.3)`; }}
                >▶ Watch Now</a>
                <a href="#book" style={{ padding: "14px 32px", borderRadius: 50, background: "transparent", border: `1px solid ${t.border}`, color: t.text, textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, transition: "all 0.3s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.text; }}
                >Book a Show</a>
              </div>
              <div className="hero-socials" style={{ opacity: loaded ? 1 : 0, transition: "all 1s ease 0.75s", display: "flex", gap: 16, marginTop: 32 }}>
                {[
                  { label: "YouTube", url: "https://www.youtube.com/@omdagur1", svg: <svg width="20" height="14" viewBox="0 0 20 14" fill="none"><path d="M19.6 2.2C19.4.8 18.2.2 17 .1 14.5 0 10 0 10 0S5.5 0 3 .1C1.8.2.6.8.4 2.2.1 3.6 0 5 0 7s.1 3.4.4 4.8c.2 1.4 1.4 2 2.6 2.1C5.5 14 10 14 10 14s4.5 0 7-.1c1.2-.1 2.4-.7 2.6-2.1.3-1.4.4-2.8.4-4.8s-.1-3.4-.4-4.8z" fill={t.textFaint} /><path d="M8 10l5.2-3L8 4v6z" fill={t.bg} /></svg> },
                  { label: "Instagram", url: "https://www.instagram.com/omdagur1", svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.textFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill={t.textFaint} stroke="none" /></svg> },
                  { label: "Threads", url: "https://www.threads.com/@omdagur1", svg: <svg width="16" height="18" viewBox="0 0 16 18" fill={t.textFaint}><path d="M8 0C4.4 0 1.6 2.4 1.2 5.6c-.2 1.8.2 3.4 1.2 4.8.8 1.2 2 2 3.4 2.4-.2.8-.4 1.6-.8 2.4-.2.4-.1.8.2 1 .2.1.4.2.6.2.2 0 .4-.1.6-.2 1-.8 1.8-1.8 2.4-3 .2 0 .4 0 .6 0 3.2 0 5.8-2 6.4-4.8.2-1.2 0-2.4-.6-3.4C14 3.2 12 1.2 9.6.4 9.2.2 8.6 0 8 0z" /></svg> },
                ].map((s) => (
                  <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" title={s.label} aria-label={s.label}
                    style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", transition: "all 0.3s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.background = t.surfaceHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = "transparent"; }}
                  >{s.svg}</a>
                ))}
              </div>
            </div>
          </div>

          <div style={{ position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", animation: "float 3s ease-in-out infinite", zIndex: 5 }}>
            <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, ${t.accent}80, transparent)` }} />
          </div>
        </section>

        {/* ═══ RIBBON ═══ */}
        <Marquee />

        {/* ═══ SCROLL SHOWCASE ═══ */}
        <ScrollShowcase items={MEDIA} galleryHref={GALLERY_HASH} />

        {/* ═══ CHANNELS ═══ */}
        <section id="channels" style={{ padding: "100px 24px", maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <Reveal><div className="section-label">YouTube Channels</div><h2 className="section-title" style={{ marginBottom: 48 }}>My <span style={{ color: t.accent }}>hub</span></h2></Reveal>
          <div className="channels-grid" style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>{CHANNELS.map((ch, i) => <ChannelCard key={ch.id} channel={ch} index={i} />)}</div>
          <Reveal delay={0.4}><div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 48, flexWrap: "wrap" }}>{CHANNELS.map((ch) => <SubscribeBtn key={ch.id} channel={ch} />)}</div></Reveal>
        </section>

        {/* ═══ SOCIALS ═══ */}
        <section id="connect" style={{ padding: "60px 24px 20px", maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <Reveal><div style={{ textAlign: "center" }}><div className="section-label">Get in Touch</div><h2 className="section-title" style={{ marginBottom: 48 }}>Let's <span style={{ color: t.accent }}>connect</span></h2></div></Reveal>
          <Reveal delay={0.2}>
            <div className="socials-row" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              {SOCIALS.map((s) => {
                const ext = s.external;
                return (
                  <a key={s.label} href={s.url}
                    {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 32px", borderRadius: 60, textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)", border: `1px solid ${s.color}30`, color: t.text, background: `${s.color}${mode === "dark" ? "15" : "0a"}` }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${s.color}${mode === "dark" ? "30" : "18"}`; e.currentTarget.style.borderColor = `${s.color}60`; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 40px ${s.color}20`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = `${s.color}${mode === "dark" ? "15" : "0a"}`; e.currentTarget.style.borderColor = `${s.color}30`; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                  ><span style={{ fontSize: 22 }}>{s.icon}</span>{s.label}<span style={{ opacity: 0.4, fontSize: 16 }}>{ext ? "↗" : "↓"}</span></a>
                );
              })}
            </div>
          </Reveal>
        </section>

        {/* ═══ BOOK A SHOW ═══ */}
        <BookShow />

        {/* ═══ FOOTER ═══ */}
        <Footer />
      </Chrome>
    </ThemeCtx.Provider>
  );
}
