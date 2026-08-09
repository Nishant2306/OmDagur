import { useState } from "react";
import { T, useTheme } from "../theme";
import { Reveal } from "../shared";

/* ═══════════════════════════════════════════════════════════
   SETUP — one step, takes about a minute:

   1. Go to  https://web3forms.com
   2. Type  omdagur1@gmail.com  into the "Create Access Key" box
   3. Check that inbox, copy the access key they email you
   4. Paste it below, replacing PASTE_YOUR_ACCESS_KEY_HERE

   Every submission then arrives as an email at omdagur1@gmail.com.
   The key is safe to commit — Web3Forms keys are designed to be
   public, they only ever deliver to the address they're bound to.

   Until it's set, the form falls back to opening the visitor's own
   mail app with everything pre-filled, so it is never a dead end.
   ═══════════════════════════════════════════════════════════ */
const WEB3FORMS_KEY = process.env.REACT_APP_WEB3FORMS_KEY || "PASTE_YOUR_ACCESS_KEY_HERE";
const TO_EMAIL = "omdagur1@gmail.com";
const isConfigured = WEB3FORMS_KEY && !WEB3FORMS_KEY.startsWith("PASTE_YOUR");

const EVENT_TYPES = [
  "Corporate / Office Party",
  "College Fest",
  "Private Party",
  "Wedding / Sangeet",
  "Brand Collaboration",
  "Podcast / Guest Appearance",
  "Club / Open Mic",
  "Something else",
];
const AUDIENCE = ["Under 50", "50 – 150", "150 – 500", "500 – 1500", "1500+", "Not sure yet"];
const BUDGET = ["Still figuring it out", "Under ₹25,000", "₹25,000 – ₹50,000", "₹50,000 – ₹1,00,000", "₹1,00,000+"];

const EMPTY = {
  name: "", email: "", phone: "", eventType: "", eventDate: "",
  city: "", org: "", audience: "", budget: "", message: "", botcheck: "",
};

