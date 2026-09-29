import type { Response, Request } from "express";
import { ZodError } from "zod";
import QRCode from "qrcode";
import { OTP } from "otplib";
import type {
    IGetUserRequest,
    MfaBackupCode,
    MfaLoginSession,
    User,
} from "../types/types.js";
import { pool } from "../db/pool.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import {
    decryptMfaSecret,
    encryptMfaSecret,
    generateBackupCode,
    hashToken,
} from "../utils/mfa.js";
import {
    mfaBackupCodesSchema,
    mfaDisableSchema,
    mfaEnableSchema,
    mfaVerifySchema,
} from "../validation/validation.js";
import { generateCsrfToken } from "../utils/csrf.js";
import { createAccessToken, createRefreshToken } from "../utils/jwt.js";
import bcrypt from "bcryptjs";
import { sendLoginNotificationEmail } from "../utils/loginNotificationEmail.js";

const otp = new OTP({ strategy: "totp" });

export const setupMfa = async (
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

        const [rows] = await pool.execute<
            (Pick<User, "id" | "email" | "mfa_enabled"> & RowDataPacket)[]
        >("SELECT id, email, mfa_enabled FROM users WHERE id = ?", [userId]);

        const user = rows[0];

        if (!user) {
            res.status(404).json({
                status: "error",
                message: "User not found",
            });

            return;
        }

        if (user.mfa_enabled) {
            res.status(400).json({
                status: "error",
                message: "MFA is already enabled",
            });

            return;
        }

        const secret = otp.generateSecret();
        const encryptedSecret = encryptMfaSecret(secret);

        const [result] = await pool.execute<ResultSetHeader>(
            "UPDATE users SET mfa_secret = ? WHERE id = ?",
            [encryptedSecret, userId],
        );

        if (result.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to setup mfa",
            });

            return;
        }

        const otpauthUri = otp.generateURI({
            issuer: "Kabanchik",
            label: user.email,
            secret,
        });
        const qrCodeDataUrl = await QRCode.toDataURL(otpauthUri);

        res.status(200).json({
            status: "success",
            message: "Scan the QR code with your authenticator app",
            data: {
                qrCode: qrCodeDataUrl,
                manualEntryKey: secret,
            },
        });
    } catch (error) {
        console.error("MFA setup error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error during MFA setup",
        });
    }
};

export const enableMfa = async (
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

        const validateData = mfaEnableSchema.parse(req.body);
        const { token } = validateData;

        const [rows] = await pool.execute<
            (Pick<User, "id" | "mfa_secret" | "mfa_enabled"> & RowDataPacket)[]
        >("SELECT id, mfa_secret, mfa_enabled FROM users WHERE id = ?", [
            userId,
        ]);

        const user = rows[0];

        if (!user || !user.mfa_secret) {
            res.status(400).json({
                status: "error",
                message: "MFA setup was not initiated. Call /mfa/setup first",
            });

            return;
        }

        if (user.mfa_enabled) {
            res.status(400).json({
                status: "error",
                message: "MFA is already enabled",
            });

            return;
        }

        const decryptedSecret = decryptMfaSecret(user.mfa_secret);

        const { valid } = await otp.verify({
            token,
            secret: decryptedSecret,
            epochTolerance: 1,
        });

        if (!valid) {
            res.status(401).json({
                status: "error",
                message: "Invalid verification code",
            });

            return;
        }

        const [result] = await pool.execute<ResultSetHeader>(
            "UPDATE users SET mfa_enabled = TRUE, mfa_enabled_at = NOW() WHERE id = ?",
            [userId],
        );

        if (result.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to enable mfa",
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "MFA has been enabled",
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

        console.error("MFA enable error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error during MFA enable",
        });
    }
};

