import type { Role, TenantType } from "@prisma/client";

/** Info keanggotaan tenant yang dibawa di sesi/JWT. */
export type MembershipInfo = {
  tenantId: string;
  tenantName: string;
  tenantType: TenantType;
  role: Role;
};
