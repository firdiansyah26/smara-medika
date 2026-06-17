import type { NextAuthConfig } from "next-auth";
import type { MembershipInfo } from "@/lib/auth-types";

// Konfigurasi edge-safe (tanpa Prisma/bcrypt) — dipakai middleware & auth.ts.
// Provider dengan dependensi Node (Credentials) ditambahkan di auth.ts.
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const onDashboard = request.nextUrl.pathname.startsWith("/dashboard");
      if (onDashboard) return isLoggedIn; // belum login → redirect ke pages.signIn
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.memberships = user.memberships ?? [];
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.memberships = (token.memberships as MembershipInfo[]) ?? [];
      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