export const verifyMfa = async (req: Request, res: Response): Promise<void> => {
    try {
        const validateData = mfaVerifySchema.parse(req.body);
        const { tempToken, token } = validateData;

        const tempTokenHash = hashToken(tempToken);

        const [sessionRows] = await pool.execute<
            (Pick<
                MfaLoginSession,
                "id" | "user_id" | "attempts" | "expires_at"
            > &
                RowDataPacket)[]
        >(
            `
                SELECT 
                    id, 
                    user_id, 
                    attempts, 
                    expires_at 
                FROM mfa_login_sessions 
                WHERE token_hash = ?
            `,
            [tempTokenHash],
        );

        const session = sessionRows[0];

        if (!session) {
            res.status(401).json({
                status: "error",
                message: "Invalid or expired session, please log in again",
            });

            return;
        }

        if (new Date(session.expires_at).getTime() < Date.now()) {
            await pool.execute<ResultSetHeader>(
                "DELETE FROM mfa_login_sessions WHERE id = ?",
                [session.id],
            );

            res.status(401).json({
                status: "error",
                message: "Session expired, please log in again",
            });

            return;
        }

        if (session.attempts >= 5) {
            await pool.execute<ResultSetHeader>(
                "DELETE FROM mfa_login_sessions WHERE id = ?",
                [session.id],
            );

            res.status(429).json({
                status: "error",
                message: "Too many attempts, please log in again",
            });

            return;
        }

        const [userRows] = await pool.execute<
            (Pick<
                User,
                "id" | "name" | "surname" | "email" | "avatar_url" | "color"
            > &
                RowDataPacket & { mfa_secret: Buffer | null })[]
        >(
            `
                SELECT 
                    id, 
                    name, 
                    surname, 
                    email, 
                    avatar_url, 
                    color, 
                    mfa_secret 
                FROM users 
                WHERE id = ?
            `,
            [session.user_id],
        );

        const user = userRows[0];

        if (!user || !user.mfa_secret) {
            res.status(401).json({
                status: "error",
                message: "Invalid or expired session, please log in again",
            });

            return;
        }

        const isTotpFormat = /^\d{6}$/.test(token);
        let isValid = false;

        if (isTotpFormat) {
            const decryptedSecret = decryptMfaSecret(user.mfa_secret);

            const result = await otp.verify({
                token,
                secret: decryptedSecret,
                epochTolerance: 1,
            });

            isValid = result.valid;
        } else {
            const codeHash = hashToken(token.toUpperCase());

            const [backupRows] = await pool.execute<
                (Pick<MfaBackupCode, "id"> & RowDataPacket)[]
            >(
                `
                    SELECT id 
                    FROM mfa_backup_codes
                    WHERE user_id = ? AND code_hash = ? AND used_at IS NULL
                `,
                [user.id, codeHash],
            );

            if (backupRows[0]) {
                isValid = true;

                const [result] = await pool.execute<ResultSetHeader>(
                    "UPDATE mfa_backup_codes SET used_at = NOW() WHERE id = ?",
                    [backupRows[0].id],
                );

                if (result.affectedRows === 0) {
                    res.status(400).json({
                        status: "error",
                        message: "Failed to verify backup code",
                    });

                    return;
                }
            }
        }

        if (!isValid) {
            await pool.execute<ResultSetHeader>(
                "UPDATE mfa_login_sessions SET attempts = attempts + 1 WHERE id = ?",
                [session.id],
            );

            res.status(401).json({
                status: "error",
                message: "Invalid verification code",
            });

            return;
        }

        const [result] = await pool.execute<ResultSetHeader>(
            "DELETE FROM mfa_login_sessions WHERE id = ?",
            [session.id],
        );

        if (result.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to delete mfa login session",
            });

            return;
        }

        const accessToken = await createAccessToken({
            id: user.id,
        });
        const refreshToken = await createRefreshToken(
            user.id,
            req.ip,
            req.headers["user-agent"],
        );
        const csrfToken = generateCsrfToken();

        res.cookie("csrfToken", csrfToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            status: "success",
            message: "User logged in successfully",
            accessToken,
            refreshToken,
        });

        sendLoginNotificationEmail(user, req).catch((error) => {
            console.error("Login notification email error:", error);
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

        console.error("MFA verify error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error during MFA verification",
        });
    }
};

