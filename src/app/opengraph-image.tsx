import { ImageResponse } from "next/og";

export const alt = "SmaraMedika — Platform Rekam Medis Elektronik";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0D9488 0%, #06B6D4 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          {/* Brand mark: white rounded square with teal cross */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "108px",
              height: "108px",
              borderRadius: "28px",
              background: "#ffffff",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "56px",
                height: "18px",
                borderRadius: "6px",
                background: "#0D9488",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: "18px",
                height: "56px",
                borderRadius: "6px",
                background: "#0D9488",
              }}
            />
          </div>
          <div style={{ fontSize: "76px", fontWeight: 800, letterSpacing: "-2px" }}>
            SmaraMedika
          </div>
        </div>

        <div
          style={{
            marginTop: "36px",
            fontSize: "40px",
            fontWeight: 600,
            maxWidth: "900px",
            lineHeight: 1.25,
          }}
        >
          Platform Rekam Medis Elektronik multi-tenant
        </div>
        <div
          style={{
            marginTop: "20px",
            fontSize: "28px",
            color: "rgba(255,255,255,0.88)",
            maxWidth: "920px",
            lineHeight: 1.35,
          }}
        >
          Rumah Sakit · Klinik · Apotek — transfer obat antar rekanan, antrian,
          billing, lab & radiologi, berbagi pasien terkontrol.
        </div>

        <div
          style={{
            marginTop: "44px",
            display: "flex",
            gap: "14px",
            fontSize: "22px",
            fontWeight: 600,
          }}
        >
          {["RME / EMR", "Multi-Tenant", "Shared API"].map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.18)",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
