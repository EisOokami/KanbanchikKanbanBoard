import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
import type { GoogleProfile, User } from "../types/types.js";
import { pool } from "../db/pool.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

dotenv.config();

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

export async function findOrCreateGoogleUser(profile: {
    googleId: string;
    email: string;
    name: string;
    surname: string;
    avatarUrl: string | null;
}): Promise<number> {
    const [byGoogleId] = await pool.execute<
        (Pick<User, "id"> & RowDataPacket)[]
    >(`SELECT id FROM users WHERE google_id = ?`, [profile.googleId]);

    if (byGoogleId[0]) {
        return byGoogleId[0].id;
    }

    const [byEmail] = await pool.execute<
        (Pick<User, "id" | "google_id"> & RowDataPacket)[]
    >(`SELECT id, google_id FROM users WHERE email = ?`, [profile.email]);

    if (byEmail[0]) {
        await pool.execute(
            `
                UPDATE users 
                SET google_id = ?, 
                    avatar_url = COALESCE(avatar_url, ?) 
                WHERE id = ?
            `,
            [profile.googleId, profile.avatarUrl, byEmail[0].id],
        );

        return byEmail[0].id;
    }

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
            new Date(),
            process.env.TERMS_VERSION!,
            new Date(),
            process.env.PRIVACY_VERSION!,
        ],
    );

    return result.insertId;
}
