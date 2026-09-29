import crypto from "crypto";
import dotenv from "dotenv";
import type { Response } from "express";
import { pool } from "../db/pool.js";
import type {
    IGetUserRequest,
    Project,
    ProjectInvite,
    ProjectMember,
} from "../types/types.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import {
    memberInviteSchema,
    tokenSchema,
    validateIdSchema,
} from "../validation/validation.js";
import { ZodError } from "zod";
import { transporter } from "../utils/email.js";
import { emailTemplate } from "../utils/emailTemplate.js";

dotenv.config();

const frontendUrl = process.env.FRONTEND_URL;
const inviteTime = 7 * 24 * 60 * 60 * 1000;

export const generateInvite = async (
    req: IGetUserRequest,
    res: Response,
): Promise<void> => {
    try {
        validateIdSchema.parse(req.params);

        const { id } = req.params;
        const userId = req.user.id;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        if (!id) {
            res.status(400).json({
                status: "error",
                message: "Invalid project ID",
            });

            return;
        }

        const projectId = +id;

        const [members] = await pool.execute<(ProjectMember & RowDataPacket)[]>(
            `
                SELECT *
                FROM project_members
                WHERE project_id = ?
                AND user_id = ?
                AND role IN ("owner", "admin")
            `,
            [projectId, userId],
        );

        if (!members[0]) {
            res.status(403).json({
                status: "error",
                message: "Forbidden",
            });

            return;
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + inviteTime);

        const [rows] = await pool.execute<ResultSetHeader>(
            `
                INSERT INTO project_invites
                    (project_id, token, created_by, expires_at)
                VALUES (?, ?, ?, ?)
            `,
            [projectId, token, userId, expiresAt],
        );

        if (rows.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to generate invite",
            });

            return;
        }

        res.status(201).json({
            status: "success",
            message: "The invitation has been created",
            data: { inviteUrl: `${frontendUrl}/invite/${token}` },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Database error" });
    }
};

export const acceptInvite = async (
    req: IGetUserRequest,
    res: Response,
): Promise<void> => {
    try {
        const validateData = tokenSchema.parse(req.body);

        const userId = req.user.id;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        const { token } = validateData;

        if (!token) {
            res.status(400).json({
                status: "error",
                message: "Token is required",
            });

            return;
        }

        const [invites] = await pool.execute<ProjectInvite[]>(
            `
                SELECT *
                FROM project_invites
                WHERE token = ?
            `,
            [token],
        );

        const invite = invites[0];

        if (!invite) {
            res.status(404).json({
                status: "error",
                message: "Invite not found",
            });

            return;
        }

        if (invite.used) {
            res.status(400).json({
                status: "error",
                message: "Invite already used",
            });

            return;
        }

        if (new Date(invite.expires_at) < new Date()) {
            res.status(400).json({
                status: "error",
                message: "Invite expired",
            });

            return;
        }

        const [existing] = await pool.execute<ProjectMember[]>(
            `
                SELECT *
                FROM project_members
                WHERE project_id = ?
                AND user_id = ?
            `,
            [invite.project_id, userId],
        );

        if (existing[0]) {
            res.status(409).json({
                status: "error",
                message: "Already a member",
            });

            return;
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            await connection.execute(
                `
                    INSERT INTO project_members
                        (project_id, user_id, role)
                    VALUES (?, ?, 'member')
                `,
                [invite.project_id, userId],
            );

            await connection.execute(
                `
                    UPDATE project_invites
                    SET used = 1
                    WHERE id = ?
                `,
                [invite.id],
            );

            await connection.commit();
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

        res.status(200).json({
            status: "success",
            message: "Successfully joined the project",
            data: { projectId: invite.project_id },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Database error" });
    }
};

export const memberInvite = async (
    req: IGetUserRequest,
    res: Response,
): Promise<void> => {
    try {
        const userId = req.user.id;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        const validatedData = memberInviteSchema.parse(req.body);

        const [projects] = await pool.execute<
            (Pick<Project, "id" | "name"> & RowDataPacket)[]
        >(`SELECT id, name FROM projects WHERE id = ?`, [
            validatedData.projectId,
        ]);

        if (!projects.length) {
            res.status(404).json({
                status: "error",
                message: "Project not found",
            });

            return;
        }

        const project = projects[0];

        if (!project) {
            res.status(404).json({
                status: "error",
                message: "Project not found",
            });

            return;
        }

        if (validatedData.members && validatedData.members.length) {
            await Promise.all(
                validatedData.members.map(async (email) => {
                    const token = crypto.randomBytes(32).toString("hex");
                    const expiresAt = new Date(
                        Date.now() + 7 * 24 * 60 * 60 * 1000,
                    );

                    await pool.execute<ResultSetHeader>(
                        `
                            INSERT INTO project_invites
                                (project_id, token, created_by, expires_at)
                            VALUES (?, ?, ?, ?)
                        `,
                        [project.id, token, userId, expiresAt],
                    );

                    const inviteUrl = `${process.env.FRONTEND_URL}/invite/${token}`;
                    const [username] = email.split("@");

                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: `Invitation to join ${project.name}`,
                        html: emailTemplate({
                            logo: "cid:app-logo",
                            title: "Project Invitation",
                            heading: "You've been invited",
                            description: `
                                Hello <strong>${username}</strong>,
                                <br><br>
                                You've been invited to collaborate on
                                <strong>${project.name}</strong>.
                            `,
                            children: `
                                <div
                                    style="
                                        margin-top:28px;
                                        padding:20px;
                                        background:#fafafa;
                                        border:1px solid #e5e5e5;
                                        border-radius:10px;
                                    "
                                >
                                    <div
                                        style="
                                            font-size:13px;
                                            color:#71717a;
                                            margin-bottom:6px;
                                        "
                                    >
                                        Project
                                    </div>
                                    <div
                                        style="
                                            font-size:17px;
                                            font-weight:600;
                                            color:#0a0a0a;
                                        "
                                    >
                                        ${project.name}
                                    </div>
                                </div>
                            `,
                            buttonText: "Open Project",
                            buttonUrl: inviteUrl,
                            footer: "If you weren't expecting this invitation, you can safely ignore this email.",
                        }),
                        attachments: [
                            {
                                filename: "logo.png",
                                path: "./assets/generallogo.png",
                                cid: "app-logo",
                            },
                        ],
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.error(error);
                            res.status(500).send({
                                status: "error",
                                message: "Error sending email",
                            });
                        } else {
                            console.log(`Email sent: ${info.response}`);
                        }
                    });
                }),
            );
        }

        res.status(200).json({
            status: "success",
            message: "Invitations have been sent",
        });
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessages = error.issues.map((issue: any) => ({
                field: issue.path[0],
                message: issue.message,
            }));

            res.status(400).json({
                status: "error",
                message: "Invalid data",
                details: errorMessages,
            });

            return;
        }

        console.error(error);
        res.status(500).json({ status: "error", message: "Database error" });
    }
};
