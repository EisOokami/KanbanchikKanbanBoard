"use server";

import {
    ForgotPassword,
    Login,
    Register,
    ResetPassword,
} from "@/types/services";
import { cookies } from "next/headers";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

const csrfTokenConfig = {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    domain: process.env.HOST ?? "localhost",
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
    | { status: "error" | "message" | "success"; message: string }
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
          accessToken: string;
          refreshToken: string;
          status: "success";
          message: string;
      }
    | {
          status: "success";
          message: string;
          requiresMfa: boolean;
          tempToken: string;
      }
    | { status: "error" | "message" | "success"; message: string }
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
    | { status: "error" | "message" | "success"; message: string }
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
    | { status: "error" | "message" | "success"; message: string }
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
    | { status: "error"; message: string }
    | undefined
> {
    const url = new URL("/auth/google/exchange", baseUrl);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
            headers: { "Content-Type": "application/json" },
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
