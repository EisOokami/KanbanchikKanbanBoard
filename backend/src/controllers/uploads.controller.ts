import type { Response } from "express";
import { pool } from "../db/pool";
import type {
    Attachment,
    IGetUserRequest,
    Role,
    Status,
    TaskMembers,
} from "../types/types";
import {
    deleteAvatarSchema,
    getAttachmentsSchema,
} from "../validation/validation";
import { ZodError } from "zod";
import { existsSync, unlinkSync } from "fs";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

export const getAttachments = async (req: IGetUserRequest, res: Response) => {
    try {
        const userId = req.user.id;

        const validatedData = getAttachmentsSchema.parse(req.body);

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        const [projectMember] = await pool.execute<TaskMembers[]>(
            `
                SELECT pm.*
                FROM tasks t
                JOIN columns c ON c.id = t.column_id
                JOIN project_members pm ON pm.project_id = c.project_id
                WHERE t.id = ? AND pm.user_id = ?
                LIMIT 1
            `,
            [validatedData.taskId, userId],
        );

        if (!projectMember || !projectMember.length) {
            res.status(403).json({
                status: "error",
                message: "Access denied or task not found",
            });

            return;
        }

        const [rows] = await pool.execute<Attachment[]>(
            "SELECT * FROM attachments WHERE task_id = ?",
            [validatedData.taskId],
        );

        res.status(200).json(rows);
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

export const uploadSingle = async (req: IGetUserRequest, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: "File not found" });

            return;
        }

        const userId = req.user.id;

        const validatedData = getAttachmentsSchema.parse(req.body);

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        const [taskMembers] = await pool.execute<TaskMembers[]>(
            `
                SELECT tm.task_id, tm.user_id 
                FROM task_members tm
                JOIN tasks t ON t.id = tm.task_id
                JOIN columns c ON c.id = t.column_id
                JOIN project_members pm ON pm.project_id = c.project_id
                WHERE
                        pm.user_id = ?
                        AND tm.task_id = ?
                        AND (
                            pm.role != 'viewer'
                            AND (
                                tm.user_id = ?
                                OR pm.role IN ('owner', 'admin')
                            )
                        )
            `,
            [userId, validatedData.taskId, userId],
        );

        if (!taskMembers || !taskMembers.length) {
            res.status(403).json({
                status: "error",
                message: "Access denied or task not found",
            });

            return;
        }

        const [result] = await pool.execute<ResultSetHeader>(
            `
                INSERT INTO attachments 
                (task_id, uploader_id, filename, file_url, mime_type, size_bytes) 
                VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                validatedData.taskId,
                userId,
                req.file.originalname,
                `${process.env.BACKEND_URL}/files/${req.file.filename}`,
                req.file.mimetype,
                req.file.size,
            ],
        );

        if (result.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to upload file",
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "File uploaded successfully",
            data: {
                id: result.insertId,
                filename: req.file.originalname,
                url: `${process.env.BACKEND_URL}/files/${req.file.filename}`,
                size: req.file.size,
            },
        });
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessages = error.issues.map((issue: any) => ({
                field: issue.path[0],
                message: issue.message,
            }));

            if (req.file) {
                unlinkSync(req.file.path);
            }

            res.status(400).json({
                status: "error",
                message: "Invalid data",
                details: errorMessages,
            });

            return;
        }

        if (req.file) {
            unlinkSync(req.file.path);
        }

        console.error(error);
        res.status(500).json({ status: "error", message: "Database error" });
    }
};

export const uploadAvatar = async (req: IGetUserRequest, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: "File not found" });

            return;
        }

        const userId = req.user.id;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        const [uploadResult] = await pool.execute<ResultSetHeader>(
            `
                INSERT INTO attachments 
                (uploader_id, filename, file_url, mime_type, size_bytes) 
                VALUES (?, ?, ?, ?, ?)
            `,
            [
                userId,
                req.file.originalname,
                `${process.env.BACKEND_URL}/files/${req.file.filename}`,
                req.file.mimetype,
                req.file.size,
            ],
        );

        if (uploadResult.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to upload avatar",
            });

            return;
        }

        const [userResult] = await pool.execute<ResultSetHeader>(
            `
                UPDATE users
                SET avatar_url = ?
                WHERE id = ?
            `,
            [`${process.env.BACKEND_URL}/files/${req.file.filename}`, userId],
        );

        if (userResult.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to upload avatar",
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "Avatar uploaded successfully",
            data: {
                id: uploadResult.insertId,
                filename: req.file.originalname,
                url: `${process.env.BACKEND_URL}/files/${req.file.filename}`,
                size: req.file.size,
            },
        });
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessages = error.issues.map((issue: any) => ({
                field: issue.path[0],
                message: issue.message,
            }));

            if (req.file) {
                unlinkSync(req.file.path);
            }

            res.status(400).json({
                status: "error",
                message: "Invalid data",
                details: errorMessages,
            });

            return;
        }

        if (req.file) {
            unlinkSync(req.file.path);
        }

        console.error(error);
        res.status(500).json({ status: "error", message: "Database error" });
    }
};

export const uploadMultiple = async (req: IGetUserRequest, res: Response) => {
    try {
        const files = Array.isArray(req.files) ? req.files : [];

        if (!req.files || files.length === 0) {
            res.status(400).json({ error: "Files not found" });

            return;
        }

        const userId = +req.user.id;

        const validatedData = getAttachmentsSchema.parse(req.body);

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        const [taskMembers] = await pool.execute<TaskMembers[]>(
            `
                SELECT tm.task_id, tm.user_id 
                FROM task_members tm
                JOIN tasks t ON t.id = tm.task_id
                JOIN columns c ON c.id = t.column_id
                JOIN project_members pm ON pm.project_id = c.project_id
                WHERE
                        pm.user_id = ?
                        AND tm.task_id = ?
                        AND (
                            pm.role != 'viewer'
                            AND (
                                tm.user_id = ?
                                OR pm.role IN ('owner', 'admin')
                            )
                        )
            `,
            [userId, validatedData.taskId, userId],
        );

        if (!taskMembers || !taskMembers.length) {
            res.status(403).json({
                status: "error",
                message: "Access denied or task not found",
            });

            return;
        }

        const filesData = files.map((file) => {
            return [
                validatedData.taskId,
                userId,
                file.originalname,
                `${process.env.BACKEND_URL}/files/${file.filename}`,
                file.mimetype,
                file.size,
            ];
        });

        for (const fileData of filesData) {
            const [result] = await pool.execute<ResultSetHeader>(
                `
                    INSERT INTO attachments
                    (task_id, uploader_id, filename, file_url, mime_type, size_bytes)
                    VALUES (?, ?, ?, ?, ?, ?)
                `,
                fileData,
            );

            if (result.affectedRows === 0) {
                res.status(400).json({
                    status: "error",
                    message: "Failed to upload file",
                });

                return;
            }
        }

        res.status(200).json({
            status: "success",
            message: "File uploaded successfully",
            data: files.map((file) => ({
                filename: file.originalname,
                url: `${process.env.BACKEND_URL}/files/${file.filename}`,
                size: file.size,
            })),
        });
    } catch (error) {
        const files = Array.isArray(req.files) ? req.files : [];

        if (error instanceof ZodError) {
            const errorMessages = error.issues.map((issue: any) => ({
                field: issue.path[0],
                message: issue.message,
            }));

            if (files) {
                files.forEach((file) => {
                    unlinkSync(file.path);
                });
            }

            res.status(400).json({
                status: "error",
                message: "Invalid data",
                details: errorMessages,
            });

            return;
        }

        if (files) {
            files.forEach((file) => {
                unlinkSync(file.path);
            });
        }

        console.error(error);
        res.status(500).json({ status: "error", message: "Database error" });
    }
};

export const deleteAttachment = async (req: IGetUserRequest, res: Response) => {
    try {
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
                message: "Invalid task ID",
            });

            return;
        }

        const [attachments] = await pool.execute<
            (Pick<Attachment, "id" | "file_url" | "uploader_id" | "task_id"> &
                RowDataPacket)[]
        >(
            "SELECT id, file_url, uploader_id, task_id FROM attachments WHERE id = ?",
            [id],
        );

        if (!attachments || !attachments.length) {
            res.status(404).json({ error: "Attachment not found" });

            return;
        }

        const attachment = attachments[0];

        if (!attachment) {
            res.status(404).json({
                status: "error",
                message: "Attachment not found",
            });

            return;
        }

        const [memberAccessRow] = await pool.execute<
            ({
                project_role: Role | null;
                project_status: Status | null;
                task_member_id: number | null;
            } & RowDataPacket)[]
        >(
            `
            SELECT
                pm.role AS project_role,
                pm.status AS project_status,
                tm.user_id AS task_member_id
            FROM attachments a
            JOIN tasks t
                ON t.id = a.task_id
            JOIN columns c
                ON c.id = t.column_id
            JOIN projects p
                ON p.id = c.project_id
            LEFT JOIN project_members pm
                ON pm.project_id = p.id
            AND pm.user_id = ?
            LEFT JOIN task_members tm
                ON tm.task_id = t.id
            AND tm.user_id = ?
            WHERE a.id = ?
            `,
            [userId, userId, attachment.id],
        );

        const memberAccess = memberAccessRow[0];

        if (!memberAccess) {
            res.status(404).json({
                status: "error",
                message: "Access denied or data not found",
            });

            return;
        }

        if (
            !memberAccess.project_role ||
            memberAccess.project_status !== "active"
        ) {
            res.status(404).json({
                status: "error",
                message: "User is not a project member",
            });

            return;
        }

        if (
            !(
                memberAccess.project_role === "owner" ||
                memberAccess.project_role === "admin"
            ) ||
            !memberAccess.task_member_id
        ) {
            res.status(404).json({
                status: "error",
                message: "Access denied",
            });

            return;
        }

        const __dirname = path.resolve(path.dirname(""));
        const filePath = path.join(__dirname, attachment.file_url);

        if (existsSync(filePath)) {
            unlinkSync(filePath);
        }

        const [rows] = await pool.execute<ResultSetHeader>(
            "DELETE FROM attachments WHERE id = ?",
            [id],
        );

        if (rows.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to delete file",
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "File deleted successfully",
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

export const deleteAvatar = async (req: IGetUserRequest, res: Response) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        const validatedData = deleteAvatarSchema.parse(req.body);

        if (!validatedData.avatar_url) {
            res.status(400).json({
                status: "error",
                message: "Invalid avatar url",
            });

            return;
        }

        // const url = new URL(validatedData.avatar_url);
        // const pathname = url.pathname;

        const [attachments] = await pool.execute<
            (Pick<Attachment, "id" | "file_url" | "uploader_id" | "task_id"> &
                RowDataPacket)[]
        >(
            `
                SELECT id, file_url, uploader_id, task_id 
                FROM attachments 
                WHERE file_url = ? AND uploader_id = ?
            `,
            [validatedData.avatar_url, userId],
        );

        if (!attachments || !attachments.length) {
            res.status(404).json({ error: "Attachment not found" });

            return;
        }

        const attachment = attachments[0];

        if (!attachment) {
            res.status(404).json({
                status: "error",
                message: "Attachment not found",
            });

            return;
        }

        const __dirname = path.resolve(path.dirname(""));
        const filePath = path.join(__dirname, attachment.file_url);

        if (existsSync(filePath)) {
            unlinkSync(filePath);
        }

        const [deleteRows] = await pool.execute<ResultSetHeader>(
            "DELETE FROM attachments WHERE id = ?",
            [attachment.id],
        );

        if (deleteRows.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to delete file",
            });

            return;
        }

        const [updateRows] = await pool.execute<ResultSetHeader>(
            `UPDATE users SET avatar_url = NULL WHERE id = ?`,
            [userId],
        );

        if (updateRows.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to update avatar url",
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "File deleted successfully",
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
