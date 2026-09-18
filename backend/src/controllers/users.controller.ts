import type { Response } from "express";
import {
    changePasswordSchema,
    deleteAccountSchema,
    setPasswordSchema,
    updateProfileSchema,
    validateIdSchema,
} from "../validation/validation";
import { pool } from "../db/pool";
import { ZodError } from "zod";
import bcrypt from "bcryptjs";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { IGetUserRequest, User } from "../types/types";
import dotenv from "dotenv";

dotenv.config();

export const me = async (
    req: IGetUserRequest,
    res: Response,
): Promise<void> => {
    try {
        const { id } = req.user;

        const [rows] = await pool.execute<
            (Pick<
                User,
                | "id"
                | "name"
                | "surname"
                | "email"
                | "avatar_url"
                | "color"
                | "mfa_enabled"
                | "auth_provider"
                | "created_at"
                | "updated_at"
            > &
                RowDataPacket)[]
        >(
            `
                SELECT 
                    id,
                    name,
                    surname,
                    email,
                    avatar_url,
                    color,
                    mfa_enabled,
                    auth_provider,
                    created_at,
                    updated_at
                FROM users 
                WHERE id = ?
            `,
            [id],
        );

        const user = rows[0];

        if (!user) {
            res.status(404).json({
                status: "error",
                message: "User not found",
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "User found",
            user: {
                id: user.id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                avatar_url:
                    user.avatar_url === null
                        ? null
                        : user.avatar_url.startsWith("/files")
                          ? `${process.env.BACKEND_URL}${user.avatar_url}`
                          : user.avatar_url,
                color: user.color,
                mfa_enabled: user.mfa_enabled,
                auth_provider: user.auth_provider,
                created_at: user.created_at,
                updated_at: user.updated_at,
            },
        });
    } catch (error) {
        console.error("User error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error during getting user",
        });
    }
};

