import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#128c5d",
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg viewBox="0 0 40 40" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
          <ellipse
            cx="12.5"
            cy="9"
            rx="5.2"
            ry="6"
            stroke="#faf8f3"
            strokeWidth="3"
            fill="none"
            transform="rotate(-10 12.5 9)"
          />
          <circle cx="12.5" cy="9" r="1.6" fill="#f4c95d" />
          <path d="M12.5 15.5 V31" stroke="#faf8f3" strokeWidth="3" strokeLinecap="round" />
          <path
            d="M12.5 31 Q15 31 16 29 Q17 27 18 29 Q19 31 21 31 Q23 31 24 29 Q25 27 26 29 Q27 31 29 31 L31 31"
            stroke="#faf8f3"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
