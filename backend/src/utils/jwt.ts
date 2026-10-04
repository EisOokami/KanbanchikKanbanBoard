import { SignJWT, jwtVerify, errors as joseErrors } from "jose";
import type { JWTPayload } from "jose";
import dotenv from "dotenv";
import crypto from "crypto";
import { pool } from "../db/pool.js";
import type { ResultSetHeader } from "mysql2";
import bcrypt from "bcryptjs";
import type { RefreshSession } from "../types/types.js";

dotenv.config({ quiet: true });

const accessSecret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);
const ROTATION_GRACE_PERIOD_MS = 10_000;

export async function createAccessToken(payload: JWTPayload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("15m")
        .sign(accessSecret);
}

export async function createRefreshToken(
    userId: number,
    ip?: string,
    userAgent?: string,
): Promise<string | null> {
    const sessionId = crypto.randomUUID();

    const token = await new SignJWT({ sub: String(userId), sid: sessionId })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(refreshSecret);

    const hash = await bcrypt.hash(token, 10);

    const [result] = await pool.execute<ResultSetHeader>(
        `
            INSERT INTO user_sessions
            (
                id,
                user_id,
                refresh_token_hash,
                ip,
                user_agent,
                expires_at
            )
            VALUES
            (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))
        `,
        [sessionId, userId, hash, ip ?? null, userAgent ?? null],
    );

    if (result.affectedRows === 0) {
        return null;
    }

    return token;
}

export async function verifyAccessToken(token: string) {
    const { payload } = await jwtVerify(token, accessSecret);

    return {
        payload,
    };
}

export async function verifyRefreshToken(token: string) {
    const { payload } = await jwtVerify(token, refreshSecret);

    const sid = payload.sid;

    if (!sid || typeof sid !== "string") {
        throw new joseErrors.JWTInvalid("Missing sid");
    }

    const [rows] = await pool.execute<RefreshSession[]>(
        `
            SELECT *
            FROM user_sessions
            WHERE 
                id = ?
                AND expires_at > NOW()
                `,
        [sid],
    );

    if (!rows.length || !rows[0]) {
        throw new joseErrors.JWTInvalid("Session not found");
    }

    const session = rows[0];

    const valid = await bcrypt.compare(token, session.refresh_token_hash);

    if (!valid) {
        throw new joseErrors.JWTInvalid("Invalid refresh token");
    }

    if (!session.revoked) {
        return { payload, session };
    }

    const replacedAt = session.replaced_at
        ? new Date(session.replaced_at).getTime()
        : null;

    const withinGracePeriod =
        session.replaced_by &&
        replacedAt !== null &&
        Date.now() - replacedAt < ROTATION_GRACE_PERIOD_MS;

    if (!withinGracePeriod) {
        throw new joseErrors.JWTInvalid("Session not found");
    }

    return {
        payload,
        session,
    };
}

export async function rotateRefreshToken(
    token: string,
    ip?: string,
    userAgent?: string,
) {
    const { payload, session } = await verifyRefreshToken(token);

    if (!payload.sub) {
        throw new joseErrors.JWTInvalid("Missing user id");
    }

    if (session.revoked && session.replaced_by) {
        const [rows] = await pool.execute<RefreshSession[]>(
            `
                SELECT *
                FROM user_sessions
                WHERE
                    id = ?
                    AND revoked = FALSE
                    AND expires_at > NOW()
            `,
            [session.replaced_by],
        );

        const replacementSession = rows[0];

        if (replacementSession) {
            return await new SignJWT({
                sub: String(payload.sub),
                sid: replacementSession.id,
            })
                .setProtectedHeader({ alg: "HS256" })
                .setIssuedAt()
                .setExpirationTime("7d")
                .sign(refreshSecret);
        }

        throw new joseErrors.JWTInvalid("Session not found");
    }

    const newToken = await createRefreshToken(+payload.sub, ip, userAgent);

    if (!newToken) {
        throw new Error("Failed to create new session");
    }

    const { payload: newPayload } = await jwtVerify(newToken, refreshSecret);

    await pool.execute(
        `
            UPDATE user_sessions
            SET revoked = TRUE, replaced_by = ?, replaced_at = NOW()
            WHERE id = ?
        `,
        [String(newPayload.sid), session.id],
    );

    return newToken;
}

export async function revokeSession(sessionId: string) {
    await pool.execute(
        `
            UPDATE user_sessions
            SET revoked = TRUE
            WHERE id = ?
        `,
        [sessionId],
    );
}

export async function revokeAllUserSessions(userId: number) {
    await pool.execute(
        `
            UPDATE user_sessions
            SET revoked = TRUE
            WHERE user_id = ?
        `,
        [userId],
    );
}
