import type { Response } from "express";
import {
    changePasswordSchema,
    confirmAccountDeletionSchema,
    deleteAccountSchema,
    resendAccountDeletionSchema,
    setPasswordSchema,
    updateProfileSchema,
    validateIdSchema,
} from "../validation/validation.js";
import { pool } from "../db/pool.js";
import { ZodError } from "zod";
import bcrypt from "bcryptjs";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type {
    AccountDeletionSession,
    IGetUserRequest,
    MfaBackupCode,
    User,
} from "../types/types.js";
import dotenv from "dotenv";
import {
    generateEmailCode,
    hashDeletionCode,
    safeEqualHex,
} from "../utils/codes.js";
import { decryptMfaSecret, generateRawToken, hashToken } from "../utils/mfa.js";
import { OTP } from "otplib";
import { emailTemplate } from "../utils/emailTemplate.js";
import { transporter } from "../utils/email.js";

dotenv.config({ quiet: true });

const otp = new OTP({ strategy: "totp" });

export const me = async (
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
        req.log.error(
            { err: error, event: "user.me_failed", operation: "me" },
            "Operation failed",
        );

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

        req.log.info(
            { event: "user.profile_updated", audit: true, userId: id },
            "Operation completed",
        );

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

        req.log.error(
            {
                err: error,
                event: "user.update_profile_failed",
                operation: "updateProfile",
            },
            "Operation failed",
        );

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
            req.log.warn(
                { audit: true, event: "user.password_verification_failed" },
                "Password verification failed",
            );

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

        req.log.info(
            { event: "user.password_changed", audit: true, userId: id },
            "Operation completed",
        );

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

        req.log.error(
            {
                err: error,
                event: "user.change_password_failed",
                operation: "changePassword",
            },
            "Operation failed",
        );

        res.status(500).json({
            status: "error",
            message: "Server error during changing password",
        });
    }
};

