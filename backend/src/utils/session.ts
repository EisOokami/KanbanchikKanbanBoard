import type {
    PoolConnection,
    ResultSetHeader,
    RowDataPacket,
} from "mysql2/promise";
import { pool } from "../db/pool.js";
import { errors as joseErrors } from "jose";
import type { RefreshSession } from "../types/types.js";
import { UAParser } from "ua-parser-js";

export class SessionError extends Error {
    constructor(
        public status: number,
        message: string,
    ) {
        super(message);
    }
}

export async function withSessionLock<T>(
    userId: number,
    work: (connection: PoolConnection) => Promise<T>,
): Promise<T> {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [owners] = await connection.execute<RowDataPacket[]>(
            `
                SELECT id
                FROM users
                WHERE id = ? FOR UPDATE
            `,
            [userId],
        );

        if (!owners.length) {
            throw new joseErrors.JWTInvalid("Session not found");
        }

        const result = await work(connection);

        await connection.commit();

        return result;
    } catch (error) {
        await connection.rollback();

        throw error;
    } finally {
        connection.release();
    }
}

export async function getActiveSession(
    connection: Pick<PoolConnection, "execute">,
    userId: number,
    sid: string,
): Promise<RefreshSession> {
    const visited = new Set<string>();

    while (!visited.has(sid)) {
        visited.add(sid);

        const [rows] = await connection.execute<RefreshSession[]>(
            `
                SELECT *
                FROM user_sessions
                WHERE id = ?
                    AND user_id = ?
            `,
            [sid, userId],
        );

        const row = rows[0];

        if (!row) {
            break;
        }

        if (row.revoked && row.replaced_by && row.replaced_at) {
            sid = row.replaced_by;

            continue;
        }

        if (
            !row.revoked &&
            !row.replaced_by &&
            new Date(row.expires_at).getTime() > Date.now()
        ) {
            return row;
        }

        break;
    }

    throw new joseErrors.JWTInvalid("Session not found");
}

export function sessionResponse(row: RefreshSession, currentId: string) {
    const parser = new UAParser(row.user_agent ?? "");
    const device = parser.getDevice();
    const browser = parser.getBrowser();
    const os = parser.getOS();

    return {
        id: row.id,
        ip: row.ip,
        device: {
            type: device.type ?? null,
            vendor: device.vendor ?? null,
            model: device.model ?? null,
        },
        browser: {
            name: browser.name ?? null,
            version: browser.version ?? null,
        },
        os: { name: os.name ?? null, version: os.version ?? null },
        createdAt: new Date(row.created_at).toISOString(),
        lastUsedAt: new Date(row.last_used_at).toISOString(),
        expiresAt: new Date(row.expires_at).toISOString(),
        isCurrent: row.id === currentId,
    };
}

export async function revokeOtherSessions(
    userId: number,
    sid: string,
    targetId?: string,
) {
    return withSessionLock(userId, async (connection) => {
        const current = await getActiveSession(connection, userId, sid);

        if (targetId) {
            let target: RefreshSession;

            try {
                target = await getActiveSession(connection, userId, targetId);
            } catch (error) {
                if (!(error instanceof joseErrors.JOSEError)) {
                    throw error;
                }

                throw new SessionError(
                    404,
                    "Session not found or already revoked",
                );
            }

            if (target.id === current.id) {
                throw new SessionError(
                    409,
                    "Use Sign out to end your current session",
                );
            }

            await connection.execute(
                `
                UPDATE user_sessions
                SET revoked = 1,
                    replaced_by = NULL,
                    replaced_at = NULL
                WHERE id = ?
                    AND user_id = ?
            `,
                [target.id, userId],
            );

            return {
                revokedCount: 1,
                currentSessionId: current.id,
                sessionId: target.id,
            };
        }

        const [result] = await connection.execute<ResultSetHeader>(
            `
                UPDATE user_sessions
                SET revoked = 1,
                    replaced_by = NULL,
                    replaced_at = NULL
                WHERE user_id = ?
                    AND id != ?
                    AND revoked = 0
                    AND expires_at > NOW()
            `,
            [userId, current.id],
        );

        return {
            revokedCount: result.affectedRows,
            currentSessionId: current.id,
        };
    });
}

export async function listSessions(userId: number, sid: string) {
    return withSessionLock(userId, async (connection) => {
        const current = await getActiveSession(connection, userId, sid);

        const [rows] = await connection.execute<RefreshSession[]>(
            `
                SELECT id,
                    ip,
                    user_agent,
                    created_at,
                    last_used_at,
                    expires_at
                FROM user_sessions
                WHERE user_id = ?
                    AND revoked = 0
                    AND replaced_by IS NULL
                    AND expires_at > NOW()
                ORDER BY (id = ?) DESC,
                    last_used_at DESC
            `,
            [userId, current.id],
        );

        return rows.map((row) => sessionResponse(row, current.id));
    });
}
