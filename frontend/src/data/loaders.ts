"use server";

import {  Project, } from "@/types/types";

const baseUrl = process.env.NEXT_PUBLIC_DB_URL;

async function fetchData(url: string) {
    // const accessToken = await getAccessToken();

    const headers = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${accessToken}`,
        },
    };

    try {
        // const response = await fetch(url, accessToken ? headers : {});
        const response = await fetch(url, headers);

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
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