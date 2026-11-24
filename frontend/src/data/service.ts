"use server";

import {
    ForgotPassword,
    Login,
    Register,
    ResetPassword,
} from "@/types/services";
import { cookies, headers } from "next/headers";
import { forwardedClientIp } from "./clientIp";

const baseUrl = process.env.API_URL ?? "http://localhost:3001";

const csrfTokenConfig = {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
};

function parseAuthCookies(setCookieHeaders: string[]) {
    const find = (name: string) => {
        const header = setCookieHeaders.find((cookieHeader) =>
            cookieHeader.startsWith(`${name}=`),
        );

        if (!header) {
            return "";
        }

        return header.split(";")[0].split("=")[1];
    };

    return {
        csrfToken: find("csrfToken"),
    };
}

export async function registerService(userData: Register): Promise<
    | {
          accessToken: string;
          refreshToken: string;
          status: "success";
          message: string;
      }
    | { status: "error" | "success"; message: string }
    | {
          error: string;
          details: {
              field: string;
              message: string;
          }[];
      }
    | undefined
> {
    const url = new URL("/auth/register", baseUrl);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": (await headers()).get("user-agent") ?? "",
                ...forwardedClientIp(await headers()),
            },
            body: JSON.stringify({ ...userData }),
            credentials: "include",
            cache: "no-cache",
        });

        const setCookieHeaders = response.headers.getSetCookie();
        const { csrfToken } = parseAuthCookies(setCookieHeaders);

        const cookieStore = await cookies();
        cookieStore.set("csrfToken", csrfToken, csrfTokenConfig);

        return response.json();
    } catch (error) {
        console.error("Registration Service Error:", error);
    }
}

export async function loginService(userData: Login): Promise<
    | {
          status: "success";
          message: string;
          accessToken: string;
          refreshToken: string;
      }
    | {
          status: "success";
          message: string;
          requiresMfa: boolean;
          tempToken: string;
      }
    | {
          status: "success";
          message: string;
          requiresEmailCode: boolean;
          tempToken: string;
      }
    | { status: "error" | "success"; message: string }
    | {
          error: string;
          details: {
              field: string;
              message: string;
          }[];
      }
    | undefined
> {
    const url = new URL("/auth/login", baseUrl);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": (await headers()).get("user-agent") ?? "",
                ...forwardedClientIp(await headers()),
            },
            body: JSON.stringify({ ...userData }),
            credentials: "include",
            cache: "no-cache",
        });

        const setCookieHeaders = response.headers.getSetCookie();
        const { csrfToken } = parseAuthCookies(setCookieHeaders);

        const cookieStore = await cookies();
        cookieStore.set("csrfToken", csrfToken, csrfTokenConfig);

        return response.json();
    } catch (error) {
        console.error("Login Service Error:", error);
        throw error;
    }
}

export async function forgotPasswordService(userData: ForgotPassword): Promise<
    | { status: "error" | "success"; message: string }
    | {
          error: string;
          details: {
              field: string;
              message: string;
          }[];
      }
    | undefined
> {
    const url = new URL("/auth/forgot-password", baseUrl);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": (await headers()).get("user-agent") ?? "",
                ...forwardedClientIp(await headers()),
            },
            body: JSON.stringify({ ...userData }),
            cache: "no-cache",
        });

        return response.json();
    } catch (error) {
        console.error("Forgot Password Service Error:", error);
        throw error;
    }
}

export async function resetPasswordService(userData: ResetPassword): Promise<
    | {
          accessToken: string;
          refreshToken: string;
          status: "success";
          message: string;
      }
    | { status: "error" | "success"; message: string }
    | {
          error: string;
          details: {
              field: string;
              message: string;
          }[];
      }
    | undefined
> {
    const url = new URL("/auth/reset-password", baseUrl);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": (await headers()).get("user-agent") ?? "",
                ...forwardedClientIp(await headers()),
            },
            body: JSON.stringify({ ...userData }),
            cache: "no-cache",
        });

        return response.json();
    } catch (error) {
        console.error("Login Service Error:", error);
        throw error;
    }
}

