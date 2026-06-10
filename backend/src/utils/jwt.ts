import { SignJWT, jwtVerify } from "jose";
import type { JWTPayload } from "jose";
import dotenv from "dotenv";
import crypto from "crypto";
import { pool } from "../db/pool";
import type { ResultSetHeader } from "mysql2";

dotenv.config();

const accessSecret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);

const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);

export async function createAccessToken(payload: JWTPayload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("15m")
        .sign(accessSecret);
}

export async function createRefreshToken(
    userId: string,
): Promise<string | null> {
    const jti = crypto.randomUUID();

    const token = await new SignJWT({ sub: userId })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .setJti(jti)
        .sign(refreshSecret);

    const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO refresh_tokens (id, user_id, token)
     VALUES (?, ?, ?)`,
        [jti, userId, token],
    );

    if (result.affectedRows === 0) {
        return null;
    }

    return token;
}

export async function revokeAllUserTokens(userId: string | number) {
    await pool.execute<ResultSetHeader>(
        `UPDATE refresh_tokens SET revoked = true WHERE user_id = ?`,
        [userId],
    );
}

export async function verifyAccessToken(token: string | Uint8Array) {
    return (await jwtVerify(token, accessSecret)).payload;
}

export async function verifyRefreshToken(token: string | Uint8Array) {
    return (await jwtVerify(token, refreshSecret)).payload;
}
