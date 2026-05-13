import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Llave — Alquilá hoy, sin meses adelantados";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "radial-gradient(900px 500px at 15% 20%, #f7d9cb 0%, transparent 60%), radial-gradient(900px 500px at 90% 85%, #fbeee5 0%, transparent 60%), #faf8f3",
          padding: 60,
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 14,
              background: "#8a3722",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg viewBox="0 0 40 40" width="44" height="44" xmlns="http://www.w3.org/2000/svg">
              <ellipse
                cx="12"
                cy="9"
                rx="5.2"
                ry="6"
                stroke="#faf8f3"
                strokeWidth="3"
                fill="none"
                transform="rotate(-10 12 9)"
              />
              <path d="M12 15 V31" stroke="#faf8f3" strokeWidth="3" strokeLinecap="round" />
              <path d="M12 31 H31" stroke="#faf8f3" strokeWidth="3" strokeLinecap="round" />
              <path
                d="M15.5 31 V26.2 L17.4 24 L19.3 26.2 V31"
                stroke="#faf8f3"
                strokeWidth="2.2"
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M21.4 31 V27.4 L22.9 25.6 L24.4 27.4 V31"
                stroke="#faf8f3"
                strokeWidth="2.2"
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M26.5 31 V28.3 L27.7 26.9 L28.9 28.3 V31"
                stroke="#faf8f3"
                strokeWidth="2.2"
                strokeLinejoin="round"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 38, fontWeight: 800, color: "#8a3722", letterSpacing: -0.5, lineHeight: 1 }}>
              Llave
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#7c8a87", letterSpacing: 2, marginTop: 4 }}>
              ALQUILAR · VENEZUELA · IA
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 44,
            fontSize: 88,
            fontWeight: 900,
            lineHeight: 1.02,
            color: "#0b1f1c",
            display: "flex",
            flexDirection: "column",
            letterSpacing: -2,
          }}
        >
          <span>Alquilá hoy. Sin</span>
          <span
            style={{
              background:
                "linear-gradient(90deg, #4a1e13 0%, #8a3722 50%, #c4513a 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            meses adelantados.
          </span>
        </div>
        <div
          style={{
            marginTop: 36,
            display: "flex",
            gap: 12,
            fontSize: 22,
            fontWeight: 600,
            flexWrap: "wrap",
          }}
        >
          <div style={{ padding: "12px 22px", background: "#8a3722", color: "#faf8f3", borderRadius: 999, display: "flex", alignItems: "center", gap: 8 }}>
            <span>⚡</span>
            <span>Alquilá hoy</span>
          </div>
          <div style={{ padding: "12px 22px", background: "#fbeee5", color: "#8a3722", borderRadius: 999, border: "1px solid #f7d9cb" }}>
            0 meses adelantados
          </div>
          <div style={{ padding: "12px 22px", background: "#fbeee5", color: "#8a3722", borderRadius: 999, border: "1px solid #f7d9cb" }}>
            1 mes depósito reembolsable
          </div>
          <div style={{ padding: "12px 22px", background: "#fbeee5", color: "#8a3722", borderRadius: 999, border: "1px solid #f7d9cb", display: "flex", alignItems: "center", gap: 8 }}>
            <span>✦</span>
            <span>Llavero IA</span>
          </div>
        </div>
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#4a5b58",
            fontSize: 20,
          }}
        >
          <div>Construido en Venezuela · Powered by Claude</div>
          <div style={{ fontWeight: 700, color: "#8a3722" }}>llave-ruby.vercel.app</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