export const initiateAccountDeletion = async (
    req: IGetUserRequest,
    res: Response,
): Promise<void> => {
    try {
        validateIdSchema.parse(req.params);

        const userId = +req.user.id;
        const { id } = req.params;

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

        const paramId = +id;

        if (userId !== paramId) {
            req.log.warn(
                {
                    audit: true,
                    event: "security.authorization_failed",
                    operation: "initiateAccountDeletion",
                },
                "Authorization denied",
            );

            res.status(403).json({
                status: "error",
                message: "You can only delete your own account",
            });

            return;
        }

        const validatedData = deleteAccountSchema.parse(req.body);

        const [users] = await pool.execute<
            (Pick<
                User,
                | "id"
                | "password"
                | "email"
                | "name"
                | "mfa_enabled"
                | "auth_provider"
            > &
                RowDataPacket)[]
        >(
            `
                SELECT id, password, email, name, mfa_enabled, auth_provider
                FROM users
                WHERE id = ?
            `,
            [paramId],
        );

        const user = users[0];

        if (!user) {
            res.status(404).json({
                status: "error",
                message: "User not found",
            });

            return;
        }

        if (user.auth_provider !== "google" || user.password) {
            if (!validatedData.password || !user.password) {
                res.status(401).json({
                    status: "error",
                    message: "Incorrect password",
                });

                return;
            }

            const isPasswordValid = await bcrypt.compare(
                validatedData.password,
                user.password,
            );

            if (!isPasswordValid) {
                req.log.warn(
                    {
                        audit: true,
                        event: "user.password_verification_failed",
                        operation: "initiateAccountDeletion",
                    },
                    "Password verification failed",
                );

                res.status(401).json({
                    status: "error",
                    message: "Incorrect password",
                });

                return;
            }
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

        await pool.execute(
            `DELETE FROM account_deletion_sessions WHERE user_id = ?`,
            [paramId],
        );

        const rawTempToken = generateRawToken();
        const tempTokenHash = hashToken(rawTempToken);

        if (
            (user.auth_provider !== "google" || user.password) &&
            user.mfa_enabled
        ) {
            await pool.execute<ResultSetHeader>(
                `
                    INSERT INTO account_deletion_sessions
                        (token_hash, user_id, method, expires_at)
                    VALUES (?, ?, 'totp', DATE_ADD(NOW(), INTERVAL ? MINUTE))
                `,
                [tempTokenHash, paramId, 10],
            );

            req.log.debug(
                {
                    event: "user.challenge_created",
                    userId: paramId,
                    method: "totp",
                    operation: "initiateAccountDeletion",
                },
                "Account deletion challenge created",
            );

            res.status(200).json({
                status: "success",
                message:
                    "Enter the code from your authenticator app to confirm",
                data: {
                    requiresMfa: true,
                    tempToken: rawTempToken,
                },
            });

            return;
        }

        const code = generateEmailCode();

        await pool.execute<ResultSetHeader>(
            `
                INSERT INTO account_deletion_sessions
                    (token_hash, user_id, method, code_hash, expires_at)
                VALUES (?, ?, 'email', ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))
            `,
            [tempTokenHash, paramId, hashDeletionCode(paramId, code), 10],
        );

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: `${code} - confirm ownership transfer`,
            html: emailTemplate({
                logo: "cid:app-logo",
                title: "Ownership transfer code",
                heading: `Hi, ${user.name}!`,
                description: `
                        Use this code to confirm transferring project ownership:
                        <br />
                        <p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p>
                        It expires in 10 minutes.
                    `,
                footer: "If this wasn't you, please change your password immediately and contact support.",
            }),
            attachments: [
                {
                    filename: "logo.png",
                    path: "./assets/generallogo.png",
                    cid: "app-logo",
                },
            ],
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                req.log.error(
                    {
                        err: error,
                        event: "email.delivery_failed",
                        operation: "initiateAccountDeletion",
                    },
                    "Operation failed",
                );

                if (!res.headersSent) {
                    res.status(500).send({
                        status: "error",
                        message: "Error sending email",
                    });
                }
            } else {
                req.log.debug(
                    {
                        event: "email.sent",
                        operation: "initiateAccountDeletion",
                    },
                    "Email accepted by transport",
                );
            }
        });

        req.log.debug(
            {
                event: "user.challenge_created",
                userId: paramId,
                method: "email",
                operation: "initiateAccountDeletion",
            },
            "Account deletion challenge created",
        );

        res.status(200).json({
            status: "success",
            message: "Verification code sent to your email",
            data: {
                requiresEmailCode: true,
                tempToken: rawTempToken,
            },
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                status: "error",
                message: "Invalid data",
                details: error.issues.map((issue) => ({
                    field: issue.path[0],
                    message: issue.message,
                })),
            });

            return;
        }

        req.log.error(
            {
                err: error,
                event: "user.initiate_account_deletion_failed",
                operation: "initiateAccountDeletion",
            },
            "Operation failed",
        );

        res.status(500).json({
            status: "error",
            message: "Server error while starting account deletion",
        });
    }
};

