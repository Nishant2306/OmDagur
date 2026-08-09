import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

const ThemeCtx = createContext();
const useTheme = () => useContext(ThemeCtx);

const T = {
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
  },
};

const YOUTUBE_VIDEOS = [
  { id: "baby-planning", title: "Baby Planning", subtitle: "Full Stand Up Comedy Video", embedId: "kmbKZRJ6OyM" },
  { id: "fartist", title: "Dastaan-e-Breakup", subtitle: "Stand Up Comedy ft. Om Dagur", embedId: "0aYCAbDr5_A" },
];
const YOUTUBE_SHORTS = [
  { id: "rajasthani-dulha", title: "Rajasthani Dulha", embedId: "k_GIGNGI0xI" },
  { id: "kachhua", title: "Kachhua", embedId: "jXnzM68Zn8w" },
  { id: "baby-planning-short", title: "Baby Planning", embedId: "aMRvqUpkjQY" },
];
const CHANNELS = [
  { id: "standup", label: "Stand Up", icon: "🎤", url: "https://www.youtube.com/@omdagur1", sub: "Comedy & Desi Struggles" },
  { id: "music", label: "Om Dagur Music", icon: "🎵", url: "https://www.youtube.com/@omdagur", sub: "Original Music & Vibes" },
];
const SOCIALS = [
  { label: "Instagram", icon: "📸", url: "https://www.instagram.com/omdagur1", color: "#E1306C" },
  { label: "Threads", icon: "🧵", url: "https://www.threads.com/@omdagur1", color: "#888888" },
  { label: "Book a Show", icon: "🎫", url: "#", color: "#FFD700" },
];

