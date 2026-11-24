import dotenv from "dotenv";
import type { Response } from "express";
import type { RowDataPacket } from "mysql2";
import { pool } from "../db/pool.js";

dotenv.config({ quiet: true });

const MAX_INVITES_PER_DAY = Math.max(
    1,
    Number(process.env.MAX_INVITES_PER_DAY) || 50,
);

const escapeHtml = (value: string): string =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

export const checkInviteQuota = async (
    res: Response,
    userId: number,
    count: number,
): Promise<boolean> => {
    if (count === 0) {
        return true;
    }

    const [rows] = await pool.execute<({ sent: number } & RowDataPacket)[]>(
        `
            SELECT COUNT(*) AS sent
            FROM project_invites
            WHERE created_by = ?
                AND email IS NOT NULL
                AND created_at > NOW() - INTERVAL 1 DAY
        `,
        [userId],
    );

    const sent = Number(rows[0]?.sent ?? 0);

    if (sent + count <= MAX_INVITES_PER_DAY) {
        return true;
    }

    res.setHeader("Retry-After", String(24 * 60 * 60));
    res.status(429).json({
        status: "error",
        message: `You can send up to ${MAX_INVITES_PER_DAY} invitations per day. ${Math.max(
            0,
            MAX_INVITES_PER_DAY - sent,
        )} left today.`,
    });

    return false;
};

export const invitationFooter = async (
    inviterId: number,
    projectName: string,
): Promise<string> => {
    const [rows] = await pool.execute<
        ({ name: string; surname: string } & RowDataPacket)[]
    >(`SELECT name, surname FROM users WHERE id = ?`, [inviterId]);

    const inviter = rows[0]
        ? `${rows[0].name} ${rows[0].surname}`.trim()
        : "A Kanbanchik user";
    const privacyUrl = `${process.env.FRONTEND_URL}/privacy#zaproszenia`;
    const email = escapeHtml(
        process.env.LEGAL_CONTACT_EMAIL || "help.prydni@gmail.com",
    );

    return `
        You are receiving this email because <strong>${escapeHtml(inviter)}</strong>
        entered your address to invite you to the project
        <strong>${escapeHtml(projectName)}</strong> on Kanbanchik.
        <br><br>
        Your address is processed by ${escapeHtml(process.env.LEGAL_CONTROLLER_NAME || "Serhii Kharchenko")}
        (<a href="mailto:${email}" style="color:#71717a;">${email}</a>), the controller,
        only to deliver this invitation and to link it to your account if you accept it
        (legitimate interest, Art. 6(1)(f) GDPR). The invitation is valid for 7 days, and
        your address is deleted 30 days after it expires or is used. You can object or ask
        for deletion at any time by writing to the address above; you also have the other
        rights described in the
        <a href="${escapeHtml(privacyUrl)}" style="color:#71717a;">Privacy Policy</a>
        (Polityka prywatności, section 5.7).
        <br><br>
        If you weren't expecting this invitation, you can safely ignore this email.
    `;
};
