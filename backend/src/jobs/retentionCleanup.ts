import type { ResultSetHeader } from "mysql2";
import { pool } from "../db/pool.js";
import { logger } from "../utils/logger.js";

const rules: readonly { name: string; sql: string }[] = [
    {
        name: "project_invites",
        sql: `DELETE FROM project_invites WHERE expires_at < NOW() - INTERVAL 30 DAY`,
    },
    {
        name: "user_sessions",
        sql: `
            DELETE FROM user_sessions
            WHERE expires_at < NOW() - INTERVAL 30 DAY
               OR (replaced_at IS NOT NULL AND replaced_at < NOW() - INTERVAL 30 DAY)
               OR (revoked = 1 AND last_used_at < NOW() - INTERVAL 30 DAY)
        `,
    },
    {
        name: "login_email_codes",
        sql: `DELETE FROM login_email_codes WHERE expires_at < NOW() - INTERVAL 24 HOUR`,
    },
    {
        name: "mfa_login_sessions",
        sql: `DELETE FROM mfa_login_sessions WHERE expires_at < NOW() - INTERVAL 24 HOUR`,
    },
    {
        name: "oauth_exchange_codes",
        sql: `DELETE FROM oauth_exchange_codes WHERE expires_at < NOW() - INTERVAL 24 HOUR`,
    },
    {
        name: "account_deletion_sessions",
        sql: `DELETE FROM account_deletion_sessions WHERE expires_at < NOW() - INTERVAL 24 HOUR`,
    },
    {
        name: "ownership_transfer_sessions",
        sql: `DELETE FROM ownership_transfer_sessions WHERE expires_at < NOW() - INTERVAL 24 HOUR`,
    },
    {
        name: "users.reset_token",
        sql: `
            UPDATE users
            SET reset_token = NULL,
                reset_token_expires_at = NULL
            WHERE reset_token_expires_at < NOW()
        `,
    },
    {
        name: "users.pending_email",
        sql: `
            UPDATE users
            SET pending_email = NULL,
                email_change_token_hash = NULL,
                email_change_expires_at = NULL
            WHERE email_change_expires_at < NOW()
        `,
    },
    {
        name: "users.unverified",
        sql: `
            DELETE FROM users
            WHERE is_verified = 0
              AND google_id IS NULL
              AND verification_token_expires < NOW() - INTERVAL 7 DAY
              AND NOT EXISTS (
                  SELECT 1 FROM project_members WHERE project_members.user_id = users.id
              )
        `,
    },
];

export const runRetentionCleanup = async () => {
    const removed: Record<string, number> = {};

    for (const rule of rules) {
        try {
            const [result] = await pool.execute<ResultSetHeader>(rule.sql);

            if (result.affectedRows) {
                removed[rule.name] = result.affectedRows;
            }
        } catch (error) {
            logger.error(
                {
                    err: error,
                    event: "retention.cleanup_failed",
                    rule: rule.name,
                },
                "Retention cleanup rule failed",
            );
        }
    }

    if (Object.keys(removed).length) {
        logger.info(
            { event: "retention.cleanup_completed", removed },
            "Retention cleanup completed",
        );
    }
};

export const startRetentionCleanup = () => {
    if (process.env.RETENTION_CLEANUP === "false") {
        logger.warn(
            { event: "retention.cleanup_disabled" },
            "Retention cleanup is disabled",
        );

        return;
    }

    void runRetentionCleanup();
    setInterval(() => void runRetentionCleanup(), 60 * 60 * 1000).unref();
};
