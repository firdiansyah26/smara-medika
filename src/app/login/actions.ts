"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

/** Server action login. Mengembalikan kode error "invalid" jika gagal. */
export async function authenticate(
  _prev: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) return "invalid";
    throw error; // termasuk redirect (NEXT_REDIRECT) — biarkan dilempar
  }
}
