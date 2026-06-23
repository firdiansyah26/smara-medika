import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0D9488 0%, #06B6D4 100%)",
          position: "relative",
        }}
      >
        {/* Cross mark (medis) */}
        <div
          style={{
            position: "absolute",
            width: "92px",
            height: "30px",
            borderRadius: "10px",
            background: "#ffffff",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "30px",
            height: "92px",
            borderRadius: "10px",
            background: "#ffffff",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
