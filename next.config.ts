import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pastikan root workspace = folder proyek ini (ada lockfile lain di direktori induk).
  turbopack: {
    root: __dirname,
  },
  // @react-pdf/renderer dirender di server (Node) — jangan di-bundle.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
