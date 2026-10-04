import type { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export function validateData(schema: z.ZodObject<any, any>) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.issues.map((issue: any) => ({
                    field: issue.path[0],
                    message: issue.message,
                }));

                res.status(400).json({
                    error: "Invalid data",
                    details: errorMessages,
                });
            } else {
                req.log.error(
                    { err: error, event: "request.validation_failed" },
                    "Validation failed unexpectedly",
                );

                res.status(500).json({ error: "Internal Server Error" });
            }
        }
    };
}
