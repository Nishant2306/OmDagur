import { useState, useEffect, useRef } from "react";
import { T, useTheme, thumbCandidates } from "./theme";

/* Command a YouTube iframe (mute/unMute/pauseVideo/playVideo) without
   touching its src, so the embed never reloads. Requires enablejsapi=1. */
export const postToPlayer = (el, func) => {
  try {
    el?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");
  } catch { /* iframe not ready yet */ }
};

/* Respects the OS "reduce motion" setting - we tone down the heavy stuff for it. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/* Single source of truth for the "small screen" breakpoint. */
export function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return mobile;
}

export function useInView(th = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: th });
    obs.observe(el);
    return () => obs.disconnect();
  }, [th]);
  return [ref, inView];
}

export function Reveal({ children, delay = 0, style = {}, className }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(60px)",
      transition: `all 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
      ...style,
    }}>{children}</div>
  );
}

export function GlitchText({ text }) {
  const { mode } = useTheme(); const t = T[mode];
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const iv = setInterval(() => { setGlitch(true); setTimeout(() => setGlitch(false), 200); }, 4000);
    return () => clearInterval(iv);
  }, []);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span style={{ position: "relative", zIndex: 2 }}>{text}</span>
      {glitch && (<>
        <span style={{ position: "absolute", top: "-2px", left: "3px", color: t.accent, zIndex: 1, clipPath: "inset(20% 0 30% 0)", opacity: 0.8 }}>{text}</span>
        <span style={{ position: "absolute", top: "2px", left: "-3px", color: t.accent2, zIndex: 1, clipPath: "inset(50% 0 10% 0)", opacity: 0.8 }}>{text}</span>
      </>)}
    </span>
  );
}

/* YouTube's "no such thumbnail" response is NOT an error the browser reports:
   img.youtube.com answers a missing maxresdefault.jpg with a decodable grey
   120x90 placeholder, so `onError` never fires and the card just shows grey.
   That is why Dastaan-e-Breakup (0aYCAbDr5_A) had no preview image.

   So we check the decoded size as well as listening for errors. Every real
   thumbnail is at least 480px wide (hqdefault 480x360, sd 640x480,
   maxres 1280x720), so anything narrower is the placeholder. */
const PLACEHOLDER_MAX_W = 200;

export function Thumb({ item, style = {}, alt }) {
  const candidates = thumbCandidates(item);
  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(0); }, [item.embedId]);

  // Capped at the last candidate so a final failure stops rather than looping.
  const advance = () => setIdx((i) => (i < candidates.length - 1 ? i + 1 : i));

  return (
    <img
      src={candidates[Math.min(idx, candidates.length - 1)]}
      alt={alt || item.title}
      loading="lazy"
      onError={advance}
      onLoad={(e) => { if (e.currentTarget.naturalWidth <= PLACEHOLDER_MAX_W) advance(); }}
      style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", ...style }}
    />
  );
}

/* Play triangle used across phone / laptop / gallery cards. */
export function PlayGlyph({ size = 22, color = "#0a0a0a" }) {
  return (
    <div style={{
      width: 0, height: 0, borderStyle: "solid",
      borderWidth: `${size * 0.55}px 0 ${size * 0.55}px ${size}px`,
      borderColor: `transparent transparent transparent ${color}`,
      marginLeft: size * 0.18,
    }} />
  );
}

export function ExternalLink({ href, children, style = {}, ...rest }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" style={style} {...rest}>{children}</a>;
}