export const disableMfa = async (
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

        const validateData = mfaDisableSchema.parse(req.body);
        const { password, token } = validateData;

        const [rows] = await pool.execute<
            (Pick<User, "id" | "password" | "mfa_enabled" | "mfa_secret"> &
                RowDataPacket)[]
        >(
            "SELECT id, password, mfa_enabled, mfa_secret FROM users WHERE id = ?",
            [userId],
        );

        const user = rows[0];

        if (!user || !user.password) {
            res.status(404).json({
                status: "error",
                message: "User not found",
            });

            return;
        }

        if (!user.mfa_enabled) {
            res.status(400).json({
                status: "error",
                message: "MFA is not enabled",
            });

            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({
                status: "error",
                message: "Invalid password",
            });

            return;
        }

        if (token) {
            if (!user.mfa_secret) {
                res.status(400).json({
                    status: "error",
                    message: "MFA secret not found",
                });

                return;
            }

            const decryptedSecret = decryptMfaSecret(user.mfa_secret);

            const { valid } = await otp.verify({
                token,
                secret: decryptedSecret,
                epochTolerance: 1,
            });

            if (!valid) {
                res.status(401).json({
                    status: "error",
                    message: "Invalid verification code",
                });

                return;
            }
        }

        const [mfaResult] = await pool.execute<ResultSetHeader>(
            `
                UPDATE users
                SET 
                    mfa_enabled = FALSE, 
                    mfa_secret = NULL, 
                    mfa_enabled_at = NULL
                WHERE id = ?
            `,
            [userId],
        );

        if (mfaResult.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to disable mfa",
            });

            return;
        }

        const [backupCodesResult] = await pool.execute<ResultSetHeader>(
            "DELETE FROM mfa_backup_codes WHERE user_id = ?",
            [userId],
        );

        if (backupCodesResult.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to delete backup codes",
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "MFA has been disabled",
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

        console.error("MFA disable error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error during MFA disable",
        });
    }
};

export const regenerateBackupCodes = async (
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

        const validateData = mfaBackupCodesSchema.parse(req.body);
        const { password } = validateData;

        const [rows] = await pool.execute<
            (Pick<User, "id" | "password" | "mfa_enabled"> & RowDataPacket)[]
        >("SELECT id, password, mfa_enabled FROM users WHERE id = ?", [userId]);

        const user = rows[0];

        if (!user || !user.password) {
            res.status(404).json({
                status: "error",
                message: "User not found",
            });

            return;
        }

        if (!user.mfa_enabled) {
            res.status(400).json({
                status: "error",
                message: "MFA is not enabled",
            });

            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({
                status: "error",
                message: "Invalid password",
            });

            return;
        }

        const rawCodes = Array.from({ length: 10 }, () => generateBackupCode());
        const hashedCodes = rawCodes.map(hashToken);

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            await connection.execute<ResultSetHeader>(
                "DELETE FROM mfa_backup_codes WHERE user_id = ?",
                [userId],
            );

            const placeholders = hashedCodes.map(() => "(?, ?)").join(", ");
            const flatValues = hashedCodes.flatMap((hash) => [userId, hash]);

            await connection.execute<ResultSetHeader>(
                `INSERT INTO mfa_backup_codes (user_id, code_hash) VALUES ${placeholders}`,
                flatValues,
            );

            await connection.commit();
        } catch (transactionError) {
            await connection.rollback();

            throw transactionError;
        } finally {
            connection.release();
        }

        res.status(200).json({
            status: "success",
            message: "Backup codes have been regenerated",
            data: {
                backupCodes: rawCodes,
            },
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

        console.error("Regenerate backup codes error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error during backup codes regeneration",
        });
    }
};
