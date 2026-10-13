import { SignJWT, jwtVerify, errors as joseErrors } from "jose";
import type { JWTPayload } from "jose";
import dotenv from "dotenv";
import crypto from "crypto";
import { pool } from "../db/pool.js";
import type { PoolConnection } from "mysql2/promise";
import bcrypt from "bcryptjs";
import type { RefreshSession } from "../types/types.js";
import { getActiveSession, withSessionLock } from "./session.js";

dotenv.config({ quiet: true });

const accessSecret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);

const hashRefreshToken = (token: string) =>
    crypto.createHash("sha256").update(token).digest("hex");

export async function createAccessToken(
    payload: JWTPayload,
    refreshToken: string,
) {
    const { payload: refresh } = await jwtVerify(refreshToken, refreshSecret);

    if (String(payload.id) !== refresh.sub || typeof refresh.sid !== "string") {
        throw new joseErrors.JWTInvalid("Invalid session");
    }

    return new SignJWT({ ...payload, sid: refresh.sid })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("15m")
        .sign(accessSecret);
}

function signRefreshToken(userId: number, sid: string, issuedAt: number) {
    return new SignJWT({ sub: String(userId), sid })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt(issuedAt)
        .setExpirationTime(issuedAt + 7 * 24 * 60 * 60)
        .sign(refreshSecret);
}

