import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
import type { GoogleProfile, User } from "../types/types.js";
import { pool } from "../db/pool.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { legalVersions } from "./legal.js";

dotenv.config({ quiet: true });

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
);

export function getGoogleAuthUrl(state: string): string {
    return client.generateAuthUrl({
        access_type: "online",
        scope: ["openid", "email", "profile"],
        state,
        prompt: "select_account",
    });
}

export async function exchangeCodeForProfile(
    code: string,
): Promise<GoogleProfile> {
    const { tokens } = await client.getToken(code);

    if (!tokens.id_token) {
        throw new Error("No token returned from Google");
    }

    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID as string,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.sub || !payload.email) {
        throw new Error("Invalid Google token payload");
    }

    return {
        googleId: payload.sub,
        email: payload.email,
        emailVerified: payload.email_verified ?? false,
        name: payload.given_name ?? "unknown",
        surname: payload.family_name ?? "unknown",
        avatarUrl: payload.picture ?? null,
    };
}

export async function findOrCreateGoogleUser(
    profile: {
        googleId: string;
        email: string;
        name: string;
        surname: string;
        avatarUrl: string | null;
    },
    termsAccepted: boolean,
): Promise<
    | { status: "ok"; userId: number; termsAccepted: boolean }
    | { status: "terms_required" }
> {
    const [byGoogleId] = await pool.execute<
        (Pick<
            User,
            | "id"
            | "google_id"
            | "is_verified"
            | "terms_version"
            | "privacy_version"
        > &
            RowDataPacket)[]
    >(
        `
            SELECT id, google_id, is_verified, terms_version, privacy_version
            FROM users
            WHERE google_id = ?
        `,
        [profile.googleId],
    );

    const [byEmail] = byGoogleId[0]
        ? [
              [] as (Pick<
                  User,
                  | "id"
                  | "google_id"
                  | "is_verified"
                  | "terms_version"
                  | "privacy_version"
              > &
                  RowDataPacket)[],
          ]
        : await pool.execute<
              (Pick<
                  User,
                  | "id"
                  | "google_id"
                  | "is_verified"
                  | "terms_version"
                  | "privacy_version"
              > &
                  RowDataPacket)[]
          >(
              `
                  SELECT id, google_id, is_verified, terms_version, privacy_version
                  FROM users
                  WHERE email = ?
              `,
              [profile.email],
          );

    const existing = byGoogleId[0] ?? byEmail[0];

    if (!existing && !termsAccepted) {
        return { status: "terms_required" };
    }

    const { terms, privacy } = legalVersions();

    if (!existing) {
        const now = new Date();

        const [result] = await pool.execute<ResultSetHeader>(
            `
                INSERT INTO users 
                    (
                        email, 
                        google_id, 
                        auth_provider, 
                        name,
                        surname,
                        avatar_url, 
                        password,
                        terms_accepted_at,
                        terms_version,
                        privacy_accepted_at,
                        privacy_version
                    )
                VALUES (?, ?, 'google', ?, ?, ?, NULL, ?, ?, ?, ?)
            `,
            [
                profile.email,
                profile.googleId,
                profile.name,
                profile.surname,
                profile.avatarUrl,
                now,
                terms,
                now,
                privacy,
            ],
        );

        return { status: "ok", userId: result.insertId, termsAccepted: true };
    }

    if (
        (existing.terms_version !== terms ||
            existing.privacy_version !== privacy) &&
        !termsAccepted
    ) {
        return { status: "terms_required" };
    }

    if (!byGoogleId[0] && existing.is_verified) {
        await pool.execute(
            `
                UPDATE users 
                SET google_id = ?, 
                    avatar_url = COALESCE(avatar_url, ?) 
                WHERE id = ?
            `,
            [profile.googleId, profile.avatarUrl, existing.id],
        );
    }

    if (!byGoogleId[0] && !existing.is_verified) {
        const [result] = await pool.execute<ResultSetHeader>(
            `
                UPDATE users
                SET google_id = ?,
                    auth_provider = 'google',
                    password = NULL,
                    is_verified = TRUE,
                    verification_token = NULL,
                    verification_token_expires = NULL,
                    avatar_url = COALESCE(avatar_url, ?)
                WHERE id = ? AND is_verified = FALSE
            `,
            [profile.googleId, profile.avatarUrl, existing.id],
        );

        if (result.affectedRows === 0) {
            throw new Error("Account state changed during Google sign-in");
        }
    }

    if (
        existing.terms_version !== terms ||
        existing.privacy_version !== privacy
    ) {
        const now = new Date();

        await pool.execute<ResultSetHeader>(
            `
                UPDATE users
                SET terms_accepted_at = ?,
                    terms_version = ?,
                    privacy_accepted_at = ?,
                    privacy_version = ?
                WHERE id = ?
            `,
            [now, terms, now, privacy, existing.id],
        );
    }

    return {
        status: "ok",
        userId: existing.id,
        termsAccepted:
            existing.terms_version !== terms ||
            existing.privacy_version !== privacy,
    };
}
