import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { requestRoute } from "../utils/logger.js";

export function errorMiddleware(
    error: unknown,
    req: Request,
    res: Response,
    _next: NextFunction,
) {
    const errorMessage = error instanceof Error ? error.message : "";

    const uploadRejected =
        error instanceof MulterError ||
        [
            "Invalid file type",
            "File rejection: Filename exceeds 50 characters.",
            "Filename is too long. Maximum length is 50 characters.",
        ].includes(errorMessage);

    const status =
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof error.status === "number" &&
        Number.isInteger(error.status) &&
        error.status >= 400 &&
        error.status < 500
            ? error.status
            : undefined;

    const clientError =
        uploadRejected ||
        status !== undefined ||
        (error instanceof Error && error.name === "ZodError");

    if (uploadRejected) {
        req.log.warn(
            {
                audit: true,
                event: "upload.rejected",
                reason:
                    error instanceof MulterError ? error.code : "invalid_file",
                route: requestRoute(req),
            },
            "Upload rejected",
        );
    }

    if (!clientError) {
        req.log.error(
            { err: error, event: "request.failed", route: requestRoute(req) },
            "Unhandled request failure",
        );
    }

    if (res.headersSent) {
        res.destroy();

        return;
    }

    res.status(clientError ? (status ?? 400) : 500).json({
        status: "error",
        message: uploadRejected
            ? errorMessage
            : clientError
              ? "Invalid request"
              : "Internal server error",
    });
}
