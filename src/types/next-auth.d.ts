import type { DefaultSession } from "next-auth";
import type { MembershipInfo } from "@/lib/auth-types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      memberships: MembershipInfo[];
    } & DefaultSession["user"];
  }

  interface User {
    memberships?: MembershipInfo[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    memberships: MembershipInfo[];
  }
}
