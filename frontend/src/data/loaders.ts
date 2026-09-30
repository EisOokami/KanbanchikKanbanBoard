"use server";

import { FilterOptions, Project, Task, UserData } from "@/types/types";
import { getAccessToken, getRefreshToken } from "./getToken";
import { fetchWithRefresh } from "./fetchWithRefresh";

const baseUrl = process.env.API_URL;

async function fetchData(url: string, options?: RequestInit) {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    try {
        const response = await fetchWithRefresh(
            url,
            accessToken,
            refreshToken,
            options,
        );

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

export async function getUserData(): Promise<UserData> {
    const url = new URL("/users/me", baseUrl);

    const fetchedData = await fetchData(url.href, { cache: "no-store" });

    if (fetchedData.status === "error") {
        return {
            status: fetchedData.status,
            message: fetchedData.message,
            data: null,
        };
    }

    return {
        status: fetchedData.status,
        message: fetchedData.message,
        data: {
            id: fetchedData.user.id,
            name: fetchedData.user.name,
            surname: fetchedData.user.surname,
            email: fetchedData.user.email,
            avatar_url: fetchedData.user.avatar_url,
            color: fetchedData.user.color,
            mfa_enabled: fetchedData.user.mfa_enabled,
            auth_provider: fetchedData.user.auth_provider,
        },
    };
}

export async function getProjectsData(): Promise<Project[]> {
    const url = new URL("/projects", baseUrl);

    const fetchedData = await fetchData(url.href);

    if (fetchedData.status === "error" && fetchedData.details) {
        throw new Error(
            JSON.stringify({
                error: fetchedData.details,
                status: fetchedData.status,
                description: fetchedData.message,
            }),
        );
    }

    return fetchedData;
}

export async function getProjectData(slug: string): Promise<Project> {
    const url = new URL(`/projects/${slug}`, baseUrl);

    const fetchedData = await fetchData(url.href);

    if (fetchedData.error) {
        throw new Error(
            JSON.stringify({
                error: fetchedData.error,
                status: fetchedData.status,
                description: fetchedData.message,
            }),
        );
    }

    return fetchedData;
}

export async function getTasksData(): Promise<Task[]> {
    const url = new URL("/tasks", baseUrl);

    const fetchedData = await fetchData(url.href);

    if (fetchedData.status === "error" && fetchedData.details) {
        throw new Error(
            JSON.stringify({
                error: fetchedData.details,
                status: fetchedData.status,
                description: fetchedData.message,
            }),
        );
    }

    return fetchedData;
}

export async function getTaskData(taskId: number | string): Promise<Task> {
    const url = new URL(`/tasks/${taskId}`, baseUrl);

    const fetchedData = await fetchData(url.href);

    if (fetchedData.status === "error" && fetchedData.details) {
        throw new Error(
            JSON.stringify({
                error: fetchedData.details,
                status: fetchedData.status,
                description: fetchedData.message,
            }),
        );
    }

    return fetchedData;
}

export async function getTaskFilterOptionsData(): Promise<FilterOptions> {
    const url = new URL("/tasks/filter-options", baseUrl);

    const fetchedData = await fetchData(url.href);

    if (fetchedData.status === "error" && fetchedData.details) {
        throw new Error(
            JSON.stringify({
                error: fetchedData.details,
                status: fetchedData.status,
                description: fetchedData.message,
            }),
        );
    }

    return fetchedData;
}

export async function getVerifyEmailData(
    token: string,
): Promise<
    | { status: "success"; message: string }
    | { status: "error"; message: string }
> {
    if (!token) {
        return { status: "error", message: "Token missing" };
    }

    const url = new URL(
        `/auth/verify-email?token=${encodeURIComponent(token)}`,
        baseUrl,
    );

    const fetchedData = await fetchData(url.href, { cache: "no-store" });

    if (fetchedData.status === "error") {
        return {
            status: "error",
            message:
                fetchedData.message || "Unable to verify the email address",
        };
    }

    return fetchedData;
}

export async function exportProjectDataAction(
    id: number,
): Promise<
    | { status: "success"; message: string; data: string }
    | { status: "error"; message: string }
> {
    const url = new URL(`/projects/${id}/export`, baseUrl);

    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    try {
        const response = await fetchWithRefresh(url, accessToken, refreshToken);

        if (!response.ok) {
            return {
                status: "error",
                message: "Failed to export project data",
            };
        }

        return {
            status: "success",
            message: "Project data have been successfully exported",
            data: await response.text(),
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}
