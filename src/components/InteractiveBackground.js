import { useRef, useEffect } from "react";
import { T, useTheme } from "../theme";
import { usePrefersReducedMotion } from "../shared";

/* ═══════════════════════════════════════════════════════════
   Ambient particle field + cursor trail.

   Coordinates are VIEWPORT space (clientX / clientY), and the
   canvas is position:fixed at exactly viewport size. The older
   version drew in document space on a canvas whose CSS height
   was left to `auto`; because a canvas with width:100% and
   height:auto scales by its intrinsic aspect ratio, the drawing
   buffer and the displayed box disagreed, so every point was
   painted slightly off - an error that grew the further down
   the page you scrolled. That was the cursor-trail offset.
   ═══════════════════════════════════════════════════════════ */

export default function InteractiveBackground() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, speed: 0 });
  const trailRef = useRef([]);
  const { mode } = useTheme();
  const t = T[mode];
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let particles = [], ripples = [], meteors = [], attractors = [], frame = 0;
    let W = 0, H = 0;
    const isMob = window.innerWidth < 768;
    const COUNT = isMob ? 34 : 90;
    const MAX_TRAIL = 34;
    const MAX_ATTRACTED = 3;   // how many particles may follow the pointer
    const CURSOR_RADIUS = 260; // how close they must be to get caught

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const seed = () => {
      particles = [];
      for (let i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
          baseR: Math.random() * 2 + 0.5, r: 0,
          color: Math.random() > 0.5 ? 1 : 2,
          phase: Math.random() * Math.PI * 2, freq: 0.005 + Math.random() * 0.01,
          orbitAngle: Math.random() * Math.PI * 2, trail: [],
        });
      }
      attractors = [];
      for (let i = 0; i < (isMob ? 2 : 4); i++) {
        attractors.push({
          x: Math.random() * W, y: Math.random() * H,
          strength: 0.02 + Math.random() * 0.03,
          radius: 200 + Math.random() * 200,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };
    seed();

    const addRipple = (x, y, maxR) => { if (ripples.length < 8) ripples.push({ x, y, r: 0, maxR: maxR || 200, life: 1 }); };

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, W, H);
      const mx = mouseRef.current.x, my = mouseRef.current.y, mSpeed = mouseRef.current.speed;
      const pointerLive = mx > -500;

      /* ── cursor trail ── */
      if (pointerLive) { trailRef.current.push({ x: mx, y: my, life: 1 }); if (trailRef.current.length > MAX_TRAIL) trailRef.current.shift(); }
      if (trailRef.current.length > 1 && !isMob) {
        for (let i = 1; i < trailRef.current.length; i++) {
          const prev = trailRef.current[i - 1], cur = trailRef.current[i], progress = i / trailRef.current.length;
          const grad = ctx.createLinearGradient(prev.x, prev.y, cur.x, cur.y);
          grad.addColorStop(0, `${t.glow1}${progress * 0.4})`);
          grad.addColorStop(1, `${t.glow2}${progress * 0.5})`);
          ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(cur.x, cur.y);
          ctx.strokeStyle = grad; ctx.lineWidth = progress * 4; ctx.lineCap = "round"; ctx.stroke();
        }
        trailRef.current.forEach((p) => { p.life -= 0.025; });
        trailRef.current = trailRef.current.filter((p) => p.life > 0);
      }

      /* ── soft glow around the pointer ──
         The orbiting arc segments that used to sit here read as permanent
         ripples around the cursor. Ripples are now click-only, so only the
         soft radial glow remains. */
      if (pointerLive && !isMob) {
        const cs = Math.min(mSpeed, 25);
        const gR = 120 + cs * 2;
        const grd = ctx.createRadialGradient(mx, my, 0, mx, my, gR);
        grd.addColorStop(0, `${t.glow1}0.07)`); grd.addColorStop(0.3, `${t.glow2}0.02)`); grd.addColorStop(1, `${t.glow1}0)`);
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(mx, my, gR, 0, Math.PI * 2); ctx.fill();
      }

      ripples.forEach((rip) => {
        ctx.beginPath(); ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
        ctx.strokeStyle = `${t.glow1}${rip.life * 0.3})`; ctx.lineWidth = 2 * rip.life; ctx.stroke();
        rip.r += 3; rip.life -= 0.015;
      });
      ripples = ripples.filter((r) => r.life > 0);

      if (frame % 180 === 0 && meteors.length < 3) {
        const side = Math.random();
        meteors.push({ x: side > 0.5 ? -50 : W + 50, y: Math.random() * H * 0.5, vx: (side > 0.5 ? 1 : -1) * (3 + Math.random() * 4), vy: 2 + Math.random() * 3, life: 1, length: 60 + Math.random() * 100, width: 1 + Math.random() * 2 });
      }
      meteors.forEach((m) => {
        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * m.length * 0.3, m.y - m.vy * m.length * 0.3);
        grad.addColorStop(0, `${t.glow1}${m.life * 0.5})`); grad.addColorStop(1, `${t.glow1}0)`);
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * m.length * 0.3, m.y - m.vy * m.length * 0.3);
        ctx.strokeStyle = grad; ctx.lineWidth = m.width; ctx.stroke();
        ctx.beginPath(); ctx.arc(m.x, m.y, Math.max(0.1, 3 * m.life), 0, Math.PI * 2);
        ctx.fillStyle = `${t.glow1}${m.life * 0.7})`; ctx.fill();
        m.x += m.vx; m.y += m.vy; m.life -= 0.003;
      });
      meteors = meteors.filter((m) => m.life > 0 && m.x > -200 && m.x < W + 200);

      /* Only the few closest particles react to the pointer. Letting every
         particle inside the radius get pulled produced a distracting swarm. */
      const nearSet = new Set();
      if (pointerLive) {
        const cand = [];
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const d = Math.sqrt((mx - p.x) ** 2 + (my - p.y) ** 2);
          if (d < CURSOR_RADIUS) cand.push([d, i]);
        }
        cand.sort((a, b) => a[0] - b[0]);
        for (let k = 0; k < Math.min(MAX_ATTRACTED, cand.length); k++) nearSet.add(cand[k][1]);
      }

      particles.forEach((p, i) => {
        p.r = Math.max(0.1, p.baseR + Math.sin(frame * p.freq + p.phase) * 1);
        const attracted = nearSet.has(i);
        attractors.forEach((a) => {
          a.phase += 0.001;
          const ax = a.x + Math.sin(a.phase) * 100, ay = a.y + Math.cos(a.phase * 0.7) * 100;
          const dx = ax - p.x, dy = ay - p.y, dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < a.radius && dist > 10) { const f = a.strength * (1 - dist / a.radius); p.vx += (dx / dist) * f; p.vy += (dy / dist) * f; }
        });
        const dx = mx - p.x, dy = my - p.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (attracted && dist > 5) {
          const f = 0.15 * (1 - dist / CURSOR_RADIUS);
          p.vx += (dx / dist) * f; p.vy += (dy / dist) * f;
          p.vx += (-dy / dist) * f * 0.5; p.vy += (dx / dist) * f * 0.5;
          if (dist < 80) { p.orbitAngle += 0.03; p.vx += (mx + Math.cos(p.orbitAngle) * dist - p.x) * 0.02; p.vy += (my + Math.sin(p.orbitAngle) * dist - p.y) * 0.02; }
        }
        // (ripples used to spawn here from fast pointer movement - now click-only)
        p.vx *= 0.985; p.vy *= 0.985;
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 3) { p.vx = (p.vx / speed) * 3; p.vy = (p.vy / speed) * 3; }
        p.x += p.vx; p.y += p.vy;
        if (p.x < -50) p.x = W + 50; if (p.x > W + 50) p.x = -50;
        if (p.y < -50) p.y = H + 50; if (p.y > H + 50) p.y = -50;
        p.trail.push({ x: p.x, y: p.y }); if (p.trail.length > 8) p.trail.shift();

        // Highlight only the attracted few, so the pointer has a small
        // entourage rather than a cloud.
        const glow = attracted ? 1 - dist / CURSOR_RADIUS : 0;
        const bAlpha = 0.2 + Math.sin(frame * p.freq + p.phase) * 0.1;
        const cs = p.color === 1 ? t.particle1 : t.particle2;
        if (p.trail.length > 1 && speed > 0.5) {
          for (let ti = 1; ti < p.trail.length; ti++) {
            ctx.beginPath(); ctx.moveTo(p.trail[ti - 1].x, p.trail[ti - 1].y); ctx.lineTo(p.trail[ti].x, p.trail[ti].y);
            ctx.strokeStyle = `rgba(${cs},${(ti / p.trail.length) * 0.12})`; ctx.lineWidth = p.r * (ti / p.trail.length); ctx.stroke();
          }
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.1, p.r + glow * 4), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cs},${bAlpha + glow * 0.5})`; ctx.fill();
        if (glow > 0.3) {
          ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.1, p.r + glow * 12), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${cs},${glow * 0.12})`; ctx.lineWidth = 1; ctx.stroke();
        }
        const jEnd = Math.min(i + 25, particles.length);
        for (let j = i + 1; j < jEnd; j++) {
          const p2 = particles[j];
          const d = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
          const maxD = 120 + glow * 70;
          if (d < maxD) {
            const la = 0.05 * (1 - d / maxD) + glow * 0.06;
            const d2 = Math.sqrt((mx - p2.x) ** 2 + (my - p2.y) ** 2);
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
            if (dist < 200 || d2 < 200) {
              const lg = ctx.createLinearGradient(p.x, p.y, p2.x, p2.y);
              lg.addColorStop(0, `rgba(${t.particle1},${la})`); lg.addColorStop(1, `rgba(${t.particle2},${la})`);
              ctx.strokeStyle = lg; ctx.lineWidth = 1.2;
            } else { ctx.strokeStyle = `rgba(${t.particle1},${la * 0.5})`; ctx.lineWidth = 0.6; }
            ctx.stroke();
          }
        }
      });

      if (!isMob) {
        for (let h = 0; h < 4; h++) {
          const hx = (W * (h + 1)) / 5 + Math.sin(frame * 0.003 + h * 2) * 80;
          const hy = (frame * 0.15 + h * H * 0.25) % H;
          const hr = 20 + Math.sin(frame * 0.01 + h) * 8;
          ctx.beginPath();
          for (let s = 0; s <= 6; s++) {
            const a = (s / 6) * Math.PI * 2 + frame * 0.005;
            const px = hx + Math.cos(a) * hr, py = hy + Math.sin(a) * hr;
            s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.closePath(); ctx.strokeStyle = `rgba(${t.particle2},0.05)`; ctx.lineWidth = 1; ctx.stroke();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    if (!reduced) draw();

    const handleClick = (e) => {
      addRipple(e.clientX, e.clientY, 250);
      particles.forEach((p) => {
        const dx = p.x - e.clientX, dy = p.y - e.clientY, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 0) { const f = (1 - dist / 200) * 5; p.vx += (dx / dist) * f; p.vy += (dy / dist) * f; }
      });
    };
    const handleMouse = (e) => {
      const prev = mouseRef.current;
      mouseRef.current = {
        x: e.clientX, y: e.clientY,
        speed: Math.sqrt((e.clientX - prev.x) ** 2 + (e.clientY - prev.y) ** 2),
      };
    };
    const handleLeave = () => { mouseRef.current = { x: -1000, y: -1000, speed: 0 }; };
    const handleTouch = (e) => {
      if (e.touches.length > 0) {
        const tc = e.touches[0], prev = mouseRef.current;
        mouseRef.current = { x: tc.clientX, y: tc.clientY, speed: Math.sqrt((tc.clientX - prev.x) ** 2 + (tc.clientY - prev.y) ** 2) };
      }
    };
    // Touch gets the same ripple a click does - it's the touch equivalent.
    const handleTouchStart = (e) => {
      if (e.touches.length > 0) addRipple(e.touches[0].clientX, e.touches[0].clientY, 250);
    };

    window.addEventListener("mousemove", handleMouse, { passive: true });
    window.addEventListener("click", handleClick);
    window.addEventListener("touchmove", handleTouch, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("mouseleave", handleLeave);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("touchmove", handleTouch);
      window.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, [mode, reduced, t.glow1, t.glow2, t.particle1, t.particle2]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 0 }}
    />
  );
}
