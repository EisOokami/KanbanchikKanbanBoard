import type { NextFunction, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";
import type { IGetUserRequest } from "../types/types";

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
            return res
                .status(401)
                .json({ status: "error", message: "Token missing" });
        }

        const { payload } = await verifyAccessToken(token);
        req.user = payload;

        next();
    } catch {
        res.status(401).json({
            status: "error",
            message: "Invalid or expired token",
        });
    }
}
