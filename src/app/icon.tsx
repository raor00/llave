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
          background: "#8a3722",
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg viewBox="0 0 40 40" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
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
    ),
    { ...size }
  );
}
