import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pastikan root workspace = folder proyek ini (ada lockfile lain di direktori induk).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
