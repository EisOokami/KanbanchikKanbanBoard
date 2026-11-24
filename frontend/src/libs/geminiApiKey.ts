import { z } from "zod";

export const geminiApiKeySchema = z
    .string()
    .trim()
    .regex(
        /^[A-Za-z0-9._-]{20,200}$/,
        "This does not look like a Google Gemini API key",
    );

export function readGeminiApiKey(): string | null {
    try {
        const value = window.localStorage.getItem("kanbanchik:gemini-api-key");

        return value && geminiApiKeySchema.safeParse(value).success
            ? value
            : null;
    } catch {
        return null;
    }
}

export function saveGeminiApiKey(value: string): boolean {
    try {
        window.localStorage.setItem("kanbanchik:gemini-api-key", value);
        window.dispatchEvent(new Event("kanbanchik:gemini-api-key-changed"));

        return true;
    } catch {
        return false;
    }
}

export function removeGeminiApiKey(): void {
    try {
        window.localStorage.removeItem("kanbanchik:gemini-api-key");
        window.dispatchEvent(new Event("kanbanchik:gemini-api-key-changed"));
    } catch (error) {
        console.warn(
            "Failed to remove Gemini API key from localStorage:",
            error,
        );
    }
}
