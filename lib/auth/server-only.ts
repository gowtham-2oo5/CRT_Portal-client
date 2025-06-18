"use server";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import type { TokenClaims, User } from "./types";

export async function getServerAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("auth-token")?.value || null;
}

export async function getServerRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("refresh-token")?.value || null;
}

export async function setServerAuthCookies(
  token: string,
  refreshToken: string
): Promise<void> {
  const cookieStore = await cookies();

  // Set access token (shorter expiry)
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60, // 15 minutes
    path: "/",
  });

  // Set refresh token (longer expiry)
  cookieStore.set("refresh-token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
}

export async function clearServerAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
  cookieStore.delete("refresh-token");
}

export async function getServerUser(): Promise<User | null> {
  try {
    const token = await getServerAuthToken();
    if (!token) return null;

    const decoded = jwtDecode<TokenClaims>(token);
    const { name, email, userId, sub, role, isFirstLogin } = decoded;

    return { name, email, userId, sub, role, isFirstLogin };
  } catch (error) {
    console.error("Failed to decode token", error);
    return null;
  }
}
