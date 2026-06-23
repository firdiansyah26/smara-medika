import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SmaraMedika — Platform Rekam Medis Elektronik",
    short_name: "SmaraMedika",
    description:
      "Platform Rekam Medis Elektronik (RME) multi-tenant untuk Rumah Sakit, Klinik, dan Apotek.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0d9488",
    lang: "id",
    categories: ["medical", "health", "productivity"],
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon", type: "image/png", sizes: "180x180" },
    ],
  };
}