async function createSessionRecord(
    connection: PoolConnection,
    userId: number,
    ip?: string,
    userAgent?: string,
    createdAt?: string | Date,
) {
    const sid = crypto.randomUUID();
    const issuedAt = Math.floor(Date.now() / 1000);
    const token = await signRefreshToken(userId, sid, issuedAt);

    await connection.execute(
        `
            INSERT INTO user_sessions
            (
                id,
                user_id,
                refresh_token_hash,
                ip,
                user_agent,
                created_at,
                expires_at
            )
            VALUES
            (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            sid,
            userId,
            `sha256:${hashRefreshToken(token)}`,
            ip ?? null,
            userAgent ?? null,
            createdAt ?? new Date(issuedAt * 1000),
            new Date((issuedAt + 7 * 24 * 60 * 60) * 1000),
        ],
    );

    return { token, sid };
}

export async function createRefreshToken(
    userId: number,
    ip?: string,
    userAgent?: string,
): Promise<string> {
    return withSessionLock(
        userId,
        async (connection) =>
            (await createSessionRecord(connection, userId, ip, userAgent))
                .token,
    );
}

export async function verifyAccessToken(
    token: string,
    legacyRefreshToken?: string,
) {
    const { payload } = await jwtVerify(token, accessSecret);

    if (typeof payload.id !== "number" || !Number.isSafeInteger(payload.id)) {
        throw new joseErrors.JWTInvalid("Missing session identity");
    }

    let sid = payload.sid;

    if (sid === undefined && legacyRefreshToken) {
        const refresh = await validateRefreshSession(legacyRefreshToken, pool);

        if (refresh.session.user_id !== payload.id) {
            throw new joseErrors.JWTInvalid("Invalid session");
        }

        sid = refresh.session.id;
    }

    if (typeof sid !== "string") {
        throw new joseErrors.JWTInvalid("Missing session identity");
    }

    const session = await getActiveSession(pool, payload.id, sid);

    await pool.execute(
        `
                UPDATE user_sessions
                SET last_used_at = NOW()
                WHERE id = ?
                    AND user_id = ?
                    AND revoked = 0
                    AND expires_at > NOW()
                    AND last_used_at < DATE_SUB(NOW(),
                    INTERVAL 1 MINUTE)
            `,
        [session.id, payload.id],
    );

    return { payload: { ...payload, id: payload.id, sid: session.id } };
}

async function validateRefreshSession(
    token: string,
    connection: Pick<PoolConnection, "execute">,
) {
    const { payload } = await jwtVerify(token, refreshSecret);

    if (
        typeof payload.sid !== "string" ||
        !payload.sub ||
        !Number.isSafeInteger(+payload.sub)
    ) {
        throw new joseErrors.JWTInvalid("Missing session identity");
    }

    const [rows] = await connection.execute<RefreshSession[]>(
        `
                SELECT *
                FROM user_sessions
                WHERE id = ?
                    AND user_id = ?
                    AND expires_at > NOW()
            `,
        [payload.sid, +payload.sub],
    );

    const session = rows[0];

    if (!session) {
        throw new joseErrors.JWTInvalid("Session not found");
    }

    const hash = session.refresh_token_hash;
    const valid = hash.startsWith("sha256:")
        ? hash.length === 71 &&
          crypto.timingSafeEqual(
              Buffer.from(hashRefreshToken(token)),
              Buffer.from(hash.slice(7)),
          )
        : await bcrypt.compare(token, hash);

    if (!valid) {
        throw new joseErrors.JWTInvalid("Invalid refresh token");
    }

    if (session.revoked) {
        const elapsed = session.replaced_at
            ? Date.now() - new Date(session.replaced_at).getTime()
            : Infinity;

        if (!session.replaced_by || elapsed < 0 || elapsed >= 10000) {
            throw new joseErrors.JWTInvalid("Session not found");
        }

        await getActiveSession(connection, +payload.sub, session.id);
    }

    return { payload, session };
}

export async function verifyRefreshToken(token: string) {
    return validateRefreshSession(token, pool);
}

export async function rotateRefreshToken(
    token: string,
    ip?: string,
    userAgent?: string,
) {
    const { payload } = await jwtVerify(token, refreshSecret);

    if (!payload.sub || !Number.isSafeInteger(+payload.sub)) {
        throw new joseErrors.JWTInvalid("Missing user id");
    }

    const userId = +payload.sub;

    return withSessionLock(userId, async (connection) => {
        const { session } = await validateRefreshSession(token, connection);

        if (session.revoked) {
            const replacement = await getActiveSession(
                connection,
                userId,
                session.id,
            );

            const replacementToken = await signRefreshToken(
                replacement.user_id,
                replacement.id,
                Math.floor(new Date(replacement.expires_at).getTime() / 1000) -
                    7 * 24 * 60 * 60,
            );

            if (
                replacement.refresh_token_hash !==
                `sha256:${hashRefreshToken(replacementToken)}`
            ) {
                throw new joseErrors.JWTInvalid("Session not found");
            }

            return replacementToken;
        }

        const replacement = await createSessionRecord(
            connection,
            session.user_id,
            ip ?? session.ip ?? undefined,
            userAgent ?? session.user_agent ?? undefined,
            session.created_at,
        );

        await connection.execute(
            `
                UPDATE user_sessions
                SET revoked = 1,
                    replaced_by = ?,
                    replaced_at = NOW(),
                    last_used_at = NOW()
                WHERE id = ?
                    AND user_id = ?
            `,
            [replacement.sid, session.id, session.user_id],
        );

        return replacement.token;
    });
}

export async function revokeSession(sessionId: string) {
    const [rows] = await pool.execute<RefreshSession[]>(
        `
                SELECT user_id
                FROM user_sessions
                WHERE id = ?
            `,
        [sessionId],
    );

    if (!rows[0]) {
        return;
    }

    const userId = rows[0].user_id;

    await withSessionLock(userId, async (connection) => {
        try {
            const session = await getActiveSession(
                connection,
                userId,
                sessionId,
            );

            await connection.execute(
                `
                UPDATE user_sessions
                SET revoked = 1,
                    replaced_by = NULL,
                    replaced_at = NULL
                WHERE id = ?
                    AND user_id = ?
            `,
                [session.id, userId],
            );
        } catch (error) {
            if (!(error instanceof joseErrors.JOSEError)) {
                throw error;
            }
        }
    });
}

export async function revokeAllUserSessions(userId: number) {
    await withSessionLock(userId, async (connection) => {
        await connection.execute(
            `
                UPDATE user_sessions
                SET revoked = 1,
                    replaced_by = NULL,
                    replaced_at = NULL
                WHERE user_id = ?
            `,
            [userId],
        );
    });
}
