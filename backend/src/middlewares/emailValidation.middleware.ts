import type { NextFunction, Request, Response } from "express";
import MailChecker from "mailchecker";

export function validateEmailMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const email = req.body.email;

    if (!email || !MailChecker.isValid(email)) {
        res.status(400).json({
            status: "error",
            message:
                "The email address you entered is incorrect. Please try a different one.",
        });

        return;
    }

    next();
}