function GlitchText({ text }) {
  const { mode } = useTheme(); const t = T[mode];
  const [glitch, setGlitch] = useState(false);
  useEffect(() => { const iv = setInterval(() => { setGlitch(true); setTimeout(() => setGlitch(false), 200); }, 4000); return () => clearInterval(iv); }, []);
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

/* ═══ INTERACTIVE BACKGROUND ═══ */
function InteractiveBackground() {
  const canvasRef = useRef(null); const animRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, px: -1000, py: -1000, speed: 0 });
  const trailRef = useRef([]);
  const { mode } = useTheme(); const t = T[mode];
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext("2d");
    let particles = [], ripples = [], meteors = [], attractors = [], frame = 0;
    const isMob = window.innerWidth < 768, COUNT = isMob ? 40 : 110, MAX_TRAIL = 35;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = Math.max(document.body.scrollHeight, window.innerHeight * 5); };
    resize(); window.addEventListener("resize", resize);
    for (let i = 0; i < COUNT; i++) particles.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, vx: (Math.random()-0.5)*0.5, vy: (Math.random()-0.5)*0.5, baseR: Math.random()*2+0.5, r: 0, color: Math.random() > 0.5 ? 1 : 2, phase: Math.random()*Math.PI*2, freq: 0.005+Math.random()*0.01, orbitAngle: Math.random()*Math.PI*2, trail: [] });
    for (let i = 0; i < (isMob ? 2 : 4); i++) attractors.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, strength: 0.02+Math.random()*0.03, radius: 200+Math.random()*200, phase: Math.random()*Math.PI*2 });
    const addRipple = (x, y, maxR) => { if (ripples.length < 8) ripples.push({ x, y, r: 0, maxR: maxR||200, life: 1 }); };
    const draw = () => {
      frame++; ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x, my = mouseRef.current.y, mSpeed = mouseRef.current.speed;
      if (mx > 0 && my > 0) { trailRef.current.push({ x: mx, y: my, life: 1 }); if (trailRef.current.length > MAX_TRAIL) trailRef.current.shift(); }
      if (trailRef.current.length > 1 && !isMob) { for (let i = 1; i < trailRef.current.length; i++) { const prev = trailRef.current[i-1], cur = trailRef.current[i], progress = i/trailRef.current.length; const grad = ctx.createLinearGradient(prev.x, prev.y, cur.x, cur.y); grad.addColorStop(0, `${t.glow1}${progress*0.4})`); grad.addColorStop(1, `${t.glow2}${progress*0.5})`); ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(cur.x, cur.y); ctx.strokeStyle = grad; ctx.lineWidth = progress*4; ctx.lineCap = "round"; ctx.stroke(); } trailRef.current.forEach(p => { p.life -= 0.025; }); trailRef.current = trailRef.current.filter(p => p.life > 0); }
      if (mx > 0 && my > 0 && !isMob) { const cs = Math.min(mSpeed, 25); for (let i = 0; i < 6; i++) { const angle = (i/6)*Math.PI*2+frame*0.008, iR = 30+Math.sin(frame*0.02+i)*10, oR = 80+cs*1.5; ctx.beginPath(); ctx.arc(mx, my, iR+(oR-iR)*0.5, angle-0.3, angle+0.3); ctx.strokeStyle = `${t.glow1}${Math.min(0.15, 0.06+cs*0.003)})`; ctx.lineWidth = 1.5; ctx.stroke(); } const gR = 120+cs*2; const grd = ctx.createRadialGradient(mx, my, 0, mx, my, gR); grd.addColorStop(0, `${t.glow1}0.07)`); grd.addColorStop(0.3, `${t.glow2}0.02)`); grd.addColorStop(1, `${t.glow1}0)`); ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(mx, my, gR, 0, Math.PI*2); ctx.fill(); }
      ripples.forEach(rip => { ctx.beginPath(); ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI*2); ctx.strokeStyle = `${t.glow1}${rip.life*0.3})`; ctx.lineWidth = 2*rip.life; ctx.stroke(); rip.r += 3; rip.life -= 0.015; }); ripples = ripples.filter(r => r.life > 0);
      if (frame%180===0 && meteors.length<3) { const side = Math.random(); meteors.push({ x: side>0.5?-50:canvas.width+50, y: Math.random()*canvas.height*0.5, vx: (side>0.5?1:-1)*(3+Math.random()*4), vy: 2+Math.random()*3, life: 1, length: 60+Math.random()*100, width: 1+Math.random()*2 }); }
      meteors.forEach(m => { const grad = ctx.createLinearGradient(m.x, m.y, m.x-m.vx*m.length*0.3, m.y-m.vy*m.length*0.3); grad.addColorStop(0, `${t.glow1}${m.life*0.5})`); grad.addColorStop(1, `${t.glow1}0)`); ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x-m.vx*m.length*0.3, m.y-m.vy*m.length*0.3); ctx.strokeStyle = grad; ctx.lineWidth = m.width; ctx.stroke(); ctx.beginPath(); ctx.arc(m.x, m.y, Math.max(0.1, 3*m.life), 0, Math.PI*2); ctx.fillStyle = `${t.glow1}${m.life*0.7})`; ctx.fill(); m.x += m.vx; m.y += m.vy; m.life -= 0.003; }); meteors = meteors.filter(m => m.life>0 && m.x>-200 && m.x<canvas.width+200);
      particles.forEach((p, i) => {
        p.r = Math.max(0.1, p.baseR+Math.sin(frame*p.freq+p.phase)*1);
        attractors.forEach(a => { a.phase += 0.001; const ax = a.x+Math.sin(a.phase)*100, ay = a.y+Math.cos(a.phase*0.7)*100, dx = ax-p.x, dy = ay-p.y, dist = Math.sqrt(dx*dx+dy*dy); if (dist<a.radius && dist>10) { const f = a.strength*(1-dist/a.radius); p.vx += (dx/dist)*f; p.vy += (dy/dist)*f; } });
        const dx = mx-p.x, dy = my-p.y, dist = Math.sqrt(dx*dx+dy*dy);
        if (dist<300 && dist>5) { const f = 0.15*(1-dist/300); p.vx += (dx/dist)*f; p.vy += (dy/dist)*f; p.vx += (-dy/dist)*f*0.5; p.vy += (dx/dist)*f*0.5; if (dist<80) { p.orbitAngle += 0.03; p.vx += (mx+Math.cos(p.orbitAngle)*dist-p.x)*0.02; p.vy += (my+Math.sin(p.orbitAngle)*dist-p.y)*0.02; } }
        if (dist<100 && mSpeed>8 && Math.random()<0.02) addRipple(p.x, p.y, 80);
        p.vx *= 0.985; p.vy *= 0.985; const speed = Math.sqrt(p.vx*p.vx+p.vy*p.vy); if (speed>3) { p.vx = (p.vx/speed)*3; p.vy = (p.vy/speed)*3; }
        p.x += p.vx; p.y += p.vy;
        if (p.x<-50) p.x = canvas.width+50; if (p.x>canvas.width+50) p.x = -50; if (p.y<-50) p.y = canvas.height+50; if (p.y>canvas.height+50) p.y = -50;
        p.trail.push({ x: p.x, y: p.y }); if (p.trail.length>8) p.trail.shift();
        const glow = dist<250?1-dist/250:0, bAlpha = 0.2+Math.sin(frame*p.freq+p.phase)*0.1, cs = p.color===1?t.particle1:t.particle2;
        if (p.trail.length>1 && speed>0.5) { for (let ti = 1; ti<p.trail.length; ti++) { ctx.beginPath(); ctx.moveTo(p.trail[ti-1].x, p.trail[ti-1].y); ctx.lineTo(p.trail[ti].x, p.trail[ti].y); ctx.strokeStyle = `rgba(${cs},${(ti/p.trail.length)*0.12})`; ctx.lineWidth = p.r*(ti/p.trail.length); ctx.stroke(); } }
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.1, p.r+glow*4), 0, Math.PI*2); ctx.fillStyle = `rgba(${cs},${bAlpha+glow*0.5})`; ctx.fill();
        if (glow>0.3) { ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.1, p.r+glow*12), 0, Math.PI*2); ctx.strokeStyle = `rgba(${cs},${glow*0.12})`; ctx.lineWidth = 1; ctx.stroke(); }
        const jEnd = Math.min(i+25, particles.length);
        for (let j = i+1; j<jEnd; j++) { const p2 = particles[j], d = Math.sqrt((p.x-p2.x)**2+(p.y-p2.y)**2), maxD = 120+glow*70; if (d<maxD) { const la = 0.05*(1-d/maxD)+glow*0.06, d2 = Math.sqrt((mx-p2.x)**2+(my-p2.y)**2); ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); if (dist<200||d2<200) { const lg = ctx.createLinearGradient(p.x, p.y, p2.x, p2.y); lg.addColorStop(0, `rgba(${t.particle1},${la})`); lg.addColorStop(1, `rgba(${t.particle2},${la})`); ctx.strokeStyle = lg; ctx.lineWidth = 1.2; } else { ctx.strokeStyle = `rgba(${t.particle1},${la*0.5})`; ctx.lineWidth = 0.6; } ctx.stroke(); } }
      });
      if (!isMob) { for (let h = 0; h<4; h++) { const hx = (canvas.width*(h+1))/5+Math.sin(frame*0.003+h*2)*80, hy = (frame*0.15+h*canvas.height*0.25)%canvas.height, hr = 20+Math.sin(frame*0.01+h)*8; ctx.beginPath(); for (let s = 0; s<=6; s++) { const a = (s/6)*Math.PI*2+frame*0.005, px = hx+Math.cos(a)*hr, py = hy+Math.sin(a)*hr; s===0?ctx.moveTo(px, py):ctx.lineTo(px, py); } ctx.closePath(); ctx.strokeStyle = `rgba(${t.particle2},0.05)`; ctx.lineWidth = 1; ctx.stroke(); } }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    const handleClick = (e) => { addRipple(e.clientX, e.clientY+window.scrollY, 250); particles.forEach(p => { const dx = p.x-e.clientX, dy = p.y-(e.clientY+window.scrollY), dist = Math.sqrt(dx*dx+dy*dy); if (dist<200&&dist>0) { const f = (1-dist/200)*5; p.vx += (dx/dist)*f; p.vy += (dy/dist)*f; } }); };
    const handleMouse = (e) => { const prev = mouseRef.current; mouseRef.current = { x: e.clientX, y: e.clientY+window.scrollY, px: prev.x, py: prev.y, speed: Math.sqrt((e.clientX-prev.x)**2+((e.clientY+window.scrollY)-prev.y)**2) }; };
    const handleTouch = (e) => { if (e.touches.length>0) { const tc = e.touches[0], prev = mouseRef.current; mouseRef.current = { x: tc.clientX, y: tc.clientY+window.scrollY, px: prev.x, py: prev.y, speed: Math.sqrt((tc.clientX-prev.x)**2+((tc.clientY+window.scrollY)-prev.y)**2) }; } };
    window.addEventListener("mousemove", handleMouse); window.addEventListener("click", handleClick); window.addEventListener("touchmove", handleTouch, { passive: true });
    const ri = setInterval(resize, 3000);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", handleMouse); window.removeEventListener("click", handleClick); window.removeEventListener("touchmove", handleTouch); clearInterval(ri); };
  }, [mode]);
  return <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", pointerEvents: "none", zIndex: 0 }} />;
}

