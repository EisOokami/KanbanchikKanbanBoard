import { randomUUID } from "crypto";
import { readdir, unlink } from "fs/promises";
import path from "path";
import type { Options } from "pino-http";
import pino from "pino";
import dotenv from "dotenv";
import type { Request, Response } from "express";

dotenv.config({ quiet: true });

export function serializeError(error: unknown) {
    if (!(error instanceof Error)) {
        return { type: "UnknownError" };
    }

    const code =
        "code" in error &&
        typeof error.code === "string" &&
        /^(?:ER_|ERR_|E)[A-Z0-9_]{2,60}$/.test(error.code)
            ? error.code
            : undefined;

    return {
        type: [
            "Error",
            "TypeError",
            "RangeError",
            "SyntaxError",
            "MulterError",
            "ZodError",
        ].includes(error.name)
            ? error.name
            : "Error",
        code,
        stack: error.stack
            ?.split("\n")
            .flatMap((line) => {
                const location = line.match(
                    /^\s+at .*?((?:file:\/\/\/|\/|node:)[^\s()?]+:\d+:\d+)\)?$/,
                );

                return location ? [`    at ${location[1]}`] : [];
            })
            .slice(0, 20)
            .join("\n"),
    };
}

export function requestRoute(req: Request): string {
    return typeof req.route?.path === "string"
        ? `${req.baseUrl}${req.route.path}`
        : "unmatched";
}

const sensitiveFields = [
    "password",
    "passwordHash",
    "password_hash",
    "currentPassword",
    "newPassword",
    "token",
    "accessToken",
    "refreshToken",
    "tempToken",
    "id_token",
    "access_token",
    "refresh_token",
    "refresh_token_hash",
    "token_hash",
    "reset_token",
    "verification_token",
    "secret",
    "mfa_secret",
    "otp",
    "totp",
    "code",
    "code_hash",
    "backupCodes",
    "csrfToken",
    "authorization",
    "cookie",
    "cookies",
    "session",
    "user",
    "body",
    "query",
    "headers",
    "credentials",
    "encryptionKey",
    "apiKey",
    "geminiApiKey",
];

const logFileParts = process.env.LOG_FILE
    ? path.parse(path.resolve(process.env.LOG_FILE))
    : null;

function datedLogFile(date = new Date()): string {
    if (!logFileParts) {
        throw new Error("LOG_FILE is not set");
    }

    return path.join(
        logFileParts.dir,
        `${logFileParts.name}-${date.toISOString().slice(0, 10)}${logFileParts.ext || ".log"}`,
    );
}

const destination = pino.destination({
    dest: process.env.LOG_FILE ? datedLogFile() : 1,
    sync: false,
    mkdir: true,
});

async function removeExpiredLogFiles() {
    if (!logFileParts) {
        return;
    }

    const escape = (value: string) =>
        value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(
        `^${escape(logFileParts.name)}-(\\d{4}-\\d{2}-\\d{2})${escape(logFileParts.ext || ".log")}$`,
    );
    const oldest = new Date(
        Date.now() -
            Math.max(1, Number(process.env.LOG_RETENTION_DAYS) || 30) *
                24 *
                60 *
                60 *
                1000,
    )
        .toISOString()
        .slice(0, 10);

    for (const file of await readdir(logFileParts.dir)) {
        const date = pattern.exec(file)?.[1];

        if (date && date < oldest) {
            await unlink(path.join(logFileParts.dir, file)).catch(() => {});
        }
    }
}

function scheduleLogRotation() {
    if (!logFileParts) {
        return;
    }

    void removeExpiredLogFiles().catch(() => {});

    const now = new Date();
    const nextMidnight = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
    );

    setTimeout(
        () => {
            destination.reopen(datedLogFile());
            scheduleLogRotation();
        },
        nextMidnight - now.getTime() + 1000,
    ).unref();
}

export const logger = pino(
    {
        level: process.env.LOG_LEVEL ?? "info",
        timestamp: pino.stdTimeFunctions.epochTime,
        serializers: { err: serializeError },
        redact: {
            paths: [
                ...sensitiveFields.flatMap((field) =>
                    field === "code" ? [field] : [field, `*.${field}`],
                ),
                "req.body",
                "req.query",
                "req.headers",
                "req.cookies",
                "res.headers",
                "res.body",
            ],
            censor: "[REDACTED]",
        },
        formatters: {
            level(label) {
                return { level: label };
            },
        },
    },
    destination,
);

scheduleLogRotation();

export const httpLoggingOptions: Options<Request, Response> = {
    logger,
    genReqId: (_req, res) => {
        const id = randomUUID();

        res.setHeader("X-Request-Id", id);

        return id;
    },
    quietReqLogger: true,
    wrapSerializers: false,
    serializers: {
        err: serializeError,
        req: (req) => ({ id: req.id, method: req.method }),
        res: (res) => ({ statusCode: res.statusCode }),
    },
    customProps: (req) => (req.route ? { route: requestRoute(req) } : {}),
    customLogLevel: (_req, res, err) =>
        err || res.statusCode >= 500 ? "error" : "info",
    customSuccessMessage: () => "HTTP request completed",
    customErrorMessage: () => "HTTP request failed",
    customErrorObject: (_req, _res, _err, value) => ({
        res: value.res,
        responseTime: value.responseTime,
    }),
};