export const updateProfile = async (
    req: IGetUserRequest,
    res: Response,
): Promise<void> => {
    try {
        const { id } = req.user;

        if (!id) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        const validateData = updateProfileSchema.parse(req.body);

        const { name, surname, email, color } = validateData;

        if (!email) {
            res.status(400).json({
                status: "error",
                message: "Invalid email",
            });

            return;
        }

        const [existingUser] = await pool.execute<
            (Pick<User, "id"> & RowDataPacket)[]
        >("SELECT id FROM users WHERE email = ? AND id != ?", [email, id]);

        if (existingUser.length) {
            res.status(409).json({
                status: "error",
                message: "Email already in use",
            });

            return;
        }

        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (name) {
            updateFields.push("name = ?");
            updateValues.push(name);
        }

        if (surname) {
            updateFields.push("surname = ?");
            updateValues.push(surname);
        }

        if (email) {
            updateFields.push("email = ?");
            updateValues.push(email);
        }

        if (color) {
            updateFields.push("color = ?");
            updateValues.push(color);
        }

        if (updateFields.length === 0) {
            res.status(400).json({
                status: "error",
                message: "No fields to update",
            });

            return;
        }

        updateValues.push(id);

        const [result] = await pool.execute<ResultSetHeader>(
            `
                UPDATE users 
                SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `,
            updateValues,
        );

        if (result.affectedRows === 0) {
            res.status(404).json({
                status: "error",
                message: "User not found",
            });

            return;
        }

        const [updatedUser] = await pool.execute<
            (Pick<
                User,
                | "id"
                | "name"
                | "surname"
                | "email"
                | "avatar_url"
                | "color"
                | "created_at"
                | "updated_at"
            > &
                RowDataPacket)[]
        >(
            `
                SELECT 
                    id,
                    name,
                    surname,
                    email,
                    avatar_url,
                    color,
                    created_at,
                    updated_at
                FROM users 
                WHERE id = ?
            `,
            [id],
        );

        if (!updatedUser.length || !updatedUser[0]) {
            res.status(409).json({
                status: "error",
                message: "User not found",
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "The profile has been successfully updated",
            user: [
                {
                    ...updatedUser[0],
                    avatar_url:
                        !updatedUser[0].avatar_url ||
                        updatedUser[0].avatar_url.startsWith("/files")
                            ? `${process.env.BACKEND_URL}${updatedUser[0].avatar_url}`
                            : updatedUser[0].avatar_url,
                },
            ],
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

        console.error("User error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error during updating profile",
        });
    }
};

export const changePassword = async (
    req: IGetUserRequest,
    res: Response,
): Promise<void> => {
    try {
        const validateData = changePasswordSchema.parse(req.body);

        const { currentPassword, newPassword } = validateData;
        const { id } = req.user;

        const [users] = await pool.execute<
            (Pick<User, "id" | "password"> & RowDataPacket)[]
        >("SELECT id, password FROM users WHERE id = ?", [id]);

        if (!users.length) {
            res.status(404).json({
                status: "error",
                message: "User not found",
            });

            return;
        }

        const user = users[0];

        if (!user || !user.password) {
            res.status(404).json({
                status: "error",
                message: "User not found",
            });

            return;
        }

        const isPasswordValid = await bcrypt.compare(
            currentPassword,
            user.password,
        );

        if (!isPasswordValid) {
            res.status(400).json({
                status: "error",
                message: "Current password is incorrect",
            });

            return;
        }

        const isSamePassword = await bcrypt.compare(newPassword, user.password);

        if (isSamePassword) {
            res.status(400).json({
                status: "error",
                message: "New password must be different from current password",
            });

            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const [result] = await pool.execute<ResultSetHeader>(
            "UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [hashedPassword, id],
        );

        if (result.affectedRows === 0) {
            res.status(404).json({
                status: "error",
                message: "User not found",
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "The password has been successfully changed",
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

        console.error("User error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error during changing password",
        });
    }
};

export const deleteAccount = async (
    req: IGetUserRequest,
    res: Response,
): Promise<void> => {
    try {
        validateIdSchema.parse(req.params);
        deleteAccountSchema.parse(req.body);

        if (!req.params.id) {
            res.status(400).json({
                status: "error",
                message: "ID is required",
            });

            return;
        }

        const userId = +req.user.id;
        const paramId = +req.params.id;

        if (userId !== paramId) {
            res.status(403).json({
                status: "error",
                message: "You can only delete your own account",
            });

            return;
        }

        const { password } = req.body;

        const [users] = await pool.execute<
            (Pick<User, "id" | "password"> & RowDataPacket)[]
        >("SELECT id, password FROM users WHERE id = ?", [paramId]);

        if (!users.length) {
            res.status(404).json({
                status: "error",
                message: "User not found",
            });

            return;
        }

        const user = users[0];

        if (!user || !user.password) {
            res.status(404).json({
                status: "error",
                message: "User not found",
            });

            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({
                status: "error",
                message: "Incorrect password",
            });

            return;
        }

        const [ownedProjects] = await pool.execute<
            ({ count: number } & RowDataPacket)[]
        >("SELECT COUNT(*) as count FROM projects WHERE owner_id = ?", [
            paramId,
        ]);

        if (
            !ownedProjects.length ||
            !ownedProjects[0] ||
            ownedProjects[0].count > 0
        ) {
            res.status(400).json({
                status: "error",
                message:
                    "Cannot delete account with owned projects. Transfer or delete projects first.",
            });

            return;
        }

        const [result] = await pool.execute<ResultSetHeader>(
            "DELETE FROM users WHERE id = ?",
            [paramId],
        );

        if (result.affectedRows === 0) {
            res.status(404).json({
                status: "error",
                message: "Account not found",
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "The account has been successfully deleted",
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

        console.error("User error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error during deleting account",
        });
    }
};

export const setPassword = async (
    req: IGetUserRequest,
    res: Response,
): Promise<void> => {
    try {
        const validateData = setPasswordSchema.parse(req.body);

        const { newPassword } = validateData;
        const userId = req.user.id;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        const [rows] = await pool.execute<
            (Pick<User, "id" | "password"> & RowDataPacket)[]
        >("SELECT id, password FROM users WHERE id = ?", [userId]);

        const user = rows[0];

        if (!user) {
            res.status(404).json({
                status: "error",
                message: "User not found",
            });

            return;
        }

        if (user.password) {
            res.status(400).json({
                status: "error",
                message: "Password already set. Use change password instead.",
            });

            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const [result] = await pool.execute<ResultSetHeader>(
            "UPDATE users SET password = ?, auth_provider = 'local' WHERE id = ?",
            [hashedPassword, userId],
        );

        if (result.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to set password",
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "Password set successfully",
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

        console.error("Set password error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error while setting password",
        });
    }
};
