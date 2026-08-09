import { useEffect } from "react";
import { T, useTheme } from "../theme";
import Gallery from "./Gallery";
import Footer from "./Footer";

/* Standalone gallery, reached at #/gallery - opened in its own tab from the
   showcase CTA and the nav. Hash routing keeps it working on GitHub Pages
   with no server rewrite rules. */
export default function GalleryPage({ items, homeHref = "#top" }) {
  const { mode } = useTheme();
  const t = T[mode];

  useEffect(() => {
    window.scrollTo(0, 0);
    const prev = document.title;
    document.title = "Gallery - Om Dagur";
    return () => { document.title = prev; };
  }, []);

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, padding: "18px 28px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        zIndex: 100, background: t.navBg, backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${t.border}`,
      }}>
        <a href={homeHref} style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20,
          color: t.accent, letterSpacing: "-0.5px", textDecoration: "none",
        }}>OM.</a>
        <a
          href={homeHref}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "9px 18px", borderRadius: 40,
            border: `1px solid ${t.border}`, color: t.textMuted, textDecoration: "none",
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
            transition: "all .3s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textMuted; }}
        >← Back to the site</a>
      </nav>

      <div style={{ paddingTop: 40 }}>
        <Gallery items={items} />
      </div>

      <Footer />
    </>
  );
}
