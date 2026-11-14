import type { Request } from "express";
import { ipKeyGenerator } from "express-rate-limit";
import { jwtVerify } from "jose";
import dotenv from "dotenv";
import { JOSEError } from "jose/errors";

dotenv.config({ quiet: true });

const accessSecret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);

export const userOrIpKey = async (req: Request): Promise<string> => {
    const authHeader = req.headers.authorization;
    const accessToken =
        typeof authHeader === "string" && authHeader.startsWith("Bearer ")
            ? authHeader.slice("Bearer ".length)
            : undefined;

    if (accessToken) {
        try {
            const { payload } = await jwtVerify(accessToken, accessSecret, {
                algorithms: ["HS256"],
            });

            if (
                typeof payload.id === "number" &&
                Number.isSafeInteger(payload.id)
            ) {
                return `user:${payload.id}`;
            }
        } catch (error) {
            if (!(error instanceof JOSEError)) {
                throw error;
            }
        }
    }

    const refreshToken = req.headers.cookie
        ?.split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith("refreshToken="))
        ?.slice("refreshToken".length + 1);

    if (refreshToken) {
        try {
            const { payload } = await jwtVerify(refreshToken, refreshSecret, {
                algorithms: ["HS256"],
            });

            if (payload.sub) {
                return `user:${payload.sub}`;
            }
        } catch (error) {
            if (!(error instanceof JOSEError)) {
                throw error;
            }
        }
    }

    return ipKeyGenerator(req.ip ?? "");
};

export const ipAndEmailKey = (req: Request): string => {
    const body: unknown = req.body;
    const email =
        body &&
        typeof body === "object" &&
        "email" in body &&
        typeof body.email === "string"
            ? body.email.trim().toLowerCase()
            : "";

    return `${ipKeyGenerator(req.ip ?? "")}|email:${email}`;
};
