import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Llave — Alquilar sin meses adelantados";
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
            "radial-gradient(1200px 600px at 20% 20%, #c8ecd6 0%, transparent 60%), radial-gradient(900px 500px at 90% 80%, #f4c95d33 0%, transparent 60%), #faf8f3",
          padding: 64,
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 14,
              background: "#0a563a",
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
          <div style={{ fontSize: 38, fontWeight: 800, color: "#0a563a", letterSpacing: -0.5 }}>
            Llave
          </div>
        </div>
        <div
          style={{
            marginTop: 56,
            fontSize: 92,
            fontWeight: 900,
            lineHeight: 1.02,
            color: "#0b1f1c",
            display: "flex",
            flexDirection: "column",
            letterSpacing: -2,
          }}
        >
          <span>Alquilar sin</span>
          <span
            style={{
              background:
                "linear-gradient(90deg, #0a563a 0%, #128c5d 60%, #f4c95d 100%)",
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
            gap: 14,
            color: "#0a563a",
            fontSize: 26,
            fontWeight: 600,
          }}
        >
          <div style={{ padding: "12px 22px", background: "#e8f7ef", borderRadius: 999 }}>
            0 meses adelantados
          </div>
          <div style={{ padding: "12px 22px", background: "#e8f7ef", borderRadius: 999 }}>
            1 mes depósito
          </div>
          <div style={{ padding: "12px 22px", background: "#e8f7ef", borderRadius: 999 }}>
            100% reembolsable
          </div>
        </div>
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#4a5b58",
            fontSize: 22,
          }}
        >
          <div>Con Llavero IA · construido en Venezuela</div>
          <div style={{ fontWeight: 700, color: "#0a563a" }}>llave.app</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
