import "server-only";

import { getAccessToken, getRefreshToken } from "./getToken";
import { fetchWithRefresh } from "./fetchWithRefresh";

const baseUrl = process.env.API_URL ?? "http://localhost:3001";

export async function mutateData(
    method: string,
    path: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any,
    isImage?: boolean,
    extraHeaders?: Record<string, string>,
): Promise<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | { status: "error" | "success"; message: string; data?: any }
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
                ...(payload && {
                    body: isImage ? payload : JSON.stringify({ ...payload }),
                }),
                ...(extraHeaders && { headers: extraHeaders }),
            },
            isImage,
        );

        const data = await response.json();

        return data;
    } catch (error) {
        console.log("error", error);
        throw error;
    }
}
