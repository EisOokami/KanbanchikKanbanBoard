"use server";

import { getAccessToken, getRefreshToken } from "./getToken";

const baseUrl = process.env.NEXT_PUBLIC_DB_URL;

export async function mutateData(
    method: string,
    path: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any,
): Promise<
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
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    if (!accessToken) throw new Error("No auth token found");
    if (!refreshToken) throw new Error("No auth token found");

    const url = new URL(path, baseUrl);

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
                Cookie: `refreshToken=${refreshToken}`,
            },
            body: JSON.stringify({ ...payload }),
        });

        if (method === "DELETE") {
            return {
                status: response.ok ? "success" : "error",
                message: response.ok ? "Success" : "Error",
            };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.log("error", error);
        throw error;
    }
}