export const confirmAccountDeletion = async (
    req: IGetUserRequest,
    res: Response,
): Promise<void> => {
    try {
        validateIdSchema.parse(req.params);

        const { tempToken, code } = confirmAccountDeletionSchema.parse(
            req.body,
        );

        const userId = +req.user.id;
        const { id } = req.params;

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

        const paramId = +id;

        if (userId !== paramId) {
            res.status(403).json({
                status: "error",
                message: "You can only delete your own account",
            });

            return;
        }

        const tokenHash = hashToken(tempToken);

        const [bump] = await pool.execute<ResultSetHeader>(
            `
                UPDATE account_deletion_sessions
                SET attempts = attempts + 1
                WHERE token_hash = ?
                    AND user_id = ?
                    AND expires_at > NOW()
                    AND attempts < ?
            `,
            [tokenHash, paramId, 5],
        );

        if (bump.affectedRows === 0) {
            res.status(401).json({
                status: "error",
                message:
                    "Code expired or too many attempts. Please start again",
                data: { requiresRestart: true },
            });

            return;
        }

        const [sessions] = await pool.execute<
            (Pick<
                AccountDeletionSession,
                "id" | "user_id" | "method" | "code_hash" | "attempts"
            > &
                RowDataPacket)[]
        >(
            `
                SELECT id, user_id, method, code_hash, attempts
                FROM account_deletion_sessions
                WHERE token_hash = ?
            `,
            [tokenHash],
        );

        const session = sessions[0];

        if (!session) {
            res.status(401).json({
                status: "error",
                message: "Invalid or expired session",
                data: { requiresRestart: true },
            });

            return;
        }

        let isCodeValid = false;

        if (session.method === "email") {
            isCodeValid =
                session.code_hash !== null &&
                safeEqualHex(
                    session.code_hash,
                    hashDeletionCode(paramId, code),
                );
        }

        if (session.method !== "email") {
            const [userRows] = await pool.execute<
                (Pick<User, "id" | "mfa_secret" | "password"> & RowDataPacket)[]
            >("SELECT id, mfa_secret, password FROM users WHERE id = ?", [
                paramId,
            ]);

            const user = userRows[0];

            if (!user || !user.password) {
                res.status(404).json({
                    status: "error",
                    message: "User not found",
                });

                return;
            }

            if (user.mfa_secret && /^\d{6}$/.test(code)) {
                const decryptedSecret = decryptMfaSecret(user.mfa_secret);

                const result = await otp.verify({
                    token: code,
                    secret: decryptedSecret,
                    epochTolerance: 1,
                });

                isCodeValid = result.valid;
            }

            if (user.mfa_secret && !/^\d{6}$/.test(code)) {
                const codeHash = hashToken(code.toUpperCase());

                const [backupRows] = await pool.execute<
                    (Pick<MfaBackupCode, "id"> & RowDataPacket)[]
                >(
                    `
                            SELECT id
                            FROM mfa_backup_codes
                            WHERE user_id = ? AND code_hash = ? AND used_at IS NULL
                        `,
                    [paramId, codeHash],
                );

                const backupCode = backupRows[0];

                if (backupCode) {
                    const [updateResult] = await pool.execute<ResultSetHeader>(
                        "UPDATE mfa_backup_codes SET used_at = NOW() WHERE id = ? AND used_at IS NULL",
                        [backupCode.id],
                    );

                    isCodeValid = updateResult.affectedRows > 0;
                }
            }
        }

        if (!isCodeValid) {
            req.log.warn(
                {
                    audit: true,
                    event: "account.deletion_verification_failed",
                    operation: "confirmAccountDeletion",
                    userId: paramId,
                },
                "Verification rejected",
            );

            res.status(401).json({
                status: "error",
                message: "Invalid verification code",
                data: {
                    attemptsLeft: 5 - session.attempts,
                },
            });

            return;
        }

        const [deleteRows] = await pool.execute<ResultSetHeader>(
            `DELETE FROM account_deletion_sessions WHERE id = ?`,
            [session.id],
        );

        if (deleteRows.affectedRows === 0) {
            res.status(401).json({
                status: "error",
                message: "Invalid verification code",
            });

            return;
        }

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            await connection.execute<ResultSetHeader>(
                "DELETE FROM attachments WHERE task_id IS NULL AND uploader_id = ?",
                [paramId],
            );

            await connection.execute<ResultSetHeader>(
                `
                    UPDATE attachments
                    SET uploader_id = NULL
                    WHERE task_id IS NOT NULL AND uploader_id = ?
                `,
                [paramId],
            );

            await connection.execute<ResultSetHeader>(
                `
                    UPDATE tasks
                    SET creator_id = NULL
                    WHERE creator_id = ?
                `,
                [paramId],
            );

            await connection.execute<ResultSetHeader>(
                "UPDATE comments SET user_id = NULL WHERE user_id = ?",
                [paramId],
            );

            const [result] = await connection.execute<ResultSetHeader>(
                "DELETE FROM users WHERE id = ?",
                [paramId],
            );

            if (result.affectedRows === 0) {
                await connection.rollback();

                res.status(404).json({
                    status: "error",
                    message: "Account not found",
                });

                return;
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();

            throw error;
        } finally {
            connection.release();
        }

        req.log.info(
            { event: "user.deleted", audit: true, userId },
            "Operation completed",
        );

        res.status(200).json({
            status: "success",
            message: "The account has been successfully deleted",
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                status: "error",
                message: "Invalid data",
                details: error.issues.map((issue) => ({
                    field: issue.path[0],
                    message: issue.message,
                })),
            });

            return;
        }

        req.log.error(
            {
                err: error,
                event: "user.confirm_account_deletion_failed",
                operation: "confirmAccountDeletion",
            },
            "Operation failed",
        );

        res.status(500).json({
            status: "error",
            message: "Server error while deleting account",
        });
    }
};

