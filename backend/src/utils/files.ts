import crypto from "crypto";
import { unlink } from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import type { RowDataPacket } from "mysql2";
import { pool } from "../db/pool.js";

dotenv.config({ quiet: true });

const STORED_NAME = /^[A-Za-z0-9._-]{1,200}$/;
const BUCKET_SECONDS = 6 * 60 * 60;

const sign = (name: string, expires: number) => {
    const secret = process.env.FILE_URL_SECRET || process.env.JWT_ACCESS_SECRET;

    if (!secret) {
        throw new Error("FILE_URL_SECRET or JWT_ACCESS_SECRET must be set");
    }

    return crypto
        .createHmac(
            "sha256",
            crypto
                .createHmac("sha256", secret)
                .update("kanbanchik:file-url:v1")
                .digest(),
        )
        .update(`${name}:${expires}`)
        .digest("hex");
};

export function fileUrl(value: string): string;
export function fileUrl(value: string | null | undefined): string | null;
export function fileUrl(value: string | null | undefined): string | null {
    if (!value) {
        return null;
    }

    if (!value.startsWith("/files/")) {
        return value;
    }

    const name = value.slice("/files/".length);

    if (!STORED_NAME.test(name)) {
        return null;
    }

    const ttlSeconds =
        Math.min(
            7 * 24,
            Math.max(1, Number(process.env.FILE_URL_TTL_HOURS) || 24),
        ) *
        60 *
        60;
    const expires =
        Math.ceil(
            (Math.floor(Date.now() / 1000) + ttlSeconds) / BUCKET_SECONDS,
        ) * BUCKET_SECONDS;

    return `${process.env.BACKEND_URL}/files/${name}?exp=${expires}&sig=${sign(name, expires)}`;
}

export const verifyFileRequest = (
    name: string,
    exp: unknown,
    sig: unknown,
): boolean => {
    if (
        !STORED_NAME.test(name) ||
        typeof exp !== "string" ||
        typeof sig !== "string" ||
        !/^\d{1,12}$/.test(exp) ||
        !/^[a-f0-9]{64}$/.test(sig)
    ) {
        return false;
    }

    const expires = Number(exp);

    if (expires < Math.floor(Date.now() / 1000)) {
        return false;
    }

    const expected = Buffer.from(sign(name, expires), "hex");
    const given = Buffer.from(sig, "hex");

    return (
        expected.length === given.length &&
        crypto.timingSafeEqual(expected, given)
    );
};

export const removeUnusedStoredFiles = async (
    values: (string | null | undefined)[],
) => {
    const fileUrls = [
        ...new Set(
            values.filter(
                (value): value is string =>
                    !!value &&
                    value.startsWith("/files/") &&
                    STORED_NAME.test(value.slice("/files/".length)),
            ),
        ),
    ];

    for (const value of fileUrls) {
        const [stillUsed] = await pool.execute<RowDataPacket[]>(
            `
                SELECT 1 FROM attachments WHERE file_url = ?
                UNION ALL
                SELECT 1 FROM users WHERE avatar_url = ?
                LIMIT 1
            `,
            [value, value],
        );

        if (!stillUsed.length) {
            await unlink(
                path.join(
                    process.cwd(),
                    "uploads",
                    value.slice("/files/".length),
                ),
            ).catch((error: unknown) => {
                if (
                    !(
                        typeof error === "object" &&
                        error !== null &&
                        "code" in error &&
                        error.code === "ENOENT"
                    )
                ) {
                    throw error;
                }
            });
        }
    }
};
