import { errors as joseErrors } from "jose";
import type { NextFunction, Response } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import type { IGetUserRequest } from "../types/types.js";

export async function authenticateToken(
    req: IGetUserRequest,
    res: Response,
    next: NextFunction,
) {
    try {
        const authHeader = req.headers["authorization"];
        const token =
            typeof authHeader === "string"
                ? authHeader.split(" ")[1]
                : undefined;

        if (!token) {
            res.setHeader("WWW-Authenticate", "Bearer");

            return res
                .status(401)
                .json({ status: "error", message: "Token missing" });
        }

        const refreshToken: unknown = req.cookies?.refreshToken;
        const { payload } = await verifyAccessToken(
            token,
            typeof refreshToken === "string" ? refreshToken : undefined,
        );
        req.user = payload;

        req.log = req.log.child({
            userId: typeof payload.id === "number" ? payload.id : undefined,
        });

        next();
    } catch (error) {
        if (error instanceof joseErrors.JOSEError) {
            req.log.warn(
                {
                    audit: true,
                    event: "auth.token_rejected",
                    reason: "invalid_or_expired",
                },
                "Access token rejected",
            );
        } else {
            req.log.error(
                { err: error, event: "auth.token_verification_failed" },
                "Token verification failed unexpectedly",
            );

            res.status(500).json({
                status: "error",
                message: "Internal server error",
            });

            return;
        }

        res.setHeader("WWW-Authenticate", 'Bearer error="invalid_token"');

        res.status(401).json({
            status: "error",
            message: "Invalid or expired token",
        });
    }
}
