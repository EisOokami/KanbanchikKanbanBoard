import type { Request, Response } from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { pool } from "../db/pool";
import {
    forgotPasswordSchema,
    loginSchema,
    registerSchema,
    resetPasswordSchema,
} from "../validation/validation";
import { ZodError } from "zod";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { transporter } from "../utils/email";
import {
    createAccessToken,
    createRefreshToken,
    revokeAllUserTokens,
} from "../utils/jwt";
import { jwtVerify } from "jose";
import type { RefreshTokens, User } from "../types/types";

dotenv.config();

const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const validateData = registerSchema.parse(req.body);

        const { name, surname, email, password, color, avatar_url } =
            validateData;

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

        const [result] = await pool.execute<ResultSetHeader>(
            `
                INSERT INTO users (name, surname, email, password, avatar_url, color)
                VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                name,
                surname,
                email,
                hashedPassword,
                avatar_url || null,
                color || "#cccccc",
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
                SELECT id, name, surname, email, avatar_url, color, created_at
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

        const accessToken = await createAccessToken({ id: user.id });
        const refreshToken = await createRefreshToken(user.id.toString());

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Welcome!",
            text: `Hi ${name}, welcome! Your account has been created successfully.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Welcome email error:", error);
            } else {
                console.log(`Welcome email sent: ${info.response}`);
            }
        });

        res.status(201).json({
            status: "success",
            message: "User registered successfully",
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

        console.error("Registration error:", error);
        res.status(500).json({
            status: "error",
            message: "Server error during registration",
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
            > &
                RowDataPacket)[]
        >(
            "SELECT id, name, surname, email, password, avatar_url, color FROM users WHERE email = ?",
            [email],
        );

        const user = rows[0];

        if (!user) {
            res.status(401).json({
                status: "error",
                message: "Invalid email or password",
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

        const accessToken = await createAccessToken({
            id: user.id,
        });
        const refreshToken = await createRefreshToken(user.id.toString());

        res.status(200).json({
            status: "success",
            message: "Login successful",
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

        const resetLink = `${process.env.WEB_URL}/resetPassword?token=${token}&id=${user.id}`;

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

        if (!currentUser || !currentUser[0]) {
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

        await revokeAllUserTokens(id.toString());

        const accessToken = await createAccessToken({
            id: user.id,
        });
        const refreshToken = await createRefreshToken(user.id.toString());

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
            message: "Password Reset successfully",
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
        // const validateData = refreshTokenSchema.parse(req.body);

        // const { refreshToken } = validateData;

        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            res.status(401).json({
                status: "error",
                message: "Invalid token",
            });

            return;
        }

        const { payload } = await jwtVerify(refreshToken, refreshSecret);
        const jti = payload.jti;
        const userId = payload.sub;

        const [refreshTokenRows] = await pool.execute<RefreshTokens[]>(
            "SELECT * FROM refresh_tokens WHERE id = ?",
            [jti ?? null],
        );

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Invalid token",
            });

            return;
        }

        if (!refreshTokenRows.length) {
            await revokeAllUserTokens(userId);

            res.status(401).json({
                status: "error",
                message: "Invalid token",
            });

            return;
        }

        const storedToken = refreshTokenRows[0];

        if (!storedToken) {
            await revokeAllUserTokens(userId);

            res.status(401).json({
                status: "error",
                message: "Invalid token",
            });

            return;
        }

        if (storedToken.revoked) {
            await revokeAllUserTokens(userId);

            res.status(401).json({
                status: "error",
                message: "Invalid token",
            });

            return;
        }

        const [result] = await pool.execute<ResultSetHeader>(
            "UPDATE refresh_tokens SET revoked = true WHERE id = ?",
            [jti ?? null],
        );

        if (result.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Invalid token",
            });

            return;
        }

        const newAccessToken = await createAccessToken({ id: userId });
        const newRefreshToken = await createRefreshToken(userId);

        res.status(201).json({
            status: "success",
            message: "Token is refresh",
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
        // const validateData = refreshTokenSchema.parse(req.body);

        // const { refreshToken } = validateData;

        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            res.status(401).json({
                status: "error",
                message: "Invalid token",
            });

            return;
        }

        const { payload } = await jwtVerify(refreshToken, refreshSecret);

        const [result] = await pool.execute<ResultSetHeader>(
            "UPDATE refresh_tokens SET revoked = true WHERE id = ?",
            [payload.jti ?? null],
        );

        if (result.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to reset password",
            });

            return;
        }

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
