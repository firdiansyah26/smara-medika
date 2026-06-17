import NextAuth from "next-auth";
import authConfig from "@/auth.config";

// Next.js 16: konvensi "middleware" diganti "proxy".
// Edge-safe (pakai authConfig tanpa Prisma/bcrypt). Callback `authorized`
// pada authConfig melindungi rute /dashboard.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/dashboard/:path*"],
};
