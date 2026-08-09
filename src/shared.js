import { useState, useEffect, useRef } from "react";
import { T, useTheme, thumbUrl } from "./theme";

/* Respects the OS "reduce motion" setting — we tone down the heavy stuff for it. */
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

/* YouTube thumbnail with automatic fallback: maxresdefault 404s on many
   uploads (especially Shorts) and yields a grey 120x90 placeholder. */
export function Thumb({ item, style = {}, alt }) {
  const [src, setSrc] = useState(thumbUrl(item, true));
  return (
    <img
      src={src}
      alt={alt || item.title}
      loading="lazy"
      onError={() => setSrc(`https://img.youtube.com/vi/${item.embedId}/hqdefault.jpg`)}
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
