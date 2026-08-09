import { createContext, useContext } from "react";

export const ThemeCtx = createContext();
export const useTheme = () => useContext(ThemeCtx);

export const T = {
  dark: {
    bg: "#050505", bgAlt: "#0d0d0d", surface: "rgba(255,255,255,0.03)", surfaceHover: "rgba(255,255,255,0.06)",
    text: "#FAFAF9", textMuted: "rgba(255,255,255,0.45)", textFaint: "rgba(255,255,255,0.25)",
    accent: "#FFD700", accentRgb: "255,215,0", accent2: "#FF8C00", accent2Rgb: "255,140,0",
    border: "rgba(255,255,255,0.06)", borderHover: "rgba(255,255,255,0.12)",
    navBg: "rgba(5,5,5,0.9)", cardBg: "rgba(255,255,255,0.03)",
    cardBorder: "rgba(255,255,255,0.08)", cardBorderHover: "rgba(255,215,0,0.2)",
    shadow: "rgba(0,0,0,0.3)", shadowStrong: "rgba(0,0,0,0.8)",
    playBg: "#0a0a0a", videoGrad: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    phoneBg: "#0a0a0a", phoneInner: "linear-gradient(180deg, #1a1a2e 0%, #0a0a0a 100%)",
    marqueeStroke: "rgba(255,215,0,0.15)",
    particle1: "255,215,0", particle2: "255,140,0",
    glow1: "rgba(255,215,0,", glow2: "rgba(255,140,0,",
    scanline: "rgba(255,215,0,0.006)", selection: "rgba(255,215,0,0.25)",
    onAccent: "#050505",
    deviceShell: "#141414", deviceEdge: "rgba(255,255,255,0.10)", deviceBase: "#1c1c1c",
  },
  light: {
    bg: "#D5CFC3", bgAlt: "#CBC4B6", surface: "rgba(0,0,0,0.03)", surfaceHover: "rgba(0,0,0,0.06)",
    text: "#1E1B16", textMuted: "rgba(30,27,22,0.60)", textFaint: "rgba(30,27,22,0.32)",
    accent: "#8B6914", accentRgb: "139,105,20", accent2: "#A0782A", accent2Rgb: "160,120,42",
    border: "rgba(30,27,22,0.10)", borderHover: "rgba(30,27,22,0.18)",
    navBg: "rgba(213,207,195,0.92)", cardBg: "rgba(222,216,204,0.6)",
    cardBorder: "rgba(30,27,22,0.10)", cardBorderHover: "rgba(139,105,20,0.35)",
    shadow: "rgba(30,27,22,0.08)", shadowStrong: "rgba(30,27,22,0.18)",
    playBg: "#C5BFB1", videoGrad: "linear-gradient(135deg, #C5BFB1 0%, #BBB4A5 50%, #B0A999 100%)",
    phoneBg: "#DED8CC", phoneInner: "linear-gradient(180deg, #D5CFC3 0%, #DED8CC 100%)",
    marqueeStroke: "rgba(139,105,20,0.22)",
    particle1: "139,105,20", particle2: "160,120,42",
    glow1: "rgba(139,105,20,", glow2: "rgba(160,120,42,",
    scanline: "rgba(139,105,20,0.005)", selection: "rgba(139,105,20,0.25)",
    onAccent: "#FFFFFF",
    deviceShell: "#B9B2A3", deviceEdge: "rgba(30,27,22,0.18)", deviceBase: "#A79F8E",
  },
};

/* ─────────────────────────────────────────────
   CONTENT - edit these arrays to add/remove media.
   Everything on the site (showcase + gallery) is
   generated from MEDIA below, so adding a 6th item
   is a one-line change.
   ───────────────────────────────────────────── */

export const YOUTUBE_VIDEOS = [
  { id: "baby-planning", title: "Baby Planning", subtitle: "Full Stand Up Comedy Video", embedId: "kmbKZRJ6OyM" },
  { id: "fartist", title: "Dastaan-e-Breakup", subtitle: "Stand Up Comedy ft. Om Dagur", embedId: "0aYCAbDr5_A" },
];

export const YOUTUBE_SHORTS = [
  { id: "rajasthani-dulha", title: "Rajasthani Dulha", subtitle: "YouTube Short", embedId: "k_GIGNGI0xI" },
  { id: "kachhua", title: "Kachhua", subtitle: "YouTube Short", embedId: "jXnzM68Zn8w" },
  { id: "baby-planning-short", title: "Baby Planning", subtitle: "YouTube Short", embedId: "aMRvqUpkjQY" },
];

/* Unified list driving the scroll showcase and the gallery.
   kind: "short" renders in a phone, "video" renders in a laptop.
   Order matters - the showcase plays through this list top to bottom,
   so the full videos lead and the shorts follow. */
export const MEDIA = [
  ...YOUTUBE_VIDEOS.map((v) => ({ ...v, kind: "video" })),
  ...YOUTUBE_SHORTS.map((s) => ({ ...s, kind: "short" })),
];

export const CHANNELS = [
  { id: "standup", label: "Stand Up", icon: "🎤", url: "https://www.youtube.com/@omdagur1", sub: "Comedy & Desi Struggles" },
  { id: "music", label: "Om Dagur Music", icon: "🎵", url: "https://www.youtube.com/@omdagur", sub: "Original Music & Vibes" },
];

/* Ticket page for Om's own show - "Book a Show" sends people here to buy
   seats. Hiring him for your own event is a different thing entirely and
   goes through the enquiry form at #book. */
export const TICKETS_URL =
  "https://in.bookmyshow.com/events/b-a-pass-engineer-by-om-dagur-standup-comedy/ET00492514";

export const SOCIALS = [
  { label: "Instagram", icon: "📸", url: "https://www.instagram.com/omdagur1", color: "#E1306C", external: true },
  { label: "Threads", icon: "🧵", url: "https://www.threads.com/@omdagur1", color: "#888888", external: true },
  { label: "Book a Show", icon: "🎫", url: TICKETS_URL, color: "#FFD700", external: true },
];

/* Watch URL helpers - shorts and long-form have different canonical URLs. */
export const watchUrl = (item) =>
  item.kind === "short"
    ? `https://www.youtube.com/shorts/${item.embedId}`
    : `https://www.youtube.com/watch?v=${item.embedId}`;

export const embedUrl = (item, { autoplay = false, mute = true } = {}) => {
  const p = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    enablejsapi: "1",
    controls: "1", // keep YouTube's own bar: play/pause, seek, skip-ad, fullscreen
    autoplay: autoplay ? "1" : "0",
    mute: mute ? "1" : "0",
    loop: "1",
    playlist: item.embedId, // required for `loop` to work on a single video
  });
  return `https://www.youtube.com/embed/${item.embedId}?${p.toString()}`;
};

/* Thumbnail sizes, best first. YouTube only generates maxresdefault for
   uploads that were high-res enough - e.g. Dastaan-e-Breakup (0aYCAbDr5_A)
   returns 404 for it - so callers walk down this list on error.
   sddefault and hqdefault exist for every public video. */
export const thumbCandidates = (item) => [
  `https://img.youtube.com/vi/${item.embedId}/maxresdefault.jpg`,
  `https://img.youtube.com/vi/${item.embedId}/sddefault.jpg`,
  `https://img.youtube.com/vi/${item.embedId}/hqdefault.jpg`,
];
