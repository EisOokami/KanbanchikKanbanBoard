"use server";

import {
    ForgotPassword,
    Login,
    Register,
    ResetPassword,
} from "@/types/services";

const baseUrl = process.env.NEXT_PUBLIC_DB_URL;

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
            cache: "no-cache",
        });

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
