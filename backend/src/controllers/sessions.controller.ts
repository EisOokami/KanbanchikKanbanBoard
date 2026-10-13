import type { Response } from "express";
import type { IGetUserRequest } from "../types/types.js";
import { errors as joseErrors } from "jose";
import { sessionIdSchema } from "../validation/validation.js";
import {
    listSessions,
    revokeOtherSessions,
    SessionError,
} from "../utils/session.js";

export const getSessions = async (
    req: IGetUserRequest,
    res: Response,
): Promise<void> => {
    try {
        const { id, sid } = req.user;

        if (!id || !sid) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        const sessions = await listSessions(id, sid);

        res.setHeader("Cache-Control", "no-store");
        res.status(200).json({
            status: "success",
            message: "Sessions found",
            data: sessions,
        });
    } catch (error) {
        if (error instanceof joseErrors.JOSEError) {
            res.status(401).json({
                status: "error",
                message: "Session expired. Please sign in again.",
            });

            return;
        }

        req.log.error(
            {
                err: error,
                event: "auth.sessions_failed",
                operation: "getSessions",
            },
            "Operation failed",
        );

        res.status(500).json({
            status: "error",
            message: "Server error during getting sessions",
        });
    }
};

export const deleteSessions = async (
    req: IGetUserRequest,
    res: Response,
): Promise<void> => {
    try {
        const { id, sid } = req.user;
        const { sessionId } = req.params;

        if (!id || !sid) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        if (
            sessionId !== undefined &&
            (typeof sessionId !== "string" ||
                !sessionIdSchema.safeParse(sessionId).success)
        ) {
            res.status(404).json({
                status: "error",
                message: "Session not found or already revoked",
            });

            return;
        }

        const result = await revokeOtherSessions(id, sid, sessionId);

        req.log.info(
            {
                event: sessionId
                    ? "auth.session_revoked"
                    : "auth.other_sessions_revoked",
                audit: true,
                userId: id,
                ip: req.ip,
                ...result,
            },
            "Sessions revoked",
        );

        res.status(200).json({
            status: "success",
            message: sessionId ? "Session revoked" : "Other sessions revoked",
            data: { revokedCount: result.revokedCount },
        });
    } catch (error) {
        if (error instanceof SessionError) {
            res.status(error.status).json({
                status: "error",
                message: error.message,
            });

            return;
        }

        if (error instanceof joseErrors.JOSEError) {
            res.status(401).json({
                status: "error",
                message: "Session expired. Please sign in again.",
            });

            return;
        }

        req.log.error(
            {
                err: error,
                event: "auth.sessions_revoke_failed",
                operation: "deleteSessions",
            },
            "Operation failed",
        );

        res.status(500).json({
            status: "error",
            message: "Server error during revoking sessions",
        });
    }
};
