"use server";

import { getAccessToken, getRefreshToken } from "./getToken";
import { fetchWithRefresh } from "./fetchWithRefresh";

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

    if (!accessToken || !refreshToken) throw new Error("No auth token found");

    const url = new URL(path, baseUrl);

    try {
        const response = await fetchWithRefresh(
            url,
            accessToken,
            refreshToken,
            {
                method,
                ...(payload && { body: JSON.stringify({ ...payload }) }),
            },
        );

        const data = await response.json();
        return data;
    } catch (error) {
        console.log("error", error);
        throw error;
    }
}
