import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

export const generateEmailCode = (): string =>
    crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");

export const hashEmailCode = (userId: number | string, code: string): string =>
    crypto
        .createHmac("sha256", process.env.LOGIN_CODE_SECRET!)
        .update(`${userId}:${code}`)
        .digest("hex");

export const safeEqualHex = (a: string, b: string): boolean => {
    const bufA = Buffer.from(a, "hex");
    const bufB = Buffer.from(b, "hex");

    return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};