export async function googleExchangeService(code: string): Promise<
    | {
          accessToken: string;
          refreshToken: string;
          status: "success";
          message: string;
      }
    | {
          status: "success";
          message: string;
          requiresMfa: true;
          tempToken: string;
      }
    | { status: "error"; message: string }
    | undefined
> {
    const url = new URL("/auth/google/exchange", baseUrl);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": (await headers()).get("user-agent") ?? "",
                ...forwardedClientIp(await headers()),
            },
            body: JSON.stringify({ code }),
            credentials: "include",
            cache: "no-cache",
        });

        const setCookieHeaders = response.headers.getSetCookie();
        const { csrfToken } = parseAuthCookies(setCookieHeaders);

        if (csrfToken) {
            const cookieStore = await cookies();
            cookieStore.set("csrfToken", csrfToken, csrfTokenConfig);
        }

        return response.json();
    } catch (error) {
        console.error("Google Exchange Service Error:", error);
        throw error;
    }
}

export async function mfaVerifyService(data: {
    tempToken: string;
    token: string;
}) {
    const url = new URL("/auth/mfa/verify", baseUrl);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...forwardedClientIp(await headers()),
            },
            body: JSON.stringify(data),
            credentials: "include",
            cache: "no-cache",
        });

        const setCookieHeaders = response.headers.getSetCookie();
        const { csrfToken } = parseAuthCookies(setCookieHeaders);

        const cookieStore = await cookies();
        cookieStore.set("csrfToken", csrfToken, csrfTokenConfig);

        return response.json();
    } catch (error) {
        console.error("MFA Verify Service Error:", error);
        throw error;
    }
}

export async function resendVerificationService(email: string): Promise<
    | { status: "error" | "success"; message: string }
    | {
          error: string;
          details: {
              field: string;
              message: string;
          }[];
      }
    | undefined
> {
    const url = new URL("/auth/resend-verification", baseUrl);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": (await headers()).get("user-agent") ?? "",
                ...forwardedClientIp(await headers()),
            },
            body: JSON.stringify({ email }),
            cache: "no-cache",
        });

        return response.json();
    } catch (error) {
        console.error("Resend Verification Service Error:", error);
        throw error;
    }
}

export async function emailCodeResendService(tempToken: string): Promise<
    | {
          status: "error";
          message: string;
          data?: {
              attemptsLeft?: number;
              requiresRelogin?: boolean;
              retryAfter?: number;
          };
      }
    | { status: "success"; message: string }
    | {
          error: string;
          details: {
              field: string;
              message: string;
          }[];
      }
    | undefined
> {
    const url = new URL("/auth/login/email-code/resend", baseUrl);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": (await headers()).get("user-agent") ?? "",
                ...forwardedClientIp(await headers()),
            },
            body: JSON.stringify({ tempToken }),
            cache: "no-cache",
        });

        return response.json();
    } catch (error) {
        console.error("Email Code Resend Service Error:", error);
        throw error;
    }
}

export async function emailCodeVerifyService(
    tempToken: string,
    code: string,
): Promise<
    | {
          status: "error";
          message: string;
          data?: {
              attemptsLeft?: number;
              requiresRelogin?: boolean;
              retryAfter?: number;
          };
      }
    | {
          status: "success";
          message: string;
          accessToken: string;
          refreshToken: string;
      }
    | {
          error: string;
          details: {
              field: string;
              message: string;
          }[];
      }
    | undefined
> {
    const url = new URL("/auth/login/email-code/verify", baseUrl);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": (await headers()).get("user-agent") ?? "",
                ...forwardedClientIp(await headers()),
            },
            body: JSON.stringify({ tempToken, code }),
            cache: "no-cache",
        });

        return response.json();
    } catch (error) {
        console.error("Email Code Verify Service Error:", error);
        throw error;
    }
}