export default function BookShow() {
  const { mode } = useTheme();
  const t = T[mode];
  const [f, setF] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | mailto | error
  const [errMsg, setErrMsg] = useState("");
  const [focused, setFocused] = useState("");

  const set = (k) => (e) => {
    setF((p) => ({ ...p, [k]: e.target.value }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!f.name.trim()) e.name = "Please tell us your name";
    if (!f.email.trim()) e.email = "We need an email to reply to";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "That email doesn't look right";
    if (!f.eventType) e.eventType = "Pick what this is for";
    if (!f.message.trim()) e.message = "A line or two about the event helps a lot";
    else if (f.message.trim().length < 10) e.message = "A little more detail, please";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const plainText = () =>
    [
      `Name: ${f.name}`,
      `Email: ${f.email}`,
      `Phone / WhatsApp: ${f.phone || "—"}`,
      `Type of event: ${f.eventType}`,
      `Preferred date: ${f.eventDate || "—"}`,
      `City: ${f.city || "—"}`,
      `Company / College / Venue: ${f.org || "—"}`,
      `Expected audience: ${f.audience || "—"}`,
      `Budget range: ${f.budget || "—"}`,
      "",
      "Details:",
      f.message,
    ].join("\n");

  const openMailFallback = () => {
    const subject = encodeURIComponent(`Booking enquiry — ${f.eventType || "Show"} — ${f.name}`);
    const body = encodeURIComponent(plainText());
    window.location.href = `mailto:${TO_EMAIL}?subject=${subject}&body=${body}`;
    setStatus("mailto");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (f.botcheck) return; // honeypot tripped — silently drop
    if (!validate()) {
      document.querySelector(".bk-error-field")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!isConfigured) { openMailFallback(); return; }

    setStatus("sending");
    setErrMsg("");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `🎤 Booking enquiry — ${f.eventType} — ${f.name}`,
          from_name: "omdagur.com — Book a Show",
          name: f.name,
          email: f.email,
          replyto: f.email,
          phone: f.phone || "—",
          "Type of event": f.eventType,
          "Preferred date": f.eventDate || "—",
          City: f.city || "—",
          "Company / College / Venue": f.org || "—",
          "Expected audience": f.audience || "—",
          "Budget range": f.budget || "—",
          Details: f.message,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        setF(EMPTY);
      } else {
        setStatus("error");
        setErrMsg(data.message || "The form service rejected that. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrMsg("Couldn't reach the network. Check your connection and try again.");
    }
  };

  /* ── field styling helpers ── */
  const fieldStyle = (key) => ({
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    background: t.surface,
    border: `1px solid ${errors[key] ? "#e2554e" : focused === key ? `rgba(${t.accentRgb},.6)` : t.border}`,
    color: t.text,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    outline: "none",
    transition: "border-color .25s ease, background .25s ease",
    boxShadow: focused === key ? `0 0 0 4px rgba(${t.accentRgb},.09)` : "none",
    appearance: "none",
  });

  const Label = ({ htmlFor, children, required }) => (
    <label htmlFor={htmlFor} style={{
      display: "block", marginBottom: 8,
      fontFamily: "'Space Mono', monospace", fontSize: 10,
      letterSpacing: ".18em", textTransform: "uppercase", color: t.textMuted,
    }}>
      {children}{required && <span style={{ color: t.accent, marginLeft: 4 }}>*</span>}
    </label>
  );

  const Err = ({ k }) => errors[k] ? (
    <div style={{ marginTop: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#e2554e" }}>{errors[k]}</div>
  ) : null;

  const wrap = (k, extra = {}) => ({ className: errors[k] ? "bk-error-field" : "", style: { ...extra } });

  if (status === "success" || status === "mailto") {
    return (
      <section id="book" style={{ padding: "110px 24px", maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 2 }}>
        <div style={{
          textAlign: "center", padding: "56px 32px", borderRadius: 24,
          background: t.surface, border: `1px solid rgba(${t.accentRgb},.28)`,
          boxShadow: `0 30px 80px rgba(${t.accentRgb},.10)`,
        }}>
          <div style={{ fontSize: 56, marginBottom: 18 }}>{status === "success" ? "🎉" : "📬"}</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(26px,4vw,40px)", color: t.text, margin: 0 }}>
            {status === "success" ? "Request sent!" : "Almost there"}
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: t.textMuted, marginTop: 14, lineHeight: 1.7 }}>
            {status === "success"
              ? <>Your enquiry just landed in Om's inbox. Expect a reply within a couple of days — check your spam folder too, just in case.</>
              : <>Your mail app should have opened with everything filled in. Just hit send — or write to <a href={`mailto:${TO_EMAIL}`} style={{ color: t.accent }}>{TO_EMAIL}</a> directly.</>}
          </p>
          <button
            onClick={() => setStatus("idle")}
            style={{
              marginTop: 26, padding: "13px 28px", borderRadius: 50, cursor: "pointer",
              background: "transparent", border: `1px solid ${t.border}`, color: t.text,
              fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, transition: "all .3s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.text; }}
          >Send another enquiry</button>
        </div>
      </section>
    );
  }

  return (
    <section id="book" style={{ padding: "110px 24px", maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 2 }}>
      <style>{`
        .bk-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .bk-full { grid-column: 1 / -1; }
        .bk-grid input::placeholder, .bk-grid textarea::placeholder { color: ${t.textFaint}; }
        .bk-grid select option { background: ${t.bg}; color: ${t.text}; }
        @media (max-width: 640px) { .bk-grid { grid-template-columns: 1fr; } }
      `}</style>

      <Reveal>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div className="section-label">Book a Show</div>
          <h2 className="section-title" style={{ marginBottom: 14 }}>
            Get Om on your <span style={{ color: t.accent }}>stage</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: t.textMuted, maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
            Office party, college fest, wedding, brand collab — if there's a crowd and a mic, he's interested. Fill this in and it goes straight to his inbox.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <form onSubmit={submit} noValidate style={{
          padding: "clamp(24px, 4vw, 44px)", borderRadius: 24,
          background: t.cardBg, border: `1px solid ${t.cardBorder}`,
          boxShadow: `0 24px 70px ${t.shadow}`,
        }}>
          {/* honeypot — hidden from humans, catches naive bots */}
          <input
            type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off"
            checked={!!f.botcheck} onChange={(e) => setF((p) => ({ ...p, botcheck: e.target.checked ? "1" : "" }))}
            style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
            aria-hidden="true"
          />

          <div className="bk-grid">
            <div {...wrap("name")}>
              <Label htmlFor="bk-name" required>Your name</Label>
              <input id="bk-name" type="text" value={f.name} onChange={set("name")}
                onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                placeholder="Who's asking?" style={fieldStyle("name")} autoComplete="name" />
              <Err k="name" />
            </div>

            <div {...wrap("email")}>
              <Label htmlFor="bk-email" required>Email</Label>
              <input id="bk-email" type="email" value={f.email} onChange={set("email")}
                onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                placeholder="you@company.com" style={fieldStyle("email")} autoComplete="email" />
              <Err k="email" />
            </div>

            <div>
              <Label htmlFor="bk-phone">Phone / WhatsApp</Label>
              <input id="bk-phone" type="tel" value={f.phone} onChange={set("phone")}
                onFocus={() => setFocused("phone")} onBlur={() => setFocused("")}
                placeholder="+91 …" style={fieldStyle("phone")} autoComplete="tel" />
            </div>

            <div {...wrap("eventType")}>
              <Label htmlFor="bk-type" required>What's this for?</Label>
              <select id="bk-type" value={f.eventType} onChange={set("eventType")}
                onFocus={() => setFocused("eventType")} onBlur={() => setFocused("")}
                style={{ ...fieldStyle("eventType"), cursor: "pointer" }}>
                <option value="">Choose one…</option>
                {EVENT_TYPES.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
              <Err k="eventType" />
            </div>

            <div>
              <Label htmlFor="bk-date">Preferred date</Label>
              <input id="bk-date" type="date" value={f.eventDate} onChange={set("eventDate")}
                onFocus={() => setFocused("eventDate")} onBlur={() => setFocused("")}
                min={new Date().toISOString().split("T")[0]}
                style={{ ...fieldStyle("eventDate"), colorScheme: mode === "dark" ? "dark" : "light" }} />
            </div>

            <div>
              <Label htmlFor="bk-city">City</Label>
              <input id="bk-city" type="text" value={f.city} onChange={set("city")}
                onFocus={() => setFocused("city")} onBlur={() => setFocused("")}
                placeholder="Where's the show?" style={fieldStyle("city")} />
            </div>

            <div>
              <Label htmlFor="bk-org">Company / College / Venue</Label>
              <input id="bk-org" type="text" value={f.org} onChange={set("org")}
                onFocus={() => setFocused("org")} onBlur={() => setFocused("")}
                placeholder="Optional" style={fieldStyle("org")} />
            </div>

            <div>
              <Label htmlFor="bk-aud">Expected audience</Label>
              <select id="bk-aud" value={f.audience} onChange={set("audience")}
                onFocus={() => setFocused("audience")} onBlur={() => setFocused("")}
                style={{ ...fieldStyle("audience"), cursor: "pointer" }}>
                <option value="">Choose one…</option>
                {AUDIENCE.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </div>

            <div className="bk-full">
              <Label htmlFor="bk-budget">Budget range</Label>
              <select id="bk-budget" value={f.budget} onChange={set("budget")}
                onFocus={() => setFocused("budget")} onBlur={() => setFocused("")}
                style={{ ...fieldStyle("budget"), cursor: "pointer" }}>
                <option value="">Rather not say</option>
                {BUDGET.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </div>

            <div className="bk-full" {...wrap("message")}>
              <Label htmlFor="bk-msg" required>Tell him about it</Label>
              <textarea id="bk-msg" rows={5} value={f.message} onChange={set("message")}
                onFocus={() => setFocused("message")} onBlur={() => setFocused("")}
                placeholder="The occasion, the crowd, how long a set you're after, anything else worth knowing…"
                style={{ ...fieldStyle("message"), resize: "vertical", minHeight: 130, lineHeight: 1.6 }} />
              <Err k="message" />
            </div>
          </div>

          {status === "error" && (
            <div style={{
              marginTop: 20, padding: "14px 18px", borderRadius: 12,
              background: "rgba(226,85,78,.10)", border: "1px solid rgba(226,85,78,.35)",
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: t.text,
            }}>
              {errMsg}{" "}
              <button type="button" onClick={openMailFallback} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: t.accent, fontWeight: 700, fontFamily: "inherit", fontSize: 14 }}>
                Send it by email instead →
              </button>
            </div>
          )}

          <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            <button
              type="submit"
              disabled={status === "sending"}
              style={{
                padding: "16px 38px", borderRadius: 50, border: "none",
                cursor: status === "sending" ? "wait" : "pointer",
                background: t.accent, color: t.onAccent,
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15,
                boxShadow: `0 8px 30px rgba(${t.accentRgb},.32)`,
                opacity: status === "sending" ? .7 : 1,
                transition: "all .3s ease",
                display: "inline-flex", alignItems: "center", gap: 10,
              }}
              onMouseEnter={(e) => { if (status !== "sending") e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {status === "sending" ? "Sending…" : "Send enquiry"}
              {status !== "sending" && <span aria-hidden="true">🎤</span>}
            </button>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: t.textFaint }}>
              Goes straight to <span style={{ color: t.textMuted }}>{TO_EMAIL}</span>
            </span>
          </div>
        </form>
      </Reveal>
    </section>
  );
}