function useInView(th = 0.1) { const ref = useRef(null); const [inView, setInView] = useState(false); useEffect(() => { const el = ref.current; if (!el) return; const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: th }); obs.observe(el); return () => obs.disconnect(); }, [th]); return [ref, inView]; }
function Reveal({ children, delay = 0, style = {} }) { const [ref, inView] = useInView(0.1); return <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(60px)", transition: `all 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`, ...style }}>{children}</div>; }

function ThemeToggle() { const { mode, toggle } = useTheme(); const t = T[mode]; const [h, setH] = useState(false); return <button onClick={toggle} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} aria-label="Toggle theme" style={{ width: 42, height: 42, borderRadius: 12, cursor: "pointer", border: `1px solid ${t.border}`, background: h ? t.surfaceHover : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease", fontSize: 18 }}>{mode === "dark" ? "☀️" : "🌙"}</button>; }

function HamburgerMenu() {
  const { mode } = useTheme(); const t = T[mode]; const [open, setOpen] = useState(false);
  return (
    <div className="hamburger-wrap">
      <button onClick={() => setOpen(!open)} aria-label="Menu" style={{ width: 42, height: 42, borderRadius: 12, cursor: "pointer", border: `1px solid ${t.border}`, background: "transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: open ? 0 : 5, transition: "all 0.3s ease" }}>
        <span style={{ display: "block", width: 18, height: 2, background: t.accent, borderRadius: 2, transition: "all 0.3s ease", transform: open ? "rotate(45deg) translateY(1px)" : "rotate(0)" }} />
        {!open && <span style={{ display: "block", width: 18, height: 2, background: t.accent, borderRadius: 2 }} />}
        <span style={{ display: "block", width: 18, height: 2, background: t.accent, borderRadius: 2, transition: "all 0.3s ease", transform: open ? "rotate(-45deg) translateY(-1px)" : "rotate(0)" }} />
      </button>
      <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 8, background: t.navBg, backdropFilter: "blur(24px) saturate(1.5)", border: `1px solid ${t.border}`, borderRadius: 16, padding: open ? "12px 8px" : "0 8px", minWidth: 180, overflow: "hidden", maxHeight: open ? 300 : 0, opacity: open ? 1 : 0, transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)", pointerEvents: open ? "auto" : "none", boxShadow: open ? `0 16px 48px ${t.shadowStrong}` : "none" }}>
        {["Videos", "Shorts", "Channels", "Connect"].map((item, i) => (
          <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setOpen(false)} style={{ display: "block", padding: "12px 16px", borderRadius: 10, color: t.textMuted, textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500, transition: "all 0.2s ease", opacity: open ? 1 : 0, transform: open ? "translateX(0)" : "translateX(20px)", transitionDelay: `${i*0.05}s` }}
            onMouseEnter={(e) => { e.target.style.color = t.accent; e.target.style.background = t.surfaceHover; }} onMouseLeave={(e) => { e.target.style.color = t.textMuted; e.target.style.background = "transparent"; }}>{item}</a>
        ))}
      </div>
    </div>
  );
}

function PhoneFrame({ short, isActive, onClick }) {
  const { mode } = useTheme(); const t = T[mode]; const [playing, setPlaying] = useState(false);
  useEffect(() => { if (!isActive) setPlaying(false); }, [isActive]);
  const thumbUrl = `https://img.youtube.com/vi/${short.embedId}/0.jpg`;
  return (
    <div onClick={onClick} style={{ width: isActive ? 280 : 240, height: isActive ? 560 : 480, borderRadius: 36, border: isActive ? `3px solid ${t.accent}` : `3px solid ${t.border}`, background: t.phoneBg, overflow: "hidden", position: "relative", transition: "all 0.6s cubic-bezier(0.22, 1, 0.36, 1)", cursor: "pointer", flexShrink: 0, boxShadow: isActive ? `0 0 60px rgba(${t.accentRgb},0.25), 0 20px 60px ${t.shadowStrong}` : `0 10px 40px ${t.shadow}`, transform: isActive ? "scale(1)" : "scale(0.9)", opacity: isActive ? 1 : 0.5 }}>
      <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", width: 80, height: 22, borderRadius: 12, background: t.phoneBg, zIndex: 10, border: `2px solid ${t.border}` }} />
      <div style={{ width: "100%", height: "100%", borderRadius: 33, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: t.phoneInner }}>
        {playing && isActive ? <iframe src={`https://www.youtube.com/embed/${short.embedId}?autoplay=1&loop=1&controls=1&modestbranding=1`} style={{ width: "100%", height: "100%", border: "none" }} allow="autoplay; encrypted-media" allowFullScreen /> : (
          <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <img src={thumbUrl} alt={short.title} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: isActive ? 0.4 : 0.2, transition: "opacity 0.3s" }} />
            <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div onClick={(e) => { e.stopPropagation(); if (isActive) setPlaying(true); }} style={{ width: 64, height: 64, borderRadius: "50%", background: isActive ? `rgba(${t.accentRgb},0.9)` : t.textFaint, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease", cursor: isActive ? "pointer" : "default", backdropFilter: "blur(8px)" }}>
                <div style={{ width: 0, height: 0, borderStyle: "solid", borderWidth: "12px 0 12px 22px", borderColor: `transparent transparent transparent ${mode === "dark" ? "#0a0a0a" : "#fff"}`, marginLeft: 4 }} />
              </div>
              <span style={{ color: isActive ? "#fff" : t.textFaint, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, textAlign: "center", padding: "0 20px", transition: "color 0.3s", textShadow: isActive ? "0 2px 8px rgba(0,0,0,0.5)" : "none" }}>{short.title}</span>
              {isActive && <a href={`https://youtube.com/shorts/${short.embedId}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, textDecoration: "none", fontFamily: "'DM Sans', sans-serif", borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: 2 }} onMouseEnter={(e) => e.target.style.color = t.accent} onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.6)"}>Watch on YouTube ↗</a>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VideoCard({ video, index }) {
  const { mode } = useTheme(); const t = T[mode]; const [playing, setPlaying] = useState(false); const [hov, setHov] = useState(false);
  const thumbUrl = `https://img.youtube.com/vi/${video.embedId}/maxresdefault.jpg`;
  return (
    <Reveal delay={index*0.15} style={{ flex: "1 1 480px", maxWidth: 640 }}>
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ borderRadius: 20, overflow: "hidden", background: t.surface, border: `1px solid ${hov ? t.cardBorderHover : t.cardBorder}`, transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)", transform: hov ? "translateY(-8px)" : "translateY(0)", boxShadow: hov ? `0 30px 80px rgba(${t.accentRgb},0.12), 0 0 0 1px rgba(${t.accentRgb},0.2)` : `0 10px 40px ${t.shadow}` }}>
        <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", background: t.playBg }}>
          {playing ? <iframe src={`https://www.youtube.com/embed/${video.embedId}?autoplay=1&modestbranding=1&rel=0`} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} allow="autoplay; encrypted-media" allowFullScreen /> : (
            <div onClick={() => setPlaying(true)} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={thumbUrl} alt={video.title} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.3)" }} />
              <div style={{ position: "relative", zIndex: 2, width: 80, height: 80, borderRadius: "50%", background: `rgba(${t.accentRgb},0.9)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 40px rgba(${t.accentRgb},0.4)`, transition: "transform 0.3s", transform: hov ? "scale(1.15)" : "scale(1)" }}>
                <div style={{ width: 0, height: 0, borderStyle: "solid", borderWidth: "16px 0 16px 28px", borderColor: `transparent transparent transparent ${mode === "dark" ? "#0a0a0a" : "#fff"}`, marginLeft: 6 }} />
              </div>
            </div>
          )}
        </div>
        <div style={{ padding: "24px 28px" }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: t.text, margin: 0 }}>{video.title}</h3>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: t.textMuted, margin: "8px 0 16px" }}>{video.subtitle}</p>
          <a href={`https://youtube.com/watch?v=${video.embedId}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: t.accent, textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, transition: "gap 0.3s" }} onMouseEnter={(e) => e.currentTarget.style.gap = "12px"} onMouseLeave={(e) => e.currentTarget.style.gap = "8px"}>Watch on YouTube →</a>
        </div>
      </div>
    </Reveal>
  );
}

function ChannelCard({ channel, index }) {
  const { mode } = useTheme(); const t = T[mode]; const [hov, setHov] = useState(false);
  return (
    <Reveal delay={index*0.2} style={{ flex: "1 1 360px" }}>
      <a href={channel.url} target="_blank" rel="noopener noreferrer" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ display: "flex", alignItems: "center", gap: 24, padding: "28px 36px", borderRadius: 20, background: hov ? `rgba(${t.accentRgb},0.06)` : t.surface, border: `1px solid ${hov ? `rgba(${t.accentRgb},0.3)` : t.border}`, textDecoration: "none", transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)", transform: hov ? "translateX(8px)" : "translateX(0)", cursor: "pointer" }}>
        <span style={{ fontSize: 42, filter: hov ? "none" : "grayscale(0.5)", transition: "filter 0.3s" }}>{channel.icon}</span>
        <div><div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: hov ? t.accent : t.text, transition: "color 0.3s" }}>{channel.label}</div><div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: t.textFaint, marginTop: 4 }}>{channel.sub}</div></div>
        <span style={{ marginLeft: "auto", fontSize: 24, color: hov ? t.accent : t.textFaint, transition: "all 0.3s", transform: hov ? "translateX(4px)" : "translateX(0)" }}>→</span>
      </a>
    </Reveal>
  );
}

function SubscribeBtn({ channel }) {
  const [h, setH] = useState(false);
  return <a href={`${channel.url}?sub_confirmation=1`} target="_blank" rel="noopener noreferrer" onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 28px", borderRadius: 50, background: h ? "#ff0000" : "rgba(255,0,0,0.85)", color: "#fff", textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, transition: "all 0.3s ease", transform: h ? "scale(1.05)" : "scale(1)", boxShadow: h ? "0 8px 30px rgba(255,0,0,0.4)" : "0 4px 15px rgba(255,0,0,0.2)" }}>
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none"><path d="M19.6 2.2C19.4.8 18.2.2 17 .1 14.5 0 10 0 10 0S5.5 0 3 .1C1.8.2.6.8.4 2.2.1 3.6 0 5 0 7s.1 3.4.4 4.8c.2 1.4 1.4 2 2.6 2.1C5.5 14 10 14 10 14s4.5 0 7-.1c1.2-.1 2.4-.7 2.6-2.1.3-1.4.4-2.8.4-4.8s-.1-3.4-.4-4.8z" fill="#fff"/><path d="M8 10l5.2-3L8 4v6z" fill="#ff0000"/></svg>
    Subscribe — {channel.label}
  </a>;
}

/* ═══ MAIN APP ═══ */
export default function OmDagurWebsite() {
  const [mode, setMode] = useState("dark");
  const [activeShort, setActiveShort] = useState(1);
  const [scrollY, setScrollY] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [UnicornScene, setUnicornScene] = useState(null);
  const toggle = useCallback(() => setMode(m => m === "dark" ? "light" : "dark"), []);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 300);
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    import("unicornstudio-react").then(mod => setUnicornScene(() => mod.default)).catch(() => console.warn("UnicornStudio not available"));
    return () => window.removeEventListener("scroll", h);
  }, []);

  const t = T[mode];

  return (
    <ThemeCtx.Provider value={{ mode, toggle }}>
      <div style={{ background: t.bg, minHeight: "100vh", position: "relative", overflowX: "hidden", transition: "background 0.5s ease", color: t.text }}>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
          html { scroll-behavior: smooth; overflow-x: hidden; }
          body { background: ${t.bg}; transition: background 0.5s ease; overflow-x: hidden; }
          ::selection { background: ${t.selection}; color: ${t.text}; }
          html, body { scrollbar-width: thin; scrollbar-color: ${t.accent}50 transparent; }
          html::-webkit-scrollbar, body::-webkit-scrollbar { width: 6px; }
          html::-webkit-scrollbar-track, body::-webkit-scrollbar-track { background: transparent; }
          html::-webkit-scrollbar-thumb, body::-webkit-scrollbar-thumb { background: ${t.accent}40; border-radius: 3px; }
          /* Kill scrollbars on everything else */
          div, section, iframe, canvas { scrollbar-width: none !important; }
          div::-webkit-scrollbar, section::-webkit-scrollbar, iframe::-webkit-scrollbar, canvas::-webkit-scrollbar { display: none !important; width: 0 !important; }
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
          @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          @keyframes marqueeReverse { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
          @keyframes gridShift { 0% { background-position: 0 0; } 100% { background-position: 60px 60px; } }
          @keyframes starSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .section-label { font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: ${t.accent}; opacity: 0.7; margin-bottom: 16px; }
          .section-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(32px, 5vw, 56px); color: ${t.text}; line-height: 1.1; letter-spacing: -0.03em; }
          .shorts-container { display: flex; align-items: center; justify-content: center; gap: 20px; padding: 40px 20px; }
          .desktop-nav { display: flex; gap: 32; align-items: center; }
          .hamburger-wrap { display: none; position: relative; }

          /* Modern marquee ribbon */
          .marquee-ribbon {
            position: relative;
            padding: 48px 0;
            overflow: hidden;
            z-index: 2;
            background: linear-gradient(180deg, transparent, ${t.bg} 50%, transparent);
          }
          .marquee-ribbon::before, .marquee-ribbon::after {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            width: 180px;
            z-index: 3;
            pointer-events: none;
          }
          .marquee-ribbon::before { left: 0; background: linear-gradient(90deg, ${t.bg}, transparent); }
          .marquee-ribbon::after { right: 0; background: linear-gradient(270deg, ${t.bg}, transparent); }
          .marquee-border-line {
            position: absolute;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(${t.accentRgb},0.3), transparent);
          }
          .marquee-track-wrapper {
            display: flex;
            width: max-content;
            align-items: center;
          }
          .marquee-track-1 { animation: marquee 30s linear infinite; }
          .marquee-track-2 { animation: marqueeReverse 40s linear infinite; }
          .marquee-word {
            font-family: 'Syne', sans-serif;
            font-weight: 800;
            font-size: clamp(48px, 7vw, 96px);
            text-transform: uppercase;
            letter-spacing: -0.02em;
            white-space: nowrap;
            display: inline-flex;
            align-items: center;
            padding: 0 32px;
            color: ${t.text};
            transition: color 0.3s;
          }
          .marquee-word-outline {
            color: transparent;
            -webkit-text-stroke: 1.5px ${t.accent};
          }
          .marquee-word:hover {
            color: ${t.accent};
          }
          .marquee-star {
            display: inline-block;
            margin: 0 24px;
            color: ${t.accent};
            font-size: 32px;
            animation: starSpin 8s linear infinite;
          }

          @media (max-width: 768px) {
            .shorts-container { flex-direction: column; }
            .videos-grid { flex-direction: column !important; align-items: center !important; }
            .channels-grid { flex-direction: column !important; }
            .socials-row { flex-direction: column !important; align-items: stretch !important; }
            .desktop-nav { display: none !important; }
            .hamburger-wrap { display: block !important; }
            .hero-text-wrap { padding: 0 20px !important; align-items: center !important; text-align: center !important; max-width: 100% !important; margin: 0 auto !important; }
            .hero-ctas { justify-content: center !important; }
            .hero-socials { justify-content: center !important; }
          }
        `}</style>

        <InteractiveBackground />
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 1, background: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${t.scanline} 2px, ${t.scanline} 4px)` }} />
        {mode === "dark" && (<><svg style={{ position: "fixed", width: 0, height: 0 }}><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter></svg><div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.03, pointerEvents: "none", zIndex: 9999, filter: "url(#noise)" }} /></>)}

        {/* NAV — black initially, solid navBg on scroll */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 100, background: scrollY > 50 ? t.navBg : t.bg, backdropFilter: scrollY > 50 ? "blur(20px)" : "none", borderBottom: `1px solid ${t.border}`, transition: "all 0.5s ease" }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: t.accent, letterSpacing: "-0.5px" }}>OM.</span>
          <div className="desktop-nav" style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {["Videos", "Shorts", "Channels", "Connect"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} style={{ color: t.textMuted, textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, transition: "color 0.3s" }}
                onMouseEnter={(e) => e.target.style.color = t.accent} onMouseLeave={(e) => e.target.style.color = t.textMuted}>{item}</a>
            ))}
          </div>
          {/* <div style={{ display: "flex", gap: 10, alignItems: "center" }}><ThemeToggle /><HamburgerMenu /></div> */}
        </nav>

        {/* ═══ HERO — UNICORN AS FULL BACKGROUND ═══ */}
        <section style={{ minHeight: "100vh", position: "relative", zIndex: 2, overflow: "hidden" }}>
          {/* UnicornScene as full-bleed background — shifted slightly left */}
          <div style={{ position: "absolute", top: 60, left: "-20%", right: 0, bottom: -60, zIndex: 0, height: "110%", width: "110%", overflow: "hidden" }}>
            {UnicornScene ? (
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
              /* Fallback gradient */
              <div style={{ width: "100%", height: "100%", background: `radial-gradient(ellipse at 30% 50%, rgba(${t.accentRgb},0.06) 0%, transparent 60%)` }} />
            )}
          </div>

          {/* Bottom gradient — tall and fully opaque to hide watermark completely */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 180, background: `linear-gradient(to top, ${t.bg} 0%, ${t.bg} 30%, ${t.bg}f5 50%, ${t.bg}aa 70%, transparent 100%)`, zIndex: 3, pointerEvents: "none" }} />
          {/* Top gradient for nav blending */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 100, background: `linear-gradient(to bottom, ${t.bg}cc, transparent)`, zIndex: 3, pointerEvents: "none" }} />
          {/* Right side gradient so text is readable */}
          <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "55%", background: `linear-gradient(to left, ${t.bg}ee, ${t.bg}cc 30%, transparent 80%)`, zIndex: 2, pointerEvents: "none" }} />

          {/* Grid bg behind everything */}
          <div style={{ position: "absolute", inset: 0, zIndex: 1, backgroundImage: `linear-gradient(rgba(${t.accentRgb},0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(${t.accentRgb},0.04) 1px, transparent 1px)`, backgroundSize: "60px 60px", animation: "gridShift 20s linear infinite", maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)", pointerEvents: "none" }} />

          {/* Text content — positioned center-right, not flush-right */}
          <div className="hero-text-wrap" style={{ position: "relative", zIndex: 5, minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", padding: "120px 120px 80px", marginLeft: "auto", maxWidth: "55%" }}>
            <div style={{ maxWidth: 620 }}>
              <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(30px)", transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s" }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: "0.4em", color: t.accent, opacity: 0.7, textTransform: "uppercase", marginBottom: 20 }}>Stand Up Comedian</div>
              </div>
              <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(30px)", transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s" }}>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(52px, 7vw, 110px)", lineHeight: 0.9, letterSpacing: "-0.04em", textTransform: "uppercase", margin: 0, color: t.text }}>
                  <GlitchText text="OM" /><br />
                  <span style={{ color: t.accent }}><GlitchText text="DAGUR" /></span>
                </h1>
              </div>
              <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(30px)", transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.8s" }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, color: t.textMuted, maxWidth: 400, margin: "28px 0 0", lineHeight: 1.7, fontStyle: "italic" }}>A stand-up comic turning desi struggles into comedy</p>
              </div>
              <div className="hero-ctas" style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(30px)", transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 1s", display: "flex", gap: 14, marginTop: 36, flexWrap: "wrap" }}>
                <a href="#videos" style={{ padding: "14px 32px", borderRadius: 50, background: t.accent, color: mode === "dark" ? "#050505" : "#fff", textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, transition: "all 0.3s", boxShadow: `0 4px 20px rgba(${t.accentRgb},0.3)`, display: "inline-flex", alignItems: "center", gap: 8 }}
                  onMouseEnter={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = `0 8px 30px rgba(${t.accentRgb},0.4)`; }}
                  onMouseLeave={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = `0 4px 20px rgba(${t.accentRgb},0.3)`; }}
                >▶ Watch Now</a>
                <a href="#connect" style={{ padding: "14px 32px", borderRadius: 50, background: "transparent", border: `1px solid ${t.border}`, color: t.text, textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, transition: "all 0.3s" }}
                  onMouseEnter={(e) => { e.target.style.borderColor = t.accent; e.target.style.color = t.accent; }}
                  onMouseLeave={(e) => { e.target.style.borderColor = t.border; e.target.style.color = t.text; }}
                >Book a Show</a>
              </div>
              <div className="hero-socials" style={{ opacity: loaded ? 1 : 0, transition: "all 1s ease 1.2s", display: "flex", gap: 16, marginTop: 32 }}>
                {[
                  { label: "YouTube", url: "https://www.youtube.com/@omdagur1", svg: <svg width="20" height="14" viewBox="0 0 20 14" fill="none"><path d="M19.6 2.2C19.4.8 18.2.2 17 .1 14.5 0 10 0 10 0S5.5 0 3 .1C1.8.2.6.8.4 2.2.1 3.6 0 5 0 7s.1 3.4.4 4.8c.2 1.4 1.4 2 2.6 2.1C5.5 14 10 14 10 14s4.5 0 7-.1c1.2-.1 2.4-.7 2.6-2.1.3-1.4.4-2.8.4-4.8s-.1-3.4-.4-4.8z" fill={t.textFaint}/><path d="M8 10l5.2-3L8 4v6z" fill={t.bg}/></svg> },
                  { label: "Instagram", url: "https://www.instagram.com/omdagur1", svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.textFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill={t.textFaint} stroke="none"/></svg> },
                  { label: "Threads", url: "https://www.threads.com/@omdagur1", svg: <svg width="16" height="18" viewBox="0 0 16 18" fill={t.textFaint}><path d="M8 0C4.4 0 1.6 2.4 1.2 5.6c-.2 1.8.2 3.4 1.2 4.8.8 1.2 2 2 3.4 2.4-.2.8-.4 1.6-.8 2.4-.2.4-.1.8.2 1 .2.1.4.2.6.2.2 0 .4-.1.6-.2 1-.8 1.8-1.8 2.4-3 .2 0 .4 0 .6 0 3.2 0 5.8-2 6.4-4.8.2-1.2 0-2.4-.6-3.4C14 3.2 12 1.2 9.6.4 9.2.2 8.6 0 8 0z"/></svg> },
                ].map((s) => (
                  <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" title={s.label}
                    style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", transition: "all 0.3s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.background = t.surfaceHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = "transparent"; }}
                  >{s.svg}</a>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll line */}
          <div style={{ position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", animation: "float 3s ease-in-out infinite", zIndex: 5 }}>
            <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, ${t.accent}80, transparent)` }} />
          </div>
        </section>

        {/* ═══ MODERN MARQUEE RIBBON (dual-layer scroll) ═══ */}
        <div className="marquee-ribbon">
          <div className="marquee-border-line" style={{ top: 0 }} />
          {/* Layer 1: bold filled, scrolls left */}
          <div className="marquee-track-wrapper marquee-track-1">
            {[...Array(2)].map((_, dup) => (
              <div key={dup} style={{ display: "flex", alignItems: "center" }}>
                <span className="marquee-word">Comedy</span>
                <span className="marquee-star">✦</span>
                <span className="marquee-word marquee-word-outline">Desi</span>
                <span className="marquee-star">✦</span>
                <span className="marquee-word">Laughs</span>
                <span className="marquee-star">✦</span>
                <span className="marquee-word marquee-word-outline">Standup</span>
                <span className="marquee-star">✦</span>
                <span className="marquee-word">Punchlines</span>
                <span className="marquee-star">✦</span>
                <span className="marquee-word marquee-word-outline">Mumbai</span>
                <span className="marquee-star">✦</span>
              </div>
            ))}
          </div>
          <div className="marquee-border-line" style={{ bottom: 0 }} />
        </div>

        {/* VIDEOS */}
        <section id="videos" style={{ padding: "100px 24px", maxWidth: 1300, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <Reveal><div className="section-label">Featured Specials</div><h2 className="section-title" style={{ marginBottom: 60 }}>Watch the <span style={{ color: t.accent }}>laughs</span></h2></Reveal>
          <div className="videos-grid" style={{ display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "center" }}>{YOUTUBE_VIDEOS.map((v, i) => <VideoCard key={v.id} video={v} index={i} />)}</div>
        </section>

        {/* SHORTS */}
        <section id="shorts" style={{ padding: "100px 24px 120px", position: "relative", zIndex: 2 }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, rgba(${t.accentRgb},0.04) 0%, transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ maxWidth: 1300, margin: "0 auto" }}>
            <Reveal><div style={{ textAlign: "center" }}><div className="section-label">Quick Bites</div><h2 className="section-title" style={{ marginBottom: 16 }}>Shorts that <span style={{ color: t.accent }}>slap</span></h2><p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: t.textFaint, maxWidth: 400, margin: "0 auto 60px", lineHeight: 1.6 }}>Tap a phone to switch — hit play to watch</p></div></Reveal>
            <Reveal delay={0.2}>
              <div className="shorts-container">{YOUTUBE_SHORTS.map((s, i) => <PhoneFrame key={s.id} short={s} isActive={i === activeShort} onClick={() => setActiveShort(i)} />)}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 32 }}>{YOUTUBE_SHORTS.map((_, i) => <button key={i} onClick={() => setActiveShort(i)} style={{ width: activeShort === i ? 32 : 10, height: 10, borderRadius: 5, border: "none", cursor: "pointer", background: activeShort === i ? t.accent : t.textFaint, transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)" }} />)}</div>
            </Reveal>
          </div>
        </section>

        {/* CHANNELS */}
        <section id="channels" style={{ padding: "100px 24px", maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <Reveal><div className="section-label">YouTube Channels</div><h2 className="section-title" style={{ marginBottom: 48 }}>The <span style={{ color: t.accent }}>hub</span></h2></Reveal>
          <div className="channels-grid" style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>{CHANNELS.map((ch, i) => <ChannelCard key={ch.id} channel={ch} index={i} />)}</div>
          <Reveal delay={0.4}><div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 48, flexWrap: "wrap" }}>{CHANNELS.map((ch) => <SubscribeBtn key={ch.id} channel={ch} />)}</div></Reveal>
        </section>

        {/* SOCIALS */}
        <section id="connect" style={{ padding: "100px 24px 80px", maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <Reveal><div style={{ textAlign: "center" }}><div className="section-label">Get in Touch</div><h2 className="section-title" style={{ marginBottom: 48 }}>Let's <span style={{ color: t.accent }}>connect</span></h2></div></Reveal>
          <Reveal delay={0.2}>
            <div className="socials-row" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 32px", borderRadius: 60, textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)", border: `1px solid ${s.color}30`, color: t.text, background: `${s.color}${mode === "dark" ? "15" : "0a"}` }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${s.color}${mode === "dark" ? "30" : "18"}`; e.currentTarget.style.borderColor = `${s.color}60`; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 40px ${s.color}20`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = `${s.color}${mode === "dark" ? "15" : "0a"}`; e.currentTarget.style.borderColor = `${s.color}30`; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                ><span style={{ fontSize: 22 }}>{s.icon}</span>{s.label}<span style={{ opacity: 0.4, fontSize: 16 }}>↗</span></a>
              ))}
            </div>
          </Reveal>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: `1px solid ${t.border}`, padding: "40px 24px", textAlign: "center", position: "relative", zIndex: 2 }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, color: t.accent, letterSpacing: "-0.02em" }}>OM DAGUR</span>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: t.textFaint, marginTop: 12 }}>© {new Date().getFullYear()} Om Dagur. Making India laugh, one joke at a time.</p>
        </footer>
      </div>
    </ThemeCtx.Provider>
  );
}