export const resendAccountDeletionCode = async (
    req: IGetUserRequest,
    res: Response,
): Promise<void> => {
    try {
        validateIdSchema.parse(req.params);

        const { tempToken } = resendAccountDeletionSchema.parse(req.body);

        const { id } = req.params;
        const userId = +req.user.id;

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
                message: "Invalid ID",
            });

            return;
        }

        const paramId = +id;

        if (userId !== paramId) {
            res.status(403).json({
                status: "error",
                message: "You can only delete your own account",
            });

            return;
        }

        const tokenHash = hashToken(tempToken);

        const [sessions] = await pool.execute<
            (Pick<
                AccountDeletionSession,
                "id" | "user_id" | "method" | "attempts"
            > & { seconds_since_sent: number } & Pick<User, "email" | "name"> &
                RowDataPacket)[]
        >(
            `
                SELECT
                    s.id,
                    s.user_id,
                    s.method,
                    s.attempts,
                    TIMESTAMPDIFF(SECOND, s.last_sent_at, NOW()) AS seconds_since_sent,
                    u.email,
                    u.name
                FROM account_deletion_sessions s
                JOIN users u ON u.id = s.user_id
                WHERE s.token_hash = ? AND s.user_id = ?
            `,
            [tokenHash, paramId],
        );

        const session = sessions[0];

        if (!session || session.method !== "email") {
            res.status(401).json({
                status: "error",
                message: "Session expired. Please start again",
                data: { requiresRestart: true },
            });

            return;
        }

        if (session.seconds_since_sent < 60) {
            res.status(429).json({
                status: "error",
                message: "Please wait before requesting a new code",
                data: {
                    retryAfter: 60 - session.seconds_since_sent,
                },
            });

            return;
        }

        const code = generateEmailCode();

        await pool.execute(
            `
                UPDATE account_deletion_sessions
                SET code_hash = ?,
                    attempts = 0,
                    last_sent_at = NOW(),
                    expires_at = DATE_ADD(NOW(), INTERVAL ? MINUTE)
                WHERE id = ?
            `,
            [hashDeletionCode(paramId, code), 10, session.id],
        );

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: session.email,
            subject: `${code} - confirm ownership transfer`,
            html: emailTemplate({
                logo: "cid:app-logo",
                title: "Ownership transfer code",
                heading: `Hi, ${session.name}!`,
                description: `
                        Use this code to confirm transferring project ownership:
                        <br />
                        <p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p>
                        It expires in 10 minutes.
                    `,
                footer: "If this wasn't you, please change your password immediately and contact support.",
            }),
            attachments: [
                {
                    filename: "logo.png",
                    path: "./assets/generallogo.png",
                    cid: "app-logo",
                },
            ],
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                req.log.error(
                    {
                        err: error,
                        event: "email.delivery_failed",
                        operation: "initiateAccountDeletion",
                    },
                    "Operation failed",
                );

                if (!res.headersSent) {
                    res.status(500).send({
                        status: "error",
                        message: "Error sending email",
                    });
                }
            } else {
                req.log.debug(
                    {
                        event: "email.sent",
                        operation: "initiateAccountDeletion",
                    },
                    "Email accepted by transport",
                );
            }
        });

        res.status(200).json({
            status: "success",
            message: "A new verification code has been sent",
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                status: "error",
                message: "Invalid data",
                details: error.issues.map((issue) => ({
                    field: issue.path[0],
                    message: issue.message,
                })),
            });

            return;
        }

        req.log.error(
            {
                err: error,
                event: "user.resend_account_deletion_code_failed",
                operation: "resendAccountDeletionCode",
            },
            "Operation failed",
        );

        res.status(500).json({
            status: "error",
            message: "Server error while resending code",
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

        req.log.info(
            { event: "user.password_set", audit: true, userId },
            "Operation completed",
        );

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

        req.log.error(
            {
                err: error,
                event: "user.set_password_failed",
                operation: "setPassword",
            },
            "Operation failed",
        );

        res.status(500).json({
            status: "error",
            message: "Server error while setting password",
        });
    }
};
