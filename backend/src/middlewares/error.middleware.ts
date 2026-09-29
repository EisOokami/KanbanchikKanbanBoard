import type { NextFunction, Request, Response } from "express";

export async function errorMiddleware(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    console.error(error);

    res.status(400).json({
        status: "error",
        message: error.message,
    });

    next();
}
