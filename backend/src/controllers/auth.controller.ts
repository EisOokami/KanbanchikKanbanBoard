import type { Request, Response } from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { pool } from "../db/pool";
import {
    forgotPasswordSchema,
    loginSchema,
    registerSchema,
    resendVerificationSchema,
    resetPasswordSchema,
} from "../validation/validation";
import { ZodError } from "zod";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { transporter } from "../utils/email";
import {
    createAccessToken,
    createRefreshToken,
    revokeAllUserSessions,
    revokeSession,
    rotateRefreshToken,
    verifyRefreshToken,
} from "../utils/jwt";
import { jwtVerify, type JWTPayload } from "jose";
import type { User } from "../types/types";
import { generateCsrfToken } from "../utils/csrf";
import {
    exchangeCodeForProfile,
    findOrCreateGoogleUser,
    getGoogleAuthUrl,
} from "../utils/googleAuth";
import { generateRawToken, hashToken } from "../utils/mfa";

dotenv.config();

const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const validateData = registerSchema.parse(req.body);

        const { name, surname, email, password, color } = validateData;

        const [existingEmailUser] = await pool.execute<
            (Pick<User, "id"> & RowDataPacket)[]
        >("SELECT id FROM users WHERE email = ?", [email]);

        if (existingEmailUser.length) {
            res.status(409).json({
                status: "error",
                message: "Email already in use",
            });

            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const [result] = await pool.execute<ResultSetHeader>(
            `
                INSERT INTO users 
                    (
                        name, 
                        surname, 
                        email, 
                        password, 
                        color,
                        is_verified, 
                        verification_token, 
                        verification_token_expires
                    )
                VALUES (?, ?, ?, ?, ?, FALSE, ?, ?)
            `,
            [
                name,
                surname,
                email,
                hashedPassword,
                color || "#cccccc",
                verificationToken,
                verificationExpires,
            ],
        );

        if (result.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to register",
            });

            return;
        }

        const userId = result.insertId;

        const [rows] = await pool.execute<
            (Pick<
                User,
                | "id"
                | "name"
                | "surname"
                | "email"
                | "avatar_url"
                | "color"
                | "created_at"
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
                    is_verified
                FROM users
                WHERE id = ?
            `,
            [userId],
        );

        const user = rows[0];

        if (!user) {
            res.status(400).json({
                status: "error",
                message: "Failed to retrieve user",
            });

            return;
        }

        const verificationUrl = `${process.env.FRONTEND_URL}/verifyEmail?token=${verificationToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Welcome! Activate your account",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px;">
                    <table style="width: 100%; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <tr>
                            <td style="text-align: center; color: #333333;">
                                <h1 style="color: #2c3e50;">Welcome, ${name}!</h1>
                                <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                                    Thank you for registering with us. To complete your setup and activate your account, please verify your email address by clicking the button below.
                                </p>
                                <p style="margin: 30px 0;">
                                    <a href="${verificationUrl}" style="background-color: #007bff; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                        Activate Account
                                    </a>
                                </p>
                                <p style="font-size: 14px; color: #888888;">
                                    If the button above doesn't work, copy and paste this link into your browser:<br>
                                    <a href="${verificationUrl}" style="color: #007bff; word-break: break-all;">${verificationUrl}</a>
                                </p>
                                <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 30px 0;">
                                <p style="font-size: 12px; color: #aaaaaa;">
                                    This link is valid for 24 hours. If you didn't request this, please ignore this email.
                                </p>
                            </td>
                        </tr>
                    </table>
                </div>
            `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Verification email error:", error);
            } else {
                console.log(`Verification email sent: ${info.response}`);
            }
        });

        res.status(201).json({
            status: "success",
            message:
                "User has been successfully registered. Please check your email to verify your account.",
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

        console.error("Registration error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error during registration",
        });
    }
};

export const verifyEmail = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const token = req.query.token;

        if (!token) {
            res.status(400).json({
                status: "error",
                message: "Verification token is required",
            });

            return;
        }

        const [rows] = await pool.execute<
            (Pick<User, "id" | "is_verified" | "verification_token_expires"> &
                RowDataPacket)[]
        >(
            `
                SELECT id, is_verified, verification_token_expires
                FROM users
                WHERE verification_token = ?
            `,
            [token],
        );

        const user = rows[0];

        if (!user) {
            res.status(400).json({
                status: "error",
                message: "Invalid verification token",
            });

            return;
        }

        if (user.is_verified) {
            res.status(200).json({
                status: "success",
                message: "Email already verified",
            });

            return;
        }

        if (
            !user.verification_token_expires ||
            new Date(user.verification_token_expires) < new Date()
        ) {
            res.status(400).json({
                status: "error",
                message: "Verification token has expired",
            });

            return;
        }

        await pool.execute<ResultSetHeader>(
            `
                UPDATE users
                SET is_verified = TRUE,
                    verification_token = NULL,
                    verification_token_expires = NULL
                WHERE id = ?
            `,
            [user.id],
        );

        res.status(200).json({
            status: "success",
            message: "Email successfully verified. You can now log in.",
        });
    } catch (error) {
        console.error("Email verification error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error during email verification",
        });
    }
};

export const resendVerificationEmail = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { email } = resendVerificationSchema.parse(req.body);

        const [rows] = await pool.execute<
            (Pick<User, "id" | "name" | "email" | "is_verified"> &
                RowDataPacket)[]
        >(
            `
                SELECT id, name, email, is_verified
                FROM users
                WHERE email = ?
            `,
            [email],
        );

        const user = rows[0];

        if (!user) {
            res.status(200).json({
                status: "success",
                message:
                    "If this email is registered and not verified, a new verification link has been sent.",
            });

            return;
        }

        if (user.is_verified) {
            res.status(200).json({
                status: "success",
                message:
                    "If this email is registered and not verified, a new verification link has been sent.",
            });

            return;
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await pool.execute<ResultSetHeader>(
            `
                UPDATE users
                SET verification_token = ?,
                    verification_token_expires = ?
                WHERE id = ?
            `,
            [verificationToken, verificationExpires, user.id],
        );

        const verificationUrl = `${process.env.FRONTEND_URL}/verifyEmail?token=${verificationToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Confirm your email address",
            html: `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
                    <table align="center" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <tr>
                            <td style="padding: 40px 30px; text-align: center; background-color: #ffffff; border-bottom: 1px solid #eeeeee;">
                                <h1 style="margin: 0; color: #333333; font-size: 24px;">Confirm your email</h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 40px 30px; color: #555555; line-height: 1.6;">
                                <p style="margin: 0 0 20px 0; font-size: 16px;">Hello <strong>${user.name}</strong>,</p>
                                <p style="margin: 0 0 30px 0; font-size: 16px;">
                                    We received a request to activate your account. Please click the button below to confirm your email address.
                                </p>
                                <table align="center" cellpadding="0" cellspacing="0" style="margin: 30px auto;">
                                    <tr>
                                        <td align="center" bgcolor="#007bff" style="border-radius: 5px;">
                                            <a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; text-decoration: none; color: #ffffff; font-size: 16px; font-weight: bold; border-radius: 5px; background-color: #007bff;">
                                                Activate Account
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                <p style="margin: 30px 0 10px 0; font-size: 14px; color: #888888;">
                                    Or copy and paste this link into your browser:<br>
                                    <a href="${verificationUrl}" style="color: #007bff; word-break: break-all;">${verificationUrl}</a>
                                </p>
                                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 30px; border: 1px solid #eeeeee;">
                                    <p style="margin: 0; font-size: 14px; color: #666666;">
                                        <strong>Note:</strong> This link is valid for 24 hours. If you did not request this activation, please ignore this email.
                                    </p>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px; text-align: center; background-color: #f4f4f4; border-top: 1px solid #eeeeee;">
                                <p style="margin: 0; font-size: 12px; color: #999999;">
                                    &copy; 2026 Your Company Name. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </div>
            `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Resend verification email error:", error);
            } else {
                console.log(`Verification email resent: ${info.response}`);
            }
        });

        res.status(200).json({
            status: "success",
            message:
                "If this email is registered and not verified, a new verification link has been sent.",
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

        console.error("Resend verification error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error while resending verification email",
        });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const validateData = loginSchema.parse(req.body);

        const { email, password } = validateData;

        const [rows] = await pool.execute<
            (Pick<
                User,
                | "id"
                | "name"
                | "surname"
                | "email"
                | "password"
                | "avatar_url"
                | "color"
                | "auth_provider"
                | "mfa_enabled"
                | "is_verified"
            > &
                RowDataPacket)[]
        >(
            `
                SELECT 
                    id, 
                    name,
                    surname, 
                    email, 
                    password, 
                    avatar_url, 
                    color, 
                    auth_provider,
                    mfa_enabled,
                    is_verified
                FROM users 
                WHERE email = ?
            `,
            [email],
        );

        const user = rows[0];

        if (!user || user.auth_provider === "google" || !user.password) {
            res.status(401).json({
                status: "error",
                message: "Invalid email or password",
            });

            return;
        }

        if (!user.is_verified) {
            res.status(403).json({
                status: "error",
                message: "Please verify your email before logging in",
                data: {
                    requiresVerification: true,
                },
            });

            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({
                status: "error",
                message: "Invalid email or password",
            });

            return;
        }

        if (user.mfa_enabled) {
            const rawTempToken = generateRawToken();
            const tempTokenHash = hashToken(rawTempToken);

            await pool.execute<ResultSetHeader>(
                `
                    INSERT INTO mfa_login_sessions 
                        (
                            token_hash, 
                            user_id, 
                            ip_address, 
                            user_agent, 
                            expires_at
                        )
                    VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))
                `,
                [
                    tempTokenHash,
                    user.id,
                    req.ip ?? null,
                    req.headers["user-agent"] ?? null,
                ],
            );

            res.status(200).json({
                status: "success",
                message: "MFA verification required",
                requiresMfa: true,
                tempToken: rawTempToken,
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

        console.error("Login error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error during login",
        });
    }
};

export const forgotPassword = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const validateData = forgotPasswordSchema.parse(req.body);

        const { email } = validateData;

        const [rows] = await pool.execute<
            (Pick<User, "id" | "name"> & RowDataPacket)[]
        >("SELECT id, name FROM users WHERE email = ?", [email]);

        const user = rows[0];

        if (!user) {
            res.status(200).json({
                status: "success",
                message:
                    "If this email exists, you will receive reset instructions",
            });

            return;
        }

        const token = crypto.randomBytes(32).toString("hex");
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(token, salt);

        const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
            .toISOString()
            .slice(0, 19)
            .replace("T", " ");

        const [result] = await pool.execute<ResultSetHeader>(
            "UPDATE users SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?",
            [hash, expiresAt, user.id],
        );

        if (result.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Something went wrong... Try again",
            });

            return;
        }

        const resetLink = `${process.env.FRONTEND_URL}/resetPassword?token=${token}&id=${user.id}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Request",
            html: `
                <h2>Password Reset</h2>
                <p>Hi ${user.name},</p>
                <p>You requested to reset your password. Click the link below:</p>
                <a href="${resetLink}" style="
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #0096FF;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                ">Reset Password</a>
                <p>This link will expire in <strong>1 hour</strong>.</p>
                <p>If you did not request a password reset, please ignore this email.</p>
            `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Email error:", error);
                res.status(500).json({
                    status: "error",
                    message: "Error sending email",
                });
            } else {
                console.log(`Reset email sent: ${info.response}`);
                res.status(200).json({
                    status: "success",
                    message:
                        "If this email exists, you will receive reset instructions",
                });
            }
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

        console.error("Error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
};

export const resetPassword = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const validateData = resetPasswordSchema.parse(req.body);

        const { token, password, id } = validateData;

        const [rows] = await pool.execute<
            (Pick<User, "id" | "email" | "name" | "reset_token"> &
                RowDataPacket)[]
        >("SELECT id, email, name, reset_token FROM users WHERE id = ?", [id]);

        if (!rows.length) {
            res.status(401).json({
                status: "error",
                message: "Invalid or expired password reset token",
            });

            return;
        }

        const user = rows[0];

        if (!user || !user.reset_token) {
            res.status(400).json({
                status: "error",
                message: "Invalid or expired password reset token",
            });

            return;
        }

        if (
            user.reset_token_expires_at &&
            new Date(user.reset_token_expires_at) < new Date()
        ) {
            await pool.execute(
                "UPDATE users SET reset_token = NULL, reset_token_expires_at = NULL WHERE id = ?",
                [id],
            );

            res.status(401).json({
                status: "error",
                message: "Password reset token has expired",
            });

            return;
        }

        const isTokenValid = await bcrypt.compare(token, user.reset_token);

        if (!isTokenValid) {
            res.status(401).json({
                status: "error",
                message: "Invalid or expired password reset token",
            });

            return;
        }

        const [currentUser] = await pool.execute<
            (Pick<User, "password"> & RowDataPacket)[]
        >("SELECT password FROM users WHERE id = ?", [id]);

        if (!currentUser || !currentUser[0] || !currentUser[0].password) {
            res.status(401).json({
                status: "error",
                message: "Failed to retrieve user",
            });

            return;
        }

        const isSamePassword = await bcrypt.compare(
            password,
            currentUser[0].password,
        );

        if (isSamePassword) {
            res.status(400).json({
                status: "error",
                message: "New password must be different from current password",
            });

            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await pool.execute<ResultSetHeader>(
            `
                UPDATE users
                SET
                    password = ?,
                    reset_token = NULL,
                    reset_token_expires_at = NULL,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `,
            [hashedPassword, id],
        );

        if (result.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to reset password",
            });

            return;
        }

        await revokeAllUserSessions(user.id);

        const accessToken = await createAccessToken({
            id: user.id,
        });
        const refreshToken = await createRefreshToken(
            user.id,
            req.ip,
            req.headers["user-agent"],
        );

        if (!refreshToken) {
            res.status(500).json({
                status: "error",
                message: "Failed to create session",
            });

            return;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset Successfully",
            html: `
                <h2>Password Changed</h2>
                <p>Hi ${user.name},</p>
                <p>Your password has been changed successfully.</p>
                <p>If you did not make this change, please contact support immediately.</p>
            `,
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

        res.status(201).json({
            status: "success",
            message: "The password has been successfully reset",
            accessToken,
            refreshToken,
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

        console.error("Error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            res.status(401).json({
                status: "error",
                message: "Invalid token",
            });

            return;
        }

        let payload: JWTPayload;
        let session: RowDataPacket;

        try {
            ({ payload, session } = await verifyRefreshToken(refreshToken));
        } catch {
            res.status(401).json({
                status: "error",
                message: "Invalid token",
            });

            return;
        }

        const userId = payload.sub;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Invalid token",
            });

            return;
        }

        const newRefreshToken = await rotateRefreshToken(
            refreshToken,
            req.ip,
            req.headers["user-agent"],
        );

        if (!newRefreshToken) {
            res.status(500).json({
                status: "error",
                message: "Failed to refresh session",
            });

            return;
        }

        const newAccessToken = await createAccessToken({ id: +userId });
        const csrfToken = generateCsrfToken();

        res.cookie("csrfToken", csrfToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            status: "success",
            message: "The token has been updated",
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessages = error.issues.map((issue: any) => ({
                field: issue.path[0],
                message: issue.message,
            }));

            res.status(400).json({
                status: "error",
                message: "Invalid token",
                details: errorMessages,
            });

            return;
        }

        console.error("Error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            res.status(401).json({
                status: "error",
                message: "Invalid token",
            });

            return;
        }

        const { payload } = await jwtVerify(refreshToken, refreshSecret);

        const sid = payload.sid;

        if (!sid || typeof sid !== "string") {
            res.status(401).json({
                status: "error",
                message: "Invalid token",
            });

            return;
        }

        await revokeSession(sid);

        res.clearCookie("refreshToken");
        res.clearCookie("csrfToken");

        res.status(201).json({
            status: "success",
            message: "Logout successfully",
        });
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessages = error.issues.map((issue: any) => ({
                field: issue.path[0],
                message: issue.message,
            }));

            res.status(400).json({
                status: "error",
                message: "Invalid token",
                details: errorMessages,
            });

            return;
        }

        console.error("Error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
};

export function googleAuthStart(req: Request, res: Response) {
    const state = crypto.randomUUID();

    res.cookie("google_oauth_state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 5 * 60 * 1000,
    });

    const url = getGoogleAuthUrl(state);

    res.redirect(url);
}

export async function googleAuthCallback(req: Request, res: Response) {
    try {
        const { code, state } = req.query;
        const savedState = req.cookies?.google_oauth_state;

        res.clearCookie("google_oauth_state");

        if (
            !code ||
            typeof code !== "string" ||
            !state ||
            state !== savedState
        ) {
            res.redirect(
                `${process.env.FRONTEND_URL}/signIn?error=oauth_state_mismatch`,
            );

            return;
        }

        const profile = await exchangeCodeForProfile(code);

        if (!profile.emailVerified) {
            res.redirect(
                `${process.env.FRONTEND_URL}/signIn?error=email_not_verified`,
            );

            return;
        }

        const userId = await findOrCreateGoogleUser(profile);
        const exchangeCode = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60_000);

        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO oauth_exchange_codes (code, user_id, expires_at) VALUES (?, ?, ?)`,
            [exchangeCode, userId, expiresAt],
        );

        if (result.affectedRows === 0) {
            res.redirect(
                `${process.env.FRONTEND_URL}/signIn?error=oauth_failed`,
            );

            return;
        }

        return res.redirect(
            `${process.env.FRONTEND_URL}/callback?code=${exchangeCode}`,
        );
    } catch (error) {
        console.error("Error:", error);
        return res.redirect(
            `${process.env.FRONTEND_URL}/signIn?error=oauth_failed`,
        );
    }
}

export async function googleAuthExchange(req: Request, res: Response) {
    try {
        const { code } = req.body;

        if (!code || typeof code !== "string") {
            res.status(400).json({ status: "error", message: "Missing code" });

            return;
        }

        const [rows] = await pool.execute<RowDataPacket[]>(
            `
            SELECT * FROM oauth_exchange_codes
            WHERE code = ? AND used_at IS NULL AND expires_at > NOW()
        `,
            [code],
        );

        const record = rows[0];

        if (!record) {
            res.status(400).json({
                status: "error",
                message: "Invalid or expired code",
            });

            return;
        }

        const [result] = await pool.execute<ResultSetHeader>(
            `UPDATE oauth_exchange_codes SET used_at = NOW() WHERE code = ?`,
            [code],
        );

        if (result.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Something went wrong... Try again",
            });

            return;
        }

        const userId = record.user_id;
        const refreshToken = await createRefreshToken(
            userId,
            req.ip,
            req.headers["user-agent"],
        );

        if (!refreshToken) {
            res.status(500).json({
                status: "error",
                message: "Failed to create session",
            });

            return;
        }

        const accessToken = await createAccessToken({ id: userId });
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
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
}
